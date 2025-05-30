import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Event as EventIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  Assignment as ActionItemIcon,
  Person as PersonIcon,
  Today as DateIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { getSummaryById } from '../../api/summaries';

const SummaryDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<any>(null);
  const [actionItems, setActionItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSummaryDetails();
  }, [id]);

  const fetchSummaryDetails = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getSummaryById(id);
      setSummary(response.summary);
      
      // Parse action items
      if (response.summary.actionItems) {
        const items = Array.isArray(response.summary.actionItems) 
          ? response.summary.actionItems 
          : JSON.parse(response.summary.actionItems);
          
        setActionItems(items);
      }
    } catch (err) {
      console.error('Failed to fetch summary details:', err);
      setError('Failed to load summary details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatMeetingDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    return format(date, 'EEEE, MMMM d, yyyy');
  };

  const formatMeetingTime = (startTime: string, endTime: string) => {
    const start = parseISO(startTime);
    const end = parseISO(endTime);
    
    const startTimeStr = format(start, 'h:mm a');
    const endTimeStr = format(end, 'h:mm a');
    
    return `${startTimeStr} - ${endTimeStr}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!summary) {
    return (
      <Alert severity="error">
        Summary not found. Please try again or go back to the summaries list.
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/summaries')} sx={{ mr: 1 }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4">
          Meeting Summary
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {/* Meeting Info */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              {summary.meeting.title}
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EventIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {formatMeetingDate(summary.meeting.startTime)}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PeopleIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {summary.meeting.inviteeCount || 0} attendees
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Summary
            </Typography>
            
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {summary.summary}
            </Typography>
          </Paper>
          
          {/* Action Items */}
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ActionItemIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">
                Action Items ({actionItems.length})
              </Typography>
            </Box>
            
            {actionItems.length === 0 ? (
              <Typography variant="body1" color="text.secondary">
                No action items were identified in this meeting.
              </Typography>
            ) : (
              <List>
                {actionItems.map((item, index) => (
                  <ListItem
                    key={index}
                    alignItems="flex-start"
                    sx={{ px: 0, borderBottom: index < actionItems.length - 1 ? '1px solid rgba(0, 0, 0, 0.12)' : 'none' }}
                  >
                    <ListItemIcon>
                      <AssigneeAvatar name={item.assignee} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body1" fontWeight="medium">
                          {item.task}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              Assigned to: {item.assignee}
                            </Typography>
                          </Box>
                          
                          {item.dueDate && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <DateIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                Due: {item.dueDate}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
        
        {/* Meeting Details Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Meeting Details
              </Typography>
              
              <List disablePadding>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <EventIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Date"
                    secondary={formatMeetingDate(summary.meeting.startTime)}
                  />
                </ListItem>
                
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <PeopleIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Time"
                    secondary={formatMeetingTime(summary.meeting.startTime, summary.meeting.endTime)}
                  />
                </ListItem>
                
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <PeopleIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Participants"
                    secondary={`${summary.meeting.inviteeCount || 0} invited${summary.meeting.attendeeCount ? `, ${summary.meeting.attendeeCount} attended` : ''}`}
                  />
                </ListItem>
              </List>
              
              <Divider sx={{ my: 2 }} />
              
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate(`/meetings/${summary.meeting.id}`)}
              >
                View Original Meeting
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// Helper component to display assignee avatar
const AssigneeAvatar = ({ name }: { name: string }) => {
  // Create an initial from the name
  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };
  
  // Generate a deterministic color based on the name
  const getColor = (name: string) => {
    const colors = [
      '#f44336', '#e91e63', '#9c27b0', '#673ab7', 
      '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', 
      '#009688', '#4caf50', '#8bc34a', '#cddc39',
      '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        fontWeight: 'bold',
        bgcolor: getColor(name)
      }}
    >
      {getInitial(name)}
    </Box>
  );
};

export default SummaryDetails;
