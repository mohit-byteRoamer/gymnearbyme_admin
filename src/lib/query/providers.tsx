import React from 'react'
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient as defaultQueryClient } from './queryClient'
import { env } from '@/config/env'

export interface QueryProviderProps {
  children: React.ReactNode
  client?: QueryClient
}

/**
 * App-wide TanStack Query Provider with devtools enabled during development.
 */
export function QueryProvider({ children, client = defaultQueryClient }: QueryProviderProps) {
  return (
    <QueryClientProvider client={client}>
      {children}
      {env.isDev && <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />}
    </QueryClientProvider>
  )
}
