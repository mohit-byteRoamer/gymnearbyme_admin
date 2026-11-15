import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { env } from '@/config/env'
import { ApiError } from './errors'
import type {
  RequestConfig,
  TokenGetter,
  TokenRefreshHandler,
  AuthFailureHandler,
} from './types'

// Single configured Axios instance
export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Authentication token hooks (decoupled from any specific store)
let tokenGetter: TokenGetter = () => null
let tokenRefreshHandler: TokenRefreshHandler | null = null
let onAuthFailure: AuthFailureHandler | null = null

export function setTokenGetter(getter: TokenGetter): void {
  tokenGetter = getter
}

export function setTokenRefreshHandler(handler: TokenRefreshHandler | null): void {
  tokenRefreshHandler = handler
}

export function setOnAuthFailure(handler: AuthFailureHandler | null): void {
  onAuthFailure = handler
}

// Single-flight 401 refresh queue state
interface PendingRequest {
  resolve: (token: string) => void
  reject: (error: unknown) => void
}

let isRefreshing = false
let failedQueue: PendingRequest[] = []

function processQueue(error: unknown, token: string | null = null): void {
  failedQueue.forEach((promise) => {
    if (token) {
      promise.resolve(token)
    } else {
      promise.reject(error)
    }
  })
  failedQueue = []
}

// --- Request Interceptor ---
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig & RequestConfig) => {
    // Record start time for dev logging duration calculation
    config._startTime = Date.now()

    // Attach auth token if not explicitly skipped
    if (!config.skipAuth) {
      try {
        const token = await tokenGetter()
        if (token) {
          config.headers.set('Authorization', `Bearer ${token}`)
        }
      } catch (tokenError) {
        if (env.isDev) {
          console.warn('[API Client] Error resolving auth token:', tokenError)
        }
      }
    }

    // Dev-only request logging
    if (env.isDev) {
      console.log(
        `%c[API Request] %c${config.method?.toUpperCase()} %c${config.url}`,
        'color: #2563EB; font-weight: bold;',
        'color: #0F172A; font-weight: bold;',
        'color: #475569;',
        {
          params: config.params,
          data: config.data,
          headers: config.headers,
        }
      )
    }

    return config
  },
  (error: unknown) => {
    return Promise.reject(normalizeError(error))
  }
)

// --- Response Interceptor ---
apiClient.interceptors.response.use(
  (response) => {
    const config = response.config as RequestConfig
    const duration = config._startTime ? Date.now() - config._startTime : 0

    // Dev-only response logging
    if (env.isDev) {
      console.log(
        `%c[API Response ${response.status}] %c${response.config.method?.toUpperCase()} %c${response.config.url} %c(${duration}ms)`,
        'color: #166534; font-weight: bold;',
        'color: #0F172A; font-weight: bold;',
        'color: #475569;',
        'color: #94A3B8; font-style: italic;',
        { data: response.data }
      )
    }

    return response
  },
  async (error: unknown) => {
    const axiosError = error as AxiosError
    const originalRequest = axiosError.config as (InternalAxiosRequestConfig & RequestConfig) | undefined

    // Handle 401 Unauthorized with single-flight refresh queue
    if (
      axiosError.response?.status === 401 &&
      originalRequest &&
      !originalRequest.skipAuth &&
      !originalRequest.skipRetry &&
      !originalRequest._retry
    ) {
      // If no refresh handler registered, trigger failure handler and reject
      if (!tokenRefreshHandler) {
        onAuthFailure?.()
        return Promise.reject(normalizeError(error, originalRequest))
      }

      if (isRefreshing) {
        // Queue this request while refresh is in flight
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((newToken) => {
            originalRequest.headers.set('Authorization', `Bearer ${newToken}`)
            return apiClient(originalRequest)
          })
          .catch((refreshErr) => {
            return Promise.reject(normalizeError(refreshErr, originalRequest))
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const newToken = await tokenRefreshHandler()

        if (!newToken) {
          throw new Error('Token refresh did not yield a new token')
        }

        processQueue(null, newToken)
        originalRequest.headers.set('Authorization', `Bearer ${newToken}`)
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        onAuthFailure?.()
        return Promise.reject(normalizeError(refreshError, originalRequest))
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(normalizeError(error, originalRequest))
  }
)

/**
 * Normalizes any error (AxiosError, AbortError, Network error) into a structured ApiError
 */
export function normalizeError(error: unknown, config?: RequestConfig): ApiError {
  // If already normalized, return as-is
  if (ApiError.isApiError(error)) {
    return error
  }

  // Handle AbortController cancellation
  if (axios.isCancel(error)) {
    return ApiError.cancelled(error.message || 'Request was cancelled', error)
  }

  if (axios.isAxiosError(error)) {
    const duration = config?._startTime ? Date.now() - config._startTime : 0

    if (env.isDev) {
      console.error(
        `%c[API Error ${error.response?.status ?? 'NET'}] %c${config?.method?.toUpperCase() ?? ''} %c${config?.url ?? ''} %c(${duration}ms)`,
        'color: #B91C1C; font-weight: bold;',
        'color: #0F172A; font-weight: bold;',
        'color: #475569;',
        'color: #94A3B8; font-style: italic;',
        error.response?.data ?? error.message
      )
    }

    // Timeout check
    if (error.code === 'ECONNABORTED' || error.message.toLowerCase().includes('timeout')) {
      return ApiError.timeoutError('Request timed out: server took too long to respond', error)
    }

    // Network error (no response received)
    if (!error.response) {
      return ApiError.networkError('Unable to connect to the server. Please check your internet connection.', error)
    }

    // Standard HTTP error responses
    const status = error.response.status
    const data = error.response.data as Record<string, unknown> | string | undefined

    let code = `HTTP_${status}`
    let message = error.message
    let details: unknown = undefined

    if (data && typeof data === 'object') {
      if (typeof data.code === 'string') {
        code = data.code
      } else if (typeof data.error === 'string') {
        code = data.error
      } else {
        switch (status) {
          case 400:
            code = 'BAD_REQUEST'
            break
          case 401:
            code = 'UNAUTHORIZED'
            break
          case 403:
            code = 'FORBIDDEN'
            break
          case 404:
            code = 'NOT_FOUND'
            break
          case 409:
            code = 'CONFLICT'
            break
          case 422:
            code = 'UNPROCESSABLE_ENTITY'
            break
          case 500:
            code = 'INTERNAL_SERVER_ERROR'
            break
          case 502:
          case 503:
          case 504:
            code = 'SERVICE_UNAVAILABLE'
            break
        }
      }

      if (typeof data.message === 'string') {
        message = data.message
      } else if (typeof data.error === 'string') {
        message = data.error
      }

      details = data.details ?? data.errors
    } else if (typeof data === 'string' && data.length > 0) {
      message = data
    }

    return new ApiError({
      status,
      code,
      message,
      details,
      cause: error,
    })
  }

  // Generic fallback error
  if (error instanceof Error) {
    return new ApiError({
      status: 0,
      code: 'UNKNOWN_ERROR',
      message: error.message,
      cause: error,
    })
  }

  return new ApiError({
    status: 0,
    code: 'UNKNOWN_ERROR',
    message: String(error) || 'An unexpected error occurred',
    cause: error,
  })
}
