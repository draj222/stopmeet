import { useEffect, useState } from 'react';
import { demoLogin } from '../api/auth';

interface UseDemoAuthResult {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useDemoAuth = (): UseDemoAuthResult => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if already authenticated
        const existingToken = localStorage.getItem('token');
        const existingUser = localStorage.getItem('user');

        if (existingToken && existingUser) {
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }

        // Check if we're in demo mode (development or no API URL configured)
        const isDemoMode = process.env.NODE_ENV === 'development' || 
                          !process.env.REACT_APP_API_URL ||
                          process.env.REACT_APP_API_URL.includes('localhost');

        if (isDemoMode) {
          console.log('🎭 Performing automatic demo login...');
          
          // Perform demo login
          const data = await demoLogin();
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          setIsAuthenticated(true);
          console.log('🎭 Demo login successful');
        } else {
          // Production mode - require actual login
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Demo auth error:', err);
        setError('Failed to authenticate');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { isAuthenticated, isLoading, error };
}; 