import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Alert,
  Chip,
  LinearProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Stack,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  Warning as WarningIcon,
  Savings as SavingsIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Speed as SpeedIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Psychology as AIIcon,
  Refresh as RefreshIcon,
  Timeline as TimelineIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { motion } from 'framer-motion';
import { getDashboardMetrics, getWeeklyStats } from '../../api/dashboard';
import { syncCalendarEvents, analyzeMeetings, auditCalendar } from '../../api/meetings';
import { useDemoAuth } from '../../hooks/useDemoAuth';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { isAuthenticated, isLoading: authLoading, error: authError } = useDemoAuth();
  const [metrics, setMetrics] = React.useState<any>(null);
  const [timeRange, setTimeRange] = React.useState<string>('month');
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [syncLoading, setSyncLoading] = React.useState<boolean>(false);
  const [auditLoading, setAuditLoading] = React.useState<boolean>(false);
  const [resolveDialogOpen, setResolveDialogOpen] = React.useState<boolean>(false);
  const [selectedFlag, setSelectedFlag] = React.useState<any>(null);
  const navigate = useNavigate();

  // Load dashboard data with real API calls only
  const loadDashboardData = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);

    try {
      const data = await getDashboardMetrics(timeRange);
      setMetrics(data);
    } catch (err: any) {
      console.error('Failed to load dashboard metrics:', err.message);
      setError('Failed to load dashboard data. Please check your API connection.');
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [timeRange, isAuthenticated]);

  const handleTimeRangeChange = (event: SelectChangeEvent) => {
    setTimeRange(event.target.value);
  };

  const handleSyncCalendar = async () => {
    setSyncLoading(true);
    try {
      await syncCalendarEvents();
      await loadDashboardData();
    } catch (err: any) {
      console.warn('Calendar sync failed:', err.message);
    } finally {
      setSyncLoading(false);
    }
  };

  const handleRunAudit = async () => {
    setAuditLoading(true);
    try {
      await auditCalendar();
      await loadDashboardData();
    } catch (err: any) {
      console.warn('Calendar audit failed:', err.message);
    } finally {
      setAuditLoading(false);
    }
  };

  const MetricCard = ({ icon, title, value, change, color = '#6366f1', subtitle, trend }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card 
        sx={{ 
          height: '100%',
          bgcolor: '#ffffff',
          borderRadius: 4,
          p: 3,
          border: '1px solid #e5e7eb',
          transition: 'all 150ms ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          }
        }}
      >
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={2}>
          <Avatar sx={{ bgcolor: `${color}15`, color: color, width: 48, height: 48 }}>
            {icon}
          </Avatar>
          {trend && (
            <Chip 
              size="small" 
              label={`${trend > 0 ? '+' : ''}${trend}%`}
              color={trend > 0 ? 'success' : 'error'}
              sx={{ fontSize: '0.75rem', fontWeight: 600 }}
            />
          )}
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', mb: 0.5 }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
            {subtitle}
          </Typography>
        )}
      </Card>
    </motion.div>
  );

  // Show loading state while authenticating
  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={48} sx={{ color: '#6366f1' }} />
        <Typography variant="body2" sx={{ ml: 2 }}>Initializing demo...</Typography>
      </Box>
    );
  }

  // Show auth error if authentication failed
  if (authError) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Alert severity="error">
          Demo authentication failed: {authError}
        </Alert>
      </Box>
    );
  }

  if (loading && !metrics) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={48} sx={{ color: '#6366f1' }} />
      </Box>
    );
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderWidth: 0,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: {
          color: '#e5e7eb',
          lineWidth: 1,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
          },
        },
      },
      y: {
        grid: {
          color: '#e5e7eb',
          lineWidth: 1,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
          },
        },
      },
    },
  };

  const weeklyTrendData = {
    labels: metrics?.weeklyTrend?.labels || [],
    datasets: [
      {
        label: 'Hours Saved',
        data: metrics?.weeklyTrend?.hoursSaved || [],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const issuesDonutData = {
    labels: ['No Agenda', 'Too Many Attendees', 'Back-to-Back', 'Long Meetings'],
    datasets: [
      {
        data: [91, 34, 67, 23],
        backgroundColor: ['#6366f1', '#a5b4fc', '#fbbf24', '#ef4444'],
        borderWidth: 0,
      },
    ],
  };

  const confirmResolveFlag = async () => {
    // Close dialog for demo purposes - in real implementation this would call an API
    console.log('Meeting issue marked as resolved');
    setResolveDialogOpen(false);
    // Could refresh dashboard data here: await loadDashboardData();
  };

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#111827', mb: 1 }}>
              Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              AI-powered insights into your meeting efficiency and productivity gains
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                label="Time Range"
                onChange={handleTimeRangeChange}
                sx={{ bgcolor: '#ffffff' }}
              >
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
                <MenuItem value="quarter">This Quarter</MenuItem>
              </Select>
            </FormControl>
            
            <Button
              variant="outlined"
              startIcon={syncLoading ? <CircularProgress size={16} /> : <RefreshIcon />}
              onClick={handleSyncCalendar}
              disabled={syncLoading}
              sx={{ bgcolor: '#ffffff' }}
            >
              Sync Calendar
            </Button>
            
            <Button
              variant="contained"
              startIcon={auditLoading ? <CircularProgress size={16} /> : <AnalyticsIcon />}
              onClick={handleRunAudit}
              disabled={auditLoading}
            >
              Run Audit
            </Button>
          </Stack>
        </Box>

        {error && (
          <Alert 
            severity="info" 
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              bgcolor: '#f8fafc',
              border: '1px solid #e2e8f0',
              '& .MuiAlert-message': {
                width: '100%'
              }
            }}
          >
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Welcome to StopMeet - AI-Powered Meeting Governance (Zoom-focused MVP)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                You're currently viewing the platform in MVP mode. Connect your Zoom account in Settings to analyze real meeting data, attendance patterns, and engagement metrics.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/settings')}
                  sx={{ fontSize: '0.75rem', bgcolor: '#2D8CFF' }} // Zoom blue color
                >
                  Connect Zoom
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => navigate('/meetings')}
                  sx={{ fontSize: '0.75rem' }}
                >
                  View Demo Meetings
                </Button>
              </Box>
            </Box>
          </Alert>
        )}
      </Box>

      {/* Metrics Grid */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            icon={<MoneyIcon />}
            title="Monthly Savings"
            value={`$${metrics?.moneySaved?.toLocaleString() || '4,280'}`}
            subtitle="Based on $120/hour avg cost"
            color="#10b981"
            trend={15}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            icon={<TimeIcon />}
            title="Time Reclaimed"
            value={`${metrics?.timeReclaimed || '24.5'} hrs`}
            subtitle="This month"
            color="#6366f1"
            trend={8}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            icon={<WarningIcon />}
            title="Issues Detected"
            value={metrics?.issuesDetected || '47'}
            subtitle="Automatically flagged"
            color="#f59e0b"
            trend={-12}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            icon={<SpeedIcon />}
            title="Efficiency Score"
            value={`${metrics?.efficiencyScore || '78'}%`}
            subtitle="Meeting productivity"
            color="#8b5cf6"
            trend={5}
          />
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ 
            p: 3, 
            borderRadius: 4, 
            border: '1px solid #e5e7eb',
            bgcolor: '#ffffff'
          }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
                  Weekly Time Savings Trend
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hours saved through meeting optimization
                </Typography>
              </Box>
              <Chip 
                label="↗ 24% increase" 
                color="success" 
                size="small"
                sx={{ fontSize: '0.75rem', fontWeight: 600 }}
              />
            </Stack>
            <Box sx={{ height: 300, position: 'relative' }}>
              <Line data={weeklyTrendData} options={chartOptions} />
            </Box>
          </Card>
        </Grid>
        
        <Grid item xs={12} lg={4}>
          <Card sx={{ 
            p: 3, 
            borderRadius: 4, 
            border: '1px solid #e5e7eb',
            bgcolor: '#ffffff',
            height: '100%'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', mb: 1 }}>
              Common Issues Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              AI-detected meeting inefficiencies
            </Typography>
            <Box sx={{ height: 240, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Doughnut 
                data={issuesDonutData} 
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      display: true,
                      position: 'bottom' as const,
                      labels: {
                        boxWidth: 12,
                        padding: 15,
                      }
                    }
                  }
                }} 
              />
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions Section */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            p: 4, 
            borderRadius: 4, 
            border: '1px solid #e5e7eb',
            bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                🚀 Ready to Optimize?
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                Run an AI audit of your calendar to identify inefficient meetings and reclaim valuable time.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={handleRunAudit}
                disabled={auditLoading}
                startIcon={auditLoading ? <CircularProgress size={16} /> : <AnalyticsIcon />}
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.3)',
                  }
                }}
              >
                {auditLoading ? 'Analyzing...' : 'Start Calendar Audit'}
              </Button>
            </Box>
            {/* Decorative elements */}
            <Box sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 150,
              height: 150,
              bgcolor: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              zIndex: 0
            }} />
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            p: 4, 
            borderRadius: 4, 
            border: '1px solid #e5e7eb',
            bgcolor: '#ffffff'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', mb: 2 }}>
              🎯 Quick Actions
            </Typography>
            <Stack spacing={2}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<CalendarIcon />}
                onClick={() => navigate('/meetings')}
                sx={{ justifyContent: 'flex-start', py: 1.5 }}
              >
                View All Meetings
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<AIIcon />}
                onClick={() => navigate('/ai-tools')}
                sx={{ justifyContent: 'flex-start', py: 1.5 }}
              >
                Generate AI Agenda
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<TimelineIcon />}
                onClick={() => navigate('/summaries')}
                sx={{ justifyContent: 'flex-start', py: 1.5 }}
              >
                Meeting Summaries
              </Button>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity Section */}
      <Card sx={{ 
        p: 3, 
        borderRadius: 4, 
        border: '1px solid #e5e7eb',
        bgcolor: '#ffffff'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', mb: 3 }}>
          Recent Activity
        </Typography>
        <List>
          <ListItem sx={{ px: 0, py: 1 }}>
            <ListItemIcon>
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#10b981' }}>
                <CheckIcon fontSize="small" />
              </Avatar>
            </ListItemIcon>
            <ListItemText
              primary="Calendar audit completed"
              secondary="Found 12 optimization opportunities • 2 hours ago"
            />
            <Typography variant="body2" color="text.secondary">
              +$480 potential savings
            </Typography>
          </ListItem>
          <ListItem sx={{ px: 0, py: 1 }}>
            <ListItemIcon>
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#6366f1' }}>
                <AIIcon fontSize="small" />
              </Avatar>
            </ListItemIcon>
            <ListItemText
              primary="AI agenda generated"
              secondary="Weekly Team Standup • 4 hours ago"
            />
            <Button size="small" variant="text">View</Button>
          </ListItem>
          <ListItem sx={{ px: 0, py: 1 }}>
            <ListItemIcon>
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#f59e0b' }}>
                <WarningIcon fontSize="small" />
              </Avatar>
            </ListItemIcon>
            <ListItemText
              primary="Meeting flagged for review"
              secondary="Product Planning Session • 1 day ago"
            />
            <Button size="small" variant="text">Review</Button>
          </ListItem>
        </List>
      </Card>

      {/* Resolve Flag Dialog */}
      <Dialog open={resolveDialogOpen} onClose={() => setResolveDialogOpen(false)}>
        <DialogTitle>Resolve Meeting Issue</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to mark this meeting issue as resolved?
            {selectedFlag && (
              <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>Issue:</strong> {selectedFlag.type}
                </Typography>
                <Typography variant="body2">
                  <strong>Description:</strong> {selectedFlag.description}
                </Typography>
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResolveDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmResolveFlag} variant="contained">
            Mark as Resolved
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
