import { http } from '@/lib/api'
import {
  adminLoginResponseSchema,
  refreshTokensResponseSchema,
  type AdminLoginRequest,
  type AdminLoginResponse,
  type RefreshTokensResponse,
} from './types'

/**
 * Authenticates platform operators and super administrators.
 * Endpoint: POST /api/v1/auth/admin/login
 */
export async function adminLogin(
  payload: AdminLoginRequest,
  signal?: AbortSignal
): Promise<AdminLoginResponse> {
  return http.post<AdminLoginResponse, AdminLoginRequest>(
    '/auth/admin/login',
    payload,
    { skipAuth: true, signal },
    adminLoginResponseSchema
  )
}

/**
 * Refreshes JWT access token using a valid refresh token.
 * Endpoint: POST /api/v1/auth/refresh
 */
export async function refreshTokens(
  refreshToken: string,
  signal?: AbortSignal
): Promise<RefreshTokensResponse> {
  return http.post<RefreshTokensResponse, { refreshToken: string }>(
    '/auth/refresh',
    { refreshToken },
    { skipAuth: true, skipRetry: true, signal },
    refreshTokensResponseSchema
  )
}
