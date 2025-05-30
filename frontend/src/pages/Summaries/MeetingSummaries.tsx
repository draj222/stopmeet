import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  Chip
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Event as EventIcon,
  People as PeopleIcon,
  AccessTime as TimeIcon,
  Assignment as ActionItemIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { getSummaries } from '../../api/summaries';
import { useDemoAuth } from '../../hooks/useDemoAuth';

const MeetingSummaries = () => {
  const { isAuthenticated, isLoading: authLoading, error: authError } = useDemoAuth();
  const [summaries, setSummaries] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      fetchSummaries();
    }
  }, [isAuthenticated]);

  const fetchSummaries = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getSummaries();
      setSummaries(response.summaries || []);
    } catch (err) {
      console.error('Failed to fetch summaries:', err);
      setError('Failed to load meeting summaries. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatMeetingDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    return format(date, 'MMM d, yyyy');
  };

  // Get action item count from summary
  const getActionItemCount = (summary: any) => {
    if (!summary.actionItems) return 0;
    
    try {
      const actionItems = Array.isArray(summary.actionItems) 
        ? summary.actionItems 
        : JSON.parse(summary.actionItems);
      
      return actionItems.length;
    } catch (err) {
      return 0;
    }
  };

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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 0 }}>
      {/* Enhanced Header Section */}
      <Box sx={{ mb: 6 }}>
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
          📝 Meeting Summaries
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem', mb: 4 }}>
          AI-generated insights, key decisions, and action items from your meetings
        </Typography>

        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              p: 2, 
              textAlign: 'center',
              borderRadius: 3,
              border: '1px solid #e5e7eb',
              bgcolor: '#fafafa',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.1)'
              }
            }}>
              <DescriptionIcon sx={{ fontSize: 40, color: '#6366f1', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
                {summaries.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Summaries
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              p: 2, 
              textAlign: 'center',
              borderRadius: 3,
              border: '1px solid #e5e7eb',
              bgcolor: '#fafafa',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.1)'
              }
            }}>
              <ActionItemIcon sx={{ fontSize: 40, color: '#10b981', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
                {summaries.reduce((total, summary) => total + getActionItemCount(summary), 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Action Items
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              p: 2, 
              textAlign: 'center',
              borderRadius: 3,
              border: '1px solid #e5e7eb',
              bgcolor: '#fafafa',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.1)'
              }
            }}>
              <EventIcon sx={{ fontSize: 40, color: '#f59e0b', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
                {summaries.filter(s => new Date(s.meeting.startTime) > new Date(Date.now() - 7*24*60*60*1000)).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This Week
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              p: 2, 
              textAlign: 'center',
              borderRadius: 3,
              border: '1px solid #e5e7eb',
              bgcolor: '#fafafa',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.1)'
              }
            }}>
              <TimeIcon sx={{ fontSize: 40, color: '#8b5cf6', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
                ~{Math.round(summaries.length * 1.5)}h
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Time Saved
              </Typography>
            </Card>
          </Grid>
        </Grid>
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
      
      {summaries.length === 0 ? (
        <Card sx={{ 
          p: 6, 
          textAlign: 'center', 
          borderRadius: 4,
          border: '1px solid #e5e7eb',
          bgcolor: '#fafafa'
        }}>
          <DescriptionIcon sx={{ fontSize: 64, color: '#9ca3af', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#111827', mb: 2 }}>
            No meeting summaries yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
            Start generating AI-powered summaries from your meetings to capture key insights, decisions, and action items automatically.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/meetings')}
            sx={{ 
              py: 1.5,
              px: 4,
              borderRadius: 3,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            View Your Meetings
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {summaries.map((summary) => (
            <Grid item xs={12} md={6} lg={4} key={summary.id}>
              <Card sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 4,
                border: '1px solid #e5e7eb',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  borderColor: '#6366f1'
                }
              }}>
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    color: '#111827',
                    mb: 2,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: 1.3
                  }}>
                    {summary.meeting.title}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                    <EventIcon fontSize="small" sx={{ color: '#6b7280' }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {formatMeetingDate(summary.meeting.startTime)}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 2, borderColor: '#e5e7eb' }} />
                  
                  <Typography variant="body2" sx={{ 
                    mb: 3, 
                    color: '#6b7280',
                    display: '-webkit-box', 
                    WebkitLineClamp: 3, 
                    WebkitBoxOrient: 'vertical', 
                    overflow: 'hidden',
                    lineHeight: 1.5
                  }}>
                    {summary.summary.substring(0, 150)}...
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ActionItemIcon fontSize="small" sx={{ color: '#10b981' }} />
                    <Chip 
                      label={`${getActionItemCount(summary)} action items`} 
                      size="small" 
                      sx={{
                        bgcolor: '#10b98115',
                        color: '#10b981',
                        fontWeight: 600,
                        border: '1px solid #10b98130'
                      }}
                    />
                  </Box>
                </CardContent>
                
                <CardActions sx={{ p: 3, pt: 0 }}>
                  <Button 
                    variant="contained"
                    fullWidth
                    onClick={() => navigate(`/summaries/${summary.id}`)}
                    sx={{
                      py: 1.5,
                      borderRadius: 3,
                      textTransform: 'none',
                      fontSize: '0.95rem',
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
                    View Full Summary
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default MeetingSummaries;
