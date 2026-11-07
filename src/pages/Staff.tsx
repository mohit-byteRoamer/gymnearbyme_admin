import React, { useState, useMemo } from 'react'
import { useAdmin } from '@/context/admin-store'
import { StaffUser, StaffRole } from '@/types'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { formatDate } from '@/lib/utils'
import {
  UserCog,
  Plus,
  Search,
  Download,
  Shield,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Mail,
  Phone,
} from 'lucide-react'

export const ROLE_DEFINITIONS: Record<
  StaffRole,
  { label: string; badgeVariant: 'blue' | 'green' | 'yellow' | 'grey'; description: string; permissions: string[] }
> = {
  super_admin: {
    label: 'Super Admin',
    badgeVariant: 'blue',
    description: 'Full administrative authority across all modules, platform settings, and staff accounts.',
    permissions: [
      'Full access to all modules and configurations',
      'Manage staff users and assign access roles',
      'Financial operations, Route transfers, and fee cap adjustments',
      'System-wide audit logs and configuration overrides',
    ],
  },
  finance: {
    label: 'Finance',
    badgeVariant: 'green',
    description: 'Manages incoming payment orders, Route payouts to gyms, settlement holds, and member refunds.',
    permissions: [
      'View Payments and transaction ledgers',
      'Release, hold, and reverse Route transfers',
      'Approve and process member refund requests',
      'Export accounting reports and bank payout statements',
    ],
  },
  moderator: {
    label: 'Moderator',
    badgeVariant: 'yellow',
    description: 'Reviews partner gym applications, facility photos/videos, and verified member reviews.',
    permissions: [
      'Approve or reject gym partner onboarding applications',
      'Review and moderate facility photos and videos',
      'Moderate user reviews and publish official responses',
      'View basic gym profiles and facility checklists',
    ],
  },
  support: {
    label: 'Support',
    badgeVariant: 'grey',
    description: 'Handles customer service escalations, QR voucher verification issues, and user queries.',
    permissions: [
      'Read and respond to support tickets',
      'Lookup vouchers, users, and booking details',
      'Escalate refund requests to the finance team',
      'Send transactional notifications to members',
    ],
  },
}

