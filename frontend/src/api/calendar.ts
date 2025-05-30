import apiClient from './client';

/**
 * Sync calendar events from Google Calendar
 */
export const syncCalendar = async () => {
  const response = await apiClient.post('/calendar/sync');
  return response.data;
};

/**
 * Get calendar sync status
 */
export const getCalendarStatus = async () => {
  const response = await apiClient.get('/calendar/status');
  return response.data;
};

/**
 * Manually refresh calendar
 */
export const refreshCalendar = async () => {
  const response = await apiClient.post('/calendar/refresh');
  return response.data;
}; 