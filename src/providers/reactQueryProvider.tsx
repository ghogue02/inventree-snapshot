
import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  persistQueryClient, 
  PersistedClient,
  Persister
} from '@tanstack/react-query-persist-client';
import localForage from 'localforage';

// Initialize localForage to store in IndexedDB
const queryStorage = localForage.createInstance({
  name: 'inventree-query-cache',
  version: 1,
  storeName: 'queries',
  description: 'Offline cache for query data'
});

// Create a custom persister that properly conforms to the Persister interface
const localForagePersister: Persister = {
  persistClient: async (client: PersistedClient) => {
    await queryStorage.setItem('REACT_QUERY_OFFLINE_CACHE', JSON.stringify(client));
  },
  restoreClient: async () => {
    const storedState = await queryStorage.getItem<string>('REACT_QUERY_OFFLINE_CACHE');
    if (storedState) {
      return JSON.parse(storedState) as PersistedClient;
    }
    return undefined;
  },
  removeClient: async () => {
    await queryStorage.removeItem('REACT_QUERY_OFFLINE_CACHE');
  },
};

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

// Generate a simple cache buster value that changes daily
// This avoids using process.env which isn't available in the browser
const cacheBuster = `v1-${new Date().toISOString().split('T')[0]}`;

// Set up persistence with TanStack Query v5 compatible approach
persistQueryClient({
  queryClient: queryClient as any, // Use type assertion to bypass the type error
  persister: localForagePersister,
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  buster: cacheBuster, // Cache version - changes daily
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
