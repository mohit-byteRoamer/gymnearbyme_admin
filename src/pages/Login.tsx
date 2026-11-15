import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAdmin } from '@/context/admin-store'
import { StaffRole } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Dumbbell, AlertCircle } from 'lucide-react'

export function LoginPage() {
  const { login } = useAdmin()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [role, setRole] = useState<StaffRole>('super_admin')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const from = (location.state as any)?.from?.pathname || '/dashboard'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Please enter your staff email address')
      return
    }

    setLoading(true)

    try {
      const result = await login(email.trim(), password, undefined, role)
      setLoading(false)
      if (result.success) {
        navigate(from, { replace: true })
      } else {
        setError(result.error || 'Authentication failed. Please check your credentials.')
      }
    } catch (err: unknown) {
      setLoading(false)
      setError(err instanceof Error ? err.message : 'Authentication failed')
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 font-roboto">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-control bg-primaryLight text-primary mb-1">
            <Dumbbell className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <h1 className="text-2xl font-bold text-text tracking-tight">GymApp Admin</h1>
          <p className="text-sm text-textMuted font-normal">
            Sign in to access the administrator control panel
          </p>
        </div>

        {/* Login Card */}
        <Card className="bg-surface border border-border rounded-card p-6 shadow-subtle space-y-4">
          <CardHeader className="p-0 border-0 space-y-1">
            <CardTitle>Sign in</CardTitle>
            <p className="text-sm text-textMuted font-normal">
              Enter your administrator credentials to continue
            </p>
          </CardHeader>

          {error && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-control bg-dangerBg border border-dangerText/20 p-3 text-sm text-dangerText"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-dangerText" strokeWidth={1.75} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text">Email address</label>
              <Input
                type="email"
                placeholder="admin@yourdomain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text">Staff role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as StaffRole)}
                disabled={loading}
                className="w-full h-10 px-3 rounded-control border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="super_admin">Super Admin</option>
                <option value="finance">Finance</option>
                <option value="moderator">Moderator</option>
                <option value="support">Support</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text">Password</label>
              <Input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={loading}
              disabled={loading}
            >
              Sign in
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default LoginPage
