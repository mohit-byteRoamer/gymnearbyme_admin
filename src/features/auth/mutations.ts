import { useMutation, type UseMutationResult } from '@tanstack/react-query'
import { adminLogin, refreshTokens } from './api'
import type { AdminLoginRequest, AdminLoginResponse, RefreshTokensResponse } from './types'
import type { ApiError } from '@/lib/api'

/**
 * React Query mutation for Admin Staff login via POST /api/v1/auth/admin/login.
 */
export function useAdminLogin(): UseMutationResult<AdminLoginResponse, ApiError, AdminLoginRequest> {
  return useMutation({
    mutationFn: (payload: AdminLoginRequest) => adminLogin(payload),
  })
}

/**
 * React Query mutation for refreshing tokens via POST /api/v1/auth/refresh.
 */
export function useRefreshTokens(): UseMutationResult<RefreshTokensResponse, ApiError, string> {
  return useMutation({
    mutationFn: (refreshToken: string) => refreshTokens(refreshToken),
  })
}
