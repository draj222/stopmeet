import apiClient from './client';

/**
 * Generate a meeting summary from a transcript
 */
export const generateSummary = async (data: {
  meetingId: string;
  transcript: string;
}) => {
  const response = await apiClient.post('/summaries/generate', data);
  return response.data;
};

/**
 * Get all summaries for the current user
 */
export const getSummaries = async (meetingId?: string) => {
  const params = meetingId ? { meetingId } : undefined;
  const response = await apiClient.get('/summaries', { params });
  return response.data;
};

/**
 * Get a summary by ID
 */
export const getSummaryById = async (id: string) => {
  const response = await apiClient.get(`/summaries/${id}`);
  return response.data;
};
