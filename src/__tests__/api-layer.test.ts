import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { ApiError, isApiError } from '../lib/api/errors'
import { normalizeError } from '../lib/api/client'
import { userKeys } from '../features/users/keys'
import { userSchema, userListResponseSchema } from '../features/users/types'
import { queryClient } from '../lib/query/queryClient'
import { env } from '../config/env'

describe('Production API Layer - Unit Tests', () => {
  describe('Environment Configuration', () => {
    it('provides a validated apiBaseUrl', () => {
      assert.ok(env.apiBaseUrl, 'env.apiBaseUrl must be defined')
      assert.ok(typeof env.apiBaseUrl === 'string', 'apiBaseUrl must be a string')
      assert.ok(typeof env.isDev === 'boolean', 'isDev must be boolean')
    })
  })

  describe('ApiError & Normalization', () => {
    it('creates structured ApiError instances with custom properties', () => {
      const error = new ApiError({
        status: 404,
        code: 'USER_NOT_FOUND',
        message: 'The requested user could not be found',
        details: { userId: '123' },
      })

      assert.strictEqual(error.status, 404)
      assert.strictEqual(error.code, 'USER_NOT_FOUND')
      assert.strictEqual(error.message, 'The requested user could not be found')
      assert.deepStrictEqual(error.details, { userId: '123' })
      assert.strictEqual(error.isApiError, true)
      assert.strictEqual(isApiError(error), true)
    })

    it('identifies network errors and cancellation correctly', () => {
      const netErr = ApiError.networkError('Offline')
      assert.strictEqual(netErr.status, 0)
      assert.strictEqual(netErr.code, 'NETWORK_ERROR')
      assert.strictEqual(isApiError(netErr), true)

      const cancelErr = ApiError.cancelled('User aborted request')
      assert.strictEqual(cancelErr.status, 0)
      assert.strictEqual(cancelErr.code, 'CANCELLED')
      assert.strictEqual(cancelErr.isCancelled, true)
    })

    it('normalizes arbitrary errors into ApiError instances', () => {
      const rawError = new Error('Database connection failed')
      const normalized = normalizeError(rawError)

      assert.strictEqual(isApiError(normalized), true)
      assert.strictEqual(normalized.message, 'Database connection failed')
      assert.strictEqual(normalized.code, 'UNKNOWN_ERROR')
    })
  })

  describe('Query Key Factory', () => {
    it('produces hierarchical and deterministic query keys', () => {
      assert.deepStrictEqual(userKeys.all, ['users'])
      assert.deepStrictEqual(userKeys.lists(), ['users', 'list'])
      assert.deepStrictEqual(userKeys.list({ search: 'admin', page: 1, limit: 10 }), [
        'users',
        'list',
        { search: 'admin', page: 1, limit: 10 },
      ])
      assert.deepStrictEqual(userKeys.details(), ['users', 'detail'])
      assert.deepStrictEqual(userKeys.detail('usr_42'), ['users', 'detail', 'usr_42'])
    })
  })

  describe('TanStack Query Client Configuration', () => {
    it('configures sensible production defaults', () => {
      const defaultQueryOptions = queryClient.getDefaultOptions().queries
      assert.strictEqual(defaultQueryOptions?.staleTime, 60000, 'staleTime must be 60 seconds')
      assert.strictEqual(defaultQueryOptions?.gcTime, 300000, 'gcTime must be 5 minutes')
      assert.strictEqual(defaultQueryOptions?.refetchOnWindowFocus, false)

      // Test retry predicate skips 4xx
      const retryFn = defaultQueryOptions?.retry as (failureCount: number, error: unknown) => boolean
      const clientError = new ApiError({ status: 404, code: 'NOT_FOUND', message: 'Not found' })
      assert.strictEqual(retryFn(0, clientError), false, 'Must not retry 4xx errors')

      const serverError = new ApiError({ status: 500, code: 'SERVER_ERROR', message: 'Server error' })
      assert.strictEqual(retryFn(0, serverError), true, 'Must retry 500 errors on first failure')
      assert.strictEqual(retryFn(2, serverError), false, 'Must not retry after 2 failures')
    })
  })

  describe('Zod Runtime Schema Validation', () => {
    it('validates valid user data and rejects invalid schemas', () => {
      const validUser = {
        id: 'u_1',
        name: 'Aman Deep',
        email: 'aman@example.com',
        role: 'member',
        status: 'active',
        createdAt: '2026-11-15T12:00:00Z',
      }

      const parsed = userSchema.safeParse(validUser)
      assert.strictEqual(parsed.success, true)

      const invalidUser = {
        id: 'u_2',
        name: '', // Empty name violates min(1)
        email: 'not-an-email',
      }
      const invalidParsed = userSchema.safeParse(invalidUser)
      assert.strictEqual(invalidParsed.success, false)
    })

    it('validates paginated user list response', () => {
      const validList = {
        items: [
          {
            id: 'u_1',
            name: 'Aman Deep',
            email: 'aman@example.com',
            role: 'member',
            status: 'active',
            createdAt: '2026-11-15T12:00:00Z',
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      }

      const parsed = userListResponseSchema.safeParse(validList)
      assert.strictEqual(parsed.success, true)
    })
  })
})
