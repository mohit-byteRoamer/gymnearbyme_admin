import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { RouteTransfer, GymBalanceSummary, TransferStatus } from '../../types/payments'
import { formatIndianCurrency } from '../../lib/payments-api'
import { formatDate } from '@/shared/ui'
import { Badge } from '../../components/ui/badge'
import {
  AlertCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  Check,
  CheckCircle2,
  Building2,
  HelpCircle,
} from 'lucide-react'

interface PayoutsTabProps {
  transfers: RouteTransfer[]
  gymBalances: GymBalanceSummary[]
  isFinanceOrAdmin: boolean
  onReleaseTransfer: (id: string) => Promise<void>
  onExtendHold: (id: string, hours: number, reason: string) => Promise<void>
  onReverseTransfer: (id: string, reason: string) => Promise<void>
  onBulkRelease: (ids: string[]) => Promise<void>
  loading?: boolean
}

export function PayoutsTab({
  transfers,
  gymBalances,
  isFinanceOrAdmin,
  onReleaseTransfer,
  onExtendHold,
  onReverseTransfer,
  onBulkRelease,
  loading = false,
}: PayoutsTabProps) {
  const [subView, setSubView] = useState<'transfers' | 'by_gym'>(() => {
    const v = new URLSearchParams(window.location.search).get('view')
    return v === 'by-gym' || v === 'by_gym' ? 'by_gym' : 'transfers'
  })
  const [statusFilter, setStatusFilter] = useState<'All' | TransferStatus>('All')

  // Bulk Selection
  const [selectedTransferIds, setSelectedTransferIds] = useState<string[]>([])
  const [bulkLoading, setBulkLoading] = useState(false)

  // Dialog states
  const [releaseTarget, setReleaseTarget] = useState<RouteTransfer | null>(null)
  const [extendTarget, setExtendTarget] = useState<RouteTransfer | null>(null)
  const [extendHours, setExtendHours] = useState<number>(48)
  const [extendReason, setExtendReason] = useState<string>('Verification check')
  const [reverseTarget, setReverseTarget] = useState<RouteTransfer | null>(null)
  const [reverseReason, setReverseReason] = useState<string>('')
  const [dialogLoading, setDialogLoading] = useState(false)

  // Filter transfers
  const filteredTransfers = useMemo(() => {
    if (statusFilter === 'All') return transfers
    return transfers.filter((t) => t.status === statusFilter)
  }, [transfers, statusFilter])

  // Bulk checkbox handlers
  const handleToggleSelectAll = () => {
    const releasable = filteredTransfers
      .filter((t) => t.status === 'Held' || t.status === 'Ready to release')
      .map((t) => t.id)
    if (selectedTransferIds.length === releasable.length) {
      setSelectedTransferIds([])
    } else {
      setSelectedTransferIds(releasable)
    }
  }

  const handleToggleSelectOne = (id: string) => {
    setSelectedTransferIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleExecuteBulkRelease = async () => {
    if (selectedTransferIds.length === 0) return
    setBulkLoading(true)
    await onBulkRelease(selectedTransferIds)
    setBulkLoading(false)
    setSelectedTransferIds([])
  }

  // Dialog confirmations
  const handleConfirmRelease = async () => {
    if (!releaseTarget) return
    setDialogLoading(true)
    await onReleaseTransfer(releaseTarget.id)
    setDialogLoading(false)
    setReleaseTarget(null)
  }

  const handleConfirmExtend = async () => {
    if (!extendTarget) return
    setDialogLoading(true)
    await onExtendHold(extendTarget.id, extendHours, extendReason)
    setDialogLoading(false)
    setExtendTarget(null)
  }

  const handleConfirmReverse = async () => {
    if (!reverseTarget) return
    setDialogLoading(true)
    await onReverseTransfer(reverseTarget.id, reverseReason)
    setDialogLoading(false)
    setReverseTarget(null)
    setReverseReason('')
  }

  const getTransferBadge = (status: TransferStatus) => {
    switch (status) {
      case 'Held':
        return <Badge variant="yellow">HELD</Badge>
      case 'Ready to release':
        return <Badge variant="yellow">READY</Badge>
      case 'Released':
        return <Badge variant="green">RELEASED</Badge>
      case 'Settled':
        return <Badge variant="green">SETTLED</Badge>
      case 'Failed':
        return <Badge variant="red">FAILED</Badge>
      default:
        return <Badge variant="grey">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {/* View Toggle Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="inline-flex p-1 bg-background border border-border rounded-control">
          <button
            onClick={() => setSubView('transfers')}
            className={`px-3 py-1.5 text-sm font-medium rounded-control transition-colors ${
              subView === 'transfers'
                ? 'bg-surface text-primary shadow-subtle'
                : 'text-textMuted hover:text-text'
            }`}
          >
            Transfers ({transfers.length})
          </button>
          <button
            onClick={() => setSubView('by_gym')}
            className={`px-3 py-1.5 text-sm font-medium rounded-control transition-colors ${
              subView === 'by_gym'
                ? 'bg-surface text-primary shadow-subtle'
                : 'text-textMuted hover:text-text'
            }`}
          >
            By gym ({gymBalances.length})
          </button>
        </div>

        {subView === 'transfers' && (
          <div className="flex flex-wrap items-center gap-1.5">
            {(['All', 'Held', 'Ready to release', 'Released', 'Settled', 'Failed'] as const).map(
              (st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-control border transition-colors ${
                    statusFilter === st
                      ? 'bg-primary text-white border-primary'
                      : 'bg-surface text-textMuted border-border hover:bg-background'
                  }`}
                >
                  {st}
                </button>
              )
            )}
          </div>
        )}
      </div>

      {/* Transfers View */}
      {subView === 'transfers' && (
        <div className="bg-surface border border-border rounded-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-background/50 text-xs font-medium text-textMuted uppercase tracking-wider">
                  {isFinanceOrAdmin && (
                    <th className="py-3 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={
                          selectedTransferIds.length > 0 &&
                          selectedTransferIds.length ===
                            filteredTransfers.filter(
                              (t) => t.status === 'Held' || t.status === 'Ready to release'
                            ).length
                        }
                        onChange={handleToggleSelectAll}
                        className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                        aria-label="Select all eligible transfers"
                      />
                    </th>
                  )}
                  <th className="py-3 px-4">Gym</th>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4 text-right">Gym share</th>
                  <th className="py-3 px-4">Release date</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Transfer ID</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {filteredTransfers.map((t) => {
                  const isSelectable =
                    (t.status === 'Held' || t.status === 'Ready to release') &&
                    t.payoutsEnabled
                  return (
                    <tr key={t.id} className="hover:bg-background/40 transition-colors">
                      {isFinanceOrAdmin && (
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedTransferIds.includes(t.id)}
                            onChange={() => handleToggleSelectOne(t.id)}
                            disabled={!isSelectable}
                            className="rounded border-border text-primary focus:ring-primary h-4 w-4 disabled:opacity-30"
                            aria-label={`Select transfer ${t.id}`}
                          />
                        </td>
                      )}
                      <td className="py-3 px-4 text-text font-medium">{t.gymName}</td>
                      <td className="py-3 px-4 text-text">{t.memberName}</td>
                      <td className="py-3 px-4 text-right font-bold text-successText whitespace-nowrap">
                        {formatIndianCurrency(t.gymSharePaise)}
                      </td>
                      <td className="py-3 px-4 text-textMuted whitespace-nowrap">
                        {formatDate(t.releaseDate)}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {getTransferBadge(t.status)}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-textMuted whitespace-nowrap">
                        {t.providerTransferId}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {isFinanceOrAdmin ? (
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            {t.status !== 'Settled' && (
                              <button
                                onClick={() => setReleaseTarget(t)}
                                disabled={!t.payoutsEnabled}
                                title={
                                  !t.payoutsEnabled
                                    ? 'Bank details pending for this gym'
                                    : 'Release transfer immediately'
                                }
                                className="px-2.5 py-1 text-xs font-medium border border-border rounded-control bg-surface text-text hover:bg-background disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                              >
                                Release now
                              </button>
                            )}
                            {t.status === 'Held' && (
                              <button
                                onClick={() => setExtendTarget(t)}
                                className="px-2.5 py-1 text-xs font-medium border border-border rounded-control bg-surface text-text hover:bg-background transition-colors"
                              >
                                Extend hold
                              </button>
                            )}
                            {t.status !== 'Failed' && t.status !== 'Settled' && (
                              <button
                                onClick={() => setReverseTarget(t)}
                                className="px-2.5 py-1 text-xs font-medium border border-dangerBg rounded-control bg-surface text-dangerText hover:bg-dangerBg transition-colors"
                              >
                                Reverse
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-textMuted italic">Read only</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Sticky Bulk Release Action Bar */}
          {selectedTransferIds.length > 0 && isFinanceOrAdmin && (
            <div className="p-3 bg-surface border-t border-primary/30 flex items-center justify-between text-sm shadow-md animate-in slide-in-from-bottom-2">
              <span className="font-medium text-text">
                {selectedTransferIds.length} {selectedTransferIds.length === 1 ? 'transfer' : 'transfers'} selected for immediate release
              </span>
              <button
                onClick={handleExecuteBulkRelease}
                disabled={bulkLoading}
                className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-control hover:bg-primaryDark transition-colors disabled:opacity-50"
              >
                {bulkLoading ? 'Releasing...' : `Release selected (${selectedTransferIds.length})`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* By Gym View */}
      {subView === 'by_gym' && (
        <div className="bg-surface border border-border rounded-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-background/50 text-xs font-medium text-textMuted uppercase tracking-wider">
                  <th className="py-3 px-4">Gym name</th>
                  <th className="py-3 px-4">Locality</th>
                  <th className="py-3 px-4 text-right">Held balance</th>
                  <th className="py-3 px-4 text-right">Released</th>
                  <th className="py-3 px-4 text-right">Settled</th>
                  <th className="py-3 px-4 text-center">Linked account status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {gymBalances.map((gym) => (
                  <tr key={gym.gymId} className="hover:bg-background/40 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-text">
                      <Link to={`/gyms/${gym.gymId}`} className="hover:text-primary hover:underline transition-colors">
                        {gym.gymName}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-textMuted">{gym.locality}</td>
                    <td className="py-3.5 px-4 text-right font-medium text-text whitespace-nowrap">
                      {formatIndianCurrency(gym.heldBalancePaise)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-textMuted whitespace-nowrap">
                      {formatIndianCurrency(gym.releasedPaise)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-successText whitespace-nowrap">
                      {formatIndianCurrency(gym.settledPaise)}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {gym.linkedAccountStatus === 'activated' ? (
                        <Badge variant="green">ACTIVE</Badge>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-warningBg text-warningText"
                          title="Gym has not completed bank KYC with Razorpay Route"
                        >
                          Bank details pending
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setStatusFilter('All')
                          setSubView('transfers')
                        }}
                        className="px-3 py-1.5 text-xs font-medium border border-border rounded-control bg-surface text-primary hover:bg-background transition-colors"
                      >
                        View transfers
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dialog: Release Now */}
      {releaseTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-card max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-text">Release held transfer now?</h3>
            <p className="text-sm text-textMuted">
              You are releasing {formatIndianCurrency(releaseTarget.gymSharePaise)} to{' '}
              <strong>{releaseTarget.gymName}</strong> before the scheduled hold window expires. Money will settle directly to the gym's verified bank account.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setReleaseTarget(null)}
                className="px-4 py-2 border border-border rounded-control text-sm font-medium text-text hover:bg-background"
                disabled={dialogLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRelease}
                disabled={dialogLoading}
                className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-control hover:bg-primaryDark"
              >
                {dialogLoading ? 'Releasing...' : 'Confirm release'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog: Extend Hold */}
      {extendTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-card max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-text">Extend transfer hold</h3>
            <p className="text-sm text-textMuted">
              Extend hold on transfer {extendTarget.providerTransferId} to {extendTarget.gymName} ({formatIndianCurrency(extendTarget.gymSharePaise)}).
            </p>
            <div>
              <label className="block text-xs font-medium text-text uppercase tracking-wider mb-1">
                Hold extension hours
              </label>
              <select
                value={extendHours}
                onChange={(e) => setExtendHours(Number(e.target.value))}
                className="w-full text-sm h-10 px-3 bg-surface border border-border rounded-control text-text"
              >
                <option value={24}>24 hours</option>
                <option value={48}>48 hours (Standard)</option>
                <option value={72}>72 hours</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text uppercase tracking-wider mb-1">
                Reason for hold extension
              </label>
              <input
                type="text"
                value={extendReason}
                onChange={(e) => setExtendReason(e.target.value)}
                placeholder="e.g. Member verification dispute"
                className="w-full text-sm h-10 px-3 bg-surface border border-border rounded-control text-text placeholder:text-textSubtle"
              />
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setExtendTarget(null)}
                className="px-4 py-2 border border-border rounded-control text-sm font-medium text-text hover:bg-background"
                disabled={dialogLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmExtend}
                disabled={dialogLoading || !extendReason.trim()}
                className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-control hover:bg-primaryDark disabled:opacity-50"
              >
                {dialogLoading ? 'Saving...' : 'Extend hold'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog: Reverse Transfer */}
      {reverseTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-card max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-text">Reverse transfer to platform</h3>
            <p className="text-sm text-textMuted">
              Reversing will pull back {formatIndianCurrency(reverseTarget.gymSharePaise)} from {reverseTarget.gymName} back into the marketplace primary balance.
            </p>
            <div>
              <label className="block text-xs font-medium text-text uppercase tracking-wider mb-1">
                Reason (required)
              </label>
              <textarea
                value={reverseReason}
                onChange={(e) => setReverseReason(e.target.value)}
                placeholder="e.g. Pass cancelled and refunded to member"
                rows={3}
                className="w-full text-sm p-3 bg-surface border border-border rounded-control text-text placeholder:text-textSubtle"
              />
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setReverseTarget(null)}
                className="px-4 py-2 border border-border rounded-control text-sm font-medium text-text hover:bg-background"
                disabled={dialogLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReverse}
                disabled={dialogLoading || !reverseReason.trim()}
                className="px-4 py-2 bg-dangerText text-white text-sm font-bold rounded-control hover:bg-red-700 disabled:opacity-50"
              >
                {dialogLoading ? 'Reversing...' : 'Confirm reverse'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

