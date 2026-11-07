import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAdmin } from '@/context/admin-store'
import { Voucher, RefundRequest } from '@/types'
import { ColumnDef } from '@tanstack/react-table'
import { PageHeader } from '@/components/ui/page-header'
import { DataTable, FilterOption } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
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

export function VouchersPage() {
  const {
    vouchers,
    refunds,
    approveRefund,
    rejectRefund,
    markRefundPaid,
  } = useAdmin()

  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') === 'refunds' ? 'refunds' : 'vouchers'
  const [activeTab, setActiveTab] = useState(initialTab)

  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null)
  const [approveModalRefund, setApproveModalRefund] = useState<RefundRequest | null>(null)
  const [rejectModalRefund, setRejectModalRefund] = useState<RefundRequest | null>(null)
  const [payoutModalRefund, setPayoutModalRefund] = useState<RefundRequest | null>(null)
  const [refundUtr, setRefundUtr] = useState('')
  const [payoutError, setPayoutError] = useState('')

  // Sync tab with URL search parameter
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'refunds') setActiveTab('refunds')
    else setActiveTab('vouchers')
  }, [searchParams])

  const handleTabChange = (val: string) => {
    setActiveTab(val)
    if (val === 'refunds') setSearchParams({ tab: 'refunds' })
    else setSearchParams({})
  }

  // Handle Mark Paid for Refund
  const handleConfirmPayout = () => {
    if (!payoutModalRefund) return
    if (!refundUtr.trim()) {
      setPayoutError('Refund UTR reference is required.')
      return
    }
    markRefundPaid(payoutModalRefund.id, refundUtr.trim())
    setPayoutModalRefund(null)
    setRefundUtr('')
    setPayoutError('')
  }

  // Vouchers Table Columns
  const voucherColumns: ColumnDef<Voucher>[] = [
    {
      accessorKey: 'code',
      header: 'Voucher code',
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <span className="text-sm font-medium text-text block">{row.original.code}</span>
          <span className="text-sm font-normal text-textMuted block">{row.original.planName}</span>
        </div>
      ),
    },
    {
      accessorKey: 'userName',
      header: 'Member',
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <span className="text-sm font-medium text-text block">{row.original.userName}</span>
          <span className="text-sm font-normal text-textMuted block">{row.original.userPhone || row.original.userEmail}</span>
        </div>
      ),
    },
    {
      accessorKey: 'gymName',
      header: 'Gym',
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <span className="text-sm font-medium text-text block">{row.original.gymName}</span>
          <span className="text-sm font-normal text-textMuted block">{row.original.gymLocality}, Ludhiana</span>
        </div>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <span className="text-sm font-medium text-text block">{formatCurrency(row.original.amount)}</span>
          <span className="text-sm font-normal text-textMuted block">
            Fee: {formatCurrency(row.original.feeAmount || Math.round(row.original.amount * 0.2))}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'utr',
      header: 'UTR reference',
      cell: ({ row }) => (
        <span className="text-sm font-normal text-text">{row.original.utr}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'createdAt',
      header: 'Issued date',
      cell: ({ row }) => (
        <span className="text-sm text-textMuted font-normal">{formatDate(row.original.createdAt)}</span>
      ),
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
            setSelectedVoucher(row.original)
          }}
        >
          Timeline
        </Button>
      ),
    },
  ]

  // Refunds Table Columns
  const refundColumns: ColumnDef<RefundRequest>[] = [
    {
      accessorKey: 'voucherCode',
      header: 'Voucher code',
      cell: ({ row }) => (
        <span className="text-sm font-medium text-text">{row.original.voucherCode}</span>
      ),
    },
    {
      accessorKey: 'userName',
      header: 'Member',
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <span className="text-sm font-medium text-text block">{row.original.userName}</span>
          <span className="text-sm font-normal text-textMuted block">{row.original.userPhone || row.original.userEmail}</span>
        </div>
      ),
    },
    {
      accessorKey: 'gymName',
      header: 'Partner gym',
      cell: ({ row }) => (
        <span className="text-sm font-normal text-text">{row.original.gymName}</span>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Refund amount',
      cell: ({ row }) => (
        <span className="text-sm font-medium text-text">
          {formatCurrency(row.original.amount)}
        </span>
      ),
    },
    {
      accessorKey: 'reason',
      header: 'Reason',
      cell: ({ row }) => (
        <span className="text-sm font-normal text-textMuted max-w-xs block truncate" title={row.original.reason}>
          {row.original.reason}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex items-center gap-2">
            {item.status === 'REQUESTED' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    setApproveModalRefund(item)
                  }}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={(e) => {
                    e.stopPropagation()
                    setRejectModalRefund(item)
                  }}
                >
                  Reject
                </Button>
              </>
            )}
            {item.status === 'APPROVED' && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  setPayoutModalRefund(item)
                }}
              >
                Mark paid
              </Button>
            )}
            {item.status === 'REFUNDED' && (
              <span className="text-sm text-textMuted font-normal">Disbursed</span>
            )}
            {item.status === 'REJECTED' && (
              <span className="text-sm text-textMuted font-normal">Rejected</span>
            )}
          </div>
        )
      },
    },
  ]

  const voucherFilterOptions: FilterOption[] = [
    {
      id: 'status',
      label: 'Status',
      options: [
        { label: 'Active', value: 'ACTIVE' },
        { label: 'Redeemed', value: 'REDEEMED' },
        { label: 'Pending verification', value: 'FEE_PENDING_VERIFICATION' },
        { label: 'Refund requested', value: 'REFUND_REQUESTED' },
        { label: 'Refunded', value: 'REFUNDED' },
      ],
    },
  ]

  const refundFilterOptions: FilterOption[] = [
    {
      id: 'status',
      label: 'Status',
      options: [
        { label: 'Requested', value: 'REQUESTED' },
        { label: 'Approved', value: 'APPROVED' },
        { label: 'Paid', value: 'PAID' },
        { label: 'Rejected', value: 'REJECTED' },
      ],
    },
  ]

  return (
    <div className="space-y-6 font-roboto">
      <PageHeader
        title="Vouchers & Refunds"
        description="Search customer membership vouchers, review lifecycle states, and process refund claims."
      />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="vouchers">
            All vouchers ({vouchers.length})
          </TabsTrigger>
          <TabsTrigger value="refunds">
            Refund requests ({refunds.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: All Vouchers */}
        <TabsContent value="vouchers" className="mt-4">
          <DataTable
            columns={voucherColumns}
            data={vouchers}
            searchKey="code"
            searchPlaceholder="Search vouchers by code, member, or gym..."
            filters={voucherFilterOptions}
            exportFilename="vouchers_directory"
            onRowClick={(row) => setSelectedVoucher(row)}
            emptyTitle="No vouchers found"
            emptyDescription="There are no vouchers matching your search query."
          />
        </TabsContent>

        {/* Tab 2: Refund Requests */}
        <TabsContent value="refunds" className="mt-4">
          <DataTable
            columns={refundColumns}
            data={refunds}
            searchKey="voucherCode"
            searchPlaceholder="Search refunds by voucher code or member..."
            filters={refundFilterOptions}
            exportFilename="refund_requests"
            emptyTitle="No refund requests"
            emptyDescription="There are no pending refund claims in the queue."
          />
        </TabsContent>
      </Tabs>

      {/* Voucher Timeline Modal */}
      {selectedVoucher && (
        <Dialog open={!!selectedVoucher} onOpenChange={() => setSelectedVoucher(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle>{selectedVoucher.code}</DialogTitle>
                  <DialogDescription>
                    {selectedVoucher.planName} • {selectedVoucher.gymName}
                  </DialogDescription>
                </div>
                <StatusBadge status={selectedVoucher.status} />
              </div>
            </DialogHeader>

            <div className="space-y-3 py-2 text-sm">
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-textMuted">Member</span>
                <span className="font-medium text-text">{selectedVoucher.userName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-textMuted">Amount</span>
                <span className="font-medium text-text">{formatCurrency(selectedVoucher.amount)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-textMuted">UTR</span>
                <span className="font-medium text-text">{selectedVoucher.utr}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-textMuted">Issued date</span>
                <span className="text-text font-normal">{formatDate(selectedVoucher.createdAt)}</span>
              </div>

              {/* Timeline list */}
              <div className="pt-2 space-y-2">
                <span className="text-xs font-medium text-textMuted block">Activity timeline</span>
                <div className="space-y-2 border border-border rounded-control p-3 bg-background">
                  {selectedVoucher.timeline && selectedVoucher.timeline.length > 0 ? (
                    selectedVoucher.timeline.map((event, idx) => (
                      <div key={idx} className="space-y-0.5 text-xs border-b border-border pb-2 last:border-0 last:pb-0">
                        <div className="flex justify-between">
                          <span className="font-medium text-text">{event.event}</span>
                          <span className="text-textMuted">{formatDate(event.timestamp)}</span>
                        </div>
                        {event.actor && <span className="text-textMuted block">By: {event.actor}</span>}
                        {event.note && <span className="text-textSubtle block">{event.note}</span>}
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-textMuted">No timeline records logged yet.</span>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedVoucher(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Approve Refund Confirmation Dialog */}
      {approveModalRefund && (
        <ConfirmationDialog
          open={!!approveModalRefund}
          onOpenChange={(open) => !open && setApproveModalRefund(null)}
          title="Approve Refund Claim"
          description={`Approve refund claim of ${formatCurrency(approveModalRefund.amount)} for voucher ${approveModalRefund.voucherCode} (${approveModalRefund.userName}). This moves the claim to payout queue.`}
          confirmText="Approve refund"
          variant="default"
          onConfirm={() => {
            approveRefund(approveModalRefund.id)
            setApproveModalRefund(null)
          }}
        />
      )}

      {/* Reject Refund Confirmation Dialog */}
      {rejectModalRefund && (
        <ConfirmationDialog
          open={!!rejectModalRefund}
          onOpenChange={(open) => !open && setRejectModalRefund(null)}
          title="Reject Refund Claim"
          description={`Reject refund claim for voucher ${rejectModalRefund.voucherCode}.`}
          confirmText="Reject refund"
          variant="destructive"
          requireReason={true}
          reasonLabel="Rejection reason"
          onConfirm={(reason) => {
            rejectRefund(rejectModalRefund.id, reason || 'Ineligible claim')
            setRejectModalRefund(null)
          }}
        />
      )}

      {/* Mark Refund Paid Dialog */}
      {payoutModalRefund && (
        <Dialog open={!!payoutModalRefund} onOpenChange={() => setPayoutModalRefund(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Disburse Refund Payout</DialogTitle>
              <DialogDescription>
                Confirm bank disbursement of {formatCurrency(payoutModalRefund.amount)} to {payoutModalRefund.userName}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-sm">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text">
                  Bank refund transaction UTR reference <span className="text-dangerText">*</span>
                </label>
                <Input
                  placeholder="e.g. REF998877665544"
                  value={refundUtr}
                  onChange={(e) => {
                    setRefundUtr(e.target.value)
                    if (payoutError) setPayoutError('')
                  }}
                />
                {payoutError && (
                  <p className="text-xs text-dangerText font-medium">{payoutError}</p>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setPayoutModalRefund(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleConfirmPayout}>
                Confirm disbursement
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default VouchersPage
