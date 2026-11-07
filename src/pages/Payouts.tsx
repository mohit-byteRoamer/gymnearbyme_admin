import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAdmin } from '@/context/admin-store'
import {
  RouteTransfer,
  GymBalanceSummary,
  PayoutStats,
  DateRangePreset,
} from '@/types/payments'
import {
  paymentsApi,
  formatIndianCurrency,
} from '@/lib/payments-api'
import { StatCard } from '@/components/ui/stat-card'
import { PayoutsTab } from './payments/PayoutsTab'
import { Download } from 'lucide-react'

export function PayoutsPage() {
  const { currentUser, logAudit } = useAdmin()
  const [searchParams, setSearchParams] = useSearchParams()

  // Role check
  const isFinanceOrAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'finance'

  // URL State
  const dateRange = (searchParams.get('range') as DateRangePreset) || '7d'

  // Dedicated Payout Stats state
  const [stats, setStats] = useState<PayoutStats>({
    heldForGymsPaise: 319920,
    heldTransfersCount: 4,
    readyToReleasePaise: 80000,
    readyTransfersCount: 1,
    settledPaise: 12080000,
    settledTransfersCount: 14,
    failedPaise: 239920,
    failedTransfersCount: 1,
    totalGymSharePaise: 12719840,
  })

  const [transfers, setTransfers] = useState<RouteTransfer[]>([])
  const [gymBalances, setGymBalances] = useState<GymBalanceSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>('just now')

  const updateUrlParams = useCallback(
    (params: Record<string, string | number | null>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        Object.entries(params).forEach(([key, val]) => {
          if (val === null || val === undefined || val === '') {
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

  // Fetch Payouts data
  const fetchData = useCallback(async () => {
    try {
      const [statsRes, transfersRes, balancesRes] = await Promise.all([
        paymentsApi.getPayoutStats({ preset: dateRange }),
        paymentsApi.getTransfers(),
        paymentsApi.getGymBalances(),
      ])

      setStats(statsRes)
      setTransfers(transfersRes)
      setGymBalances(balancesRes)
      setLastUpdated('just now')
    } catch (err) {
      console.error('Failed to load payouts data:', err)
    } finally {
      setLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Live 15-second polling (Paused when tab/document is hidden)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchData()
      }
    }, 15000)

    return () => clearInterval(interval)
  }, [fetchData])

  // Export Transfers CSV
  const handleExportCsv = () => {
    const csv = paymentsApi.exportPayoutsCsv(transfers)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `payouts_transfers_${dateRange}_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
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
    logAudit(
      'BULK_RELEASE_ROUTE_TRANSFERS',
      'Payment',
      ids.join(','),
      `Bulk released ${ids.length} transfers.`
    )
    await fetchData()
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar (No duplicate page title) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <p className="text-sm text-textMuted max-w-xl">
          Track gym partner earnings, manage Route transfer holds, and release disbursements.
        </p>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Date range filter */}
          <div className="inline-flex rounded-control border border-border bg-surface p-0.5 text-xs font-medium text-textMuted">
            {(['today', '7d', '30d', 'custom'] as DateRangePreset[]).map((preset) => (
              <button
                key={preset}
                onClick={() => updateUrlParams({ range: preset })}
                className={`px-2.5 py-1 rounded transition-colors capitalize ${
                  dateRange === preset
                    ? 'bg-primary text-white font-bold'
                    : 'hover:text-text hover:bg-background'
                }`}
              >
                {preset === '7d' ? '7 days' : preset === '30d' ? '30 days' : preset}
              </button>
            ))}
          </div>

          {/* Export Ghost Button */}
          <button
            onClick={handleExportCsv}
            className="h-8 px-3 rounded-control border border-border bg-surface hover:bg-background text-text text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Export payouts CSV"
          >
            <Download className="w-3.5 h-3.5 stroke-[1.75]" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* 2. Four Dedicated Payout Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Held for gyms"
          value={formatIndianCurrency(stats.heldForGymsPaise)}
          subtext={`${stats.heldTransfersCount} transfers on hold`}
        />
        <StatCard
          label="Ready to release"
          value={formatIndianCurrency(stats.readyToReleasePaise)}
          subtext={`${stats.readyTransfersCount} eligible for payout`}
        />
        <StatCard
          label="Settled to gyms"
          value={formatIndianCurrency(stats.settledPaise)}
          subtext={`${stats.settledTransfersCount} transfers settled`}
        />
        <StatCard
          label="Failed / KYC issues"
          value={formatIndianCurrency(stats.failedPaise)}
          subtext={`${stats.failedTransfersCount} action required`}
        />
      </div>

      {/* Live Polling Status Indicator */}
      <div className="flex justify-end -mt-2">
        <span className="text-xs text-textSubtle">Updated {lastUpdated}</span>
      </div>

      {/* 3. Payouts Content View */}
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
    </div>
  )
}

export default PayoutsPage

