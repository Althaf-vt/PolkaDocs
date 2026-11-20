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
    let isCancelled = false;

    // Attempt silent refresh on boot using HTTP-only cookie
    const initializeAuth = async () => {
      const maxRetries = 3;
      let attempt = 0;

      while (attempt < maxRetries && !isCancelled) {
        try {
          const response = await authApi.refresh();
          if (!isCancelled) {
            setAuth(response.user, response.accessToken);
          }
          return;
        } catch (err: any) {
          if (isCancelled) return;
          const status = err?.response?.status;

          // If the server explicitly rejected the token as invalid or missing, clear auth immediately
          if (status === 401) {
            clearAuth();
            return;
          }

          attempt++;
          if (attempt < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, 1500));
          } else {
            clearAuth();
          }
        }
      }
    };

    void initializeAuth();

    return () => {
      isCancelled = true;
    };
  }, [setAuth, clearAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReloadPrompt />
    </QueryClientProvider>
  );
}

export default App;