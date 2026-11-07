import React, { useState } from 'react'
import { Voucher } from '../../types'
import { formatCurrency, formatDate } from '../../lib/utils'
import { Badge } from '../../components/ui/badge'
import { SlaBadge } from '../../components/ui/sla-badge'
import { AlertCircle, AlertTriangle, Check, X, Inbox } from 'lucide-react'

interface ManualVerificationTabProps {
  vouchers: Voucher[]
  isFinanceOrAdmin: boolean
  onVerify: (voucherId: string) => void
  onReject: (voucherId: string, reason: string) => void
  onOpenImportModal: () => void
}

export function ManualVerificationTab({
  vouchers,
  isFinanceOrAdmin,
  onVerify,
  onReject,
  onOpenImportModal,
}: ManualVerificationTabProps) {
  const [selectedVoucherForReject, setSelectedVoucherForReject] = useState<Voucher | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const pendingVouchers = vouchers.filter(
    (v) => v.status === 'FEE_PENDING_VERIFICATION'
  )

  const handleConfirmReject = () => {
    if (!selectedVoucherForReject) return
    onReject(selectedVoucherForReject.id, rejectReason || 'Payment unverified')
    setSelectedVoucherForReject(null)
    setRejectReason('')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3.5 bg-background border border-border rounded-card text-sm">
        <span className="text-textMuted">
          Manual offline payment mode is active. Verify bank UTRs against statements.
        </span>
        {isFinanceOrAdmin && (
          <button
            onClick={onOpenImportModal}
            className="px-3 py-1.5 text-xs font-medium border border-border rounded-control bg-surface text-text hover:bg-background transition-colors"
          >
            Import statement CSV
          </button>
        )}
      </div>

      <div className="bg-surface border border-border rounded-card overflow-hidden">
        {pendingVouchers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Inbox className="w-10 h-10 text-textSubtle mx-auto stroke-[1.5]" />
            <p className="text-base font-medium text-text">No pending manual UTRs</p>
            <p className="text-sm text-textMuted max-w-sm mx-auto">
              All submitted UTRs have been reviewed or matched.
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
                  <th className="py-3 px-4">Bank UTR</th>
                  <th className="py-3 px-4 text-right">Fee amount</th>
                  <th className="py-3 px-4 text-center">SLA status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {pendingVouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-background/40 transition-colors">
                    <td className="py-3.5 px-4 text-textMuted whitespace-nowrap">
                      {formatDate(v.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-sm font-medium text-primary">
                      {v.code}
                    </td>
                    <td className="py-3.5 px-4 text-text">
                      <span className="font-medium block">{v.userName}</span>
                      <span className="text-xs text-textMuted">{v.userPhone}</span>
                    </td>
                    <td className="py-3.5 px-4 text-text font-medium">{v.gymName}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-text font-medium">
                      {v.utr || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-text whitespace-nowrap">
                      {formatCurrency(v.feeAmount || v.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <SlaBadge createdAt={v.createdAt} slaMinutes={30} />
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {isFinanceOrAdmin ? (
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => onVerify(v.id)}
                            className="px-2.5 py-1 text-xs font-medium bg-primary text-white rounded-control hover:bg-primaryDark transition-colors"
                          >
                            Verify
                          </button>
                          <button
                            onClick={() => setSelectedVoucherForReject(v)}
                            className="px-2.5 py-1 text-xs font-medium border border-border text-dangerText rounded-control hover:bg-dangerBg transition-colors"
                          >
                            Reject
                          </button>
                        </div>
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

      {/* Reject Dialog */}
      {selectedVoucherForReject && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-card max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-text">Reject manual UTR?</h3>
            <p className="text-sm text-textMuted">
              Provide a rejection reason for voucher {selectedVoucherForReject.code}.
            </p>
            <div>
              <label className="block text-xs font-medium text-text uppercase tracking-wider mb-1">
                Reason
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. UTR not found on bank statement"
                rows={3}
                className="w-full text-sm p-3 bg-surface border border-border rounded-control text-text placeholder:text-textSubtle focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSelectedVoucherForReject(null)}
                className="px-4 py-2 border border-border rounded-control text-sm font-medium text-text hover:bg-background"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 bg-dangerText text-white text-sm font-bold rounded-control hover:bg-red-700"
              >
                Confirm rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

