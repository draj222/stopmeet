import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  Event as EventIcon,
  People as PeopleIcon,
  Warning as WarningIcon,
  CheckCircle as ResolveIcon,
  Description as DescriptionIcon,
  AccessTime as TimeIcon,
  ArrowBack as BackIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { getMeetingById, resolveMeetingFlag, getAttendeeRecommendations } from '../../api/meetings';
import { generateAgenda } from '../../api/agenda';

const MeetingDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [resolveDialogOpen, setResolveDialogOpen] = useState<boolean>(false);
  const [selectedFlag, setSelectedFlag] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState<boolean>(false);
  const [generatingAgenda, setGeneratingAgenda] = useState<boolean>(false);
  const [agenda, setAgenda] = useState<string>('');

  useEffect(() => {
    fetchMeetingDetails();
  }, [id]);

  const fetchMeetingDetails = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getMeetingById(id);
      setMeeting(response.meeting);
      
      // Fetch attendee recommendations if meeting has invitees
      if (response.meeting?.inviteeCount > 0) {
        fetchAttendeeRecommendations();
      }
    } catch (err) {
      console.error('Failed to fetch meeting details:', err);
      setError('Failed to load meeting details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendeeRecommendations = async () => {
    if (!id) return;
    
    setLoadingRecommendations(true);
    
    try {
      const response = await getAttendeeRecommendations(id);
      setRecommendations(response.recommendations || []);
    } catch (err) {
      console.error('Failed to fetch attendee recommendations:', err);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleResolveFlag = (flag: any) => {
    setSelectedFlag(flag);
    setResolveDialogOpen(true);
  };

  const confirmResolveFlag = async () => {
    if (!id || !selectedFlag) return;
    
    try {
      await resolveMeetingFlag(id, selectedFlag.id);
      setResolveDialogOpen(false);
      
      // Update the meeting data
      fetchMeetingDetails();
    } catch (err) {
      console.error('Failed to resolve flag:', err);
      setError('Failed to resolve meeting issue. Please try again.');
    }
  };

  const handleGenerateAgenda = async () => {
    if (!meeting) return;
    
    setGeneratingAgenda(true);
    
    try {
      const attendeeNames = meeting.attendees.map((a: any) => a.name || a.email);
      
      const response = await generateAgenda({
        meetingId: meeting.id,
        title: meeting.title,
        duration: getDurationInMinutes(meeting.startTime, meeting.endTime),
        attendees: attendeeNames,
        context: meeting.description
      });
      
      setAgenda(response.agenda);
    } catch (err) {
      console.error('Failed to generate agenda:', err);
      setError('Failed to generate agenda. Please try again.');
    } finally {
      setGeneratingAgenda(false);
    }
  };

  // Helper function to get duration in minutes
  const getDurationInMinutes = (startTime: string, endTime: string) => {
    const start = parseISO(startTime);
    const end = parseISO(endTime);
    
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  };

  // Helper function to format meeting date/time
  const formatMeetingTime = (startTime: string, endTime: string) => {
    const start = parseISO(startTime);
    const end = parseISO(endTime);
    
    const startDate = format(start, 'EEEE, MMMM d, yyyy');
    const startTimeStr = format(start, 'h:mm a');
    const endTimeStr = format(end, 'h:mm a');
    
    return `${startDate}, ${startTimeStr} - ${endTimeStr}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!meeting) {
    return (
      <Alert severity="error">
        Meeting not found. Please try again or go back to the meetings list.
      </Alert>
    );
  }

  const hasFlags = meeting.flags?.length > 0;
  const hasSummary = meeting.summaries?.length > 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/meetings')} sx={{ mr: 1 }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4">
          Meeting Details
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Meeting Details Card */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              {meeting.title}
              {meeting.isRecurring && (
                <Chip
                  label="Recurring"
                  size="small"
                  color="primary"
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>
            
            <List disablePadding>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon>
                  <TimeIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Time"
                  secondary={formatMeetingTime(meeting.startTime, meeting.endTime)}
                />
              </ListItem>
              
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon>
                  <PeopleIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Attendees"
                  secondary={`${meeting.inviteeCount || 0} invited${meeting.attendeeCount ? `, ${meeting.attendeeCount} attended` : ''}`}
                />
              </ListItem>
              
              {meeting.description && (
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <DescriptionIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Description / Agenda"
                    secondary={
                      <Typography
                        component="div"
                        variant="body2"
                        sx={{
                          whiteSpace: 'pre-wrap',
                          bgcolor: 'background.default',
                          p: 2,
                          borderRadius: 1,
                          mt: 1
                        }}
                      >
                        {meeting.description}
                      </Typography>
                    }
                  />
                </ListItem>
              )}
            </List>
            
            {!meeting.hasAgenda && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  This meeting doesn't have an agenda
                </Typography>
                
                <Button
                  variant="contained"
                  onClick={handleGenerateAgenda}
                  disabled={generatingAgenda}
                  startIcon={<EditIcon />}
                >
                  {generatingAgenda ? 'Generating...' : 'Generate Agenda'}
                </Button>
                
                {agenda && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">Generated Agenda:</Typography>
                    <Paper sx={{ p: 2, bgcolor: 'background.default', mt: 1 }}>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {agenda}
                      </Typography>
                    </Paper>
                  </Box>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Issues and Recommendations */}
        <Grid item xs={12} md={4}>
          {/* Efficiency Issues */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Meeting Efficiency Issues
              </Typography>
              
              {hasFlags ? (
                <List disablePadding>
                  {meeting.flags.map((flag: any) => (
                    <ListItem
                      key={flag.id}
                      secondaryAction={
                        <Tooltip title="Resolve Issue">
                          <IconButton
                            edge="end"
                            color="success"
                            onClick={() => handleResolveFlag(flag)}
                          >
                            <ResolveIcon />
                          </IconButton>
                        </Tooltip>
                      }
                      sx={{ px: 0 }}
                    >
                      <ListItemIcon>
                        <WarningIcon color="warning" />
                      </ListItemIcon>
                      <ListItemText
                        primary={flag.description}
                        secondary={`${flag.severity} severity`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No issues detected for this meeting.
                </Typography>
              )}
            </CardContent>
          </Card>
          
          {/* Attendee Recommendations */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Attendee Recommendations
              </Typography>
              
              {loadingRecommendations ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : recommendations.length > 0 ? (
                <List disablePadding>
                  {recommendations.map((rec, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemIcon>
                        <PeopleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box>
                            <Typography component="span">
                              {rec.attendee.name || rec.attendee.email}
                            </Typography>
                            <Chip
                              label={rec.recommendation}
                              size="small"
                              color={rec.recommendation === 'REMOVE' ? 'error' : 'warning'}
                              sx={{ ml: 1 }}
                            />
                          </Box>
                        }
                        secondary={rec.reason}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No attendee recommendations available for this meeting.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Resolve Flag Dialog */}
      <Dialog
        open={resolveDialogOpen}
        onClose={() => setResolveDialogOpen(false)}
      >
        <DialogTitle>Resolve Meeting Issue</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to mark this issue as resolved?
            {selectedFlag && (
              <Box component="span" sx={{ display: 'block', mt: 1, fontWeight: 'bold' }}>
                Issue: {selectedFlag.description}
              </Box>
            )}
            <Box component="span" sx={{ display: 'block', mt: 2 }}>
              When you resolve an issue, it will be counted towards your time savings metrics.
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResolveDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmResolveFlag} color="primary" variant="contained">
            Resolve Issue
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MeetingDetails;
