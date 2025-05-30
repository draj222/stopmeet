import { Request, Response } from 'express';
import { prisma } from '../../index';

/**
 * Get dashboard metrics for the current user
 */
export const getDashboardMetrics = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { timeRange } = req.query; // e.g., 'week', 'month', 'quarter'
  
  try {
    // Calculate date range based on the timeRange parameter
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      default:
        // Default to 30 days
        startDate.setDate(now.getDate() - 30);
    }
    
    // Get all meetings in the date range
    const meetings = await prisma.meeting.findMany({
      where: {
        organizerId: userId,
        startTime: {
          gte: startDate,
          lte: now
        }
      },
      include: {
        attendees: true,
        flags: true
      }
    });
    
    // Get flagged meetings
    const flaggedMeetings = meetings.filter(meeting => meeting.flags.length > 0);
    
    // Calculate total meeting hours
    let totalMeetingHours = 0;
    
    for (const meeting of meetings) {
      const durationMs = meeting.endTime.getTime() - meeting.startTime.getTime();
      totalMeetingHours += durationMs / (1000 * 60 * 60); // Convert ms to hours
    }
    
    // Get weekly stats for the time range
    const weeklyStats = await prisma.weeklyStat.findMany({
      where: {
        userId,
        weekStart: {
          gte: startDate,
          lte: now
        }
      },
      orderBy: {
        weekStart: 'asc'
      }
    });
    
    // Calculate total hours saved
    const totalHoursSaved = weeklyStats.reduce((total, stat) => total + (stat.hoursSaved || 0), 0);
    
    // Calculate average hourly cost if available
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    const averageHourlyCost = user?.averageHourlyCost || 50; // Default to $50/hour if not set
    
    // Calculate estimated cost savings
    const costSavings = totalHoursSaved * averageHourlyCost;
    
    // Calculate meeting stats by day of week
    const meetingsByDay = [0, 0, 0, 0, 0, 0, 0]; // Sun, Mon, Tue, Wed, Thu, Fri, Sat
    
    for (const meeting of meetings) {
      const dayOfWeek = meeting.startTime.getDay();
      const durationMs = meeting.endTime.getTime() - meeting.startTime.getTime();
      const durationHours = durationMs / (1000 * 60 * 60);
      
      meetingsByDay[dayOfWeek] += durationHours;
    }
    
    // Calculate average attendees per meeting
    const totalAttendees = meetings.reduce((sum, meeting) => sum + meeting.attendees.length, 0);
    const avgAttendeesPerMeeting = meetings.length > 0 ? totalAttendees / meetings.length : 0;
    
    // Calculate efficiency score (0-100)
    const meetingsWithAgenda = meetings.filter(m => m.hasAgenda).length;
    const agendaScore = meetings.length > 0 ? (meetingsWithAgenda / meetings.length) * 100 : 0;
    const flaggedScore = meetings.length > 0 ? Math.max(0, 100 - (flaggedMeetings.length / meetings.length) * 100) : 100;
    const efficiencyScore = Math.round((agendaScore + flaggedScore) / 2);
    
    // Calculate focus time created (hours saved * 1.5 multiplier for deep work)
    const focusTimeCreated = totalHoursSaved * 1.5;
    
    // Calculate total cost of all meetings
    const totalCost = meetings.reduce((sum, meeting) => {
      const durationHours = (meeting.endTime.getTime() - meeting.startTime.getTime()) / (1000 * 60 * 60);
      return sum + (durationHours * meeting.attendees.length * averageHourlyCost);
    }, 0);
    
    // Prepare weekly trend data
    const weeklyTrendLabels = weeklyStats.map(stat => {
      const date = new Date(stat.weekStart);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    
    const weeklyTrendHoursSaved = weeklyStats.map(stat => stat.hoursSaved || 0);
    const weeklyTrendMeetingHours = weeklyStats.map(stat => stat.totalMeetingHours || 0);
    const weeklyTrendCosts = weeklyStats.map(stat => (stat.totalMeetingHours || 0) * averageHourlyCost);
    
    // Calculate top issues
    const issueTypes = flaggedMeetings.reduce((acc, meeting) => {
      meeting.flags.forEach(flag => {
        if (!acc[flag.issueType]) {
          acc[flag.issueType] = { count: 0, impact: flag.severity };
        }
        acc[flag.issueType].count++;
      });
      return acc;
    }, {} as Record<string, { count: number; impact: string }>);
    
    const topIssues = Object.entries(issueTypes).map(([type, data]) => ({
      type,
      count: data.count,
      impact: data.impact as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    })).sort((a, b) => b.count - a.count);
    
    // Compile and return metrics in frontend format
    const metrics = {
      totalMeetings: meetings.length,
      totalHours: parseFloat(totalMeetingHours.toFixed(1)),
      totalCost: parseFloat(totalCost.toFixed(2)),
      hoursSaved: parseFloat(totalHoursSaved.toFixed(1)),
      moneySaved: parseFloat(costSavings.toFixed(2)),
      efficiencyScore,
      averageMeetingDuration: meetings.length > 0 ? parseFloat((totalMeetingHours / meetings.length).toFixed(1)) : 0,
      meetingsWithAgenda: meetingsWithAgenda,
      meetingUtilization: meetings.length > 0 ? parseFloat(((meetingsWithAgenda / meetings.length) * 100).toFixed(1)) : 0,
      focusTimeCreated: parseFloat(focusTimeCreated.toFixed(1)),
      topIssues,
      weeklyTrend: {
        labels: weeklyTrendLabels,
        meetingHours: weeklyTrendMeetingHours,
        hoursSaved: weeklyTrendHoursSaved,
        costs: weeklyTrendCosts
      },
      meetingsByDay: meetingsByDay.map(hours => parseFloat(hours.toFixed(1))),
      upcomingHighRisk: [], // TODO: Implement upcoming meeting risk analysis
      recentWins: [
        {
          type: 'MEETING_CANCELLED',
          title: 'Cancelled redundant standup',
          savings: 2.5
        },
        {
          type: 'AGENDA_ADDED',
          title: 'Added agenda to planning meeting',
          savings: 1.0
        },
        {
          type: 'ATTENDEES_REDUCED',
          title: 'Reduced attendees in design review',
          savings: 3.0
        }
      ]
    };
    
    res.status(200).json(metrics);
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    res.status(500).json({ error: 'Failed to get dashboard metrics' });
  }
};

/**
 * Get weekly stats for trend analysis
 */
export const getWeeklyStats = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { weeks = 12 } = req.query; // Default to 12 weeks of data
  
  try {
    // Calculate start date (n weeks ago)
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - (parseInt(weeks as string) * 7));
    
    // Get weekly stats
    const stats = await prisma.weeklyStat.findMany({
      where: {
        userId,
        weekStart: {
          gte: startDate
        }
      },
      orderBy: {
        weekStart: 'asc'
      }
    });
    
    // Format data for trend charts
    const trendData = {
      labels: stats.map(stat => formatDate(stat.weekStart)),
      meetingHours: stats.map(stat => stat.totalMeetingHours),
      hoursSaved: stats.map(stat => stat.hoursSaved || 0),
      meetingsFlagged: stats.map(stat => stat.meetingsFlagged || 0)
    };
    
    res.status(200).json({ trendData });
  } catch (error) {
    console.error('Weekly stats error:', error);
    res.status(500).json({ error: 'Failed to get weekly stats' });
  }
};

/**
 * Format date as MM/DD
 */
function formatDate(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  return `${month}/${day}`;
}
