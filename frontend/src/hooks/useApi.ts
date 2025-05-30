import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
): ApiState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = async () => {
    setState((prev: ApiState<T>) => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await apiCall();
      setState({ data, loading: false, error: null });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      setState({ data: null, loading: false, error: errorMessage });
      console.error('API Error:', errorMessage);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return {
    ...state,
    refetch: fetchData,
  };
}

export function useApiMutation<T, P = void>(): {
  mutate: (params: P) => Promise<T>;
  loading: boolean;
  error: string | null;
} {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (params: P): Promise<T> => {
    setLoading(true);
    setError(null);
    
    try {
      // This would be replaced by actual API call
      throw new Error('API call not implemented');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      setError(errorMessage);
      console.error('API Mutation Error:', errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
} 