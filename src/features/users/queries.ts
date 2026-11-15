import { queryOptions, useQuery, type UseQueryResult } from '@tanstack/react-query'
import { userKeys } from './keys'
import { getUsers, getUser } from './api'
import type { User, UserFilters, UserListResponse } from './types'
import type { ApiError } from '@/lib/api'

/**
 * Reusable query options for prefetching, route loaders, and cache inspection.
 */
export const userQueries = {
  list: (filters?: UserFilters) =>
    queryOptions<UserListResponse, ApiError>({
      queryKey: userKeys.list(filters),
      queryFn: ({ signal }) => getUsers(filters, signal),
    }),
  detail: (id: string) =>
    queryOptions<User, ApiError>({
      queryKey: userKeys.detail(id),
      queryFn: ({ signal }) => getUser(id, signal),
      enabled: Boolean(id),
    }),
}

/**
 * Hook to fetch paginated users with optional search/filter criteria.
 */
export function useUsers(filters?: UserFilters): UseQueryResult<UserListResponse, ApiError> {
  return useQuery(userQueries.list(filters))
}

/**
 * Hook to fetch a single user's details by ID.
 */
export function useUser(id: string): UseQueryResult<User, ApiError> {
  return useQuery(userQueries.detail(id))
}
