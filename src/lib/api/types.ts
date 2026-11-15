import type { AxiosRequestConfig } from 'axios'
import type { z } from 'zod'

export type TokenGetter = () => string | null | Promise<string | null>

export type TokenRefreshHandler = () => Promise<string | null>

export type AuthFailureHandler = () => void

export interface RequestConfig<TData = unknown> extends AxiosRequestConfig {
  skipAuth?: boolean
  skipRetry?: boolean
  schema?: z.ZodType<TData>
  _retry?: boolean
  _startTime?: number
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success?: boolean
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore?: boolean
}
