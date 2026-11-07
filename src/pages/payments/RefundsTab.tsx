import React, { useState } from 'react'
import { RefundRecord } from '../../types/payments'
import { formatIndianCurrency } from '../../lib/payments-api'
import { formatDate } from '@/shared/ui'
import { Badge } from '../../components/ui/badge'
import { ExternalLink, Inbox } from 'lucide-react'

interface RefundsTabProps {
  refunds: RefundRecord[]
  isFinanceOrAdmin: boolean
  onApproveRefund: (id: string) => Promise<void>
  onRejectRefund: (id: string, reason: string) => Promise<void>
  onOpenPaymentDrawer: (paymentId: string) => void
  loading?: boolean
}

export function RefundsTab({
  refunds,
  isFinanceOrAdmin,
  onApproveRefund,
  onRejectRefund,
  onOpenPaymentDrawer,
  loading = false,
}: RefundsTabProps) {
  const [rejectTarget, setRejectTarget] = useState<RefundRecord | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleConfirmReject = async () => {
    if (!rejectTarget) return
    setSubmitting(true)
    await onRejectRefund(rejectTarget.id, rejectReason)
    setSubmitting(false)
    setRejectTarget(null)
    setRejectReason('')
  }

  const getRefundBadge = (status: RefundRecord['status']) => {
    switch (status) {
      case 'processed':
        return <Badge variant="green">PROCESSED</Badge>
      case 'approved':
        return <Badge variant="blue">APPROVED</Badge>
      case 'requested':
        return <Badge variant="yellow">REQUESTED</Badge>
      case 'rejected':
        return <Badge variant="red">REJECTED</Badge>
      default:
        return <Badge variant="grey">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-surface border border-border rounded-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-textMuted">Loading refunds...</p>
          </div>
        ) : refunds.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Inbox className="w-10 h-10 text-textSubtle mx-auto stroke-[1.5]" />
            <p className="text-base font-medium text-text">No refund requests</p>
            <p className="text-sm text-textMuted max-w-sm mx-auto">
              No refund requests are pending or processed.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-background/50 text-xs font-medium text-textMuted uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Voucher</th>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Gym</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {refunds.map((ref) => (
                  <tr key={ref.id} className="hover:bg-background/40 transition-colors">
                    <td className="py-3.5 px-4 text-textMuted whitespace-nowrap">
                      {formatDate(ref.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-sm font-medium text-primary">
                      <button
                        onClick={() => onOpenPaymentDrawer(ref.paymentId)}
                        className="inline-flex items-center gap-1 hover:underline"
                        title="View payment audit drawer"
                      >
                        {ref.voucherCode}
                        <ExternalLink className="w-3.5 h-3.5 stroke-[1.75]" />
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-text">
                      <span className="font-medium block">{ref.member.name}</span>
                      <span className="text-xs text-textMuted">{ref.member.phone}</span>
                    </td>
                    <td className="py-3.5 px-4 text-text font-medium">{ref.gym.name}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-text whitespace-nowrap">
                      {formatIndianCurrency(ref.amountPaise)}
                    </td>
                    <td className="py-3.5 px-4 text-textMuted max-w-xs">{ref.reason}</td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {getRefundBadge(ref.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {isFinanceOrAdmin ? (
                        ref.status === 'requested' ? (
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            <button
                              onClick={() => onApproveRefund(ref.id)}
                              className="px-2.5 py-1 text-xs font-medium bg-primary text-white rounded-control hover:bg-primaryDark transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectTarget(ref)}
                              className="px-2.5 py-1 text-xs font-medium border border-border text-text rounded-control hover:bg-background transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-textMuted">No action required</span>
                        )
                      ) : (
                        <span className="text-xs text-textMuted italic">Read only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-card max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-text">Reject refund request?</h3>
            <p className="text-sm text-textMuted">
              Provide a valid reason for rejecting the refund request for {rejectTarget.voucherCode} ({formatIndianCurrency(rejectTarget.amountPaise)}).
            </p>
            <div>
              <label className="block text-xs font-medium text-text uppercase tracking-wider mb-1">
                Rejection reason
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Pass has already been activated and utilized by member"
                rows={3}
                className="w-full text-sm p-3 bg-surface border border-border rounded-control text-text placeholder:text-textSubtle focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
                className="px-4 py-2 border border-border rounded-control text-sm font-medium text-text hover:bg-background"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={submitting || !rejectReason.trim()}
                className="px-4 py-2 bg-dangerText text-white text-sm font-bold rounded-control hover:bg-red-700 disabled:opacity-50"
              >
                {submitting ? 'Rejecting...' : 'Confirm rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

