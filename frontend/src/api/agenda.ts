import apiClient from './client';

/**
 * Generate a meeting agenda using AI
 */
export const generateAgenda = async (data: {
  meetingId?: string;
  title: string;
  duration?: number;
  attendees?: string[];
  context?: string;
}) => {
  const response = await apiClient.post('/agenda/generate', data);
  return response.data;
};

/**
 * Save an agenda for a meeting
 */
export const saveAgenda = async (data: {
  meetingId: string;
  agenda: string;
}) => {
  const response = await apiClient.post('/agenda/save', data);
  return response.data;
};
