export interface ApiErrorPayload {
  status: number
  code: string
  message: string
  details?: unknown
  isCancelled?: boolean
  cause?: unknown
}

export class ApiError extends Error {
  readonly isApiError = true
  readonly status: number
  readonly code: string
  readonly details?: unknown
  readonly isCancelled: boolean

  constructor({ status, code, message, details, isCancelled = false, cause }: ApiErrorPayload) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
    this.isCancelled = isCancelled
    this.cause = cause

    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, ApiError.prototype)
  }

  static isApiError(error: unknown): error is ApiError {
    return Boolean(
      error &&
        typeof error === 'object' &&
        'isApiError' in error &&
        (error as { isApiError: unknown }).isApiError === true
    )
  }

  static networkError(message = 'Network error: please check your connection', cause?: unknown): ApiError {
    return new ApiError({
      status: 0,
      code: 'NETWORK_ERROR',
      message,
      cause,
    })
  }

  static timeoutError(message = 'Request timed out: server took too long to respond', cause?: unknown): ApiError {
    return new ApiError({
      status: 0,
      code: 'TIMEOUT',
      message,
      cause,
    })
  }

  static cancelled(message = 'Request was cancelled', cause?: unknown): ApiError {
    return new ApiError({
      status: 0,
      code: 'CANCELLED',
      message,
      isCancelled: true,
      cause,
    })
  }

  static validationError(message: string, details?: unknown): ApiError {
    return new ApiError({
      status: 422,
      code: 'VALIDATION_ERROR',
      message,
      details,
    })
  }
}

export function isApiError(error: unknown): error is ApiError {
  return ApiError.isApiError(error)
}
