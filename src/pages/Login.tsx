import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAdmin } from '@/context/admin-store'
import { StaffRole } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dumbbell, AlertCircle } from 'lucide-react'

export function LoginPage() {
  const { login, staff } = useAdmin()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('admin@gymapp.internal')
  const [password, setPassword] = useState('password123')
  const [otp, setOtp] = useState('')
  const [showOtpField, setShowOtpField] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const from = (location.state as any)?.from?.pathname || '/dashboard'

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setError('')
    setLoading(true)

    const user = staff.find((s) => s.email.toLowerCase() === email.toLowerCase())
    if (user?.twoFactorEnabled && !showOtpField) {
      setShowOtpField(true)
      setLoading(false)
      return
    }

    const result = login(email, password, otp)
    setLoading(false)
    if (result.success) {
      navigate(from, { replace: true })
    } else {
      setError(result.error || 'Authentication failed. Please verify your credentials.')
    }
  }

  const handleQuickLogin = (role: StaffRole, staffEmail: string) => {
    setEmail(staffEmail)
    setPassword('admin123')
    setError('')
    const user = staff.find((s) => s.email.toLowerCase() === staffEmail.toLowerCase())
    if (user?.twoFactorEnabled) {
      setShowOtpField(true)
      setOtp('123456')
    } else {
      setShowOtpField(false)
      setOtp('')
    }
    const result = login(staffEmail, 'admin123', '123456')
    if (result.success) {
      navigate(from, { replace: true })
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
              Enter your staff credentials to continue
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
                placeholder="staff@gymapp.internal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text">Password</label>
              <Input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {showOtpField && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text">
                  Two-factor authentication code
                </label>
                <Input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={loading}
            >
              Sign in
            </Button>
          </form>

          {/* Quick Login Role Shortcuts */}
          <div className="pt-4 border-t border-border space-y-2">
            <span className="text-xs text-textMuted block text-center">
              Quick access demo roles
            </span>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickLogin('super_admin', 'admin@gymapp.internal')}
              >
                Super Admin
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickLogin('finance', 'pooja.finance@gymapp.internal')}
              >
                Finance
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickLogin('moderator', 'ananya.mod@gymapp.internal')}
              >
                Moderator
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickLogin('support', 'karan.support@gymapp.internal')}
              >
                Support
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default LoginPage
