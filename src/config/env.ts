import { z } from 'zod'

const envSchema = z.object({
  VITE_API_BASE_URL: z
    .string()
    .min(1, 'VITE_API_BASE_URL must not be empty')
    .default('https://gymnearbyme-cxnvs2fg3-mohitcods-projects.vercel.app/api/v1'),
  MODE: z.string().default('development'),
  DEV: z.boolean().default(true),
  PROD: z.boolean().default(false),
})

function validateEnv() {
  const metaEnv = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : undefined
  const globalObj = typeof globalThis !== 'undefined' ? (globalThis as Record<string, unknown>) : {}
  const nodeProcess = globalObj.process as { env?: Record<string, string | undefined> } | undefined
  const procEnv = nodeProcess?.env ?? {}

  const rawBaseUrl =
    metaEnv?.VITE_API_BASE_URL ??
    metaEnv?.VITE_API_URL ??
    procEnv.VITE_API_BASE_URL ??
    procEnv.VITE_API_URL

  const rawMode = metaEnv?.MODE ?? procEnv.NODE_ENV ?? 'development'
  const isDev = metaEnv?.DEV ?? rawMode !== 'production'
  const isProd = metaEnv?.PROD ?? rawMode === 'production'

  const parsed = envSchema.safeParse({
    VITE_API_BASE_URL: rawBaseUrl,
    MODE: rawMode,
    DEV: isDev,
    PROD: isProd,
  })

  if (!parsed.success) {
    const errorDetails = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n')
    const message = `[ENV VALIDATION ERROR] Missing or invalid environment variables:\n${errorDetails}`
    console.error(message)

    if (isProd) {
      throw new Error(message)
    }

    // In development or test, return safe defaults with a warning
    return {
      apiBaseUrl: 'https://gymnearbyme-cxnvs2fg3-mohitcods-projects.vercel.app/api/v1',
      mode: 'development',
      isDev: true,
      isProd: false,
    }
  }

  return {
    apiBaseUrl: parsed.data.VITE_API_BASE_URL,
    mode: parsed.data.MODE,
    isDev: parsed.data.DEV,
    isProd: parsed.data.PROD,
  }
}

export const env = validateEnv()

export type Env = typeof env
