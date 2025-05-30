import React, { useState, useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
  Divider,
  Alert
} from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { registerUser, startGoogleAuth } from '../../api/auth';
import AuthContext from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      setError('Please enter your name');
      return;
    }
    
    if (!formData.email || !formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const data = await registerUser(formData);
      login(data.user, data.token);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
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
              Create Account
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleRegister}
            size="large"
            sx={{ mb: 2, py: 1.5 }}
          >
            Sign up with Google
          </Button>
          
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>
          
          <Box component="form" onSubmit={handleRegister} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Full Name"
              name="name"
              autoComplete="name"
              autoFocus
              value={formData.name}
              onChange={handleChange}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2">
                Already have an account?{' '}
                <Link component={RouterLink} to="/login">
                  Sign In
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
        
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Meeting Efficiency Optimizer — Save time and improve productivity
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;
