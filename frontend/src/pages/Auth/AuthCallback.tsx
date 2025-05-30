import React, { useEffect, useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, CircularProgress, Paper, Container } from '@mui/material';
import AuthContext from '../../context/AuthContext';
import { getUserProfile } from '../../api/auth';

const AuthCallback = () => {
  const [error, setError] = useState<string | null>(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Parse the token from the URL query parameters
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('token');
        const error = queryParams.get('error');
        const zoomConnected = queryParams.get('zoomConnected');
        const demo = queryParams.get('demo');
        
        // Check if there's an error parameter
        if (error) {
          setError(decodeURIComponent(error));
          return;
        }
        
        if (!token) {
          setError('No authentication token received');
          return;
        }
        
        // Fetch user profile with the token
        const data = await getUserProfile(token);
        
        // Set user in context and store token
        login(data.user, token);
        
        // If this is a Zoom connection callback, redirect to settings with a success message
        if (zoomConnected === 'true') {
          console.log('Zoom connected successfully, redirecting to settings...');
          // Force a refresh of the user profile to show Zoom as connected
          localStorage.setItem('zoomConnected', 'true');
          
          // Redirect to settings page with success parameter
          navigate('/settings?zoomConnected=true');
          return;
        }
        
        // Otherwise redirect to dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Authentication callback error:', error);
        setError('Failed to complete authentication. Please try again.');
      }
    };
    
    handleCallback();
  }, [login, navigate, location.search]);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh'
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            textAlign: 'center',
            borderRadius: 2
          }}
        >
          {error ? (
            <>
              <Typography variant="h5" color="error" gutterBottom>
                Authentication Failed
              </Typography>
              <Typography variant="body1">{error}</Typography>
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2">
                  Please try signing in again.
                </Typography>
              </Box>
            </>
          ) : (
            <>
              <CircularProgress size={60} sx={{ mb: 3 }} />
              <Typography variant="h5" gutterBottom>
                Completing Authentication
              </Typography>
              <Typography variant="body1">
                Please wait while we set up your account...
              </Typography>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default AuthCallback;
