import { google } from 'googleapis';
import { prisma } from '../index';
import { User } from '@prisma/client';

export class GoogleCalendarService {
  private calendar: any;

  constructor(private user: User) {
    if (!user.googleTokens) {
      throw new Error('User has no Google tokens');
    }

    // Parse tokens from JSON string format
    const tokens = typeof user.googleTokens === 'string' 
      ? JSON.parse(user.googleTokens) 
      : user.googleTokens;
      
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials(tokens);
    this.calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  }

  async syncCalendarEvents(timeMin?: string, timeMax?: string) {
    try {
      const now = new Date();
      const oneMonthFromNow = new Date();
      oneMonthFromNow.setMonth(now.getMonth() + 1);

      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin || now.toISOString(),
        timeMax: timeMax || oneMonthFromNow.toISOString(),
        maxResults: 250,
        singleEvents: true,
        orderBy: 'startTime',
      });

      const events = response.data.items || [];
      console.log(`🔍 DEBUG: Found ${events.length} total events from Google Calendar`);
      
      // Log first few events for debugging
      events.slice(0, 3).forEach((event: any, index: number) => {
        console.log(`🔍 Event ${index + 1}:`, {
          summary: event.summary,
          start: event.start?.dateTime || event.start?.date,
          attendees: event.attendees?.length || 0,
          transparency: event.transparency
        });
      });

      const syncedMeetings = [];

      for (const event of events) {
        console.log(`🔍 Processing event: ${event.summary}`);
        
        if (!event.start?.dateTime || !event.end?.dateTime) {
          console.log(`❌ Skipping - No dateTime (all-day event): ${event.summary}`);
          continue;
        }

        // More flexible date handling - accept both dateTime and date
        const startTime = event.start?.dateTime || event.start?.date;
        const endTime = event.end?.dateTime || event.end?.date;
        
        if (!startTime || !endTime) {
          console.log(`❌ Skipping - No start/end time: ${event.summary}`);
          continue;
        }

        // Skip transparent events (free time)
        if (event.transparency === 'transparent') {
          console.log(`❌ Skipping - Transparent event: ${event.summary}`);
          continue;
        }

        // Include all events for now (remove attendee filtering)
        console.log(`✅ Including event: ${event.summary} (attendees: ${event.attendees?.length || 0})`);

        const existingMeeting = await prisma.meeting.findFirst({
          where: {
            externalId: event.id,
            organizerId: this.user.id,
          },
        });

        const attendees = event.attendees || [];
        const meetingData = {
          externalId: event.id,
          title: event.summary || 'Untitled Meeting',
          description: event.description || '',
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          isRecurring: !!event.recurringEventId,
          recurrenceId: event.recurringEventId || null,
          recurrenceRule: event.recurrence?.[0] || null,
          organizer: event.organizer?.email || '',
          organizerId: this.user.id,
          inviteeCount: attendees.length,
          location: event.location || null,
          status: this.mapGoogleEventStatus(event.status),
        };

        let meeting;
        if (existingMeeting) {
          meeting = await prisma.meeting.update({
            where: { id: existingMeeting.id },
            data: meetingData,
          });
        } else {
          meeting = await prisma.meeting.create({
            data: meetingData,
          });
        }

        // Sync attendees
        await this.syncAttendees(meeting.id, attendees);
        syncedMeetings.push(meeting);
      }

      console.log(`✅ Final result: ${syncedMeetings.length} meetings synced`);
      return syncedMeetings;
    } catch (error) {
      console.error('Error syncing calendar events:', error);
      throw error;
    }
  }

  private async syncAttendees(meetingId: string, attendees: any[]) {
    // Delete existing attendees
    await prisma.attendee.deleteMany({
      where: { meetingId },
    });

    // Add new attendees
    for (const attendee of attendees) {
      await prisma.attendee.create({
        data: {
          meetingId,
          email: attendee.email,
          name: attendee.displayName || null,
          status: attendee.responseStatus,
          isOptional: attendee.optional || false,
        },
      });
    }
  }

  private mapGoogleEventStatus(status?: string): string {
    switch (status) {
      case 'confirmed':
        return 'scheduled';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'scheduled';
    }
  }

  async createMeeting(meetingData: {
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    attendees: string[];
    location?: string;
  }) {
    try {
      const event = {
        summary: meetingData.title,
        description: meetingData.description,
        start: {
          dateTime: meetingData.startTime.toISOString(),
          timeZone: this.user.timeZone,
        },
        end: {
          dateTime: meetingData.endTime.toISOString(),
          timeZone: this.user.timeZone,
        },
        attendees: meetingData.attendees.map(email => ({ email })),
        location: meetingData.location,
      };

      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
      });

      return response.data;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  }

  async updateMeeting(eventId: string, updates: any) {
    try {
      const response = await this.calendar.events.patch({
        calendarId: 'primary',
        eventId,
        resource: updates,
      });

      return response.data;
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw error;
    }
  }

  async deleteMeeting(eventId: string) {
    try {
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId,
      });
      return true;
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw error;
    }
  }

  async findFreeBusyTimes(timeMin: Date, timeMax: Date) {
    try {
      const response = await this.calendar.freebusy.query({
        resource: {
          timeMin: timeMin.toISOString(),
          timeMax: timeMax.toISOString(),
          items: [{ id: 'primary' }],
        },
      });

      return response.data.calendars?.primary?.busy || [];
    } catch (error) {
      console.error('Error getting free/busy times:', error);
      throw error;
    }
  }
} 