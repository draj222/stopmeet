import apiClient from './client';

/**
 * Register a new user
 */
export const registerUser = async (userData: any) => {
  const response = await apiClient.post('/auth/register', userData);
  return response.data;
};

/**
 * Login user
 */
export const loginUser = async (email: string) => {
  const response = await apiClient.post('/auth/login', { email });
  return response.data;
};

/**
 * Demo login - automatically login as demo user
 */
export const demoLogin = async () => {
  try {
    const response = await apiClient.post('/auth/login', { 
      email: 'demo@stopmeet.com' 
    });
    return response.data;
  } catch (error) {
    // If demo user doesn't exist, register it first
    console.log('Demo user not found, creating...');
    await apiClient.post('/auth/register', {
      email: 'demo@stopmeet.com',
      name: 'Demo User'
    });
    // Then login
    const response = await apiClient.post('/auth/login', { 
      email: 'demo@stopmeet.com' 
    });
    return response.data;
  }
};

/**
 * Get current user profile
 */
export const getUserProfile = async (token?: string) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await apiClient.get('/auth/me', { headers });
  return response.data;
};

/**
 * Refresh token
 */
export const refreshToken = async (token: string) => {
  const response = await apiClient.post('/auth/refresh-token', { token });
  return response.data;
};

/**
 * Start Google OAuth flow
 */
export const startGoogleAuth = () => {
  window.location.href = `${apiClient.defaults.baseURL}/auth/google`;
};

/**
 * Start Zoom OAuth flow
 */
export const startZoomAuth = () => {
  // Use the standard Zoom auth endpoint which will use demo mode if enabled
  const zoomAuthUrl = `${apiClient.defaults.baseURL}/auth/zoom`;
  console.log('Starting Zoom OAuth flow, redirecting to:', zoomAuthUrl);
  
  // Force redirect to the backend Zoom auth endpoint
  window.location.href = zoomAuthUrl;
};

/**
 * Check Zoom connection status
 */
export const checkZoomStatus = async () => {
  try {
    const response = await apiClient.get('/auth/zoom-status');
    console.log('Zoom status check result:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to check Zoom status:', error);
    return { zoomConnected: false };
  }
};
