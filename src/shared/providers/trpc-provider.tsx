'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import superjson from 'superjson';

import { trpc } from '@/shared/lib/trpc/client';

function getBaseUrl() {
  if (typeof window !== 'undefined') return '';
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 1000, // 5 seconds
            refetchOnWindowFocus: false,
          },
          mutations: {
            // Retry mutations on network errors
            // - Retry up to 2 times (3 attempts total)
            // - Only retry on network errors, not validation/business logic errors
            // - Use exponential backoff: 1s, 2s
            retry: (failureCount, error) => {
              // Don't retry if it's a known application error (4xx errors)
              if (error instanceof Error) {
                const errorMessage = error.message.toLowerCase();
                // Don't retry on validation errors, auth errors, or business logic errors
                if (
                  errorMessage.includes('validation') ||
                  errorMessage.includes('unauthorized') ||
                  errorMessage.includes('forbidden') ||
                  errorMessage.includes('not found') ||
                  errorMessage.includes('already exists')
                ) {
                  return false;
                }
              }

              // Retry up to 2 times on network/server errors
              return failureCount < 2;
            },
            retryDelay: (attemptIndex) => {
              // Exponential backoff: 1s, 2s
              return Math.min(1000 * 2 ** attemptIndex, 30000);
            },
          },
        },
      }),
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: superjson,
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
