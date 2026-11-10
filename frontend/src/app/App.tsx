import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from '../routes';
import { useAuthStore } from '../stores/auth.store';
import { authApi } from '../api/auth.api';
import { ReloadPrompt } from '@/components/common/ReloadPrompt';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
    },
  },
});

export function App() {
  const { setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    // Attempt silent refresh on boot using HTTP-only cookie
    const initializeAuth = async () => {
      try {
        const response = await authApi.refresh();
        setAuth(response.user, response.accessToken);
      } catch {
        clearAuth();
      }
    };

    void initializeAuth();
  }, [setAuth, clearAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReloadPrompt />
    </QueryClientProvider>
  );
}

export default App;