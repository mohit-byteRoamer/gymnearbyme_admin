import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query'
import { isApiError } from '@/lib/api/errors'
import { env } from '@/config/env'

/**
 * Global QueryClient instance with production-grade defaults.
 */
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Don't log if query explicitly opted out or is cancelled
      if (isApiError(error) && error.isCancelled) {
        return
      }

      if (env.isDev) {
        console.error(
          `%c[Query Error] %c${JSON.stringify(query.queryKey)}`,
          'color: #B91C1C; font-weight: bold;',
          'color: #0F172A;',
          error
        )
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (isApiError(error) && error.isCancelled) {
        return
      }

      if (env.isDev) {
        console.error(
          `%c[Mutation Error] %c${mutation.options.mutationKey ? JSON.stringify(mutation.options.mutationKey) : 'anonymous'}`,
          'color: #B91C1C; font-weight: bold;',
          'color: #0F172A;',
          error
        )
      }
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 60 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Do not retry client 4xx errors (e.g. 400 Bad Request, 401 Unauthorized, 404 Not Found)
        if (isApiError(error) && error.status >= 400 && error.status < 500) {
          return false
        }
        // Retry network or 5xx errors up to 2 times
        return failureCount < 2
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
    mutations: {
      retry: false,
    },
  },
})
