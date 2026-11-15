import { z } from 'zod'

export const userRoleSchema = z.enum(['admin', 'member', 'owner', 'staff'])

export const userStatusSchema = z.enum(['active', 'suspended', 'pending'])

export const userSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  role: userRoleSchema.default('member'),
  status: userStatusSchema.default('active'),
  phone: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
})

export const createUserInputSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  role: userRoleSchema.default('member'),
  phone: z.string().optional(),
})

export const updateUserInputSchema = createUserInputSchema
  .extend({
    status: userStatusSchema.optional(),
  })
  .partial()

export const userFiltersSchema = z.object({
  search: z.string().optional(),
  role: userRoleSchema.optional(),
  status: userStatusSchema.optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
})

export const userListResponseSchema = z.object({
  items: z.array(userSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
})

export type User = z.infer<typeof userSchema>
export type UserRole = z.infer<typeof userRoleSchema>
export type UserStatus = z.infer<typeof userStatusSchema>
export type CreateUserInput = z.infer<typeof createUserInputSchema>
export type UpdateUserInput = z.infer<typeof updateUserInputSchema>
export type UserFilters = z.input<typeof userFiltersSchema>
export type UserListResponse = z.infer<typeof userListResponseSchema>
