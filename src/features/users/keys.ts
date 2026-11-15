import type { UserFilters } from './types'

/**
 * Hierarchical query key factory for the Users feature.
 * Enables granular and predictable cache invalidation.
 */
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters?: UserFilters) => [...userKeys.lists(), filters ?? {}] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
}
