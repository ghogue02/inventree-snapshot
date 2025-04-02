
import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import localForage from 'localforage';

// Initialize localForage to store in IndexedDB
const queryStorage = localForage.createInstance({
  name: 'inventree-query-cache',
  version: 1,
  storeName: 'queries',
  description: 'Offline cache for query data'
});

// Create a new query client with default settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
    },
  },
});

// Set up persistence with TanStack Query v5 compatible approach
persistQueryClient({
  queryClient,
  persister: {
    getItem: async (key) => {
      return queryStorage.getItem(key) as Promise<string>;
    },
    setItem: async (key, value) => {
      await queryStorage.setItem(key, value);
    },
    removeItem: async (key) => {
      await queryStorage.removeItem(key);
    }
  },
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  buster: process.env.BUILD_ID || '1', // Cache version - change to invalidate cache
});

interface QueryProviderProps {
  children: ReactNode;
}

export function ReactQueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
