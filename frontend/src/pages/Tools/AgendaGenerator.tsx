import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Divider,
  OutlinedInput,
  SelectChangeEvent
} from '@mui/material';
import { generateAgenda, saveAgenda } from '../../api/agenda';
import { getMeetings } from '../../api/meetings';
import { useDemoAuth } from '../../hooks/useDemoAuth';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const AgendaGenerator = () => {
  const { isAuthenticated, isLoading: authLoading, error: authError } = useDemoAuth();
  const [formData, setFormData] = useState({
    meetingId: '',
    title: '',
    duration: 30,
    attendees: [] as string[],
    context: ''
  });
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [generatedAgenda, setGeneratedAgenda] = useState<string>('');
  const [meetingsLoading, setMeetingsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUpcomingMeetings();
    }
  }, [isAuthenticated]);

  const fetchUpcomingMeetings = async () => {
    if (!isAuthenticated) return;
    
    setMeetingsLoading(true);
    
    try {
      const response = await getMeetings();
      // Filter only upcoming meetings
      const upcomingMeetings = response.meetings.filter((meeting: any) => 
        new Date(meeting.startTime) > new Date()
      );
      
      setMeetings(upcomingMeetings);
    } catch (err) {
      console.error('Failed to fetch upcoming meetings:', err);
      setError('Failed to load upcoming meetings. You can still create an agenda manually.');
    } finally {
      setMeetingsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const meetingId = e.target.value;
    
    if (meetingId) {
      // Find the selected meeting
      const selectedMeeting = meetings.find(m => m.id === meetingId);
      
      if (selectedMeeting) {
        // Pre-fill form with meeting details
        const attendeeNames = selectedMeeting.attendees?.map((a: any) => a.name || a.email) || [];
        const duration = calculateDurationInMinutes(selectedMeeting.startTime, selectedMeeting.endTime);
        
        setFormData({
          meetingId,
          title: selectedMeeting.title,
          duration,
          attendees: attendeeNames,
          context: selectedMeeting.description || ''
        });
      }
    } else {
      // Clear form if "Custom Meeting" is selected
      setFormData({
        meetingId: '',
        title: '',
        duration: 30,
        attendees: [],
        context: ''
      });
    }
  };

  const handleAttendeesChange = (event: SelectChangeEvent<string[]>) => {
    const { value } = event.target;
    setFormData({
      ...formData,
      attendees: typeof value === 'string' ? value.split(',') : value,
    });
  };

  const handleGenerateAgenda = async () => {
    if (!formData.title) {
      setError('Meeting title is required');
      return;
    }
    
    setGenerating(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await generateAgenda(formData);
      setGeneratedAgenda(response.agenda);
      setSuccess('Agenda generated successfully!');
    } catch (err) {
      console.error('Failed to generate agenda:', err);
      setError('Failed to generate agenda. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveAgenda = async () => {
    if (!formData.meetingId || !generatedAgenda) {
      setError('Cannot save agenda: No meeting selected or no agenda generated');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await saveAgenda({
        meetingId: formData.meetingId,
        agenda: generatedAgenda
      });
      
      setSuccess('Agenda saved to meeting successfully!');
    } catch (err) {
      console.error('Failed to save agenda:', err);
      setError('Failed to save agenda to meeting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateDurationInMinutes = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        AI Agenda Generator
      </Typography>
      
      <Typography variant="body1" paragraph>
        Generate professional meeting agendas with AI. Select an upcoming meeting or create a custom agenda.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Meeting Details
            </Typography>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="meeting-select-label">Select Meeting</InputLabel>
              <Select
                labelId="meeting-select-label"
                id="meeting-select"
                value={formData.meetingId}
                onChange={handleSelectChange}
                label="Select Meeting"
                disabled={meetingsLoading}
              >
                <MenuItem value="">
                  <em>Custom Meeting</em>
                </MenuItem>
                {meetings.map((meeting) => (
                  <MenuItem key={meeting.id} value={meeting.id}>
                    {meeting.title}
                  </MenuItem>
                ))}
              </Select>
              {meetingsLoading && (
                <CircularProgress size={20} sx={{ position: 'absolute', right: 40, top: 15 }} />
              )}
            </FormControl>
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="title"
              label="Meeting Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
            />
            
            <TextField
              margin="normal"
              fullWidth
              id="duration"
              label="Duration (minutes)"
              name="duration"
              type="number"
              value={formData.duration}
              onChange={handleInputChange}
              InputProps={{ inputProps: { min: 1 } }}
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="attendees-label">Attendees</InputLabel>
              <Select
                labelId="attendees-label"
                id="attendees"
                multiple
                value={formData.attendees}
                onChange={handleAttendeesChange}
                input={<OutlinedInput id="select-multiple-chip" label="Attendees" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {formData.attendees.map((name) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              margin="normal"
              fullWidth
              id="context"
              label="Additional Context"
              name="context"
              multiline
              rows={4}
              value={formData.context}
              onChange={handleInputChange}
              placeholder="Add any additional context about the meeting that would help generate a better agenda"
            />
            
            <Button
              variant="contained"
              fullWidth
              onClick={handleGenerateAgenda}
              disabled={generating || !formData.title}
              sx={{ mt: 3 }}
            >
              {generating ? 'Generating...' : 'Generate Agenda'}
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Generated Agenda
            </Typography>
            
            {generating ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                <CircularProgress />
              </Box>
            ) : generatedAgenda ? (
              <>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: 'background.default',
                    minHeight: 200,
                    mb: 3,
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {generatedAgenda}
                </Paper>
                
                {formData.meetingId && (
                  <Button
                    variant="contained"
                    color="secondary"
                    fullWidth
                    onClick={handleSaveAgenda}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save to Meeting'}
                  </Button>
                )}
              </>
            ) : (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: 200,
                bgcolor: 'background.default',
                borderRadius: 1
              }}>
                <Typography variant="body1" color="text.secondary">
                  Your generated agenda will appear here
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AgendaGenerator;
