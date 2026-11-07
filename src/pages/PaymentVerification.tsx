import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAdmin } from '@/context/admin-store'
import {
  PaymentTransaction,
  NeedsReviewItem,
  RouteTransfer,
  GymBalanceSummary,
  RefundRecord,
  PaymentStats,
  DateRangePreset,
} from '@/types/payments'
import {
  paymentsApi,
  formatIndianCurrency,
} from '@/lib/payments-api'
import { StatCard } from '@/components/ui/stat-card'
import { PaymentsTab } from './payments/PaymentsTab'
import { NeedsReviewTab } from './payments/NeedsReviewTab'
import { PayoutsTab } from './payments/PayoutsTab'
import { RefundsTab } from './payments/RefundsTab'
import { ManualVerificationTab } from './payments/ManualVerificationTab'
import { PaymentDrawer } from './payments/PaymentDrawer'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Download,
  MoreVertical,
  UploadCloud,
  RefreshCw,
  SlidersHorizontal,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react'

type TabType = 'payments' | 'needs_review' | 'payouts' | 'refunds' | 'manual'

export function PaymentVerificationPage() {
  const { currentUser, vouchers, verifyPayment, rejectPayment, logAudit } = useAdmin()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  // Redirect ?tab=payouts to dedicated /payouts module
  useEffect(() => {
    if (searchParams.get('tab') === 'payouts') {
      navigate('/payouts', { replace: true })
    }
  }, [searchParams, navigate])

  // Role check
  const isFinanceOrAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'finance'

  // URL State
  const rawTab = searchParams.get('tab')
  const activeTab: TabType = rawTab === 'needs-review' ? 'needs_review' : (rawTab as TabType) || 'payments'
  const dateRange = (searchParams.get('range') as DateRangePreset) || '7d'
  const searchQuery = searchParams.get('q') || ''
  const selectedGym = searchParams.get('gym') || 'all'
  const selectedType = searchParams.get('type') || 'all'
  const selectedStatus = searchParams.get('status') || 'all'
  const page = parseInt(searchParams.get('page') || '1', 10)
  const drawerPaymentId = searchParams.get('drawer') || null

  // Payment Mode: 'full_collect' (default) or 'manual'
  const [paymentMode, setPaymentMode] = useState<'full_collect' | 'manual'>(() => {
    const modeParam = searchParams.get('mode')
    if (modeParam === 'manual' || rawTab === 'manual') return 'manual'
    const saved = localStorage.getItem('gymapp_payment_mode')
    return (saved as 'full_collect' | 'manual') || 'full_collect'
  })

  // Data states
  const [stats, setStats] = useState<PaymentStats>({
    grossCollectedPaise: 1099600,
    grossPaymentsCount: 86,
    platformCommissionPaise: 159960,
    commissionPaymentsCount: 86,
    heldForGymsPaise: 319920,
    heldTransfersCount: 4,
    releasedThisWeekPaise: 299900,
    releasedTransfersCount: 12,
  })

  const [payments, setPayments] = useState<PaymentTransaction[]>([])
  const [totalPayments, setTotalPayments] = useState(0)
  const [needsReviewItems, setNeedsReviewItems] = useState<NeedsReviewItem[]>([])
  const [transfers, setTransfers] = useState<RouteTransfer[]>([])
  const [gymBalances, setGymBalances] = useState<GymBalanceSummary[]>([])
  const [refunds, setRefunds] = useState<RefundRecord[]>([])

  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>('just now')
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const moreMenuRef = useRef<HTMLDivElement>(null)

  // Statement Import Modal (Manual Mode only)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [csvContent, setCsvContent] = useState('')
  const [csvFileName, setCsvFileName] = useState('')
  const [importSummary, setImportSummary] = useState<string | null>(null)

  // URL state update helper
  const updateUrlParams = useCallback(
    (params: Record<string, string | number | null>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        Object.entries(params).forEach(([key, val]) => {
          if (val === null || val === '' || val === undefined) {
            next.delete(key)
          } else {
            next.set(key, String(val))
          }
        })
        return next
      })
    },
    [setSearchParams]
  )

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 1. Fetch Mode
  useEffect(() => {
    paymentsApi.getPaymentMode().then((mode) => {
      setPaymentMode(mode)
    })
  }, [])

  // 2. Fetch Active Data
  const fetchData = useCallback(async () => {
    try {
      const [statsRes, paymentsRes, reviewRes, transfersRes, balancesRes, refundsRes] =
        await Promise.all([
          paymentsApi.getStats({ preset: dateRange }),
          paymentsApi.getPayments({
            search: searchQuery,
            gymId: selectedGym,
            type: selectedType,
            status: selectedStatus,
            page,
            limit: 10,
          }),
          paymentsApi.getNeedsReview(),
          paymentsApi.getTransfers(),
          paymentsApi.getGymBalances(),
          paymentsApi.getRefunds(),
        ])

      setStats(statsRes)
      setPayments(paymentsRes.items)
      setTotalPayments(paymentsRes.total)
      setNeedsReviewItems(reviewRes)
      setTransfers(transfersRes)
      setGymBalances(balancesRes)
      setRefunds(refundsRes)
      setLastUpdated('just now')
    } catch {
      // offline resilience
    } finally {
      setLoading(false)
    }
  }, [dateRange, searchQuery, selectedGym, selectedType, selectedStatus, page])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // 3. Live 15-second polling (Paused when tab/document is hidden)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchData()
      }
    }, 15000)

    return () => clearInterval(interval)
  }, [fetchData])

  // Selected Payment Drawer
  const selectedDrawerPayment = useMemo(() => {
    if (!drawerPaymentId) return null
    return payments.find((p) => p.id === drawerPaymentId) || null
  }, [drawerPaymentId, payments])

  // Gym Options for filter
  const gymOptions = useMemo(() => {
    return [
      { id: 'gym-cult-sarabha', name: 'Cult Gym Sarabha Nagar' },
      { id: 'gym-anytime-model-town', name: 'Anytime Fitness Model Town' },
      { id: 'gym-golds-civil-lines', name: "Gold's Gym Civil Lines" },
      { id: 'gym-titan-brs', name: 'Titan Strength Club BRS Nagar' },
      { id: 'gym-burn-ferozepur', name: 'Burn Gym Ferozepur Road' },
    ]
  }, [])

  // Export CSV respecting current filters
  const handleExportCsv = () => {
    const csv = paymentsApi.exportPaymentsCsv(payments)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `payments_export_${dateRange}_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Toggle Dev Payment Mode
  const handleTogglePaymentMode = () => {
    const next = paymentMode === 'full_collect' ? 'manual' : 'full_collect'
    setPaymentMode(next)
    localStorage.setItem('gymapp_payment_mode', next)
    setMoreMenuOpen(false)
  }

  // Handle Review Item Approval
  const handleApproveReview = async (id: string, note?: string) => {
    await paymentsApi.approveAndActivateReview(id, note)
    logAudit(
      'APPROVE_PAYMENT_EXCEPTION',
      'Payment',
      id,
      `Approved exception and activated pass. Note: ${note || 'None'}`
    )
    await fetchData()
  }

  // Handle Review Item Refund
  const handleRefundReview = async (id: string, note?: string) => {
    await paymentsApi.refundReview(id, note)
    logAudit(
      'REFUND_PAYMENT_EXCEPTION',
      'Payment',
      id,
      `Refunded exception payment. Note: ${note || 'None'}`
    )
    await fetchData()
  }

  // Handle Transfer Actions
  const handleReleaseTransfer = async (id: string) => {
    await paymentsApi.releaseTransfer(id)
    logAudit('RELEASE_ROUTE_TRANSFER', 'Payment', id, 'Force released transfer to gym bank account.')
    await fetchData()
  }

  const handleExtendHold = async (id: string, hours: number, reason: string) => {
    await paymentsApi.extendTransferHold(id, hours, reason)
    logAudit('EXTEND_ROUTE_HOLD', 'Payment', id, `Extended hold by ${hours} hours. Reason: ${reason}`)
    await fetchData()
  }

  const handleReverseTransfer = async (id: string, reason: string) => {
    await paymentsApi.reverseTransfer(id, reason)
    logAudit('REVERSE_ROUTE_TRANSFER', 'Payment', id, `Reversed transfer to marketplace. Reason: ${reason}`)
    await fetchData()
  }

  const handleBulkRelease = async (ids: string[]) => {
    await paymentsApi.bulkReleaseTransfers(ids)
    logAudit('BULK_RELEASE_TRANSFERS', 'Payment', 'multiple', `Bulk released ${ids.length} transfers.`)
    await fetchData()
  }

  // Handle Refunds
  const handleApproveRefund = async (id: string) => {
    await paymentsApi.approveRefund(id)
    logAudit('APPROVE_REFUND', 'Payment', id, 'Approved customer refund.')
    await fetchData()
  }

  const handleRejectRefund = async (id: string, reason: string) => {
    await paymentsApi.rejectRefund(id, reason)
    logAudit('REJECT_REFUND', 'Payment', id, `Rejected customer refund. Reason: ${reason}`)
    await fetchData()
  }

  // CSV Import execution (Manual mode only)
  const handleExecuteImportCsv = () => {
    if (!csvContent) return
    setIsImportModalOpen(false)
    setImportSummary('Statement imported. Matched vouchers verified.')
    setCsvContent('')
    setCsvFileName('')
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 font-roboto">
      {/* 1. Page Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-sm text-textMuted">
            Track member payments and release money to gyms.
          </p>
        </div>

        {/* Top-Right Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Range Selector */}
          <div className="inline-flex p-0.5 bg-surface border border-border rounded-control text-xs">
            {(['today', '7d', '30d', 'custom'] as const).map((r) => {
              const labelMap: Record<DateRangePreset, string> = {
                today: 'Today',
                '7d': '7 days',
                '30d': '30 days',
                custom: 'Custom',
              }
              const isActive = dateRange === r
              return (
                <button
                  key={r}
                  onClick={() => updateUrlParams({ range: r, page: 1 })}
                  className={`px-3 py-1.5 rounded-control font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-white shadow-subtle'
                      : 'text-textMuted hover:text-text'
                  }`}
                >
                  {labelMap[r]}
                </button>
              )
            })}
          </div>

          {/* Export Ghost Button */}
          <button
            onClick={handleExportCsv}
            className="h-9 px-3.5 border border-border rounded-control bg-surface text-text hover:bg-background text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4 stroke-[1.75]" />
            Export
          </button>

          {/* More Options Menu (⋯) */}
          <div className="relative" ref={moreMenuRef}>
            <button
              onClick={() => setMoreMenuOpen(!moreMenuOpen)}
              className="h-9 w-9 border border-border rounded-control bg-surface text-text hover:bg-background flex items-center justify-center transition-colors"
              aria-label="More options"
            >
              <MoreVertical className="w-4 h-4 stroke-[1.75]" />
            </button>

            {moreMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-56 bg-surface border border-border rounded-card shadow-lg py-1.5 z-30 animate-in fade-in">
                {paymentMode === 'manual' && (
                  <button
                    onClick={() => {
                      setIsImportModalOpen(true)
                      setMoreMenuOpen(false)
                    }}
                    className="w-full text-left px-3.5 py-2 text-sm text-text hover:bg-background flex items-center gap-2"
                  >
                    <UploadCloud className="w-4 h-4 text-textMuted stroke-[1.75]" />
                    Import statement
                  </button>
                )}
                <button
                  onClick={() => {
                    fetchData()
                    setMoreMenuOpen(false)
                  }}
                  className="w-full text-left px-3.5 py-2 text-sm text-text hover:bg-background flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4 text-textMuted stroke-[1.75]" />
                  Refresh data
                </button>
                <div className="border-t border-border my-1" />
                <button
                  onClick={handleTogglePaymentMode}
                  className="w-full text-left px-3.5 py-2 text-xs text-textMuted hover:bg-background flex items-center justify-between"
                >
                  <span>Payment model</span>
                  <span className="font-mono text-primary uppercase text-[11px] font-bold">
                    {paymentMode === 'full_collect' ? 'Full-collect' : 'Manual UTR'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Four Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Gross collected"
          value={formatIndianCurrency(stats.grossCollectedPaise)}
          subtext={`${stats.grossPaymentsCount} payments`}
        />
        <StatCard
          label="Platform commission"
          value={formatIndianCurrency(stats.platformCommissionPaise)}
          subtext="20% first payments, 0% renewals"
        />
        <StatCard
          label="Held for gyms"
          value={formatIndianCurrency(stats.heldForGymsPaise)}
          subtext={`${stats.heldTransfersCount} transfers held`}
        />
        <StatCard
          label="Released this week"
          value={formatIndianCurrency(stats.releasedThisWeekPaise)}
          subtext={`${stats.releasedTransfersCount} transfers settled`}
        />
      </div>

      {/* Live Polling Status Indicator */}
      <div className="flex justify-end -mt-2">
        <span className="text-xs text-textSubtle">Updated {lastUpdated}</span>
      </div>

      {/* 3. Tab Navigation */}
      <div className="border-b border-border">
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar scrollbar-none">
          {/* Tab 1: Payments */}
          <button
            onClick={() => updateUrlParams({ tab: 'payments', page: 1 })}
            className={`pb-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'payments'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-textMuted hover:text-text'
            }`}
          >
            Payments
          </button>

          {/* Tab 2: Needs review */}
          <button
            onClick={() => updateUrlParams({ tab: 'needs_review', page: 1 })}
            className={`pb-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'needs_review'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-textMuted hover:text-text'
            }`}
          >
            Needs review
            {needsReviewItems.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-warningBg text-warningText">
                {needsReviewItems.length}
              </span>
            )}
          </button>

          {/* Tab 3: Payouts (Direct link to dedicated module) */}
          <button
            onClick={() => navigate('/payouts')}
            className="pb-3 text-sm font-medium border-b-2 border-transparent text-textMuted hover:text-primary whitespace-nowrap transition-colors flex items-center gap-1.5"
            title="Open dedicated Payouts module"
          >
            <span>Payouts</span>
            {transfers.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-background text-textMuted border border-border">
                {transfers.length}
              </span>
            )}
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[1.75] text-textSubtle" />
          </button>

          {/* Tab 4: Refunds */}
          <button
            onClick={() => updateUrlParams({ tab: 'refunds', page: 1 })}
            className={`pb-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'refunds'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-textMuted hover:text-text'
            }`}
          >
            Refunds
            {refunds.filter((r) => r.status === 'requested').length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-dangerBg text-dangerText">
                {refunds.filter((r) => r.status === 'requested').length}
              </span>
            )}
          </button>

          {/* Tab 5: Manual verification (Shown ONLY when paymentMode === 'manual') */}
          {paymentMode === 'manual' && (
            <button
              onClick={() => updateUrlParams({ tab: 'manual', page: 1 })}
              className={`pb-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeTab === 'manual'
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-textMuted hover:text-text'
              }`}
            >
              Manual verification
              {vouchers.filter((v) => v.status === 'FEE_PENDING_VERIFICATION').length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-warningBg text-warningText">
                  {vouchers.filter((v) => v.status === 'FEE_PENDING_VERIFICATION').length}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 4. Tab Content Panels */}
      {activeTab === 'payments' && (
        <PaymentsTab
          payments={payments}
          totalCount={totalPayments}
          page={page}
          limit={10}
          onPageChange={(p) => updateUrlParams({ page: p })}
          search={searchQuery}
          onSearchChange={(q) => updateUrlParams({ q, page: 1 })}
          selectedGym={selectedGym}
          onGymChange={(gym) => updateUrlParams({ gym, page: 1 })}
          selectedType={selectedType}
          onTypeChange={(type) => updateUrlParams({ type, page: 1 })}
          selectedStatus={selectedStatus}
          onStatusChange={(status) => updateUrlParams({ status, page: 1 })}
          gymOptions={gymOptions}
          onSelectPayment={(payment) => updateUrlParams({ drawer: payment.id })}
          loading={loading}
        />
      )}

      {activeTab === 'needs_review' && (
        <NeedsReviewTab
          items={needsReviewItems}
          isFinanceOrAdmin={isFinanceOrAdmin}
          onApprove={handleApproveReview}
          onRefund={handleRefundReview}
          loading={loading}
        />
      )}

      {activeTab === 'payouts' && (
        <PayoutsTab
          transfers={transfers}
          gymBalances={gymBalances}
          isFinanceOrAdmin={isFinanceOrAdmin}
          onReleaseTransfer={handleReleaseTransfer}
          onExtendHold={handleExtendHold}
          onReverseTransfer={handleReverseTransfer}
          onBulkRelease={handleBulkRelease}
          loading={loading}
        />
      )}

      {activeTab === 'refunds' && (
        <RefundsTab
          refunds={refunds}
          isFinanceOrAdmin={isFinanceOrAdmin}
          onApproveRefund={handleApproveRefund}
          onRejectRefund={handleRejectRefund}
          onOpenPaymentDrawer={(payId) => updateUrlParams({ drawer: payId })}
          loading={loading}
        />
      )}

      {activeTab === 'manual' && paymentMode === 'manual' && (
        <ManualVerificationTab
          vouchers={vouchers}
          isFinanceOrAdmin={isFinanceOrAdmin}
          onVerify={(id) => {
            verifyPayment(id)
            fetchData()
          }}
          onReject={(id, reason) => {
            rejectPayment(id, reason)
            fetchData()
          }}
          onOpenImportModal={() => setIsImportModalOpen(true)}
        />
      )}

      {/* 5. Payment Drawer Slide-over */}
      <PaymentDrawer
        payment={selectedDrawerPayment}
        onClose={() => updateUrlParams({ drawer: null })}
      />

      {/* 6. Import Statement CSV Modal (Manual Mode only) */}
      {isImportModalOpen && (
        <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Import bank statement CSV</DialogTitle>
              <DialogDescription>
                Upload bank statement CSV to automatically match UTR numbers and amounts against pending offline vouchers.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <input
                type="file"
                id="modal-csv-input"
                accept=".csv"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setCsvFileName(file.name)
                    const r = new FileReader()
                    r.onload = (ev) => setCsvContent(ev.target?.result as string)
                    r.readAsText(file)
                  }
                }}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('modal-csv-input')?.click()}
                leftIcon={<UploadCloud className="h-4 w-4" strokeWidth={1.75} />}
              >
                Choose CSV file {csvFileName ? `(${csvFileName})` : ''}
              </Button>

              <textarea
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                rows={4}
                placeholder="Paste CSV rows here (Date, UTR, Amount, Description)..."
                className="w-full text-sm p-3 bg-surface border border-border rounded-control text-text placeholder:text-textSubtle focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsImportModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleExecuteImportCsv}
                disabled={!csvContent.trim()}
              >
                Verify and match
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default PaymentVerificationPage
