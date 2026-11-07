import React, { useState } from 'react'
import { useAdmin } from '@/context/admin-store'
import { AppUser } from '@/types'
import { ColumnDef } from '@tanstack/react-table'
import { PageHeader } from '@/components/ui/page-header'
import { DataTable, FilterOption } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { StatCard } from '@/components/ui/stat-card'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { formatCurrency, formatDate } from '@/lib/utils'

export function UsersPage() {
  const { users, vouchers, blockUser, unblockUser } = useAdmin()

  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null)
  const [blockModalUser, setBlockModalUser] = useState<AppUser | null>(null)
  const [unblockModalUser, setUnblockModalUser] = useState<AppUser | null>(null)

  const columns: ColumnDef<AppUser>[] = [
    {
      accessorKey: 'name',
      header: 'Member',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.avatar ? (
            <img
              src={row.original.avatar}
              alt={row.original.name}
              className="h-8 w-8 rounded-full object-cover border border-border shrink-0"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-primaryLight text-primary flex items-center justify-center text-xs font-medium shrink-0">
              {row.original.name.charAt(0)}
            </div>
          )}
          <div className="space-y-0.5 min-w-0">
            <span className="text-sm font-medium text-text block truncate">{row.original.name}</span>
            <span className="text-sm font-normal text-textMuted block truncate">{row.original.email}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone & locality',
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <span className="text-sm font-normal text-text block">{row.original.phone}</span>
          <span className="text-sm font-normal text-textMuted block">Ludhiana, Punjab</span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'totalVouchers',
      header: 'Passes',
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <span className="text-sm font-medium text-text block">{row.original.totalVouchers} vouchers</span>
          <span className="text-sm font-normal text-textMuted block">
            {row.original.activeMemberships} active pass
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'joinedAt',
      header: 'Joined',
      cell: ({ row }) => (
        <span className="text-sm text-textMuted font-normal">{formatDate(row.original.joinedAt)}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedUser(item)
              }}
            >
              Profile
            </Button>
            {item.status === 'active' ? (
              <Button
                size="sm"
                variant="danger"
                onClick={(e) => {
                  e.stopPropagation()
                  setBlockModalUser(item)
                }}
              >
                Block
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  setUnblockModalUser(item)
                }}
              >
                Unblock
              </Button>
            )}
          </div>
        )
      },
    },
  ]

  const filterOptions: FilterOption[] = [
    {
      id: 'status',
      label: 'Status',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Blocked', value: 'blocked' },
      ],
    },
  ]

  // Active user vouchers for profile modal
  const userVouchers = selectedUser
    ? vouchers.filter((v) => v.userId === selectedUser.id)
    : []

  const activePassesCount = users.reduce((acc, u) => acc + (u.activeMemberships || 0), 0)

  return (
    <div className="space-y-6 font-roboto">
      <PageHeader
        title="Users"
        description="Manage registered customer accounts, active passes, and platform access."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          label="Registered members"
          value={users.length}
          subtext="Total registered platform accounts in Ludhiana"
        />
        <StatCard
          label="Active gym passes"
          value={activePassesCount}
          subtext="Currently enrolled across partner gyms"
        />
      </div>

      <DataTable
        columns={columns}
        data={users}
        searchKey="name"
        searchPlaceholder="Search members by name or email..."
        filters={filterOptions}
        exportFilename="users_list"
        onRowClick={(row) => setSelectedUser(row)}
        emptyTitle="No users found"
        emptyDescription="There are no users matching your criteria."
      />

      {/* User Profile Modal */}
      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle>{selectedUser.name}</DialogTitle>
                  <DialogDescription>{selectedUser.email}</DialogDescription>
                </div>
                <StatusBadge status={selectedUser.status} />
              </div>
            </DialogHeader>

            <div className="space-y-4 py-2 text-sm">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-control border border-border bg-background">
                <div>
                  <span className="text-xs text-textMuted block">Phone</span>
                  <span className="font-medium text-text">{selectedUser.phone}</span>
                </div>
                <div>
                  <span className="text-xs text-textMuted block">City</span>
                  <span className="font-medium text-text">Ludhiana, Punjab</span>
                </div>
                <div>
                  <span className="text-xs text-textMuted block">Total vouchers</span>
                  <span className="font-medium text-text">{selectedUser.totalVouchers}</span>
                </div>
                <div>
                  <span className="text-xs text-textMuted block">Member since</span>
                  <span className="font-medium text-text">{formatDate(selectedUser.joinedAt)}</span>
                </div>
              </div>

              {/* Vouchers list */}
              <div className="space-y-2">
                <span className="text-xs font-medium text-textMuted block">
                  Purchased membership vouchers
                </span>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {userVouchers.length > 0 ? (
                    userVouchers.map((vch) => (
                      <div
                        key={vch.id}
                        className="flex items-center justify-between p-2.5 rounded-control border border-border bg-background text-sm"
                      >
                        <div>
                          <span className="font-medium text-text block">{vch.code}</span>
                          <span className="text-xs text-textMuted block">
                            {vch.gymName} • {vch.planName}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium text-text block">{formatCurrency(vch.amount)}</span>
                          <StatusBadge status={vch.status} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-textMuted py-2 text-center">No vouchers found for this member.</p>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setSelectedUser(null)}>
                Close
              </Button>
              {selectedUser.status === 'active' ? (
                <Button
                  variant="danger"
                  onClick={() => {
                    setBlockModalUser(selectedUser)
                    setSelectedUser(null)
                  }}
                >
                  Block user
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => {
                    setUnblockModalUser(selectedUser)
                    setSelectedUser(null)
                  }}
                >
                  Unblock user
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Block Confirmation Dialog */}
      {blockModalUser && (
        <ConfirmationDialog
          open={!!blockModalUser}
          onOpenChange={(open) => !open && setBlockModalUser(null)}
          title="Block Member Account"
          description={`Are you sure you want to block ${blockModalUser.name}? The user will be unable to log in or purchase new vouchers.`}
          confirmText="Block user"
          variant="destructive"
          requireReason={true}
          reasonLabel="Block reason"
          onConfirm={(reason) => {
            blockUser(blockModalUser.id, reason || 'Account blocked by admin')
            setBlockModalUser(null)
          }}
        />
      )}

      {/* Unblock Confirmation Dialog */}
      {unblockModalUser && (
        <ConfirmationDialog
          open={!!unblockModalUser}
          onOpenChange={(open) => !open && setUnblockModalUser(null)}
          title="Unblock Member Account"
          description={`Restore account access for ${unblockModalUser.name}.`}
          confirmText="Unblock user"
          variant="default"
          onConfirm={() => {
            unblockUser(unblockModalUser.id)
            setUnblockModalUser(null)
          }}
        />
      )}
    </div>
  )
}

export default UsersPage
