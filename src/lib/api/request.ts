import type { z } from 'zod'
import { apiClient } from './client'
import { ApiError } from './errors'
import type { RequestConfig } from './types'

/**
 * Validates response payload against an optional Zod schema.
 * Throws a normalized ApiError if validation fails.
 */
function parseResponseData<T>(data: unknown, schema?: z.ZodType<T>): T {
  if (!schema) {
    return data as T
  }

  const result = schema.safeParse(data)
  if (!result.success) {
    throw ApiError.validationError('API response failed validation schema', result.error.issues)
  }

  return result.data
}

/**
 * Thin generic HTTP GET wrapper returning response data directly
 */
export async function get<T>(
  url: string,
  config?: RequestConfig<T>,
  schema?: z.ZodType<T>
): Promise<T> {
  const response = await apiClient.get<unknown>(url, config)
  return parseResponseData<T>(response.data, schema ?? config?.schema)
}

/**
 * Thin generic HTTP POST wrapper returning response data directly
 */
export async function post<T, B = unknown>(
  url: string,
  data?: B,
  config?: RequestConfig<T>,
  schema?: z.ZodType<T>
): Promise<T> {
  const response = await apiClient.post<unknown>(url, data, config)
  return parseResponseData<T>(response.data, schema ?? config?.schema)
}

/**
 * Thin generic HTTP PUT wrapper returning response data directly
 */
export async function put<T, B = unknown>(
  url: string,
  data?: B,
  config?: RequestConfig<T>,
  schema?: z.ZodType<T>
): Promise<T> {
  const response = await apiClient.put<unknown>(url, data, config)
  return parseResponseData<T>(response.data, schema ?? config?.schema)
}

/**
 * Thin generic HTTP PATCH wrapper returning response data directly
 */
export async function patch<T, B = unknown>(
  url: string,
  data?: B,
  config?: RequestConfig<T>,
  schema?: z.ZodType<T>
): Promise<T> {
  const response = await apiClient.patch<unknown>(url, data, config)
  return parseResponseData<T>(response.data, schema ?? config?.schema)
}

/**
 * Thin generic HTTP DELETE wrapper returning response data directly
 */
export async function del<T = void>(
  url: string,
  config?: RequestConfig<T>,
  schema?: z.ZodType<T>
): Promise<T> {
  const response = await apiClient.delete<unknown>(url, config)
  return parseResponseData<T>(response.data, schema ?? config?.schema)
}

// Export request object with delete alias
export const http = {
  get,
  post,
  put,
  patch,
  delete: del,
  del,
}
