import { z } from 'zod'

export const staffRoleSchema = z.enum(['super_admin', 'finance', 'support', 'moderator'])

export const adminLoginRequestSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: staffRoleSchema.default('super_admin'),
})

export const adminLoginResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
  }),
  role: staffRoleSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
})

export const refreshTokensRequestSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
})

export const refreshTokensResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
})

export type StaffRole = z.infer<typeof staffRoleSchema>
export type AdminLoginRequest = z.infer<typeof adminLoginRequestSchema>
export type AdminLoginResponse = z.infer<typeof adminLoginResponseSchema>
export type RefreshTokensRequest = z.infer<typeof refreshTokensRequestSchema>
export type RefreshTokensResponse = z.infer<typeof refreshTokensResponseSchema>
