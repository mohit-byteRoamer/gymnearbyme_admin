import React from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { useAdmin } from '@/context/admin-store'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { ShieldAlert, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AdminLayout() {
  const { currentUser, switchRole } = useAdmin()
  const location = useLocation()

  // If not logged in, redirect to login screen
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Role permissions check
  const path = location.pathname
  let isAllowed = true

  if (currentUser.role === 'moderator') {
    // Moderators can view gyms, moderation, users, dashboard
    if (path.startsWith('/payments') || path.startsWith('/payouts') || path.startsWith('/reports')) {
      isAllowed = false
    }
  } else if (currentUser.role === 'support') {
    // Support can view support, users, gyms, dashboard, vouchers
    if (path.startsWith('/reports') || path.startsWith('/payments') || path.startsWith('/payouts')) {
      isAllowed = false
    }
  }

  return (
    <div className="flex min-h-screen bg-background font-roboto antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8 bg-background">
          <div className="mx-auto max-w-[1280px] space-y-6">
            {isAllowed ? (
              <Outlet />
            ) : (
              <div className="rounded-card border border-border bg-surface p-12 text-center my-8 shadow-subtle max-w-lg mx-auto">
                <ShieldAlert className="h-10 w-10 text-dangerText mx-auto mb-4" strokeWidth={1.75} />
                <h2 className="text-lg font-medium text-text">Access Restricted</h2>
                <p className="mt-2 text-sm text-textMuted">
                  Your current role ({currentUser.role.replace('_', ' ')}) does not have permission to view this section.
                </p>
                <div className="mt-6 flex items-center justify-center gap-3">
                  <Button variant="outline" onClick={() => window.history.back()} leftIcon={<ArrowLeft className="h-4 w-4" strokeWidth={1.75} />}>
                    Go Back
                  </Button>
                  <Button variant="primary" onClick={() => switchRole('super_admin')}>
                    Switch to Super Admin
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
