import { http } from '@/lib/api'
import {
  userSchema,
  userListResponseSchema,
  type User,
  type UserListResponse,
  type CreateUserInput,
  type UpdateUserInput,
  type UserFilters,
} from './types'

/**
 * Fetch a paginated list of users with optional filtering.
 */
export async function getUsers(
  filters?: UserFilters,
  signal?: AbortSignal
): Promise<UserListResponse> {
  return http.get<UserListResponse>(
    '/users',
    {
      params: filters,
      signal,
    },
    userListResponseSchema
  )
}

/**
 * Fetch a single user by their ID.
 */
export async function getUser(id: string, signal?: AbortSignal): Promise<User> {
  return http.get<User>(
    `/users/${encodeURIComponent(id)}`,
    { signal },
    userSchema
  )
}

/**
 * Create a new user.
 */
export async function createUser(
  input: CreateUserInput,
  signal?: AbortSignal
): Promise<User> {
  return http.post<User, CreateUserInput>(
    '/users',
    input,
    { signal },
    userSchema
  )
}

/**
 * Update an existing user by ID.
 */
export async function updateUser(
  id: string,
  input: UpdateUserInput,
  signal?: AbortSignal
): Promise<User> {
  return http.patch<User, UpdateUserInput>(
    `/users/${encodeURIComponent(id)}`,
    input,
    { signal },
    userSchema
  )
}

/**
 * Delete a user by ID.
 */
export async function deleteUser(
  id: string,
  signal?: AbortSignal
): Promise<{ success: boolean }> {
  return http.del<{ success: boolean }>(`/users/${encodeURIComponent(id)}`, {
    signal,
  })
}
