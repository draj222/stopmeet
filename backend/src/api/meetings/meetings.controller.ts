import { Request, Response } from 'express';
import { google } from 'googleapis';
import axios from 'axios';
import { prisma } from '../../index';

/**
 * Get meetings for the current user
 */
export const getMeetings = async (req: Request, res: Response) => {
  const { startDate, endDate, flagged } = req.query;
  const userId = req.user.id;
  
  try {
    // Build query filters
    const filters: any = {
      organizerId: userId
    };
    
    // Add date range filter if provided
    if (startDate && endDate) {
      filters.startTime = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }
    
    // Fetch meetings
    const meetings = await prisma.meeting.findMany({
      where: filters,
      include: {
        attendees: true,
        flags: flagged === 'true',
        summaries: flagged === 'true'
      },
      orderBy: {
        startTime: 'asc'
      }
    });
    
    // If flagged parameter is true, filter meetings with flags
    const result = flagged === 'true'
      ? meetings.filter(meeting => meeting.flags.length > 0)
      : meetings;
    
    res.status(200).json({ meetings: result });
  } catch (error) {
    console.error('Get meetings error:', error);
    res.status(500).json({ error: 'Failed to get meetings' });
  }
};

/**
 * Get meeting by ID
 */
export const getMeetingById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  try {
    const meeting = await prisma.meeting.findFirst({
      where: {
        id,
        organizerId: userId
      },
      include: {
        attendees: true,
        flags: true,
        summaries: true
      }
    });
    
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    res.status(200).json({ meeting });
  } catch (error) {
    console.error('Get meeting error:', error);
    res.status(500).json({ error: 'Failed to get meeting' });
  }
};

/**
 * Sync calendar events from Google Calendar
 */
