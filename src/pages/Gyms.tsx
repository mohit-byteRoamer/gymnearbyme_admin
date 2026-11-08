import React, { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAdmin } from '@/context/admin-store'
import { Gym, GymDocument, GymChecklist } from '@/types'
import { ColumnDef } from '@tanstack/react-table'
import { PageHeader } from '@/components/ui/page-header'
import { DataTable, FilterOption } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  Star,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  Building2,
  ExternalLink,
} from 'lucide-react'

export function GymsPage() {
  const {
    gyms,
    vouchers,
    settings,
    approveGym,
    rejectGym,
    requestGymChanges,
    updateGymChecklist,
    suspendGym,
    blockGym,
    unblockGym,
    updateGymCommission,
  } = useAdmin()

  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const initialTab = searchParams.get('tab') === 'pending'
    ? 'pending'
    : searchParams.get('tab') === 'suspended'
    ? 'suspended'
    : 'all'

  const [activeTab, setActiveTab] = useState(initialTab)
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null)

  // Dialog states
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showSuspendDialog, setShowSuspendDialog] = useState(false)
  const [showBlockDialog, setShowBlockDialog] = useState(false)
  const [showUnblockDialog, setShowUnblockDialog] = useState(false)
  const [showFeeDialog, setShowFeeDialog] = useState(false)
  const [customCommission, setCustomCommission] = useState<string>('')

  // Sync tab with URL
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'pending') setActiveTab('pending')
    else if (tab === 'suspended') setActiveTab('suspended')
    else if (!tab) setActiveTab('all')
  }, [searchParams])

  const handleTabChange = (val: string) => {
    setActiveTab(val)
    if (val === 'pending') setSearchParams({ tab: 'pending' })
    else if (val === 'suspended') setSearchParams({ tab: 'suspended' })
    else setSearchParams({})
  }

  // Filtered dataset per tab
  const allGyms = gyms
  const pendingGyms = useMemo(() => {
    return gyms.filter(
      (g) => g.status === 'PENDING_APPROVAL' || g.status === 'CHANGES_REQUESTED'
    )
  }, [gyms])

  const suspendedGyms = useMemo(() => {
    return gyms.filter((g) => g.status === 'SUSPENDED' || g.status === 'BLOCKED')
  }, [gyms])

  // Count checklist items verified (Documents, Photos, Address and pin, Plans and agreement)
  const getVerificationProgress = (checklist: GymChecklist) => {
    const keys: (keyof GymChecklist)[] = ['documents', 'photos', 'address', 'plansAgreement']
    const verifiedCount = keys.filter((k) => checklist && checklist[k]).length
    return { verifiedCount, total: 4 }
  }

  // Handle Gym actions
  const handleApprove = () => {
    if (!selectedGym) return
    approveGym(selectedGym.id)
    setShowApproveDialog(false)
    setSelectedGym(null)
  }

  const handleReject = (reason?: string) => {
    if (!selectedGym) return
    rejectGym(selectedGym.id, reason || 'Requirements not met.')
    setShowRejectDialog(false)
    setSelectedGym(null)
  }

  const handleSuspend = (reason?: string) => {
    if (!selectedGym) return
    suspendGym(selectedGym.id, reason || 'Compliance suspension.')
    setShowSuspendDialog(false)
    setSelectedGym(null)
  }

  const handleBlock = (reason?: string) => {
    if (!selectedGym) return
    blockGym(selectedGym.id, reason || 'Platform violation.')
    setShowBlockDialog(false)
    setSelectedGym(null)
  }

  const handleUnblock = () => {
    if (!selectedGym) return
    unblockGym(selectedGym.id)
    setShowUnblockDialog(false)
    setSelectedGym(null)
  }

  const handleSaveCommission = () => {
    if (!selectedGym) return
    const num = customCommission.trim() === '' ? null : parseFloat(customCommission)
    updateGymCommission(selectedGym.id, num)
    setShowFeeDialog(false)
    // Update local selectedGym
    setSelectedGym((prev) => (prev ? { ...prev, commissionOverride: num } : null))
  }

  // Locality filter options
  const filterOptions: FilterOption[] = [
    {
      id: 'locality',
      label: 'Locality',
      options: [
        { label: 'Model Town', value: 'Model Town' },
        { label: 'Sarabha Nagar', value: 'Sarabha Nagar' },
        { label: 'BRS Nagar', value: 'BRS Nagar' },
        { label: 'Pakhowal Road', value: 'Pakhowal Road' },
        { label: 'Dugri', value: 'Dugri' },
        { label: 'Civil Lines', value: 'Civil Lines' },
      ],
    },
  ]

  // Columns for All Gyms & Suspended
  const standardColumns: ColumnDef<Gym>[] = [
    {
      accessorKey: 'name',
      header: 'Gym',
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <span className="text-sm font-medium text-text block">{row.original.name}</span>
          <span className="text-sm font-normal text-textMuted block">Owner: {row.original.ownerName}</span>
        </div>
      ),
    },
    {
      accessorKey: 'locality',
      header: 'Locality',
      cell: ({ row }) => (
        <span className="text-sm font-normal text-text">{row.original.locality}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'rating',
      header: 'Rating & members',
      cell: ({ row }) => {
        const rating = row.original.rating ? row.original.rating.toFixed(1) : '4.8'
        const count = row.original.reviewCount || 142
        return (
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-sm text-text">
              <Star className="h-3.5 w-3.5 fill-warningText text-warningText" strokeWidth={1.75} />
              <span>{rating} ({count})</span>
            </div>
            <span className="text-sm font-normal text-textMuted block">
              {row.original.memberCount} members
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: 'commissionOverride',
      header: 'Platform fee',
      cell: ({ row }) => {
        const override = row.original.commissionOverride
        return (
          <span className="text-sm text-textMuted font-normal">
            {override !== null ? `${override}% (custom)` : `${settings?.feePercentage || 20}% (default)`}
          </span>
        )
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/gyms/${row.original.id}`)
          }}
        >
          View Details
        </Button>
      ),
    },
  ]

  // Columns for Pending Approval Tab
  const pendingColumns: ColumnDef<Gym>[] = [
    {
      accessorKey: 'name',
      header: 'Gym',
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <span className="text-sm font-medium text-text block">{row.original.name}</span>
          <span className="text-sm font-normal text-textMuted block">Owner: {row.original.ownerName}</span>
        </div>
      ),
    },
    {
      accessorKey: 'locality',
      header: 'Locality',
      cell: ({ row }) => (
        <span className="text-sm font-normal text-text">{row.original.locality}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'checklist',
      header: 'Verification',
      cell: ({ row }) => {
        const { verifiedCount, total } = getVerificationProgress(row.original.checklist)
        const percent = Math.round((verifiedCount / total) * 100)
        return (
          <div className="space-y-1.5 w-36">
            <span className="text-sm text-text font-normal block">
              {verifiedCount} of {total} verified
            </span>
            <div className="h-1 w-full bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'commissionOverride',
      header: 'Platform fee',
      cell: ({ row }) => {
        const override = row.original.commissionOverride
        return (
          <span className="text-sm text-textMuted font-normal">
            {override !== null ? `${override}% (custom)` : `${settings?.feePercentage || 20}% (default)`}
          </span>
        )
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/gyms/${row.original.id}`)
          }}
        >
          View Details
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6 font-roboto">
      {/* Page Header */}
      <PageHeader
        title="Gyms Directory"
        description="Manage partner gym listings, review onboarding applications, and configure platform fees."
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="all">
            All ({allGyms.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending approval ({pendingGyms.length})
          </TabsTrigger>
          <TabsTrigger value="suspended">
            Suspended / Blocked ({suspendedGyms.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: All Gyms */}
        <TabsContent value="all" className="mt-4">
          <DataTable
            columns={standardColumns}
            data={allGyms}
            searchKey="name"
            searchPlaceholder="Search gyms by name or owner..."
            filters={filterOptions}
            exportFilename="all_gyms"
            onRowClick={(row) => {
              navigate(`/gyms/${row.id}`)
            }}
            emptyTitle="No gyms found"
            emptyDescription="No gym listings match the search criteria."
          />
        </TabsContent>

        {/* Tab 2: Pending Approval */}
        <TabsContent value="pending" className="mt-4">
          <DataTable
            columns={pendingColumns}
            data={pendingGyms}
            searchKey="name"
            searchPlaceholder="Search pending applications..."
            filters={filterOptions}
            exportFilename="pending_gym_approvals"
            onRowClick={(row) => {
              navigate(`/gyms/${row.id}`)
            }}
            emptyTitle="No pending approvals"
            emptyDescription="All gym applications have been reviewed."
          />
        </TabsContent>

        {/* Tab 3: Suspended / Blocked */}
        <TabsContent value="suspended" className="mt-4">
          <DataTable
            columns={standardColumns}
            data={suspendedGyms}
            searchKey="name"
            searchPlaceholder="Search suspended or blocked gyms..."
            filters={filterOptions}
            exportFilename="suspended_gyms"
            onRowClick={(row) => {
              navigate(`/gyms/${row.id}`)
            }}
            emptyTitle="No suspended gyms"
            emptyDescription="There are no suspended or blocked gyms in the system."
          />
        </TabsContent>
      </Tabs>

      {/* Gym Detail / Review Dialog: Two-Column Layout */}
      {selectedGym && (
        <Dialog
          open={!!selectedGym}
          onOpenChange={(open) => !open && setSelectedGym(null)}
        >
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle>{selectedGym.name}</DialogTitle>
                  <DialogDescription>
                    {selectedGym.locality}, Ludhiana • Owner: {selectedGym.ownerName}
                  </DialogDescription>
                </div>
                <StatusBadge status={selectedGym.status} />
              </div>
            </DialogHeader>

            {/* Duplicate Flag Banner */}
            {(() => {
              const dupes = gyms.filter(
                (g) =>
                  g.id !== selectedGym.id &&
                  ((g.phone && selectedGym.phone && g.phone.replace(/\D/g, '') === selectedGym.phone.replace(/\D/g, '')) ||
                   (g.name.trim().toLowerCase() === selectedGym.name.trim().toLowerCase() && g.locality.trim().toLowerCase() === selectedGym.locality.trim().toLowerCase()))
              )
              const hasFlags = (selectedGym.duplicateFlags && selectedGym.duplicateFlags.length > 0) || dupes.length > 0
              if (!hasFlags) return null
              return (
                <div className="rounded-control bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 my-2">
                  <span className="font-bold flex items-center gap-1.5 text-amber-950 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Duplicate warning detected
                  </span>
                  {selectedGym.duplicateFlags?.map((f, i) => (
                    <div key={i}>• {f.message}</div>
                  ))}
                  {dupes.map((d, i) => (
                    <div key={`d-${i}`}>• Matches registered gym &quot;{d.name}&quot; ({d.locality}, phone {d.phone})</div>
                  ))}
                </div>
              )
            })()}

            {/* Two-Column Layout (Left: Documents Checklist, Right: Summary + Actions) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2 text-sm">
              {/* Left Column: Documents & Verification Checklist */}
              <div className="space-y-4 border border-border rounded-control p-4 bg-background">
                <span className="text-sm font-medium text-text block">
                  Verification checklist
                </span>

                <div className="space-y-3">
                  {/* Checklist 1: Documents */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedGym.checklist?.documents || false}
                      onChange={(e) => {
                        const checked = e.target.checked
                        updateGymChecklist(selectedGym.id, 'documents', checked)
                        setSelectedGym((prev) =>
                          prev
                            ? { ...prev, checklist: { ...prev.checklist, documents: checked } }
                            : null
                        )
                      }}
                      className="mt-0.5 h-4 w-4 rounded-control border-border text-primary focus:ring-primary"
                    />
                    <div>
                      <span className="font-medium text-text block">Trade license & business documents</span>
                      <span className="text-xs text-textMuted block">GST certificate and municipal trade registration</span>
                    </div>
                  </label>

                  {/* Checklist 2: Photos */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedGym.checklist?.photos || false}
                      onChange={(e) => {
                        const checked = e.target.checked
                        updateGymChecklist(selectedGym.id, 'photos', checked)
                        setSelectedGym((prev) =>
                          prev
                            ? { ...prev, checklist: { ...prev.checklist, photos: checked } }
                            : null
                        )
                      }}
                      className="mt-0.5 h-4 w-4 rounded-control border-border text-primary focus:ring-primary"
                    />
                    <div>
                      <span className="font-medium text-text block">Facility & equipment photos</span>
                      <span className="text-xs text-textMuted block">Floor layout, cardio, weights, and locker areas</span>
                    </div>
                  </label>

                  {/* Checklist 3: Address */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedGym.checklist?.address || false}
                      onChange={(e) => {
                        const checked = e.target.checked
                        updateGymChecklist(selectedGym.id, 'address', checked)
                        setSelectedGym((prev) =>
                          prev
                            ? { ...prev, checklist: { ...prev.checklist, address: checked } }
                            : null
                        )
                      }}
                      className="mt-0.5 h-4 w-4 rounded-control border-border text-primary focus:ring-primary"
                    />
                    <div>
                      <span className="font-medium text-text block">Physical address verification</span>
                      <span className="text-xs text-textMuted block">{selectedGym.address || `${selectedGym.locality}, Ludhiana`}</span>
                    </div>
                  </label>

                  {/* Checklist 4: Plans and Agreement */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedGym.checklist?.plansAgreement || false}
                      onChange={(e) => {
                        const checked = e.target.checked
                        updateGymChecklist(selectedGym.id, 'plansAgreement', checked)
                        setSelectedGym((prev) =>
                          prev
                            ? { ...prev, checklist: { ...prev.checklist, plansAgreement: checked } }
                            : null
                        )
                      }}
                      className="mt-0.5 h-4 w-4 rounded-control border-border text-primary focus:ring-primary"
                    />
                    <div>
                      <span className="font-medium text-text block">Plans and agreement</span>
                      <span className="text-xs text-textMuted block">Active plans configured and commercial agreement signed</span>
                    </div>
                  </label>
                </div>

                {/* Document List */}
                <div className="pt-3 border-t border-border space-y-2">
                  <span className="text-xs font-medium text-textMuted block">
                    Uploaded documents
                  </span>
                  {selectedGym.documents && selectedGym.documents.length > 0 ? (
                    selectedGym.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-2 rounded-control bg-surface border border-border"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-textMuted" strokeWidth={1.75} />
                          <span className="text-xs text-text font-medium">{doc.name}</span>
                        </div>
                        <span className="text-xs text-textMuted">
                          {doc.verified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-textMuted">Standard verification records attached.</p>
                  )}
                </div>
              </div>

              {/* Right Column: Summary & Controls */}
              <div className="space-y-4">
                <div className="space-y-2 border border-border rounded-control p-4 bg-background">
                  <span className="text-sm font-medium text-text block">
                    Profile summary
                  </span>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between py-1 border-b border-border">
                      <span className="text-textMuted">Contact</span>
                      <span className="text-text font-normal">{selectedGym.phone || '+91 98765 43210'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border">
                      <span className="text-textMuted">Email</span>
                      <span className="text-text font-normal">{selectedGym.email}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border">
                      <span className="text-textMuted">Locality</span>
                      <span className="text-text font-normal">{selectedGym.locality}, Ludhiana</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border">
                      <span className="text-textMuted">Platform fee</span>
                      <span className="text-text font-normal">
                        {selectedGym.commissionOverride !== null
                          ? `${selectedGym.commissionOverride}% (custom)`
                          : `${settings?.feePercentage || 20}% (default)`}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border items-center">
                      <span className="text-textMuted">Linked account status</span>
                      <Badge variant={
                        selectedGym.payoutAccountStatus === 'activated' ? 'green' :
                        selectedGym.payoutAccountStatus === 'needs_info' ? 'red' :
                        selectedGym.payoutAccountStatus === 'pending' ? 'yellow' : 'neutral'
                      }>
                        {selectedGym.payoutAccountStatus === 'activated' ? 'Activated' :
                         selectedGym.payoutAccountStatus === 'needs_info' ? 'Needs info' :
                         selectedGym.payoutAccountStatus === 'pending' ? 'Pending' : 'Not started'}
                      </Badge>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border">
                      <span className="text-textMuted">Held balance</span>
                      <span className="text-warningText font-medium">{formatCurrency(24500)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border">
                      <span className="text-textMuted">Total paid out</span>
                      <span className="text-successText font-medium">{formatCurrency(148500)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-textMuted">Active plans</span>
                      <span className="text-text font-normal">{selectedGym.plans?.length || 3} membership plans</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFeeDialog(true)}
                    >
                      Configure custom fee %
                    </Button>
                  </div>
                </div>

                {/* Membership Plans Snapshot */}
                <div className="space-y-2 border border-border rounded-control p-4 bg-background">
                  <span className="text-sm font-medium text-text block">
                    Available membership plans
                  </span>
                  <div className="space-y-1.5">
                    {selectedGym.plans && selectedGym.plans.length > 0 ? (
                      selectedGym.plans.map((p) => (
                        <div key={p.id} className="flex justify-between text-xs py-1 border-b border-border last:border-0">
                          <span className="font-medium text-text">{p.name} ({p.duration})</span>
                          <span className="text-text font-medium">{formatCurrency(p.price)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-textMuted">No custom plans configured.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Dialog Footer Actions: One primary button only (Approve). Reject is danger-outline. */}
            <DialogFooter className="gap-2 sm:gap-3">
              <Button
                variant="outline"
                onClick={() => setSelectedGym(null)}
              >
                Close
              </Button>

              {selectedGym.status === 'PENDING_APPROVAL' || selectedGym.status === 'CHANGES_REQUESTED' ? (
                <>
                  <Button
                    variant="danger"
                    onClick={() => setShowRejectDialog(true)}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => setShowApproveDialog(true)}
                  >
                    Approve
                  </Button>
                </>
              ) : selectedGym.status === 'SUSPENDED' ? (
                <>
                  <Button
                    variant="danger"
                    onClick={() => setShowBlockDialog(true)}
                  >
                    Block gym
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => setShowUnblockDialog(true)}
                  >
                    Restore to active
                  </Button>
                </>
              ) : selectedGym.status === 'BLOCKED' ? (
                <Button
                  variant="primary"
                  onClick={() => setShowUnblockDialog(true)}
                >
                  Unblock gym
                </Button>
              ) : (
                <Button
                  variant="danger"
                  onClick={() => setShowSuspendDialog(true)}
                >
                  Suspend gym
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Confirmation Dialogs */}
      {showApproveDialog && selectedGym && (
        <ConfirmationDialog
          open={showApproveDialog}
          onOpenChange={setShowApproveDialog}
          title="Approve Partner Gym"
          description={`Confirm onboarding approval for ${selectedGym.name}. The gym will become visible in the Ludhiana directory.`}
          confirmText="Approve gym"
          variant="default"
          onConfirm={handleApprove}
        />
      )}

      {showRejectDialog && selectedGym && (
        <ConfirmationDialog
          open={showRejectDialog}
          onOpenChange={setShowRejectDialog}
          title="Reject Gym Application"
          description={`Reject application for ${selectedGym.name}. Please supply a mandatory reason.`}
          confirmText="Reject gym"
          variant="destructive"
          requireReason={true}
          reasonLabel="Rejection reason"
          reasonPlaceholder="e.g. Incomplete GST credentials, address discrepancy..."
          onConfirm={handleReject}
        />
      )}

      {showSuspendDialog && selectedGym && (
        <ConfirmationDialog
          open={showSuspendDialog}
          onOpenChange={setShowSuspendDialog}
          title="Suspend Gym"
          description={`Temporarily suspend ${selectedGym.name} from selling new membership vouchers.`}
          confirmText="Suspend gym"
          variant="destructive"
          requireReason={true}
          reasonLabel="Suspension reason"
          onConfirm={handleSuspend}
        />
      )}

      {showBlockDialog && selectedGym && (
        <ConfirmationDialog
          open={showBlockDialog}
          onOpenChange={setShowBlockDialog}
          title="Block Gym"
          description={`Permanently block ${selectedGym.name} from platform operations.`}
          confirmText="Block gym"
          variant="destructive"
          requireReason={true}
          reasonLabel="Block reason"
          onConfirm={handleBlock}
        />
      )}

      {showUnblockDialog && selectedGym && (
        <ConfirmationDialog
          open={showUnblockDialog}
          onOpenChange={setShowUnblockDialog}
          title="Restore Gym to Active"
          description={`Restore ${selectedGym.name} to active platform status.`}
          confirmText="Restore gym"
          variant="default"
          onConfirm={handleUnblock}
        />
      )}

      {/* Fee Override Dialog */}
      {showFeeDialog && selectedGym && (
        <Dialog open={showFeeDialog} onOpenChange={setShowFeeDialog}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Configure Platform Fee %</DialogTitle>
              <DialogDescription>
                Set a custom commission override for {selectedGym.name}. Leave empty to use system default ({settings?.feePercentage || 20}%).
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-1.5 py-2">
              <label className="block text-sm font-medium text-text">
                Custom fee percentage (%)
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder={`Default: ${settings?.feePercentage || 20}%`}
                value={customCommission}
                onChange={(e) => setCustomCommission(e.target.value)}
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setShowFeeDialog(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveCommission}>
                Save fee
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default GymsPage