export function StaffPage() {
  const {
    staff,
    addStaff,
    updateStaffRole,
    toggleStaffStatus,
    currentUser,
    switchRole,
  } = useAdmin()

  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingStaff, setEditingStaff] = useState<StaffUser | null>(null)
  const [selectedRole, setSelectedRole] = useState<StaffRole>('support')
  const [disableConfirmStaff, setDisableConfirmStaff] = useState<StaffUser | null>(null)

  // Add Form state
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newRole, setNewRole] = useState<StaffRole>('support')

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    return staff.filter((member) => {
      // Role filter
      if (roleFilter !== 'all' && member.role !== roleFilter) {
        return false
      }
      // Status filter
      if (statusFilter !== 'all' && member.status !== statusFilter) {
        return false
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = member.name.toLowerCase().includes(q)
        const matchEmail = member.email.toLowerCase().includes(q)
        const matchPhone = member.phone.toLowerCase().includes(q)
        if (!matchName && !matchEmail && !matchPhone) return false
      }
      return true
    })
  }, [staff, roleFilter, statusFilter, searchQuery])

  // Create staff handler
  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || !newEmail.trim()) return

    addStaff({
      name: newName.trim(),
      email: newEmail.trim(),
      phone: newPhone.trim() || '+91 98000 00000',
      role: newRole,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      status: 'active',
      twoFactorEnabled: false,
    })

    setNewName('')
    setNewEmail('')
    setNewPhone('')
    setNewRole('support')
    setShowAddModal(false)
  }

  // Export CSV handler
  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Role', 'Status', 'LastActive']
    const rows = staff.map((s) => [
      `"${s.name.replace(/"/g, '""')}"`,
      s.email,
      s.phone,
      s.role,
      s.status,
      formatDate(s.lastLogin),
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `gymapp-staff-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  return (
    <div className="space-y-6 font-roboto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text tracking-tight">Staff & Roles</h1>
          <p className="text-sm text-textMuted mt-0.5">
            Manage administrative team members, assign operational roles, and configure role-based access permissions.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 text-xs"
            title="Download staff list as CSV"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>

          <Button
            onClick={() => setShowAddModal(true)}
            size="sm"
            className="flex items-center gap-1.5 bg-primary hover:bg-primaryHover text-white font-medium shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Staff Member
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textMuted" />
          <Input
            type="text"
            placeholder="Search staff by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm w-full bg-surface border-border"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-textMuted hover:text-text"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 min-w-[140px]">
            <span className="text-xs text-textMuted whitespace-nowrap">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-9 px-3 rounded-control border border-border bg-surface text-xs text-text focus:outline-none focus:ring-1 focus:ring-primary w-full"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="finance">Finance</option>
              <option value="moderator">Moderator</option>
              <option value="support">Support</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 min-w-[130px]">
            <span className="text-xs text-textMuted whitespace-nowrap">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 rounded-control border border-border bg-surface text-xs text-text focus:outline-none focus:ring-1 focus:ring-primary w-full"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="disabled">Disabled Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <Card className="bg-surface border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-background/50 text-xs font-semibold text-textMuted uppercase tracking-wider">
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Last Active</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-textMuted">
                    <UserCog className="h-8 w-8 mx-auto text-textSubtle mb-2 opacity-50" />
                    <p className="font-medium text-sm">No staff members match your criteria.</p>
                    <p className="text-xs text-textSubtle mt-1">
                      Try adjusting the search query or role filter.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStaff.map((member) => {
                  const roleDef = ROLE_DEFINITIONS[member.role]
                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-background/40 transition-colors group"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {member.avatar ? (
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="h-9 w-9 rounded-full object-cover border border-border shrink-0"
                            />
                          ) : (
                            <div className="h-9 w-9 rounded-full bg-primaryLight text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                              {member.name.charAt(0)}
                            </div>
                          )}
                          <div className="space-y-0.5">
                            <span className="text-sm font-semibold text-text block">
                              {member.name}
                            </span>
                            <span className="text-xs text-textMuted block flex items-center gap-1 font-mono">
                              <Mail className="h-3 w-3 text-textSubtle" />
                              {member.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-textMuted font-mono">
                        {member.phone}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={roleDef ? roleDef.badgeVariant : 'grey'} className="text-xs">
                          {roleDef ? roleDef.label : member.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <StatusBadge status={member.status} />
                      </td>
                      <td className="py-3 px-4 text-xs text-textMuted">
                        {formatDate(member.lastLogin)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingStaff(member)
                              setSelectedRole(member.role)
                            }}
                            className="h-7 px-2.5 text-xs"
                          >
                            Change role
                          </Button>
                          <Button
                            size="sm"
                            variant={member.status === 'active' ? 'outline' : 'outline'}
                            onClick={() => {
                              if (member.status === 'active') {
                                setDisableConfirmStaff(member)
                              } else {
                                toggleStaffStatus(member.id)
                              }
                            }}
                            className={`h-7 px-2.5 text-xs ${
                              member.status === 'active'
                                ? 'text-danger hover:bg-danger/10 border-danger/30'
                                : 'text-successText hover:bg-successBg border-successText/30'
                            }`}
                          >
                            {member.status === 'active' ? 'Disable' : 'Enable'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 border-t border-border bg-background/50 flex items-center justify-between text-xs text-textMuted">
          <span>Showing {filteredStaff.length} of {staff.length} staff members</span>
          <span>Access control: RBAC with granular module permissions</span>
        </div>
      </Card>

      {/* Role Permission Matrix Card */}
      <Card className="bg-surface border-border">
        <CardHeader className="border-b border-border bg-background/50 pb-3">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-semibold text-text">
              Role Permissions Matrix
            </CardTitle>
          </div>
          <p className="text-xs text-textMuted mt-0.5">
            Overview of access boundaries and administrative capabilities assigned to each role.
          </p>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.keys(ROLE_DEFINITIONS) as StaffRole[]).map((role) => {
            const def = ROLE_DEFINITIONS[role]
            return (
              <div
                key={role}
                className="p-3.5 rounded-control border border-border bg-background space-y-2.5 flex flex-col"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-text text-sm">{def.label}</span>
                  <Badge variant={def.badgeVariant} className="text-[11px]">
                    {def.label}
                  </Badge>
                </div>
                <p className="text-xs text-textMuted leading-relaxed flex-1">
                  {def.description}
                </p>
                <div className="space-y-1 pt-2 border-t border-border">
                  <span className="text-[11px] font-medium text-textSubtle block uppercase tracking-wider">
                    Permissions:
                  </span>
                  <ul className="text-[11px] text-textMuted space-y-1">
                    {def.permissions.map((p, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="h-3 w-3 text-successText shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Dev Role Testing Switcher */}
      {import.meta.env.DEV && (
        <Card className="bg-surface border-border">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <span className="font-semibold text-sm text-text block">
                Development Role Simulator
              </span>
              <span className="text-xs text-textMuted">
                Currently logged in as: <strong className="text-primary">{currentUser?.name}</strong> ({currentUser?.role})
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {(Object.keys(ROLE_DEFINITIONS) as StaffRole[]).map((role) => (
                <Button
                  key={role}
                  size="sm"
                  variant={currentUser?.role === role ? 'primary' : 'outline'}
                  onClick={() => switchRole(role)}
                  className="h-8 text-xs capitalize"
                >
                  {role.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ADD STAFF MEMBER MODAL */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md bg-surface font-roboto">
          <DialogHeader>
            <DialogTitle>Add Staff Member</DialogTitle>
            <DialogDescription>
              Invite a new internal team administrator with specific role permissions.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateStaff} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-text">Full Name</label>
              <Input
                placeholder="e.g. Navjot Singh"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-text">Email Address</label>
              <Input
                type="email"
                placeholder="name@gymapp.internal"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-text">Phone Number</label>
              <Input
                type="tel"
                placeholder="+91 98000 00000"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-text">Assigned Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as StaffRole)}
                className="w-full h-9 rounded-control border border-border bg-background px-3 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="super_admin">Super Admin (Full Access)</option>
                <option value="finance">Finance (Payments, Payouts & Refunds)</option>
                <option value="moderator">Moderator (Gym & Media Approval)</option>
                <option value="support">Support (Tickets & Inquiries)</option>
              </select>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-white">
                Create Staff Account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CHANGE ROLE MODAL */}
      <Dialog open={Boolean(editingStaff)} onOpenChange={() => setEditingStaff(null)}>
        <DialogContent className="max-w-sm bg-surface font-roboto">
          <DialogHeader>
            <DialogTitle>Update Staff Role</DialogTitle>
            <DialogDescription>
              Modify administrative permissions for {editingStaff?.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-sm">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-text">Select New Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as StaffRole)}
                className="w-full h-9 rounded-control border border-border bg-background px-3 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="super_admin">Super Admin</option>
                <option value="finance">Finance</option>
                <option value="moderator">Moderator</option>
                <option value="support">Support</option>
              </select>
            </div>
            <p className="text-xs text-textMuted">
              {ROLE_DEFINITIONS[selectedRole]?.description}
            </p>
          </div>

          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingStaff(null)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-primary text-white"
              onClick={() => {
                if (editingStaff) {
                  updateStaffRole(editingStaff.id, selectedRole)
                  setEditingStaff(null)
                }
              }}
            >
              Save Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CONFIRM DISABLE MODAL */}
      <Dialog open={Boolean(disableConfirmStaff)} onOpenChange={() => setDisableConfirmStaff(null)}>
        <DialogContent className="max-w-md bg-surface font-roboto">
          <DialogHeader>
            <DialogTitle>Disable Staff Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to disable access for {disableConfirmStaff?.name} ({disableConfirmStaff?.email})?
            </DialogDescription>
          </DialogHeader>
          <div className="p-3 rounded-control bg-warningBg text-warningText text-xs font-normal">
            This administrator will immediately lose access to the portal until re-enabled by a Super Admin.
          </div>
          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDisableConfirmStaff(null)}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (disableConfirmStaff) {
                  toggleStaffStatus(disableConfirmStaff.id)
                  setDisableConfirmStaff(null)
                }
              }}
              className="text-danger hover:bg-danger/10 border-danger/30"
            >
              Disable Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default StaffPage
