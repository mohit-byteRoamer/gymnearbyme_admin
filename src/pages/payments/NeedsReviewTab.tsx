import React, { useState } from 'react'
import { NeedsReviewItem } from '../../types/payments'
import { formatIndianCurrency, formatWaitingTime } from '../../lib/payments-api'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { AlertCircle, AlertTriangle, CheckCircle, RotateCcw, Inbox } from 'lucide-react'

interface NeedsReviewTabProps {
  items: NeedsReviewItem[]
  isFinanceOrAdmin: boolean
  onApprove: (id: string, note?: string) => Promise<void>
  onRefund: (id: string, note?: string) => Promise<void>
  loading?: boolean
}

export function NeedsReviewTab({
  items,
  isFinanceOrAdmin,
  onApprove,
  onRefund,
  loading = false,
}: NeedsReviewTabProps) {
  // Confirm modal state
  const [activeActionItem, setActiveActionItem] = useState<{
    item: NeedsReviewItem
    action: 'approve' | 'refund'
  } | null>(null)
  const [actionNote, setActionNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Filter items older than 30 minutes for the slim SLA alert
  const slaBreachedItems = items.filter((item) => item.waitingMinutes > 30)

  const handleConfirmAction = async () => {
    if (!activeActionItem) return
    setSubmitting(true)
    if (activeActionItem.action === 'approve') {
      await onApprove(activeActionItem.item.id, actionNote)
    } else {
      await onRefund(activeActionItem.item.id, actionNote)
    }
    setSubmitting(false)
    setActiveActionItem(null)
    setActionNote('')
  }

  const getReasonChip = (reason: NeedsReviewItem['reason']) => {
    switch (reason) {
      case 'amount_mismatch':
        return <Badge variant="yellow">Amount mismatch</Badge>
      case 'paid_after_expired':
        return <Badge variant="yellow">Paid after expired</Badge>
      case 'webhook_missing':
        return <Badge variant="red">Webhook missing</Badge>
      case 'duplicate_payment':
        return <Badge variant="red">Duplicate payment</Badge>
      case 'gym_not_activated':
        return <Badge variant="yellow">Gym not activated</Badge>
      default:
        return <Badge variant="grey">{reason}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {/* Slim SLA Alert ONLY for items older than 30 minutes */}
      {slaBreachedItems.length > 0 && (
        <div className="flex items-center justify-between p-3.5 bg-warningBg/60 border border-warningText/20 rounded-card text-sm">
          <div className="flex items-center gap-2.5 text-warningText">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 stroke-[2]" />
            <span className="font-medium">
              SLA attention required: {slaBreachedItems.length} payment {slaBreachedItems.length === 1 ? 'case is' : 'cases are'} waiting over 30 minutes for manual exception resolution.
            </span>
          </div>
          <span className="text-xs font-semibold text-warningText uppercase tracking-wider">
            Review queue
          </span>
        </div>
      )}

      {/* Main Table Container */}
      <div className="bg-surface border border-border rounded-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-textMuted">Loading exception queue...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <CheckCircle className="w-10 h-10 text-successText mx-auto stroke-[1.5]" />
            <p className="text-base font-medium text-text">Exception queue is clear</p>
            <p className="text-sm text-textMuted max-w-sm mx-auto">
              All online payments were verified automatically via webhooks. No transactions require manual intervention.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-background/50 text-xs font-medium text-textMuted uppercase tracking-wider">
                  <th className="py-3 px-4">Waiting time</th>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Gym</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4">Reason & explanation</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-background/40 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-warningBg text-warningText border border-warningText/20">
                        {formatWaitingTime(item.waitingMinutes)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-text">
                      <span className="font-medium block">{item.member.name}</span>
                      <span className="text-xs text-textMuted">{item.member.phone}</span>
                    </td>
                    <td className="py-3.5 px-4 text-text">
                      <span className="font-medium block">{item.gym.name}</span>
                      <span className="text-xs text-textMuted">{item.gym.locality}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-text whitespace-nowrap">
                      {formatIndianCurrency(item.amountPaise)}
                    </td>
                    <td className="py-3.5 px-4 text-text max-w-md">
                      <div className="flex items-center gap-2 mb-1">
                        {getReasonChip(item.reason)}
                        <span className="text-xs font-mono text-textMuted">
                          {item.voucherCode}
                        </span>
                      </div>
                      <p className="text-xs text-textMuted leading-relaxed">
                        {item.explanation}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {isFinanceOrAdmin ? (
                        <div className="inline-flex items-center gap-2 justify-end">
                          <button
                            onClick={() => setActiveActionItem({ item, action: 'approve' })}
                            className="px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-control hover:bg-primaryDark transition-colors"
                          >
                            Approve and activate
                          </button>
                          <button
                            onClick={() => setActiveActionItem({ item, action: 'refund' })}
                            className="px-3 py-1.5 border border-border text-text hover:bg-background text-xs font-medium rounded-control transition-colors"
                          >
                            Refund
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

      {/* Confirmation Dialog with Note Requirement */}
      {activeActionItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-card max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-text">
              {activeActionItem.action === 'approve'
                ? 'Approve and activate pass?'
                : 'Initiate 100% refund?'}
            </h3>
            <p className="text-sm text-textMuted">
              {activeActionItem.action === 'approve'
                ? `You are manually approving ${activeActionItem.item.voucherCode} for ${activeActionItem.item.member.name} (${formatIndianCurrency(activeActionItem.item.amountPaise)}). This will immediately issue and activate their voucher.`
                : `You are initiating a full refund of ${formatIndianCurrency(activeActionItem.item.amountPaise)} for ${activeActionItem.item.voucherCode} to ${activeActionItem.item.member.name}.`}
            </p>

            <div>
              <label className="block text-xs font-medium text-text uppercase tracking-wider mb-1">
                Audit note (required for compliance)
              </label>
              <textarea
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                placeholder="Explain the reason for this exception decision..."
                rows={3}
                className="w-full text-sm p-3 bg-surface border border-border rounded-control text-text placeholder:text-textSubtle focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setActiveActionItem(null)}
                className="px-4 py-2 border border-border rounded-control text-sm font-medium text-text hover:bg-background transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={submitting || !actionNote.trim()}
                className={`px-4 py-2 rounded-control text-sm font-bold text-white transition-colors disabled:opacity-50 ${
                  activeActionItem.action === 'approve'
                    ? 'bg-primary hover:bg-primaryDark'
                    : 'bg-dangerText hover:bg-red-700'
                }`}
              >
                {submitting ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

