import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Global query options
      staleTime: 0, // Always consider data stale for fresh fetches
      cacheTime: 0, // Don't cache data to prevent stale data issues
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors except 408, 429
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          if (error?.response?.status === 408 || error?.response?.status === 429) {
            return failureCount < 2;
          }
          return false;
        }
        // Retry on network errors and 5xx errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: true, // Always refetch on focus
      refetchOnReconnect: true,
      refetchOnMount: 'always', // Always refetch on mount
    },
    mutations: {
      // Global mutation options
      retry: (failureCount, error: any) => {
        // Don't retry mutations on client errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry on network errors and 5xx errors
        return failureCount < 2;
      },
    },
  },
});

// Clear all queries when user logs out or logs in
export const clearAllQueries = () => {
  queryClient.clear();
};

// Invalidate all queries to force fresh data
export const invalidateAllQueries = () => {
  queryClient.invalidateQueries();
};

interface QueryProviderProps {
  children: ReactNode;
}

// Query Client Provider Component
export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

export { queryClient };