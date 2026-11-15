import React, { useState } from 'react'
import { useUsers, useCreateUser, useOptimisticUpdateUser } from '../index'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle2, Loader2, RefreshCw, UserPlus } from 'lucide-react'

/**
 * Staff-engineer reference demo component for the TanStack Query + Axios API layer.
 * Demonstrates:
 * 1. Query with filtering & signal passthrough
 * 2. Mutation with cache invalidation
 * 3. Optimistic update with snapshot and error rollback
 * 4. Loading, error, and empty states
 */
export function UserManagementDemo() {
  const [searchTerm, setSearchTerm] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'member' | 'staff' | 'admin'>('member')
  const [formError, setFormError] = useState<string | null>(null)

  // 1. TanStack Query hook with filter params and AbortSignal passthrough
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useUsers({ search: searchTerm || undefined })

  // 2. Mutation with automatic cache invalidation
  const createUserMutation = useCreateUser()

  // 3. Mutation with optimistic update & rollback
  const updateUserMutation = useOptimisticUpdateUser()

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!name.trim() || !email.trim()) {
      setFormError('Please enter both name and email.')
      return
    }

    try {
      await createUserMutation.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        role,
      })
      setName('')
      setEmail('')
    } catch (err: unknown) {
      // ApiError has typed properties (status, code, message, details)
      const message = err instanceof Error ? err.message : 'Failed to create user'
      setFormError(message)
    }
  }

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const nextRole = currentStatus === 'active' ? 'suspended' : 'active'
    updateUserMutation.mutate({
      id,
      input: { status: nextRole as 'active' | 'suspended' },
    })
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-6">
      {/* Header & Overview */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">API Layer Demo: Users</h1>
          <p className="text-sm text-textMuted mt-1">
            Axios + TanStack Query v5 + Zod schema validation reference implementation.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}
          leftIcon={<RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />}
        >
          {isFetching ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Create User Card (Mutation Example) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-primary" />
            Create User (Cache Invalidation Mutation)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-textMuted mb-1">Name</label>
                <Input
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={createUserMutation.isPending}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-textMuted mb-1">Email</label>
                <Input
                  type="email"
                  placeholder="e.g. rahul@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={createUserMutation.isPending}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-textMuted mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'member' | 'staff' | 'admin')}
                  disabled={createUserMutation.isPending}
                  className="w-full h-10 px-3 rounded-md border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="member">Member</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            {formError && (
              <div className="text-xs text-dangerText flex items-center gap-1.5 bg-dangerBg p-2.5 rounded-md">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {createUserMutation.isSuccess && (
              <div className="text-xs text-successText flex items-center gap-1.5 bg-successBg p-2.5 rounded-md">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>User created successfully! Cache automatically invalidated.</span>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                disabled={createUserMutation.isPending}
                leftIcon={createUserMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
              >
                {createUserMutation.isPending ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Users List Card (Query Example) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Users List (Query with Auto-Cancellation)</CardTitle>
            <div className="w-64">
              <Input
                placeholder="Filter by name/email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Loading State */}
          {isLoading && (
            <div className="py-12 text-center text-textMuted space-y-3">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
              <p className="text-sm">Fetching users from API...</p>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="py-8 px-4 text-center rounded-lg border border-dangerBorder bg-dangerBg text-dangerText space-y-3">
              <AlertCircle className="w-8 h-8 mx-auto" />
              <div>
                <p className="font-semibold text-sm">Failed to load users</p>
                <p className="text-xs mt-1 text-textMuted">
                  {error?.message || 'Server offline or endpoint not reachable'}
                </p>
                {error?.code && (
                  <span className="inline-block mt-2 font-mono text-[11px] px-2 py-0.5 rounded bg-surface border border-border text-text">
                    Code: {error.code} (Status: {error.status})
                  </span>
                )}
              </div>
              <div>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Success / Data State */}
          {!isLoading && !isError && data && (
            <div className="space-y-3">
              {data.items.length === 0 ? (
                <p className="py-8 text-center text-sm text-textMuted">No users found.</p>
              ) : (
                <div className="divide-y divide-border rounded-md border border-border overflow-hidden">
                  {data.items.map((user) => (
                    <div
                      key={user.id}
                      className="p-3.5 flex items-center justify-between bg-surface hover:bg-background transition-colors text-sm"
                    >
                      <div>
                        <div className="font-medium text-text">{user.name}</div>
                        <div className="text-xs text-textMuted">{user.email}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{user.role}</Badge>
                        <Badge variant={user.status === 'active' ? 'success' : 'neutral'}>
                          {user.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(user.id, user.status)}
                          disabled={updateUserMutation.isPending}
                        >
                          Toggle Status
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-xs text-textSubtle text-right">
                Total records: {data.total} | Page {data.page}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
