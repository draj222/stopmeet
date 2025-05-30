import apiClient from './client';

export interface AuditResult {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  estimatedTimeSavings: number;
  estimatedCostSavings: number;
  affectedMeetings: number;
  suggestions: string[];
  createdAt: string;
}

export interface CancellationCandidate {
  id: string;
  meetingId: string;
  title: string;
  score: number;
  reason: string;
  estimatedSavings: number;
  attendeeCount: number;
  frequency: string;
  lastAttendanceRate: number;
  riskFactors: string[];
}

/**
 * Run comprehensive calendar audit
 */
export const runCalendarAudit = async (params?: {
  lookbackDays?: number;
  includeTypes?: string[];
  minSeverity?: string;
}) => {
  const response = await apiClient.post('/meetings/audit', params || {});
  return response.data;
};

/**
 * Get latest audit results
 */
export const getAuditResults = async (params?: {
  type?: string;
  severity?: string;
  limit?: number;
}) => {
  const response = await apiClient.get('/audit/results', { params });
  return response.data;
};

/**
 * Get cancellation candidates with ML scoring
 */
export const getCancellationCandidates = async (params?: {
  minScore?: number;
  maxResults?: number;
  includeRecurring?: boolean;
}) => {
  const response = await apiClient.get('/meetings/cancellation-suggestions', { params });
  return response.data;
};

/**
 * Apply audit recommendations
 */
export const applyAuditRecommendations = async (data: {
  auditResultIds: string[];
  actionType: 'cancel' | 'optimize' | 'flag';
  options?: {
    notifyAttendees?: boolean;
    reason?: string;
  };
}) => {
  const response = await apiClient.post('/audit/apply-recommendations', data);
  return response.data;
};

/**
 * Get audit statistics and trends
 */
export const getAuditStats = async (params?: {
  timeRange?: 'week' | 'month' | 'quarter';
  groupBy?: 'day' | 'week' | 'type';
}) => {
  const response = await apiClient.get('/audit/stats', { params });
  return response.data;
};

/**
 * Export audit report
 */
export const exportAuditReport = async (params?: {
  format?: 'pdf' | 'csv' | 'json';
  includeDetails?: boolean;
  startDate?: string;
  endDate?: string;
}) => {
  const response = await apiClient.get('/audit/export', { 
    params,
    responseType: 'blob'
  });
  return response.data;
}; 