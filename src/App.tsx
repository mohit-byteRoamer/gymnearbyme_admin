import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AdminProvider } from '@/context/admin-store'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { LoginPage } from '@/pages/Login'
import { DashboardPage } from '@/pages/Dashboard'
import { PaymentVerificationPage } from '@/pages/PaymentVerification'
import { PayoutsPage } from '@/pages/Payouts'
import { GymApprovalsPage } from '@/pages/GymApprovals'
import { GymsPage } from '@/pages/Gyms'
import { GymDetailPage } from '@/pages/GymDetail'
import { UsersPage } from '@/pages/Users'
import { VouchersPage } from '@/pages/Vouchers'
import { RefundsPage } from '@/pages/Refunds'
import { FeaturedListingsPage } from '@/pages/FeaturedListings'
import { ModerationPage } from '@/pages/Moderation'
import { LocalitiesPage } from '@/pages/Localities'
import { ReportsPage } from '@/pages/Reports'
import { AuditLogsPage } from '@/pages/AuditLogs'
import { StaffPage } from '@/pages/Staff'
import { SupportPage } from '@/pages/Support'
import { NotificationsPage } from '@/pages/Notifications'
import { MasterDataPage } from '@/pages/MasterData'
import { ContentPages } from '@/pages/ContentPages'
import { SettingsPage } from '@/pages/Settings'

export function App() {
  return (
    <AdminProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Desktop Admin Shell */}
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="payments" element={<PaymentVerificationPage />} />
            <Route path="payouts" element={<PayoutsPage />} />
            <Route path="approvals" element={<GymApprovalsPage />} />
            <Route path="gyms" element={<GymsPage />} />
            <Route path="gyms/:id" element={<GymDetailPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="vouchers" element={<VouchersPage />} />
            <Route path="refunds" element={<RefundsPage />} />
            <Route path="featured" element={<FeaturedListingsPage />} />
            <Route path="moderation" element={<ModerationPage />} />
            <Route path="localities" element={<LocalitiesPage />} />
            <Route path="locations" element={<Navigate to="/localities" replace />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="audit" element={<AuditLogsPage />} />
            <Route path="content" element={<ContentPages />} />
            <Route path="cms" element={<Navigate to="/content" replace />} />
            <Route path="legal" element={<Navigate to="/content" replace />} />
            <Route path="staff" element={<StaffPage />} />
            <Route path="support" element={<SupportPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="master-data" element={<MasterDataPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AdminProvider>
  )
}

export default App
