import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query'
import { userKeys } from './keys'
import { createUser, updateUser, deleteUser } from './api'
import type { User, CreateUserInput, UpdateUserInput } from './types'
import type { ApiError } from '@/lib/api'

/**
 * Mutation hook to create a new user with automatic cache invalidation.
 */
export function useCreateUser(): UseMutationResult<User, ApiError, CreateUserInput> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateUserInput) => createUser(input),
    onSuccess: () => {
      // Invalidate all user list queries so the new user appears
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

interface OptimisticUpdateContext {
  previousUser?: User
  id: string
}

/**
 * Mutation hook for updating a user with optimistic updates and automatic rollback on error.
 */
export function useOptimisticUpdateUser(): UseMutationResult<
  User,
  ApiError,
  { id: string; input: UpdateUserInput },
  OptimisticUpdateContext
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) => updateUser(id, input),
    onMutate: async ({ id, input }) => {
      // Cancel outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: userKeys.detail(id) })

      // Snapshot the previous user data for rollback
      const previousUser = queryClient.getQueryData<User>(userKeys.detail(id))

      // Optimistically update the cache
      if (previousUser) {
        queryClient.setQueryData<User>(userKeys.detail(id), {
          ...previousUser,
          ...input,
          updatedAt: new Date().toISOString(),
        })
      }

      return { previousUser, id }
    },
    onError: (_error, _variables, context) => {
      // Rollback to previous state on failure
      if (context?.previousUser) {
        queryClient.setQueryData(userKeys.detail(context.id), context.previousUser)
      }
    },
    onSettled: (_data, _error, variables) => {
      // Always refetch to ensure client state matches the server
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

/**
 * Mutation hook to delete a user by ID.
 */
export function useDeleteUser(): UseMutationResult<{ success: boolean }, ApiError, string> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: userKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}
