import { Request, Response } from 'express';
import { GoogleCalendarService } from '../../integrations/googleCalendar';
import { prisma } from '../../index';

/**
 * Sync calendar events from Google Calendar
 */
export const syncCalendar = async (req: Request, res: Response) => {
  const userId = req.user.id;
  
  try {
    // Get user with their tokens
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if user has Google Calendar connected
    if (!user.googleTokens) {
      return res.status(400).json({ 
        error: 'Google Calendar not connected',
        message: 'Please connect your Google Calendar first in Settings',
        requiresAuth: true
      });
    }
    
    try {
      // Use real Google Calendar API
      const calendarService = new GoogleCalendarService(user);
      
      // Get time range from request body or use defaults
      const { timeMin, timeMax } = req.body;
      const syncedMeetings = await calendarService.syncCalendarEvents(timeMin, timeMax);
      
      res.status(200).json({
        message: `Successfully synced ${syncedMeetings.length} calendar events`,
        syncedCount: syncedMeetings.length,
        demoMode: false,
        meetings: syncedMeetings
      });
      
    } catch (apiError: any) {
      console.error('Google Calendar API error:', apiError);
      
      // If API fails, provide helpful error message
      if (apiError.code === 401) {
        return res.status(401).json({
          error: 'Google Calendar authorization expired',
          message: 'Please reconnect your Google Calendar in Settings',
          requiresReauth: true
        });
      }
      
      // For demo purposes, fall back to mock data if API is not properly configured
      console.log('🎭 Falling back to DEMO MODE due to API configuration issues');
      
      const mockMeetings = await createDemoMeetings(userId);
      
      return res.status(200).json({
        message: `Demo Mode: Created ${mockMeetings.length} sample meetings`,
        syncedCount: mockMeetings.length,
        demoMode: true,
        warning: 'Using demo data. Please check your Google Calendar API configuration.'
      });
    }
    
  } catch (error) {
    console.error('Sync calendar error:', error);
    res.status(500).json({ error: 'Failed to sync calendar events' });
  }
};

/**
 * Get calendar sync status
 */
export const getSyncStatus = async (req: Request, res: Response) => {
  const userId = req.user.id;
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const meetingCount = await prisma.meeting.count({
      where: { organizerId: userId }
    });
    
    const hasGoogleTokens = !!user.googleTokens;
    const hasZoomTokens = !!user.zoomTokens;
    
    res.status(200).json({
      hasGoogleCalendar: hasGoogleTokens,
      hasZoomAuth: hasZoomTokens,
      totalMeetings: meetingCount,
      lastSync: user.updatedAt,
      authStatus: {
        google: hasGoogleTokens ? 'connected' : 'not_connected',
        zoom: hasZoomTokens ? 'connected' : 'not_connected'
      }
    });
    
  } catch (error) {
    console.error('Sync status error:', error);
    res.status(500).json({ error: 'Failed to get sync status' });
  }
};

/**
 * Manually refresh calendar
 */
export const refreshCalendar = async (req: Request, res: Response) => {
  // This is the same as sync for now, but could have different logic
  return syncCalendar(req, res);
};

/**
 * Helper function to create demo meetings (fallback only)
 */
async function createDemoMeetings(userId: string) {
  const mockMeetings = [
    {
      title: 'Weekly Team Standup',
      description: 'Weekly team sync to discuss progress and blockers',
      startTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
      endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000), // +30 min
      externalId: `demo-standup-${Date.now()}`,
      organizerId: userId,
      status: 'confirmed',
      isRecurring: true
    },
    {
      title: 'Product Planning Meeting',
      description: 'Q2 product roadmap discussion',
      startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // +1 hour
      externalId: `demo-product-${Date.now()}`,
      organizerId: userId,
      status: 'confirmed',
      isRecurring: false
    },
    {
      title: 'Client Presentation',
      description: 'Presenting new features to key client',
      startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // In 3 days
      endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000), // +45 min
      externalId: `demo-client-${Date.now()}`,
      organizerId: userId,
      status: 'confirmed',
      isRecurring: false
    }
  ];
  
  const createdMeetings = [];
  
  for (const meetingData of mockMeetings) {
    // Check if meeting already exists
    const existingMeeting = await prisma.meeting.findFirst({
      where: {
        organizerId: userId,
        externalId: meetingData.externalId
      }
    });
    
    if (!existingMeeting) {
      const meeting = await prisma.meeting.create({
        data: meetingData
      });
      createdMeetings.push(meeting);
    }
  }
  
  return createdMeetings;
}

/**
 * Debug calendar sync
 */
export const debugCalendarSync = async (req: Request, res: Response) => {
  const userId = req.user.id;
  
  try {
    console.log('🔍 DEBUG: Starting calendar sync debug');
    console.log('🔍 User ID:', userId);
    
    // Get user with their tokens
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('🔍 User found:', user.email);
    console.log('🔍 Has Google tokens:', !!user.googleTokens);
    
    if (!user.googleTokens) {
      return res.status(400).json({ error: 'No Google tokens' });
    }
    
    // Parse tokens
    const tokens = typeof user.googleTokens === 'string' 
      ? JSON.parse(user.googleTokens) 
      : user.googleTokens;
      
    console.log('🔍 Tokens parsed successfully');
    console.log('🔍 Access token exists:', !!tokens.access_token);
    
    // Try to create calendar service
    const calendarService = new GoogleCalendarService(user);
    console.log('🔍 Calendar service created');
    
    // Try sync with limited range
    const syncedMeetings = await calendarService.syncCalendarEvents('2024-01-01T00:00:00Z', '2024-02-01T00:00:00Z');
    console.log('🔍 Sync completed, meetings:', syncedMeetings.length);
    
    res.status(200).json({
      message: 'Debug sync completed',
      userId,
      userEmail: user.email,
      hasTokens: !!user.googleTokens,
      syncedCount: syncedMeetings.length,
      meetings: syncedMeetings.slice(0, 3) // First 3 for debugging
    });
    
  } catch (error: any) {
    console.error('❌ Debug sync error:', error);
    res.status(500).json({ 
      error: 'Debug sync failed',
      message: error.message,
      stack: error.stack
    });
  }
}; 