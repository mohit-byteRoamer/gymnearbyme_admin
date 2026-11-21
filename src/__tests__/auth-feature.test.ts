import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  adminLoginRequestSchema,
  adminLoginResponseSchema,
  refreshTokensResponseSchema,
} from '../features/auth/types'
import { authKeys } from '../features/auth/keys'

describe('Admin Authentication Feature - Unit Tests', () => {
  describe('Zod Schema Validation', () => {
    it('validates admin login request with defaults', () => {
      const payload = {
        email: 'mohit878421@gmail.com',
        password: 'Pass@123',
        role: 'super_admin' as const,
      }
      const parsed = adminLoginRequestSchema.safeParse(payload)
      assert.strictEqual(parsed.success, true)
      if (parsed.success) {
        assert.strictEqual(parsed.data.email, 'mohit878421@gmail.com')
        assert.strictEqual(parsed.data.password, 'Pass@123')
        assert.strictEqual(parsed.data.role, 'super_admin')
      }
    })

    it('rejects invalid email formats for admin login', () => {
      const invalid = { email: 'not-an-email', role: 'super_admin' }
      const parsed = adminLoginRequestSchema.safeParse(invalid)
      assert.strictEqual(parsed.success, false)
    })

    it('validates successful POST /api/v1/auth/admin/login response structure', () => {
      const mockResponse = {
        user: {
          id: 'staff-mohit',
          email: 'mohit878421@gmail.com',
          name: 'Mohit (Super Admin)',
        },
        role: 'super_admin',
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      }

      const parsed = adminLoginResponseSchema.safeParse(mockResponse)
      assert.strictEqual(parsed.success, true)
      if (parsed.success) {
        assert.strictEqual(parsed.data.user.id, 'staff-mohit')
        assert.strictEqual(parsed.data.role, 'super_admin')
        assert.ok(parsed.data.accessToken.length > 10)
        assert.ok(parsed.data.refreshToken.length > 10)
      }
    })

    it('validates POST /api/v1/auth/refresh response structure', () => {
      const mockRefresh = {
        accessToken: 'new-jwt-access-token',
        refreshToken: 'new-jwt-refresh-token',
      }
      const parsed = refreshTokensResponseSchema.safeParse(mockRefresh)
      assert.strictEqual(parsed.success, true)
    })
  })

  describe('Query Key Factory', () => {
    it('produces hierarchical auth keys', () => {
      assert.deepStrictEqual(authKeys.all, ['auth'])
      assert.deepStrictEqual(authKeys.session(), ['auth', 'session'])
      assert.deepStrictEqual(authKeys.profile(), ['auth', 'profile'])
    })
  })
})