export const syncCalendarEvents = async (req: Request, res: Response) => {
  const { lookbackDays = 30, lookAheadDays = 30 } = req.body;
  const user = req.user;
  
  if (!user.googleTokens) {
    return res.status(400).json({ error: 'Google Calendar not connected' });
  }
  
  try {
    // Initialize Google OAuth client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    
    oauth2Client.setCredentials(user.googleTokens);
    
    // Create Calendar API client
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    // Calculate date range
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - lookbackDays);
    
    const endDate = new Date(now);
    endDate.setDate(now.getDate() + lookAheadDays);
    
    // Fetch calendar events
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    });
    
    const events = response.data.items || [];
    
    // Process and store events
    const processedEvents = [];
    
    for (const event of events) {
      // Skip events without a title or with no attendees (likely personal events)
      if (!event.summary || !event.attendees || event.attendees.length <= 1) {
        continue;
      }
      
      // Check if the event is a Zoom meeting
      const zoomMeetingId = extractZoomMeetingId(event.description || '');
      
      // Create or update the meeting in the database
      // First check if meeting exists by externalId
      const existingMeeting = await prisma.meeting.findFirst({
        where: {
          externalId: event.id,
          organizerId: user.id
        }
      });

      let meeting;
      if (existingMeeting) {
        // Update existing meeting
        meeting = await prisma.meeting.update({
          where: {
            id: existingMeeting.id
          },
          data: {
            title: event.summary || 'Untitled Meeting',
            description: event.description || '',
            startTime: new Date(event.start?.dateTime || event.start?.date || ''),
            endTime: new Date(event.end?.dateTime || event.end?.date || ''),
            isRecurring: !!event.recurringEventId,
            recurrenceId: event.recurringEventId || null,
            organizer: event.organizer?.email || '',
            hasAgenda: !!(event.description && event.description.length > 20),
            inviteeCount: event.attendees?.length || 0,
            zoomMeetingId: zoomMeetingId
          }
        });
      } else {
        // Create new meeting
        meeting = await prisma.meeting.create({
          data: {
            externalId: event.id,
            title: event.summary || 'Untitled Meeting',
            description: event.description || '',
            startTime: new Date(event.start?.dateTime || event.start?.date || ''),
            endTime: new Date(event.end?.dateTime || event.end?.date || ''),
            isRecurring: !!event.recurringEventId,
            recurrenceId: event.recurringEventId || null,
            organizer: event.organizer?.email || '',
            organizerId: user.id,
            hasAgenda: !!(event.description && event.description.length > 20),
            inviteeCount: event.attendees?.length || 0,
            zoomMeetingId: zoomMeetingId
          }
        });
      }
      
      // Process attendees
      if (event.attendees && event.attendees.length > 0) {
        // Clear existing attendees
        await prisma.attendee.deleteMany({
          where: { meetingId: meeting.id }
        });
        
        // Add new attendees
        for (const attendee of event.attendees) {
          if (attendee.email) {
            await prisma.attendee.create({
              data: {
                meetingId: meeting.id,
                email: attendee.email,
                name: attendee.displayName || '',
                status: attendee.responseStatus || 'needsAction',
                isOptional: attendee.optional || false
              }
            });
          }
        }
      }
      
      // If this is a Zoom meeting and user has Zoom auth, fetch additional data
      if (zoomMeetingId && user.zoomTokens) {
        try {
          // Fetch Zoom meeting data (past meetings)
          const zoomResponse = await axios.get(
            `https://api.zoom.us/v2/past_meetings/${zoomMeetingId}`,
            {
              headers: {
                Authorization: `Bearer ${user.zoomTokens.access_token}`
              }
            }
          );
          
          const zoomMeeting = zoomResponse.data;
          
          // Update meeting with Zoom data
          await prisma.meeting.update({
            where: { id: meeting.id },
            data: {
              attendeeCount: zoomMeeting.participants_count || 0,
              zoomDuration: zoomMeeting.duration || null
            }
          });
        } catch (zoomError) {
          // Ignore errors for future meetings that don't have past data yet
          console.log(`No Zoom data available for meeting ${zoomMeetingId}`);
        }
      }
      
      processedEvents.push(meeting);
    }
    
    // Calculate stats for current week
    const weekStart = getStartOfWeek(now);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    
    const weeklyMeetings = await prisma.meeting.findMany({
      where: {
        organizerId: user.id,
        startTime: {
          gte: weekStart,
          lt: weekEnd
        }
      }
    });
    
    // Calculate total meeting hours
    let totalMeetingHours = 0;
    for (const meeting of weeklyMeetings) {
      const durationMs = meeting.endTime.getTime() - meeting.startTime.getTime();
      totalMeetingHours += durationMs / (1000 * 60 * 60); // Convert ms to hours
    }
    
    // Update or create weekly stats
    await prisma.weeklyStat.upsert({
      where: {
        userId_weekStart: {
          userId: user.id,
          weekStart
        }
      },
      update: {
        totalMeetingHours,
        updatedAt: new Date()
      },
      create: {
        userId: user.id,
        weekStart,
        totalMeetingHours,
        hoursSaved: 0,
        meetingsFlagged: 0
      }
    });
    
    res.status(200).json({
      message: 'Calendar sync completed successfully',
      eventCount: processedEvents.length
    });
  } catch (error) {
    console.error('Calendar sync error:', error);
    res.status(500).json({ error: 'Failed to sync calendar events' });
  }
};

/**
 * Analyze meetings to flag potential issues
 */
