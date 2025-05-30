import { prisma } from '../index';
import { AIService } from './aiService';
import { GoogleCalendarService } from '../integrations/googleCalendar';

export class AuditService {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  async runFullAudit(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get meetings from the last 30 days and next 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const meetings = await prisma.meeting.findMany({
      where: {
        organizerId: userId,
        startTime: {
          gte: thirtyDaysAgo,
          lte: thirtyDaysFromNow,
        },
      },
      include: {
        attendees: true,
        flags: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    const auditResults = [];

    // Run all audit checks
    auditResults.push(...await this.detectDuplicateMeetings(meetings, userId));
    auditResults.push(...await this.detectOverbookedPeriods(meetings, userId));
    auditResults.push(...await this.detectMeetingsWithoutAgendas(meetings, userId));
    auditResults.push(...await this.detectLargeMeetings(meetings, userId));
    auditResults.push(...await this.detectBackToBackMeetings(meetings, userId));
    auditResults.push(...await this.detectRecurringMeetingFatigue(meetings, userId));
    auditResults.push(...await this.detectLongMeetings(meetings, userId));

    // Save audit results
    for (const result of auditResults) {
      await prisma.auditResult.create({
        data: {
          userId,
          type: result.type,
          title: result.title,
          description: result.description,
          severity: result.severity,
          affectedMeetings: result.affectedMeetings,
          suggestions: JSON.stringify(result.suggestions),
          estimatedSavings: result.estimatedSavings,
        },
      });
    }

    return {
      totalIssues: auditResults.length,
      criticalIssues: auditResults.filter(r => r.severity === 'CRITICAL').length,
      highIssues: auditResults.filter(r => r.severity === 'HIGH').length,
      estimatedTotalSavings: auditResults.reduce((sum, r) => sum + (r.estimatedSavings || 0), 0),
      results: auditResults,
    };
  }

  private async detectDuplicateMeetings(meetings: any[], userId: string) {
    const results = [];
    const duplicateGroups = new Map();

    // Group meetings by similar titles and times
    for (const meeting of meetings) {
      const key = this.createMeetingKey(meeting);
      if (!duplicateGroups.has(key)) {
        duplicateGroups.set(key, []);
      }
      duplicateGroups.get(key).push(meeting);
    }

    // Find groups with multiple meetings
    for (const [key, group] of duplicateGroups) {
      if (group.length > 1) {
        const estimatedSavings = (group.length - 1) * this.calculateMeetingDuration(group[0]) / 60;
        
        results.push({
          type: 'DUPLICATE_MEETINGS',
          severity: estimatedSavings > 2 ? 'HIGH' : 'MEDIUM',
          title: `Potential Duplicate Meetings: ${group[0].title}`,
          description: `Found ${group.length} similar meetings that might be duplicates. Consider consolidating them.`,
          affectedMeetings: group.map((m: any) => m.id),
          suggestions: [
            'Review if all instances are necessary',
            'Consolidate duplicate meetings into one',
            'Update recurring meeting settings if needed',
          ],
          estimatedSavings,
        });
      }
    }

    return results;
  }

  private async detectOverbookedPeriods(meetings: any[], userId: string) {
    const results = [];
    const sortedMeetings = meetings
      .filter(m => m.status !== 'cancelled')
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    for (let i = 0; i < sortedMeetings.length - 1; i++) {
      const current = sortedMeetings[i];
      const next = sortedMeetings[i + 1];

      const currentEnd = new Date(current.endTime);
      const nextStart = new Date(next.startTime);

      // Check for overlapping meetings
      if (currentEnd > nextStart) {
        results.push({
          type: 'OVERBOOKED',
          severity: 'HIGH',
          title: 'Overlapping Meetings Detected',
          description: `Meeting "${current.title}" overlaps with "${next.title}"`,
          affectedMeetings: [current.id, next.id],
          suggestions: [
            'Reschedule one of the conflicting meetings',
            'Reduce duration of the first meeting',
            'Decline one of the meetings if not essential',
          ],
          estimatedSavings: this.calculateMeetingDuration(current) / 60,
        });
      }

      // Check for back-to-back meetings (less than 15 minutes between)
      const timeBetween = nextStart.getTime() - currentEnd.getTime();
      if (timeBetween < 15 * 60 * 1000 && timeBetween >= 0) {
        results.push({
          type: 'BACK_TO_BACK',
          severity: 'MEDIUM',
          title: 'Back-to-Back Meetings',
          description: `Only ${Math.round(timeBetween / (60 * 1000))} minutes between "${current.title}" and "${next.title}"`,
          affectedMeetings: [current.id, next.id],
          suggestions: [
            'Add 15-minute buffer between meetings',
            'End meetings 5 minutes early',
            'Start meetings 5 minutes late to allow transition time',
          ],
          estimatedSavings: 0.25, // 15 minutes of stress reduction
        });
      }
    }

    return results;
  }

  private async detectMeetingsWithoutAgendas(meetings: any[], userId: string) {
    const results = [];
    const meetingsWithoutAgendas = meetings.filter(m => !m.hasAgenda && m.status !== 'cancelled');

    if (meetingsWithoutAgendas.length > 0) {
      const totalWastedTime = meetingsWithoutAgendas.reduce((sum, m) => 
        sum + this.calculateMeetingDuration(m), 0) / 60;

      results.push({
        type: 'NO_AGENDA_MEETINGS',
        severity: totalWastedTime > 5 ? 'HIGH' : 'MEDIUM',
        title: `${meetingsWithoutAgendas.length} Meetings Without Agendas`,
        description: 'Meetings without clear agendas tend to be 25% less efficient and often run over time.',
        affectedMeetings: meetingsWithoutAgendas.map((m: any) => m.id),
        suggestions: [
          'Create agendas for all upcoming meetings',
          'Use AI agenda generation for quick setup',
          'Require agendas before scheduling meetings',
          'Send agendas 24 hours before meetings',
        ],
        estimatedSavings: totalWastedTime * 0.25, // 25% efficiency gain
      });
    }

    return results;
  }

  private async detectLargeMeetings(meetings: any[], userId: string) {
    const results = [];
    const largeMeetings = meetings.filter(m => 
      m.attendees && m.attendees.length > 8 && m.status !== 'cancelled'
    );

    for (const meeting of largeMeetings) {
      const duration = this.calculateMeetingDuration(meeting) / 60;
      const cost = this.calculateMeetingCost(meeting);

      results.push({
        type: 'TOO_MANY_ATTENDEES',
        severity: meeting.attendees.length > 15 ? 'HIGH' : 'MEDIUM',
        title: `Large Meeting: ${meeting.title}`,
        description: `${meeting.attendees.length} attendees in a ${Math.round(duration * 60)}-minute meeting. Consider if all attendees are necessary.`,
        affectedMeetings: [meeting.id],
        suggestions: [
          'Review attendee list and remove optional participants',
          'Create smaller working groups for detailed discussions',
          'Send summary to non-essential attendees instead',
          'Use asynchronous communication for updates',
        ],
        estimatedSavings: (meeting.attendees.length - 6) * duration, // Assume 6 is optimal
      });
    }

    return results;
  }

  private async detectBackToBackMeetings(meetings: any[], userId: string) {
    const results = [];
    const meetingsByDay = new Map();

    // Group meetings by day
    for (const meeting of meetings) {
      const day = new Date(meeting.startTime).toDateString();
      if (!meetingsByDay.has(day)) {
        meetingsByDay.set(day, []);
      }
      meetingsByDay.get(day).push(meeting);
    }

    // Check each day for excessive meeting load
    for (const [day, dayMeetings] of meetingsByDay) {
      const totalMeetingTime = dayMeetings.reduce((sum: number, m: any) => 
        sum + this.calculateMeetingDuration(m), 0) / 60;

      if (totalMeetingTime > 6) { // More than 6 hours of meetings
        results.push({
          type: 'OVERBOOKED',
          severity: totalMeetingTime > 8 ? 'CRITICAL' : 'HIGH',
          title: `Overbooked Day: ${day}`,
          description: `${Math.round(totalMeetingTime)} hours of meetings scheduled. This leaves little time for deep work.`,
          affectedMeetings: dayMeetings.map((m: any) => m.id),
          suggestions: [
            'Move some meetings to other days',
            'Cancel or delegate non-essential meetings',
            'Block time for focused work',
            'Implement "No Meeting Fridays" or similar policies',
          ],
          estimatedSavings: Math.max(totalMeetingTime - 4, 0), // Target max 4 hours of meetings per day
        });
      }
    }

    return results;
  }

  private async detectRecurringMeetingFatigue(meetings: any[], userId: string) {
    const results = [];
    const recurringMeetings = meetings.filter(m => m.isRecurring);
    const recurringGroups = new Map();

    // Group by recurrence pattern
    for (const meeting of recurringMeetings) {
      const key = meeting.recurrenceId || meeting.title;
      if (!recurringGroups.has(key)) {
        recurringGroups.set(key, []);
      }
      recurringGroups.get(key).push(meeting);
    }

    for (const [key, group] of recurringGroups) {
      if (group.length >= 4) { // 4+ instances suggests established pattern
        const weeklyTime = this.calculateMeetingDuration(group[0]) / 60;
        
        results.push({
          type: 'RECURRING_MEETING_REVIEW',
          severity: weeklyTime > 2 ? 'MEDIUM' : 'LOW',
          title: `Recurring Meeting Review: ${group[0].title}`,
          description: `This meeting recurs ${group.length} times. Consider if the frequency is still necessary.`,
          affectedMeetings: group.map((m: any) => m.id),
          suggestions: [
            'Review if all instances are still needed',
            'Reduce frequency (weekly → bi-weekly)',
            'Shorten meeting duration',
            'Make some attendees optional',
            'Switch to asynchronous updates when possible',
          ],
          estimatedSavings: weeklyTime * 0.3, // 30% potential reduction
        });
      }
    }

    return results;
  }

  private async detectLongMeetings(meetings: any[], userId: string) {
    const results = [];
    const longMeetings = meetings.filter(m => {
      const duration = this.calculateMeetingDuration(m);
      return duration > 90 * 60 * 1000; // Longer than 90 minutes
    });

    for (const meeting of longMeetings) {
      const duration = this.calculateMeetingDuration(meeting) / 60;
      
      results.push({
        type: 'LONG_MEETING',
        severity: duration > 180 ? 'HIGH' : 'MEDIUM',
        title: `Long Meeting: ${meeting.title}`,
        description: `${Math.round(duration * 60)}-minute meeting. Consider breaking into smaller sessions.`,
        affectedMeetings: [meeting.id],
        suggestions: [
          'Break into multiple shorter sessions',
          'Create pre-work to reduce discussion time',
          'Use time boxing for agenda items',
          'Consider if all attendees need to be present for entire duration',
        ],
        estimatedSavings: Math.max(duration - 60, 0) * 0.5, // Assume 50% of excess time can be saved
      });
    }

    return results;
  }

  async suggestMeetingCancellations(userId: string) {
    const upcomingMeetings = await prisma.meeting.findMany({
      where: {
        organizerId: userId,
        startTime: {
          gte: new Date(),
        },
      },
      include: {
        attendees: true,
        flags: {
          where: {
            isResolved: false,
          },
        },
      },
    });

    const cancellationCandidates = [];

    for (const meeting of upcomingMeetings) {
      let score = 0;
      const reasons = [];

      // Check various factors
      if (!meeting.hasAgenda) {
        score += 30;
        reasons.push('No agenda set');
      }

      if (meeting.attendees.length > 10) {
        score += 20;
        reasons.push('Too many attendees');
      }

      if (meeting.flags.length > 0) {
        score += meeting.flags.length * 15;
        reasons.push('Has efficiency flags');
      }

      const duration = this.calculateMeetingDuration(meeting) / 60;
      if (duration > 120) {
        score += 25;
        reasons.push('Very long duration');
      }

      if (meeting.isRecurring) {
        score += 10;
        reasons.push('Recurring meeting (review frequency)');
      }

      if (score >= 50) {
        cancellationCandidates.push({
          meeting,
          score,
          reasons,
          estimatedSavings: duration,
          recommendation: score >= 80 ? 'Cancel' : 'Review and optimize',
        });
      }
    }

    return cancellationCandidates.sort((a, b) => b.score - a.score);
  }

  private createMeetingKey(meeting: any): string {
    const title = meeting.title.toLowerCase().replace(/\d+/g, '').trim();
    const dayOfWeek = new Date(meeting.startTime).getDay();
    const hour = new Date(meeting.startTime).getHours();
    
    return `${title}-${dayOfWeek}-${hour}`;
  }

  private calculateMeetingDuration(meeting: any): number {
    return new Date(meeting.endTime).getTime() - new Date(meeting.startTime).getTime();
  }

  private calculateMeetingCost(meeting: any): number {
    if (!meeting.attendees) return 0;
    
    const duration = this.calculateMeetingDuration(meeting) / (1000 * 60 * 60); // hours
    return meeting.attendees.reduce((sum: number, attendee: any) => {
      const hourlyCost = attendee.estimatedHourlyCost || 50; // Default $50/hour
      return sum + (hourlyCost * duration);
    }, 0);
  }

  async generateAuditReport(userId: string) {
    const auditData = await this.runFullAudit(userId);
    
    // Generate weekly stats
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of current week
    
    await prisma.weeklyStat.upsert({
      where: {
        userId_weekStart: {
          userId,
          weekStart,
        },
      },
      update: {
        hoursSaved: auditData.estimatedTotalSavings,
        meetingsFlagged: auditData.totalIssues,
      },
      create: {
        userId,
        weekStart,
        totalMeetingHours: 0, // Will be calculated by calendar sync
        hoursSaved: auditData.estimatedTotalSavings,
        meetingsFlagged: auditData.totalIssues,
      },
    });

    return auditData;
  }
} 