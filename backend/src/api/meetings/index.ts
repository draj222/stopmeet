import { Router } from 'express';
import { prisma } from '../../index';
import { GoogleCalendarService } from '../../integrations/googleCalendar';
import { AuditService } from '../../services/auditService';
import { AIService } from '../../services/aiService';
import { authenticateUser } from '../../middleware/auth';

const router = Router();
const auditService = new AuditService();
const aiService = new AIService();

// Apply authentication middleware to all meeting routes
router.use(authenticateUser);

// Get all meetings with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id; // Assume middleware sets req.user
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { 
      page = 1, 
      limit = 50, 
      startDate, 
      endDate, 
      includeFlags = false,
      status = 'all'
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {
      organizerId: userId,
    };

    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) where.startTime.gte = new Date(startDate as string);
      if (endDate) where.startTime.lte = new Date(endDate as string);
    }

    if (status !== 'all') {
      where.status = status;
    }

    const meetings = await prisma.meeting.findMany({
      where,
      include: {
        attendees: true,
        flags: includeFlags === 'true' ? true : false,
        agendas: true,
        summaries: true,
      },
      orderBy: {
        startTime: 'desc',
      },
      skip,
      take: Number(limit),
    });

    const total = await prisma.meeting.count({ where });

    res.json({
      meetings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
});

// Sync calendar events from Google Calendar
router.post('/sync', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.googleTokens) {
      return res.status(400).json({ error: 'Google Calendar not connected' });
    }

    const calendarService = new GoogleCalendarService(user);
    const { timeMin, timeMax } = req.body;
    
    const syncedMeetings = await calendarService.syncCalendarEvents(timeMin, timeMax);

    res.json({
      message: 'Calendar synced successfully',
      syncedCount: syncedMeetings.length,
      meetings: syncedMeetings,
    });
  } catch (error) {
    console.error('Error syncing calendar:', error);
    res.status(500).json({ error: 'Failed to sync calendar' });
  }
});

// PHASE 1: Run calendar audit
router.post('/audit', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const auditResults = await auditService.generateAuditReport(userId);

    res.json({
      message: 'Calendar audit completed',
      audit: auditResults,
    });
  } catch (error) {
    console.error('Error running audit:', error);
    res.status(500).json({ error: 'Failed to run calendar audit' });
  }
});

// PHASE 1: Get cancellation suggestions
router.get('/cancellation-suggestions', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const suggestions = await auditService.suggestMeetingCancellations(userId);

    res.json({
      suggestions,
      totalPotentialSavings: suggestions.reduce((sum, s) => sum + s.estimatedSavings, 0),
    });
  } catch (error) {
    console.error('Error getting cancellation suggestions:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

// PHASE 1: Bulk cancel meetings
router.post('/bulk-cancel', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { meetingIds, reason } = req.body;

    if (!meetingIds || !Array.isArray(meetingIds)) {
      return res.status(400).json({ error: 'Meeting IDs required' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.googleTokens) {
      return res.status(400).json({ error: 'Google Calendar not connected' });
    }

    const calendarService = new GoogleCalendarService(user);
    const results = [];

    for (const meetingId of meetingIds) {
      try {
        const meeting = await prisma.meeting.findFirst({
          where: { id: meetingId, organizerId: userId },
        });

        if (meeting && meeting.externalId) {
          await calendarService.deleteMeeting(meeting.externalId);
          
          await prisma.meeting.update({
            where: { id: meetingId },
            data: { status: 'cancelled' },
          });

          results.push({ meetingId, status: 'cancelled' });
        }
      } catch (error) {
        results.push({ 
          meetingId, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    res.json({
      message: 'Bulk cancellation completed',
      results,
      reason,
    });
  } catch (error) {
    console.error('Error bulk cancelling meetings:', error);
    res.status(500).json({ error: 'Failed to cancel meetings' });
  }
});

// PHASE 2: Generate agenda for a meeting
router.post('/:id/agenda/generate', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id: meetingId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const meeting = await prisma.meeting.findFirst({
      where: {
        id: meetingId,
        organizerId: userId,
      },
      include: {
        attendees: true,
      },
    });

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    const duration = Math.round(
      (meeting.endTime.getTime() - meeting.startTime.getTime()) / (1000 * 60)
    );

    const agenda = await aiService.generateAgenda({
      title: meeting.title,
      description: meeting.description || '',
      duration,
      attendeeCount: meeting.attendees.length,
      isRecurring: meeting.isRecurring,
    });

    // Save the agenda
    const savedAgenda = await prisma.agenda.create({
      data: {
        meetingId,
        userId,
        title: `Agenda for ${meeting.title}`,
        items: agenda.items,
        objectives: agenda.objectives,
        preparationNotes: agenda.preparationNotes,
      },
    });

    // Update meeting to mark it has an agenda
    await prisma.meeting.update({
      where: { id: meetingId },
      data: { hasAgenda: true },
    });

    res.json({
      message: 'Agenda generated successfully',
      agenda: savedAgenda,
    });
  } catch (error) {
    console.error('Error generating agenda:', error);
    res.status(500).json({ error: 'Failed to generate agenda' });
  }
});

// PHASE 2: Get agenda for a meeting
router.get('/:id/agenda', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id: meetingId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const agenda = await prisma.agenda.findFirst({
      where: {
        meetingId,
        userId,
        isActive: true,
      },
      include: {
        meeting: {
          select: {
            title: true,
            startTime: true,
            endTime: true,
          },
        },
      },
    });

    if (!agenda) {
      return res.status(404).json({ error: 'Agenda not found' });
    }

    res.json({ agenda });
  } catch (error) {
    console.error('Error fetching agenda:', error);
    res.status(500).json({ error: 'Failed to fetch agenda' });
  }
});

// PHASE 2: Update agenda
router.put('/:id/agenda/:agendaId', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id: meetingId, agendaId } = req.params;
    const { items, objectives, preparationNotes } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const agenda = await prisma.agenda.findFirst({
      where: {
        id: agendaId,
        meetingId,
        userId,
      },
    });

    if (!agenda) {
      return res.status(404).json({ error: 'Agenda not found' });
    }

    const updatedAgenda = await prisma.agenda.update({
      where: { id: agendaId },
      data: {
        items,
        objectives,
        preparationNotes,
      },
    });

    res.json({
      message: 'Agenda updated successfully',
      agenda: updatedAgenda,
    });
  } catch (error) {
    console.error('Error updating agenda:', error);
    res.status(500).json({ error: 'Failed to update agenda' });
  }
});