export const analyzeMeetings = async (req: Request, res: Response) => {
  const userId = req.user.id;
  
  try {
    // Get all user's meetings
    const meetings = await prisma.meeting.findMany({
      where: {
        organizerId: userId
      },
      include: {
        attendees: true
      }
    });
    
    const flaggedMeetings = [];
    
    // Clear existing flags
    await prisma.meetingFlag.deleteMany({
      where: { userId }
    });
    
    // Loop through meetings to analyze
    for (const meeting of meetings) {
      const flags = [];
      
      // Check for missing agenda
      if (!meeting.hasAgenda && meeting.isRecurring) {
        flags.push({
          issueType: 'NO_AGENDA',
          description: 'Recurring meeting with no agenda',
          severity: 'MEDIUM'
        });
      }
      
      // Check for low attendance rate (if meeting has Zoom data)
      if (meeting.inviteeCount && meeting.attendeeCount && 
          meeting.attendeeCount < meeting.inviteeCount * 0.7) {
        flags.push({
          issueType: 'LOW_ATTENDANCE',
          description: `Low attendance rate (${Math.round(meeting.attendeeCount / meeting.inviteeCount * 100)}%)`,
          severity: 'HIGH'
        });
      }
      
      // Check for large meetings
      if (meeting.inviteeCount && meeting.inviteeCount > 8) {
        flags.push({
          issueType: 'LARGE_MEETING',
          description: `Large meeting with ${meeting.inviteeCount} invitees`,
          severity: 'LOW'
        });
      }
      
      // Check for redundant meetings (meetings with similar titles and attendees)
      const similarMeetings = meetings.filter(m => 
        m.id !== meeting.id && 
        calculateTitleSimilarity(m.title, meeting.title) > 0.7 &&
        calculateAttendeeOverlap(m.attendees, meeting.attendees) > 0.7
      );
      
      if (similarMeetings.length > 0) {
        flags.push({
          issueType: 'REDUNDANT_MEETING',
          description: `Similar to ${similarMeetings.length} other meeting(s)`,
          severity: 'HIGH'
        });
      }
      
      // Create flags in database
      for (const flag of flags) {
        await prisma.meetingFlag.create({
          data: {
            meetingId: meeting.id,
            userId,
            issueType: flag.issueType,
            description: flag.description,
            severity: flag.severity,
            isResolved: false
          }
        });
      }
      
      if (flags.length > 0) {
        flaggedMeetings.push({
          ...meeting,
          flags
        });
      }
    }
    
    // Update weekly stats
    const now = new Date();
    const weekStart = getStartOfWeek(now);
    
    await prisma.weeklyStat.updateMany({
      where: {
        userId,
        weekStart
      },
      data: {
        meetingsFlagged: flaggedMeetings.length
      }
    });
    
    res.status(200).json({
      message: 'Meetings analyzed successfully',
      flaggedCount: flaggedMeetings.length,
      flaggedMeetings
    });
  } catch (error) {
    console.error('Meeting analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze meetings' });
  }
};

/**
 * Flag a meeting with a specific issue
 */
export const flagMeeting = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { issueType, description, severity } = req.body;
  const userId = req.user.id;
  
  try {
    const meeting = await prisma.meeting.findFirst({
      where: {
        id,
        organizerId: userId
      }
    });
    
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    const flag = await prisma.meetingFlag.create({
      data: {
        meetingId: id,
        userId,
        issueType,
        description,
        severity,
        isResolved: false
      }
    });
    
    res.status(201).json({ flag });
  } catch (error) {
    console.error('Flag meeting error:', error);
    res.status(500).json({ error: 'Failed to flag meeting' });
  }
};

/**
 * Resolve a meeting flag
 */
export const resolveMeetingFlag = async (req: Request, res: Response) => {
  const { id, flagId } = req.params;
  const userId = req.user.id;
  
  try {
    const flag = await prisma.meetingFlag.findFirst({
      where: {
        id: flagId,
        meetingId: id,
        userId
      }
    });
    
    if (!flag) {
      return res.status(404).json({ error: 'Flag not found' });
    }
    
    const updatedFlag = await prisma.meetingFlag.update({
      where: { id: flagId },
      data: { isResolved: true }
    });
    
    // Calculate hours saved (for dashboard metrics)
    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: { attendees: true }
    });
    
    if (meeting) {
      const durationMs = meeting.endTime.getTime() - meeting.startTime.getTime();
      const hoursSaved = (durationMs / (1000 * 60 * 60)) * meeting.attendees.length;
      
      // Update weekly stats
      const weekStart = getStartOfWeek(new Date());
      
      await prisma.weeklyStat.updateMany({
        where: {
          userId,
          weekStart
        },
        data: {
          hoursSaved: {
            increment: hoursSaved
          }
        }
      });
    }
    
    res.status(200).json({ flag: updatedFlag });
  } catch (error) {
    console.error('Resolve flag error:', error);
    res.status(500).json({ error: 'Failed to resolve flag' });
  }
};

/**
 * Get attendee recommendations for a meeting
 */
