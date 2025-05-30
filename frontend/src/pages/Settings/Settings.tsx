import React, { useState, useContext, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  TextField,
  FormControlLabel,
  Grid,
  Card,
  CardContent,
  IconButton
} from '@mui/material';
import {
  Google as GoogleIcon,
  Videocam as ZoomIcon,
  Check as CheckIcon,
  Settings as SettingsIcon,
  Sync as SyncIcon,
  MonetizationOn as CostIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import AuthContext from '../../context/AuthContext';
import { getUserProfile, checkZoomStatus } from '../../api/auth';
import { startGoogleAuth, startZoomAuth } from '../../api/auth';
import { useDemoAuth } from '../../hooks/useDemoAuth';
import { syncCalendar, getCalendarStatus } from '../../api/calendar';

const Settings = () => {
  const { user } = useContext(AuthContext);
  const { isAuthenticated, isLoading: authLoading, error: authError } = useDemoAuth();
  
  const [loading, setLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hourlyCost, setHourlyCost] = useState('120');
  const [calendarStatus, setCalendarStatus] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [zoomConnected, setZoomConnected] = useState<boolean>(false);

  // Active check for Zoom connection status
  const checkZoomConnectionStatus = async () => {
    try {
      const result = await checkZoomStatus();
      console.log('Zoom connection check result:', result);
      setZoomConnected(result.zoomConnected);
      
      if (result.zoomConnected) {
        setSuccess('Zoom is connected! You can view your meeting analytics.');
      }
      
      return result.zoomConnected;
    } catch (err) {
      console.error('Failed to check Zoom connection status:', err);
      return false;
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCalendarStatus();
      fetchUserProfile();
      checkZoomConnectionStatus(); // Actively check Zoom status
      
      // Check URL for Zoom connection success parameter
      const params = new URLSearchParams(window.location.search);
      if (params.get('zoomConnected') === 'true') {
        setSuccess('Zoom connected successfully! You can now view your meeting analytics.');
        // Remove the parameter from URL without page refresh
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Force refetch user profile and check Zoom status
        setTimeout(() => {
          fetchUserProfile();
          checkZoomConnectionStatus();
        }, 500);
      }
      
      // Check if we have a zoom connection flag in localStorage
      if (localStorage.getItem('zoomConnected') === 'true') {
        localStorage.removeItem('zoomConnected'); // Remove the flag
        setSuccess('Zoom connected successfully! You can now view your meeting analytics.');
        // Force refetch to update the UI
        fetchUserProfile();
        checkZoomConnectionStatus();
      }
    }
  }, [isAuthenticated]);

  // Show loading while authentication is in progress
  if (authLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={24} sx={{ mr: 2 }} />
        <Typography>Initializing demo...</Typography>
      </Box>
    );
  }

  // Show error if authentication failed
  if (authError) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Authentication Error: {authError}
        </Alert>
      </Box>
    );
  }

  const fetchCalendarStatus = async () => {
    try {
      const status = await getCalendarStatus();
      setCalendarStatus(status);
    } catch (err) {
      console.error('Failed to fetch calendar status:', err);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const profile = await getUserProfile();
      setUserProfile(profile.user);
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    }
  };

  const handleGoogleConnect = async () => {
    setSyncLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Check if already connected
      if (userProfile?.hasGoogleAuth) {
        // If connected, sync calendar
        const result = await syncCalendar();
        if (result.demoMode) {
          setSuccess(`Demo Mode: ${result.message}`);
        } else {
          setSuccess(`Successfully synced ${result.syncedCount} calendar events`);
        }
        await fetchCalendarStatus(); // Refresh status
      } else {
        // If not connected, start OAuth flow
        startGoogleAuth();
      }
    } catch (err: any) {
      console.error('Google Calendar action failed:', err);
      if (err.response?.data?.requiresAuth) {
        setError('Google Calendar not connected. Redirecting to authorization...');
        setTimeout(() => startGoogleAuth(), 2000);
      } else if (err.response?.data?.requiresReauth) {
        setError('Google Calendar authorization expired. Redirecting to re-authorize...');
        setTimeout(() => startGoogleAuth(), 2000);
      } else {
        setError('Failed to sync calendar. Please try again.');
      }
    } finally {
      setSyncLoading(false);
    }
  };

  const handleZoomConnect = () => {
    setError(null);
    setSuccess(null);
    
    // Check if Zoom is already connected using the token presence
    if (userProfile?.zoomTokens) {
      setSuccess('Zoom is already connected!');
      setTimeout(() => setSuccess(null), 3000);
    } else {
      // Start Zoom OAuth flow
      console.log('Starting Zoom OAuth flow...');
      startZoomAuth();
    }
  };

  const handleSaveHourlyCost = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // This would be an API call to update user preferences
      // For the MVP we're not implementing the full backend for this
      setSuccess('Hourly cost updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to update hourly cost:', err);
      setError('Failed to update settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getConnectionStatus = (service: 'google' | 'zoom') => {
    if (service === 'google') {
      return userProfile?.googleTokens || calendarStatus?.hasGoogleCalendar;
    }
    // For Zoom, use our direct connection status check
    return zoomConnected || userProfile?.zoomTokens || calendarStatus?.hasZoomAuth;
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      {/* Status Alert */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Connected Services */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <SettingsIcon sx={{ mr: 1 }} />
                Meeting Data Sources
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Connect to Zoom to analyze your meeting data for the StopMeet MVP
              </Typography>
              
              <List>
                {/* Zoom - Primary Integration */}
                <ListItem 
                  sx={{
                    px: 0, 
                    bgcolor: getConnectionStatus('zoom') ? 'rgba(0, 200, 83, 0.1)' : 'rgba(99, 102, 241, 0.08)', 
                    borderRadius: 1, 
                    mb: 2,
                    border: getConnectionStatus('zoom') ? '1px solid rgba(0, 200, 83, 0.5)' : 'none',
                  }}
                >
                  <ListItemIcon>
                    {getConnectionStatus('zoom') ? (
                      <Box sx={{ position: 'relative', display: 'flex' }}>
                        <ZoomIcon color="primary" sx={{ fontSize: 28 }} />
                        <CheckIcon 
                          sx={{ 
                            position: 'absolute', 
                            right: -10, 
                            bottom: -8, 
                            fontSize: 16, 
                            bgcolor: '#00c853', 
                            color: 'white', 
                            borderRadius: '50%',
                            p: 0.2
                          }} 
                        />
                      </Box>
                    ) : (
                      <ZoomIcon color="primary" sx={{ fontSize: 28 }} />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="subtitle1" fontWeight="bold">Zoom</Typography>
                        {getConnectionStatus('zoom') && (
                          <Box sx={{ ml: 1, bgcolor: '#00c853', color: 'white', px: 1, py: 0.2, borderRadius: 4, fontSize: '0.7rem' }}>
                            CONNECTED
                          </Box>
                        )}
                      </Box>
                    }
                    secondary={<>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Primary Integration:</strong> Connect to Zoom to analyze meeting attendance, duration, and engagement metrics
                      </Typography>
                      {getConnectionStatus('zoom') && (
                        <Typography variant="body2" color="success.main" sx={{ mt: 0.5, fontWeight: 'medium' }}>
                          ✓ Your Zoom account is successfully connected
                        </Typography>
                      )}
                    </>}
                  />
                  <Button
                    variant={getConnectionStatus('zoom') ? "outlined" : "contained"}
                    color={getConnectionStatus('zoom') ? "success" : "primary"}
                    size="large"
                    onClick={handleZoomConnect}
                    startIcon={getConnectionStatus('zoom') ? <CheckIcon /> : null}
                  >
                    {getConnectionStatus('zoom') ? 'Connected' : 'Connect Zoom'}
                  </Button>
                </ListItem>
                
                <Divider sx={{ my: 2 }} />
                
                {/* Google Calendar - Secondary Option */}
                <ListItem sx={{ px: 0, opacity: 0.7 }}>
                  <ListItemIcon>
                    <GoogleIcon color="disabled" />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="subtitle1">Google Calendar</Typography>}
                    secondary={<Typography variant="body2" color="text.secondary">
                      Secondary option (not needed for MVP)
                      {getConnectionStatus('google') ? ' • Connected' : ''}
                    </Typography>}
                  />
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={handleGoogleConnect}
                    disabled={syncLoading || true}
                    startIcon={syncLoading ? <CircularProgress size={16} /> : getConnectionStatus('google') ? <SyncIcon /> : <GoogleIcon />}
                    sx={{ opacity: 0.5 }}
                  >
                    MVP focuses on Zoom
                  </Button>
                </ListItem>
              </List>

              {/* Calendar Status */}
              {calendarStatus && (
                <Box mt={2} p={2} sx={{ backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Sync Status:</strong> {calendarStatus.totalMeetings} meetings synced
                  </Typography>
                  {calendarStatus.lastSync && (
                    <Typography variant="body2" color="textSecondary">
                      <strong>Last Sync:</strong> {new Date(calendarStatus.lastSync).toLocaleString()}
                    </Typography>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Account Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <CostIcon sx={{ mr: 1 }} />
                Account Information
              </Typography>
              
              <List>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Email"
                    secondary={userProfile?.email || 'demo@stopmeet.com'}
                  />
                </ListItem>
                
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Name"
                    secondary={userProfile?.name || 'Demo User'}
                  />
                </ListItem>
                
                <Divider sx={{ my: 1 }} />
                
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Average Hourly Cost"
                    secondary="Used for ROI calculations"
                  />
                </ListItem>
                
                <ListItem sx={{ px: 0 }}>
                  <TextField
                    label="Hourly Cost ($)"
                    type="number"
                    value={hourlyCost}
                    onChange={(e) => setHourlyCost(e.target.value)}
                    fullWidth
                    size="small"
                    InputProps={{
                      startAdornment: <Typography>$</Typography>,
                    }}
                  />
                </ListItem>
                
                <ListItem sx={{ px: 0 }}>
                  <Button
                    variant="contained"
                    onClick={handleSaveHourlyCost}
                    disabled={loading}
                    fullWidth
                  >
                    {loading ? 'Saving...' : 'Save Hourly Cost'}
                  </Button>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Help Section */}
      <Box mt={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Need Help?
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • Connect Google Calendar to sync your actual meetings and get real insights
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • Connect Zoom to enhance meeting data with attendance and engagement metrics
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • Set your hourly cost for accurate ROI calculations and savings estimates
            </Typography>
            {!getConnectionStatus('google') && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>No Google Calendar connected:</strong> Currently showing demo data. 
                  Connect your Google Calendar to see real meeting insights.
                </Typography>
              </Alert>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Settings;