// PHASE 3: Generate meeting summary from transcript
router.post('/:id/summary/generate', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id: meetingId } = req.params;
    const { transcript, notes } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const meeting = await prisma.meeting.findFirst({
      where: {
        id: meetingId,
        organizerId: userId,
      },
      include: {
        attendees: true,
      },
    });

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    let analysisResult;
    
    if (transcript) {
      // Analyze transcript using AI
      analysisResult = await aiService.analyzeMeetingTranscript(transcript, meeting.title);
      
      // Update meeting with transcript
      await prisma.meeting.update({
        where: { id: meetingId },
        data: { transcript },
      });
    } else {
      // Generate summary from basic information
      const duration = Math.round(
        (meeting.endTime.getTime() - meeting.startTime.getTime()) / (1000 * 60)
      );
      
      analysisResult = await aiService.generateMeetingSummary({
        title: meeting.title,
        duration,
        attendees: meeting.attendees.map(a => a.name || a.email),
        notes,
      });
    }

    // Save the summary
    const summary = await prisma.summary.create({
      data: {
        meetingId,
        userId,
        summary: analysisResult.summary,
        actionItems: analysisResult.actionItems || [],
        keyDecisions: analysisResult.keyDecisions || analysisResult.decisions || [],
        nextSteps: analysisResult.nextSteps || [],
        sentiment: analysisResult.sentiment,
        topics: analysisResult.topics || analysisResult.keyPoints || [],
      },
    });

    res.json({
      message: 'Summary generated successfully',
      summary,
      analysis: analysisResult,
    });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// PHASE 3: Get meeting summaries
router.get('/:id/summaries', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id: meetingId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const summaries = await prisma.summary.findMany({
      where: {
        meetingId,
        userId,
      },
      include: {
        meeting: {
          select: {
            title: true,
            startTime: true,
            endTime: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ summaries });
  } catch (error) {
    console.error('Error fetching summaries:', error);
    res.status(500).json({ error: 'Failed to fetch summaries' });
  }
});

// Flag a meeting with efficiency issues
router.post('/:id/flag', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id: meetingId } = req.params;
    const { issueType, description, severity } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const flag = await prisma.meetingFlag.create({
      data: {
        meetingId,
        userId,
        issueType,
        description,
        severity: severity || 'MEDIUM',
        autoDetected: false,
      },
    });

    res.json({
      message: 'Meeting flagged successfully',
      flag,
    });
  } catch (error) {
    console.error('Error flagging meeting:', error);
    res.status(500).json({ error: 'Failed to flag meeting' });
  }
});

// Resolve a meeting flag
router.post('/:id/flag/:flagId/resolve', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { flagId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const flag = await prisma.meetingFlag.update({
      where: {
        id: flagId,
      },
      data: {
        isResolved: true,
        resolvedAt: new Date(),
      },
    });

    res.json({
      message: 'Flag resolved successfully',
      flag,
    });
  } catch (error) {
    console.error('Error resolving flag:', error);
    res.status(500).json({ error: 'Failed to resolve flag' });
  }
});

// Get attendee recommendations for optimization
router.get('/:id/attendee-recommendations', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id: meetingId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const meeting = await prisma.meeting.findFirst({
      where: {
        id: meetingId,
        organizerId: userId,
      },
      include: {
        attendees: true,
      },
    });

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    // Get team members (this would ideally come from an organization context)
    const teamMembers = await prisma.user.findMany({
      where: {
        organizationId: req.user?.organizationId,
      },
      select: {
        email: true,
        name: true,
      },
    });

    const recommendations = await aiService.suggestAttendeeOptimization(meeting, teamMembers);

    res.json({ recommendations });
  } catch (error) {
    console.error('Error getting attendee recommendations:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

export default router;
