import axios from 'axios';

// Create axios instance with base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent infinite loops during demo login
let isPerformingDemoLogin = false;

// Request interceptor to add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Check if we're in development/demo mode and not already performing demo login
      const isDemoMode = process.env.NODE_ENV === 'development' || !process.env.REACT_APP_API_URL;
      
      if (isDemoMode && !isPerformingDemoLogin && !error.config.url.includes('/auth/')) {
        isPerformingDemoLogin = true;
        
        try {
          // Try to automatically login as demo user
          const { demoLogin } = await import('./auth');
          const data = await demoLogin();
          
          // Store the token
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          // Retry the original request with the new token
          error.config.headers.Authorization = `Bearer ${data.token}`;
          isPerformingDemoLogin = false;
          
          return apiClient.request(error.config);
        } catch (demoError) {
          console.error('Demo login failed:', demoError);
          isPerformingDemoLogin = false;
        }
      } else if (!isDemoMode) {
        // Production mode - clear token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
