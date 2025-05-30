import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Tab,
  Tabs,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Avatar,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Event as EventIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  CheckCircle as ResolveIcon,
  DateRange as DateRangeIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { format, isToday, isThisWeek, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import { getMeetings, syncCalendarEvents, analyzeMeetings, resolveMeetingFlag } from '../../api/meetings';
import { useDemoAuth } from '../../hooks/useDemoAuth';

// Helper component for status badge
const MeetingStatusBadge = ({ meeting }: { meeting: any }) => {
  const flagCount = meeting.flags?.length || 0;
  
  if (flagCount > 0) {
    return (
      <Chip
        icon={<WarningIcon />}
        label={`${flagCount} ${flagCount === 1 ? 'issue' : 'issues'}`}
        color="warning"
        size="small"
        sx={{ fontSize: '0.75rem' }}
      />
    );
  }
  
  return (
    <Chip
      label="Optimized"
      color="success"
      size="small"
      sx={{ fontSize: '0.75rem' }}
    />
  );
};

// Helper function to format meeting date/time
const formatMeetingTime = (startTime: string, endTime: string) => {
  const start = parseISO(startTime);
  const end = parseISO(endTime);
  
  const startDate = format(start, 'MMM d, yyyy');
  const startTimeStr = format(start, 'h:mm a');
  const endTimeStr = format(end, 'h:mm a');
  
  return `${startDate}, ${startTimeStr} - ${endTimeStr}`;
};

const Meetings = () => {
  const { isAuthenticated, isLoading: authLoading, error: authError } = useDemoAuth();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [syncLoading, setSyncLoading] = useState<boolean>(false);
  const [tab, setTab] = useState<string>('all');
  const [resolveDialogOpen, setResolveDialogOpen] = useState<boolean>(false);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  const [selectedFlag, setSelectedFlag] = useState<any>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const flaggedParam = queryParams.get('flagged');

  useEffect(() => {
    if (flaggedParam === 'true') {
      setTab('flagged');
    }
    
    if (isAuthenticated) {
      fetchMeetings();
    }
  }, [flaggedParam, isAuthenticated]);

  const fetchMeetings = async (flagged: boolean = tab === 'flagged') => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getMeetings({ flagged });
      setMeetings(response.meetings || []);
    } catch (err) {
      console.error('Failed to fetch meetings:', err);
      setError('Failed to load meetings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncCalendar = async () => {
    setSyncLoading(true);
    
    try {
      await syncCalendarEvents();
      await analyzeMeetings();
      fetchMeetings(tab === 'flagged');
    } catch (err) {
      console.error('Failed to sync calendar:', err);
      setError('Failed to sync calendar. Please try again.');
    } finally {
      setSyncLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTab(newValue);
    fetchMeetings(newValue === 'flagged');
  };

  const handleResolveFlag = (meeting: any, flag: any) => {
    setSelectedMeeting(meeting);
    setSelectedFlag(flag);
    setResolveDialogOpen(true);
  };

  const confirmResolveFlag = async () => {
    if (!selectedMeeting || !selectedFlag) return;
    
    try {
      await resolveMeetingFlag(selectedMeeting.id, selectedFlag.id);
      setResolveDialogOpen(false);
      fetchMeetings(tab === 'flagged');
    } catch (err) {
      console.error('Failed to resolve flag:', err);
      setError('Failed to resolve meeting issue. Please try again.');
    }
  };

  // Filter meetings based on tab
  const filteredMeetings = meetings.filter(meeting => {
    if (tab === 'all') return true;
    if (tab === 'flagged') return meeting.flags?.length > 0;
    if (tab === 'today') return isToday(parseISO(meeting.startTime));
    if (tab === 'upcoming') return isThisWeek(parseISO(meeting.startTime)) && !isToday(parseISO(meeting.startTime));
    return true;
  });

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

  if (loading && meetings.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={48} sx={{ color: '#6366f1' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 0 }}>
      {/* Enhanced Header Section */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
          <Box>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700, 
                color: '#111827', 
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              📅 Meeting Management
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
              Monitor, analyze, and optimize your meeting calendar with AI insights
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            startIcon={syncLoading ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
            onClick={handleSyncCalendar}
            disabled={syncLoading}
            sx={{ 
              py: 1.5,
              px: 4,
              borderRadius: 3,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5855eb 0%, #7c3aed 100%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            {syncLoading ? 'Syncing...' : 'Sync Calendar'}
          </Button>
        </Box>

        {/* Quick Stats Cards */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mb: 4 }}>
          <Card sx={{ 
            flex: 1,
            p: 3, 
            borderRadius: 3,
            border: '1px solid #e5e7eb',
            bgcolor: '#fafafa',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.1)'
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#6366f1', width: 48, height: 48 }}>
                <EventIcon />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827' }}>
                  {meetings.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Meetings
                </Typography>
              </Box>
            </Box>
          </Card>
          
          <Card sx={{ 
            flex: 1,
            p: 3, 
            borderRadius: 3,
            border: '1px solid #e5e7eb',
            bgcolor: '#fafafa',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.1)'
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#ef4444', width: 48, height: 48 }}>
                <WarningIcon />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827' }}>
                  {meetings.filter(m => m.flags?.length > 0).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Flagged Issues
                </Typography>
              </Box>
            </Box>
          </Card>
          
          <Card sx={{ 
            flex: 1,
            p: 3, 
            borderRadius: 3,
            border: '1px solid #e5e7eb',
            bgcolor: '#fafafa',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.1)'
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#10b981', width: 48, height: 48 }}>
                <ScheduleIcon />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827' }}>
                  {meetings.filter(m => isToday(parseISO(m.startTime))).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Today's Meetings
                </Typography>
              </Box>
            </Box>
          </Card>
          
          <Card sx={{ 
            flex: 1,
            p: 3, 
            borderRadius: 3,
            border: '1px solid #e5e7eb',
            bgcolor: '#fafafa',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.1)'
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#f59e0b', width: 48, height: 48 }}>
                <PeopleIcon />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827' }}>
                  {Math.round(meetings.reduce((total, m) => total + (m.attendeeCount || 0), 0) / Math.max(meetings.length, 1))}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg Attendees
                </Typography>
              </Box>
            </Box>
          </Card>
        </Stack>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 4, 
            borderRadius: 3,
            border: '1px solid #fecaca',
            bgcolor: '#fef2f2'
          }}
        >
          {error}
        </Alert>
      )}

      {/* Enhanced Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs 
          value={tab} 
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              py: 2,
              px: 3,
              minHeight: 'auto',
              '&.Mui-selected': {
                color: '#6366f1'
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#6366f1',
              height: 3,
              borderRadius: '3px 3px 0 0'
            }
          }}
        >
          <Tab label="📋 All Meetings" value="all" />
          <Tab label="⚠️ Flagged Issues" value="flagged" />
          <Tab label="📅 Today" value="today" />
          <Tab label="📆 This Week" value="upcoming" />
        </Tabs>
      </Box>

      {/* Meetings Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f9fafb' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>
                    Meeting
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>
                    Date & Time
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>
                    Attendees
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMeetings.map((meeting, index) => (
                  <TableRow 
                    key={meeting.id} 
                    sx={{ 
                      '&:hover': { bgcolor: '#f9fafb' },
                      borderBottom: '1px solid #e5e7eb'
                    }}
                  >
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', mb: 0.5 }}>
                          {meeting.title}
                        </Typography>
                        {meeting.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            {meeting.description.length > 60 
                              ? `${meeting.description.substring(0, 60)}...`
                              : meeting.description
                            }
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        {formatMeetingTime(meeting.startTime, meeting.endTime)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar sx={{ width: 24, height: 24, bgcolor: '#6366f1', fontSize: '0.75rem' }}>
                          <PeopleIcon sx={{ fontSize: '0.875rem' }} />
                        </Avatar>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                          {meeting.attendees?.length || 0}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <MeetingStatusBadge meeting={meeting} />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/dashboard/meetings/${meeting.id}`)}
                            sx={{ 
                              color: '#6366f1',
                              '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.1)' }
                            }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        {meeting.flags?.length > 0 && (
                          <Tooltip title="Resolve Issues">
                            <IconButton
                              size="small"
                              onClick={() => handleResolveFlag(meeting, meeting.flags[0])}
                              sx={{ 
                                color: '#10b981',
                                '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.1)' }
                              }}
                            >
                              <ResolveIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                
                {filteredMeetings.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 8 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <EventIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No meetings found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {tab === 'flagged' 
                            ? 'All your meetings are optimized!'
                            : 'Try syncing your calendar to see meetings here.'
                          }
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </motion.div>

      {/* Resolve Flag Dialog */}
      <Dialog open={resolveDialogOpen} onClose={() => setResolveDialogOpen(false)}>
        <DialogTitle>Resolve Meeting Issue</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to mark this meeting issue as resolved? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResolveDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={confirmResolveFlag} variant="contained" autoFocus>
            Resolve Issue
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Meetings;
