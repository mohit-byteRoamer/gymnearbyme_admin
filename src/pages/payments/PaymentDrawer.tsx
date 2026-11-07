import React, { useState } from 'react'
import { PaymentTransaction } from '../../types/payments'
import { formatIndianCurrency } from '../../lib/payments-api'
import { formatDate, formatTime } from '@/shared/ui'
import { Badge } from '../../components/ui/badge'
import { X, Copy, Check, ExternalLink, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react'

interface PaymentDrawerProps {
  payment: PaymentTransaction | null
  onClose: () => void
}

export function PaymentDrawer({ payment, onClose }: PaymentDrawerProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  if (!payment) return null

  const handleCopy = (key: string, value?: string) => {
    if (!value) return
    navigator.clipboard.writeText(value)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const getStatusBadge = () => {
    switch (payment.status) {
      case 'paid':
      case 'released':
      case 'settled':
        return <Badge variant="green">{payment.status.toUpperCase()}</Badge>
      case 'held':
        return <Badge variant="yellow">HELD</Badge>
      case 'failed':
      case 'refunded':
        return <Badge variant="red">{payment.status.toUpperCase()}</Badge>
      default:
        return <Badge variant="grey">{String(payment.status).toUpperCase()}</Badge>
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-none transition-opacity animate-in fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-lg bg-surface border-l border-border shadow-xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-surface">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-text">Payment details</h2>
                {getStatusBadge()}
              </div>
              <p className="text-sm text-textMuted mt-0.5">Voucher {payment.voucherCode}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-textMuted hover:text-text hover:bg-background rounded-control transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5 stroke-[1.75]" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Summary Block */}
            <div className="bg-background border border-border rounded-card p-4 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-textMuted">Member</span>
                <span className="font-medium text-text">{payment.member.name} ({payment.member.phone})</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-textMuted">Gym</span>
                <span className="font-medium text-text">{payment.gym.name} ({payment.gym.locality})</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-textMuted">Plan</span>
                <span className="font-medium text-text">{payment.planName}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-textMuted">Type</span>
                <span className="font-medium text-text">
                  {payment.type === 'first_join' ? 'First payment (New member)' : 'Renewal'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-textMuted">Date</span>
                <span className="text-text">
                  {formatDate(payment.date)} at {formatTime(payment.date)}
                </span>
              </div>
            </div>

            {/* (b) Financial Breakdown */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-text uppercase tracking-wider">
                Financial breakdown
              </h3>
              <div className="bg-surface border border-border rounded-card divide-y divide-border">
                <div className="p-3.5 flex justify-between items-center text-sm">
                  <span className="text-textMuted">Paid by member</span>
                  <span className="font-bold text-base text-text">
                    {formatIndianCurrency(payment.paidByMemberPaise)}
                  </span>
                </div>
                <div className="p-3.5 flex justify-between items-center text-sm">
                  <div>
                    <span className="text-text">Platform commission</span>
                    <span className="text-xs text-textMuted block">
                      {payment.type === 'first_join' ? '20% platform fee' : '0% renewal rate'}
                    </span>
                  </div>
                  <span className="font-medium text-text">
                    {formatIndianCurrency(payment.commissionPaise)}
                  </span>
                </div>
                <div className="p-3.5 flex justify-between items-center text-sm">
                  <div>
                    <span className="text-text font-medium">Gym payout share</span>
                    <span className="text-xs text-textMuted block">Razorpay Route transfer</span>
                  </div>
                  <span className="font-bold text-successText">
                    {formatIndianCurrency(payment.gymSharePaise)}
                  </span>
                </div>
                {payment.processingCostPaise > 0 && (
                  <div className="p-3.5 flex justify-between items-center text-sm bg-background/50">
                    <span className="text-textMuted">Gateway processing cost</span>
                    <span className="text-textMuted">
                      {formatIndianCurrency(payment.processingCostPaise)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* (c) IDs with Copy Buttons */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-text uppercase tracking-wider">
                Reference identifiers
              </h3>
              <div className="space-y-2">
                {/* Razorpay Payment ID */}
                <div className="flex items-center justify-between p-3 bg-surface border border-border rounded-card text-sm">
                  <div>
                    <span className="text-xs text-textMuted block">Razorpay payment ID</span>
                    <span className="font-mono text-xs text-text">{payment.razorpayPaymentId}</span>
                  </div>
                  <button
                    onClick={() => handleCopy('payId', payment.razorpayPaymentId)}
                    className="p-1.5 hover:bg-background rounded-control text-textMuted hover:text-text transition-colors"
                    title="Copy payment ID"
                  >
                    {copiedKey === 'payId' ? (
                      <Check className="w-4 h-4 text-successText stroke-[2]" />
                    ) : (
                      <Copy className="w-4 h-4 stroke-[1.75]" />
                    )}
                  </button>
                </div>

                {/* Order ID */}
                <div className="flex items-center justify-between p-3 bg-surface border border-border rounded-card text-sm">
                  <div>
                    <span className="text-xs text-textMuted block">Razorpay order ID</span>
                    <span className="font-mono text-xs text-text">{payment.orderId}</span>
                  </div>
                  <button
                    onClick={() => handleCopy('orderId', payment.orderId)}
                    className="p-1.5 hover:bg-background rounded-control text-textMuted hover:text-text transition-colors"
                    title="Copy order ID"
                  >
                    {copiedKey === 'orderId' ? (
                      <Check className="w-4 h-4 text-successText stroke-[2]" />
                    ) : (
                      <Copy className="w-4 h-4 stroke-[1.75]" />
                    )}
                  </button>
                </div>

                {/* Transfer ID */}
                {payment.transferId && (
                  <div className="flex items-center justify-between p-3 bg-surface border border-border rounded-card text-sm">
                    <div>
                      <span className="text-xs text-textMuted block">Route transfer ID</span>
                      <span className="font-mono text-xs text-text">{payment.transferId}</span>
                    </div>
                    <button
                      onClick={() => handleCopy('trfId', payment.transferId)}
                      className="p-1.5 hover:bg-background rounded-control text-textMuted hover:text-text transition-colors"
                      title="Copy transfer ID"
                    >
                      {copiedKey === 'trfId' ? (
                        <Check className="w-4 h-4 text-successText stroke-[2]" />
                      ) : (
                        <Copy className="w-4 h-4 stroke-[1.75]" />
                      )}
                    </button>
                  </div>
                )}

                {/* UTR */}
                {payment.utr && (
                  <div className="flex items-center justify-between p-3 bg-surface border border-border rounded-card text-sm">
                    <div>
                      <span className="text-xs text-textMuted block">Bank UTR</span>
                      <span className="font-mono text-xs text-text">{payment.utr}</span>
                    </div>
                    <button
                      onClick={() => handleCopy('utr', payment.utr)}
                      className="p-1.5 hover:bg-background rounded-control text-textMuted hover:text-text transition-colors"
                      title="Copy UTR"
                    >
                      {copiedKey === 'utr' ? (
                        <Check className="w-4 h-4 text-successText stroke-[2]" />
                      ) : (
                        <Copy className="w-4 h-4 stroke-[1.75]" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* (a) Timeline */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-text uppercase tracking-wider">
                Audit timeline
              </h3>
              <div className="border-l-2 border-border ml-2 pl-4 space-y-4">
                {payment.timeline.map((event, idx) => (
                  <div key={idx} className="relative group">
                    <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-primary border-2 border-surface" />
                    <div>
                      <span className="text-xs text-textMuted block">
                        {formatDate(event.timestamp)} at {formatTime(event.timestamp)}
                      </span>
                      <span className="text-sm font-medium text-text block mt-0.5">
                        {event.event}
                      </span>
                      <span className="text-xs text-textMuted">Actor: {event.actor}</span>
                      {event.note && (
                        <div className="text-xs bg-background border border-border rounded p-2 mt-1 text-textMuted">
                          {event.note}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border bg-background flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-border bg-surface text-text text-sm font-medium rounded-control hover:bg-background transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
