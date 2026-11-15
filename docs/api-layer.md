# API Layer Architecture & Extension Guide

A production-grade, type-safe API client and state layer built on **Axios**, **TanStack Query v5**, and **Zod**.

---

## Architecture Overview

```
src/
├── config/
│   └── env.ts               # Validated environment configuration (apiBaseUrl, mode)
├── lib/
│   ├── api/
│   │   ├── client.ts        # Configured Axios instance, interceptors, 401 retry queue
│   │   ├── errors.ts        # Custom ApiError class & type guard
│   │   ├── types.ts         # RequestConfig, TokenGetter, ApiResponse types
│   │   ├── request.ts       # Generic HTTP wrappers (get, post, put, patch, del) with Zod validation
│   │   └── index.ts         # Public API barrel
│   └── query/
│       ├── queryClient.ts   # TanStack QueryClient with production defaults & error logging
│       ├── providers.tsx    # QueryProvider with dev-only ReactQueryDevtools
│       └── index.ts         # Query barrel
└── features/
    ├── auth/                # Admin authentication & token refresh
    │   ├── types.ts         # Zod schemas (AdminLoginRequest, AdminLoginResponse)
    │   ├── keys.ts          # Auth query keys
    │   ├── api.ts           # POST /auth/admin/login & POST /auth/refresh
    │   ├── mutations.ts     # useAdminLogin mutation
    │   └── index.ts         # Feature barrel
    └── users/               # Reference feature implementation
        ├── types.ts         # Zod schemas & TypeScript types
        ├── keys.ts          # Hierarchical query key factory
        ├── api.ts           # Raw Axios API functions with signal passthrough
        ├── queries.ts       # queryOptions & useUsers / useUser hooks
        ├── mutations.ts     # useCreateUser & useOptimisticUpdateUser
        └── index.ts         # Feature barrel
```

---

## Key Features

1. **Strict Type Safety**: End-to-end typing with TypeScript strict mode and zero `any`.
2. **Runtime Validation**: Optional Zod schema validation on responses to catch backend schema drift early.
3. **Decoupled Auth**: Token retrieval uses a registered `tokenGetter()` function, completely decoupled from React render loops or specific store implementations.
4. **Resilient 401 Handling**: Single-flight token refresh with a pending request retry queue to prevent stampeding refresh calls.
5. **Auto-Cancellation**: `AbortSignal` from TanStack Query query functions is automatically forwarded to Axios, cancelling in-flight requests when unmounting or refetching.
6. **Hierarchical Query Keys**: Predictable and granular cache invalidation using structured key factories.
7. **Reusable Query Options**: Built with TanStack Query's `queryOptions()` for seamless prefetching, route loaders, and component queries.
8. **Smart Retry Policy**: Automatically skips retrying client errors (4xx) while gracefully retrying transient 5xx or network errors.

---

## How to Add a New Feature in 5 Steps

To add a new resource (e.g. `gyms`, `bookings`, `payments`), follow this 5-step pattern modeled after `src/features/users/`:

### Step 1: Define Schemas & Types (`src/features/<feature>/types.ts`)
```ts
import { z } from 'zod'

export const gymSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  locality: z.string(),
  rating: z.number().default(0),
})

export const createGymInputSchema = gymSchema.omit({ id: true })

export type Gym = z.infer<typeof gymSchema>
export type CreateGymInput = z.infer<typeof createGymInputSchema>
export type GymFilters = { search?: string; locality?: string }
```

### Step 2: Create Query Keys (`src/features/<feature>/keys.ts`)
```ts
import type { GymFilters } from './types'

export const gymKeys = {
  all: ['gyms'] as const,
  lists: () => [...gymKeys.all, 'list'] as const,
  list: (filters?: GymFilters) => [...gymKeys.lists(), filters ?? {}] as const,
  details: () => [...gymKeys.all, 'detail'] as const,
  detail: (id: string) => [...gymKeys.details(), id] as const,
}
```

### Step 3: Write Raw API Functions (`src/features/<feature>/api.ts`)
```ts
import { http } from '@/lib/api'
import { gymSchema, type Gym, type CreateGymInput, type GymFilters } from './types'

export async function getGyms(filters?: GymFilters, signal?: AbortSignal): Promise<Gym[]> {
  return http.get<Gym[]>('/gyms', { params: filters, signal })
}

export async function getGym(id: string, signal?: AbortSignal): Promise<Gym> {
  return http.get<Gym>(`/gyms/${id}`, { signal }, gymSchema)
}

export async function createGym(input: CreateGymInput, signal?: AbortSignal): Promise<Gym> {
  return http.post<Gym, CreateGymInput>('/gyms', input, { signal }, gymSchema)
}
```

### Step 4: Expose Query & Mutation Hooks (`src/features/<feature>/queries.ts` & `mutations.ts`)

**`queries.ts`**:
```ts
import { queryOptions, useQuery } from '@tanstack/react-query'
import { gymKeys } from './keys'
import { getGyms, getGym } from './api'
import type { GymFilters } from './types'

export const gymQueries = {
  list: (filters?: GymFilters) =>
    queryOptions({
      queryKey: gymKeys.list(filters),
      queryFn: ({ signal }) => getGyms(filters, signal),
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: gymKeys.detail(id),
      queryFn: ({ signal }) => getGym(id, signal),
      enabled: Boolean(id),
    }),
}

export function useGyms(filters?: GymFilters) {
  return useQuery(gymQueries.list(filters))
}

export function useGym(id: string) {
  return useQuery(gymQueries.detail(id))
}
```

**`mutations.ts`**:
```ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { gymKeys } from './keys'
import { createGym } from './api'
import type { CreateGymInput } from './types'

export function useCreateGym() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateGymInput) => createGym(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gymKeys.lists() })
    },
  })
}
```

### Step 5: Export from Barrel (`src/features/<feature>/index.ts`)
```ts
export * from './types'
export * from './keys'
export * from './api'
export * from './queries'
export * from './mutations'
```

---

## Error Handling

All failed API requests reject with a strongly-typed `ApiError`:
```ts
import { isApiError } from '@/lib/api'

try {
  await createGym(data)
} catch (error) {
  if (isApiError(error)) {
    console.log(error.status)   // HTTP status code (e.g. 400, 401, 500)
    console.log(error.code)     // Machine-readable code (e.g. 'VALIDATION_ERROR', 'UNAUTHORIZED')
    console.log(error.details)  // Backend validation field errors or issues
  }
}
```
