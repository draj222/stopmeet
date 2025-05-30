import apiClient from './client';

/**
 * Get all meetings for the current user
 */
export const getMeetings = async (params?: { 
  startDate?: string; 
  endDate?: string; 
  flagged?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  const response = await apiClient.get('/meetings', { params });
  return response.data;
};

/**
 * Get a single meeting by ID
 */
export const getMeetingById = async (id: string) => {
  const response = await apiClient.get(`/meetings/${id}`);
  return response.data;
};

/**
 * Sync calendar events from Google Calendar
 */
export const syncCalendarEvents = async (params?: { lookbackDays?: number; lookAheadDays?: number }) => {
  const response = await apiClient.post('/meetings/sync', params || {});
  return response.data;
};

/**
 * Analyze meetings to flag potential issues
 */
export const analyzeMeetings = async () => {
  const response = await apiClient.post('/meetings/analyze');
  return response.data;
};

// Phase 1: Calendar Audit & Cancellation
/**
 * Run calendar audit to identify meeting inefficiencies
 */
export const auditCalendar = async (params?: {
  lookbackDays?: number;
  includeTypes?: string[];
}) => {
  const response = await apiClient.post('/meetings/audit', params || {});
  return response.data;
};

/**
 * Get cancellation suggestions based on audit results
 */
export const getCancellationSuggestions = async (params?: {
  minScore?: number;
  maxResults?: number;
}) => {
  const response = await apiClient.get('/meetings/cancellation-suggestions', { params });
  return response.data;
};

/**
 * Bulk cancel meetings
 */
export const bulkCancelMeetings = async (data: {
  meetingIds: string[];
  reason?: string;
  notifyAttendees?: boolean;
}) => {
  const response = await apiClient.post('/meetings/bulk-cancel', data);
  return response.data;
};

// Phase 2: AI Agenda Generation
/**
 * Generate AI agenda for a meeting
 */
export const generateAgenda = async (meetingId: string, data?: {
  meetingType?: string;
  duration?: number;
  objectives?: string[];
  attendeeCount?: number;
}) => {
  const response = await apiClient.post(`/meetings/${meetingId}/agenda/generate`, data || {});
  return response.data;
};

/**
 * Get agenda for a meeting
 */
export const getMeetingAgenda = async (meetingId: string) => {
  const response = await apiClient.get(`/meetings/${meetingId}/agenda`);
  return response.data;
};

/**
 * Update meeting agenda
 */
export const updateMeetingAgenda = async (meetingId: string, agendaId: string, data: {
  title?: string;
  items?: Array<{
    topic: string;
    duration: number;
    type: string;
    objective?: string;
  }>;
}) => {
  const response = await apiClient.put(`/meetings/${meetingId}/agenda/${agendaId}`, data);
  return response.data;
};

// Phase 3: Meeting Insights & Analytics
/**
 * Generate meeting summary from transcript
 */
export const generateMeetingSummary = async (meetingId: string, data?: {
  transcript?: string;
  options?: {
    includeActionItems?: boolean;
    includeSentiment?: boolean;
    includeTopics?: boolean;
  };
}) => {
  const response = await apiClient.post(`/meetings/${meetingId}/summary/generate`, data || {});
  return response.data;
};

/**
 * Get all summaries for a meeting
 */
export const getMeetingSummaries = async (meetingId: string) => {
  const response = await apiClient.get(`/meetings/${meetingId}/summaries`);
  return response.data;
};

/**
 * Flag a meeting with a specific issue
 */
export const flagMeeting = async (id: string, data: { issueType: string; description: string; severity: string }) => {
  const response = await apiClient.post(`/meetings/${id}/flag`, data);
  return response.data;
};

/**
 * Resolve a meeting flag
 */
export const resolveMeetingFlag = async (meetingId: string, flagId: string) => {
  const response = await apiClient.post(`/meetings/${meetingId}/flag/${flagId}/resolve`);
  return response.data;
};

/**
 * Get attendee recommendations for a meeting
 */
export const getAttendeeRecommendations = async (meetingId: string) => {
  const response = await apiClient.get(`/meetings/${meetingId}/attendee-recommendations`);
  return response.data;
};

/**
 * Get meeting statistics and analytics
 */
export const getMeetingStats = async (params?: {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
}) => {
  const response = await apiClient.get('/meetings/stats', { params });
  return response.data;
};
