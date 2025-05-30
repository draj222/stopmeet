import * as React from 'react';
import { getDashboardMetrics, getWeeklyStats, DashboardMetrics } from '../api/dashboard';

interface DashboardContextType {
  metrics: DashboardMetrics | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  timeRange: string;
  setTimeRange: (range: string) => void;
}

const DashboardContext = React.createContext<DashboardContextType | undefined>(undefined);

// Mock data for development
const mockDashboardData: DashboardMetrics = {
  totalMeetings: 247,
  totalHours: 186.5,
  totalCost: 23420,
  hoursSaved: 34.2,
  moneySaved: 4280,
  efficiencyScore: 78,
  averageMeetingDuration: 45,
  meetingsWithAgenda: 156,
  meetingUtilization: 71,
  focusTimeCreated: 28.5,
  topIssues: [
    { type: 'NO_AGENDA', count: 91, impact: 'HIGH' },
    { type: 'TOO_MANY_ATTENDEES', count: 34, impact: 'MEDIUM' },
    { type: 'BACK_TO_BACK', count: 67, impact: 'HIGH' },
    { type: 'LONG_MEETINGS', count: 23, impact: 'MEDIUM' },
  ],
  weeklyTrend: {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    meetingHours: [42, 38, 45, 41],
    hoursSaved: [5, 8, 12, 9],
    costs: [5200, 4800, 5600, 5100],
  },
  meetingsByDay: [8, 42, 38, 45, 41, 32, 15],
  upcomingHighRisk: [
    { 
      id: '1', 
      title: 'All-Hands Meeting', 
      risk: 'HIGH', 
      reason: '150 attendees, no agenda', 
      time: '2024-01-15T10:00:00Z' 
    },
    { 
      id: '2', 
      title: 'Project Sync', 
      risk: 'MEDIUM', 
      reason: 'Back-to-back with standup', 
      time: '2024-01-15T14:00:00Z' 
    },
  ],
  recentWins: [
    { type: 'CANCELLED', title: 'Reduced weekly status from 60min to async update', savings: 4.5 },
    { type: 'OPTIMIZED', title: 'Cut "Design Review" attendees from 12 to 6', savings: 3.0 },
    { type: 'AGENDA', title: 'Added AI-generated agendas to 15 meetings', savings: 7.2 },
  ]
};

interface DashboardProviderProps {
  children: React.ReactNode;
}

export const DashboardProvider: React.FunctionComponent<DashboardProviderProps> = ({ children }) => {
  const [metrics, setMetrics] = React.useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [timeRange, setTimeRange] = React.useState('month');

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);

    try {
      // Try to fetch from API first
      const data = await getDashboardMetrics(timeRange);
      setMetrics(data);
    } catch (err: any) {
      console.warn('API call failed, using mock data:', err.message);
      // Fallback to mock data during development
      setMetrics(mockDashboardData);
      setError(null); // Don't show error in development
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchMetrics();
  }, [timeRange]);

  const value: DashboardContextType = {
    metrics,
    loading,
    error,
    refetch: fetchMetrics,
    timeRange,
    setTimeRange,
  };

  return React.createElement(
    DashboardContext.Provider,
    { value },
    children
  );
};

export const useDashboard = (): DashboardContextType => {
  const context = React.useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}; 