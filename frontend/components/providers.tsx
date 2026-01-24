'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { Toaster } from 'sonner';
import { LoadingProvider } from './providers/LoadingProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes - use cached data
            gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnMount: false, // Don't refetch when component mounts - use cache
          },
          mutations: {
            retry: 0,
          },
        },
      }),
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