export const getAttendeeRecommendations = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  try {
    const meeting = await prisma.meeting.findFirst({
      where: {
        id,
        organizerId: userId
      },
      include: {
        attendees: true
      }
    });
    
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    // Get all of this user's meetings for context
    const allMeetings = await prisma.meeting.findMany({
      where: {
        organizerId: userId,
        NOT: { id }
      },
      include: {
        attendees: true
      }
    });
    
    const recommendations = [];
    
    // Analyze each attendee
    for (const attendee of meeting.attendees) {
      // Skip the organizer
      if (attendee.email === meeting.organizer) {
        continue;
      }
      
      // Check attendee's participation in similar meetings
      const similarMeetings = allMeetings.filter(m => 
        (m.title.includes(meeting.title) || meeting.title.includes(m.title)) &&
        m.attendees.some(a => a.email === attendee.email)
      );
      
      // Check how many meetings this person is in around the same time (±2 hours)
      const meetingStartTime = meeting.startTime.getTime();
      const meetingEndTime = meeting.endTime.getTime();
      const bufferMs = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
      
      const conflictingMeetings = allMeetings.filter(m => {
        const mStart = m.startTime.getTime();
        const mEnd = m.endTime.getTime();
        
        return (
          m.attendees.some(a => a.email === attendee.email) &&
          ((mStart >= meetingStartTime - bufferMs && mStart <= meetingEndTime + bufferMs) ||
           (mEnd >= meetingStartTime - bufferMs && mEnd <= meetingEndTime + bufferMs))
        );
      });
      
      if (conflictingMeetings.length > 0) {
        recommendations.push({
          attendee,
          recommendation: 'OPTIONAL',
          reason: `Has ${conflictingMeetings.length} other meetings around this time`
        });
        continue;
      }
      
      // If they don't usually participate in similar meetings
      if (similarMeetings.length === 0) {
        recommendations.push({
          attendee,
          recommendation: 'REMOVE',
          reason: 'Not involved in similar meetings'
        });
        continue;
      }
      
      // If the meeting has more than 8 people and this person is not critical
      if (meeting.attendees.length > 8 && similarMeetings.length < 3) {
        recommendations.push({
          attendee,
          recommendation: 'OPTIONAL',
          reason: 'Large meeting and not a frequent participant in similar topics'
        });
      }
    }
    
    res.status(200).json({ recommendations });
  } catch (error) {
    console.error('Attendee recommendations error:', error);
    res.status(500).json({ error: 'Failed to get attendee recommendations' });
  }
};

// Helper functions

/**
 * Extract Zoom meeting ID from a string
 */
function extractZoomMeetingId(text: string): string | null {
  // Match common Zoom meeting URL patterns
  const zoomUrlRegex = /zoom\.us\/j\/(\d+)/;
  const match = text.match(zoomUrlRegex);
  
  return match ? match[1] : null;
}

/**
 * Get start of the week (Monday) for a given date
 */
function getStartOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  
  return result;
}

/**
 * Calculate similarity between two meeting titles
 */
function calculateTitleSimilarity(title1: string, title2: string): number {
  const t1 = title1.toLowerCase();
  const t2 = title2.toLowerCase();
  
  // If one title contains the other, high similarity
  if (t1.includes(t2) || t2.includes(t1)) {
    return 0.9;
  }
  
  // Count words that appear in both titles
  const words1 = t1.split(/\s+/);
  const words2 = t2.split(/\s+/);
  
  let commonWords = 0;
  for (const word of words1) {
    if (word.length > 3 && words2.includes(word)) {
      commonWords++;
    }
  }
  
  // Calculate Jaccard similarity
  const uniqueWords = new Set([...words1, ...words2]);
  return commonWords / uniqueWords.size;
}

/**
 * Calculate attendee overlap between two meetings
 */
function calculateAttendeeOverlap(attendees1: any[], attendees2: any[]): number {
  if (!attendees1.length || !attendees2.length) {
    return 0;
  }
  
  const emails1 = attendees1.map(a => a.email);
  const emails2 = attendees2.map(a => a.email);
  
  let commonAttendees = 0;
  for (const email of emails1) {
    if (emails2.includes(email)) {
      commonAttendees++;
    }
  }
  
  // Calculate Jaccard similarity
  const uniqueAttendees = new Set([...emails1, ...emails2]);
  return commonAttendees / uniqueAttendees.size;
}
