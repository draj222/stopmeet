import React, { useState, useContext, useEffect } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
  Divider,
  Alert,
  Chip
} from '@mui/material';
import { 
  Google as GoogleIcon,
  Videocam as ZoomIcon 
} from '@mui/icons-material';
import { loginUser, startGoogleAuth, startZoomAuth } from '../../api/auth';
import AuthContext from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { login } = useContext(AuthContext);
  const location = useLocation();

  // Check for error messages in URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errorParam = params.get('error');
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [location]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const data = await loginUser(email);
      login(data.user, data.token);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleZoomLogin = () => {
    setMessage('Connecting with Zoom...');
    startZoomAuth();
  };

  const handleGoogleLogin = () => {
    startGoogleAuth();
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          py: 4
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2
          }}
        >
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography component="h1" variant="h4" fontWeight="bold" color="primary">
              StopMeet
            </Typography>
            <Typography variant="h5" sx={{ mt: 1 }}>
              Sign In
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              Meeting analytics powered by Zoom
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {message && (
            <Alert severity="info" sx={{ mb: 3 }}>
              {message}
            </Alert>
          )}
          
          <Box sx={{ position: 'relative', mb: 3 }}>
            <Chip 
              label="Recommended" 
              color="primary" 
              size="small" 
              sx={{ 
                position: 'absolute', 
                top: -10, 
                right: 10, 
                fontSize: '0.7rem', 
                fontWeight: 'bold',
                zIndex: 1
              }} 
            />
            <Button
              fullWidth
              variant="contained"
              startIcon={<ZoomIcon />}
              onClick={handleZoomLogin}
              size="large"
              sx={{ 
                mb: 2, 
                py: 1.8,
                bgcolor: '#2D8CFF', // Zoom blue
                '&:hover': {
                  bgcolor: '#2681EB', // Slightly darker on hover
                },
                fontWeight: 'bold'
              }}
            >
              Sign in with Zoom
            </Button>
            <Typography variant="caption" color="text.secondary" align="center" display="block">
              Connect with Zoom to analyze your meeting data
            </Typography>
          </Box>
          
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OTHER OPTIONS
            </Typography>
          </Divider>
          
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            size="large"
            sx={{ mb: 2, py: 1.5 }}
          >
            Sign in with Google
          </Button>
          
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>
          
          <Box component="form" onSubmit={handleEmailLogin} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2">
                Don't have an account?{' '}
                <Link component={RouterLink} to="/register">
                  Sign Up
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
        
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Meeting Efficiency Optimizer — Reclaim your time from unproductive meetings
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
