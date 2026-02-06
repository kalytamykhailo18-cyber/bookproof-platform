'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { Toaster } from 'sonner';
import { LoadingProvider } from './providers/LoadingProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => {
      const client = new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // Data fresh for 5 minutes
            gcTime: 10 * 60 * 1000, // Cache for 10 minutes
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnMount: false, // Don't refetch - data stays fresh for 5min
          },
          mutations: {
            retry: 0,
          },
        },
      });

      return client;
    }
  );

  return (
    <QueryClientProvider client={queryClient}>
      <LoadingProvider>
        {children}
        <Toaster position="top-right" richColors closeButton />
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
      </LoadingProvider>
    </QueryClientProvider>
  );
}
