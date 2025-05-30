import apiClient from './client';

export interface DashboardMetrics {
  totalMeetings: number;
  totalHours: number;
  totalCost: number;
  hoursSaved: number;
  moneySaved: number;
  efficiencyScore: number;
  averageMeetingDuration: number;
  meetingsWithAgenda: number;
  meetingUtilization: number;
  focusTimeCreated: number;
  topIssues: Array<{
    type: string;
    count: number;
    impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }>;
  weeklyTrend: {
    labels: string[];
    meetingHours: number[];
    hoursSaved: number[];
    costs: number[];
  };
  meetingsByDay: number[];
  upcomingHighRisk: Array<{
    id: string;
    title: string;
    risk: string;
    reason: string;
    time: string;
  }>;
  recentWins: Array<{
    type: string;
    title: string;
    savings: number;
  }>;
}

/**
 * Get comprehensive dashboard metrics for the current user
 */
export const getDashboardMetrics = async (timeRange?: string) => {
  const params = timeRange ? { timeRange } : undefined;
  const response = await apiClient.get('/dashboard/metrics', { params });
  return response.data;
};

/**
 * Get weekly stats for trend analysis
 */
export const getWeeklyStats = async (weeks?: number) => {
  const params = weeks ? { weeks } : undefined;
  const response = await apiClient.get('/dashboard/weekly-stats', { params });
  return response.data;
};

/**
 * Get real-time meeting ROI calculations
 */
export const getMeetingROI = async (params?: {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
}) => {
  const response = await apiClient.get('/dashboard/roi', { params });
  return response.data;
};

/**
 * Get efficiency trends and patterns
 */
export const getEfficiencyTrends = async (params?: {
  timeRange?: 'week' | 'month' | 'quarter';
  includeProjections?: boolean;
}) => {
  const response = await apiClient.get('/dashboard/efficiency-trends', { params });
  return response.data;
};

/**
 * Get cost breakdown by meeting type, department, etc.
 */
export const getCostBreakdown = async (params?: {
  groupBy?: 'type' | 'department' | 'attendeeCount';
  timeRange?: string;
}) => {
  const response = await apiClient.get('/dashboard/cost-breakdown', { params });
  return response.data;
};

/**
 * Get upcoming optimization opportunities
 */
export const getOptimizationOpportunities = async (params?: {
  limit?: number;
  minSavings?: number;
  priorityOrder?: 'savings' | 'impact' | 'effort';
}) => {
  const response = await apiClient.get('/dashboard/optimization-opportunities', { params });
  return response.data;
};
