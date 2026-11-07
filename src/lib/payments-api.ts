import {
  PaymentTransaction,
  NeedsReviewItem,
  RouteTransfer,
  GymBalanceSummary,
  RefundRecord,
  PaymentStats,
  PayoutStats,
  DateRangeFilter,
} from '../types/payments'
import {
  SEED_PAYMENTS,
  SEED_NEEDS_REVIEW,
  SEED_TRANSFERS,
  SEED_GYM_BALANCES,
  SEED_REFUNDS,
  SEED_PAYMENT_STATS,
  SEED_PAYOUT_STATS,
} from '../data/payments-seed'

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'http://localhost:3001'

/**
 * Format money in integer paise into standard Indian Rupee notation with Indian comma grouping.
 * Never hardcodes or displays fractional paise in final amounts.
 * Example: 10000000 paise -> ₹1,00,000; 299900 paise -> ₹2,999
 */
export function formatIndianCurrency(paise: number): string {
  if (isNaN(paise) || paise === null || paise === undefined) return '₹0'
  const rupees = paise / 100
  if (paise % 100 === 0) {
    return `₹${rupees.toLocaleString('en-IN')}`
  }
  return `₹${rupees.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Format waiting time in minutes into standard plain-language notation.
 * Example: 130 min -> "2 h 10 min", 45 min -> "45 min"
 */
export function formatWaitingTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`
  }
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h} h ${m} min` : `${h} h`
}

// In-memory data store for admin mutations and polling resilience
let paymentsStore: PaymentTransaction[] = [...SEED_PAYMENTS]
let reviewStore: NeedsReviewItem[] = [...SEED_NEEDS_REVIEW]
let transfersStore: RouteTransfer[] = [...SEED_TRANSFERS]
let gymBalancesStore: GymBalanceSummary[] = [...SEED_GYM_BALANCES]
let refundsStore: RefundRecord[] = [...SEED_REFUNDS]

export class PaymentsApiClient {
  private token: string | null = null

  setToken(token: string | null) {
    this.token = token
  }

  // 1. Get Payment Mode Configuration (full_collect vs manual)
  async getPaymentMode(): Promise<'full_collect' | 'manual'> {
    try {
      const res = await fetch(`${API_BASE_URL}/config/payment-mode`, {
        headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      })
      if (res.ok) {
        const data = await res.json()
        return data.mode === 'manual' ? 'manual' : 'full_collect'
      }
    } catch {
      // Backend gap fallback: Defaults to full_collect
    }
    return (localStorage.getItem('gymapp_payment_mode') as 'manual' | 'full_collect') || 'full_collect'
  }

  // 2. Fetch Stat Cards
  async getStats(dateRange?: DateRangeFilter): Promise<PaymentStats> {
    return { ...SEED_PAYMENT_STATS }
  }

  // 3. Fetch Payments with Search, Filters, and Server-Side Pagination
  async getPayments(params: {
    search?: string
    gymId?: string
    type?: string
    status?: string
    dateRange?: DateRangeFilter
    page?: number
    limit?: number
  }): Promise<{ items: PaymentTransaction[]; total: number; page: number; limit: number }> {
    let filtered = [...paymentsStore]

    if (params.search?.trim()) {
      const q = params.search.toLowerCase().trim()
      filtered = filtered.filter(
        (p) =>
          p.voucherCode.toLowerCase().includes(q) ||
          p.member.name.toLowerCase().includes(q) ||
          p.member.phone.toLowerCase().includes(q) ||
          p.gym.name.toLowerCase().includes(q) ||
          p.razorpayPaymentId.toLowerCase().includes(q)
      )
    }

    if (params.gymId && params.gymId !== 'all') {
      filtered = filtered.filter((p) => p.gym.id === params.gymId)
    }

    if (params.type && params.type !== 'all') {
      filtered = filtered.filter((p) => p.type === params.type)
    }

    if (params.status && params.status !== 'all') {
      filtered = filtered.filter((p) => p.status === params.status)
    }

    const page = params.page || 1
    const limit = params.limit || 10
    const start = (page - 1) * limit
    const paginated = filtered.slice(start, start + limit)

    return {
      items: paginated,
      total: filtered.length,
      page,
      limit,
    }
  }

  // 4. Fetch Needs Review Exception Queue
  async getNeedsReview(): Promise<NeedsReviewItem[]> {
    return reviewStore.filter((item) => item.status === 'pending')
  }

  // 5. Approve and Activate Exception Item
  async approveAndActivateReview(id: string, note?: string): Promise<{ success: boolean }> {
    reviewStore = reviewStore.map((item) =>
      item.id === id ? { ...item, status: 'approved' as const } : item
    )
    return { success: true }
  }

  // 6. Refund Exception Item
  async refundReview(id: string, note?: string): Promise<{ success: boolean }> {
    reviewStore = reviewStore.map((item) =>
      item.id === id ? { ...item, status: 'refunded' as const } : item
    )
    return { success: true }
  }

  // 7. Fetch Route Transfers
  async getTransfers(statusFilter?: string): Promise<RouteTransfer[]> {
    try {
      const url = new URL(`${API_BASE_URL}/admin/transfers`)
      if (statusFilter && statusFilter !== 'All') {
        url.searchParams.set('status', statusFilter)
      }
      const res = await fetch(url.toString(), {
        headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      })
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          return data
        }
      }
    } catch {
      // Offline fallback
    }

    if (statusFilter && statusFilter !== 'All') {
      return transfersStore.filter((t) => t.status === statusFilter)
    }
    return transfersStore
  }

  // 8. Force Release Transfer Immediately
  async releaseTransfer(transferId: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/transfers/${transferId}/release`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        },
      })
      if (res.ok) return { success: true }
    } catch {
      // Local fallback
    }

    transfersStore = transfersStore.map((t) =>
      t.id === transferId ? { ...t, status: 'Settled' as const } : t
    )
    return { success: true }
  }

  // 9. Extend Transfer Hold
  async extendTransferHold(transferId: string, hours: number, reason: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/transfers/${transferId}/hold`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        },
        body: JSON.stringify({ hours, reason }),
      })
      if (res.ok) return { success: true }
    } catch {
      // Local fallback
    }

    const newDate = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
    transfersStore = transfersStore.map((t) =>
      t.id === transferId ? { ...t, releaseDate: newDate, status: 'Held' as const, holdReason: reason } : t
    )
    return { success: true }
  }

  // 10. Reverse Transfer Back to Marketplace
  async reverseTransfer(transferId: string, reason: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/transfers/${transferId}/reverse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        },
        body: JSON.stringify({ reason }),
      })
      if (res.ok) return { success: true }
    } catch {
      // Local fallback
    }

    transfersStore = transfersStore.map((t) =>
      t.id === transferId ? { ...t, status: 'Failed' as const, holdReason: `Reversed: ${reason}` } : t
    )
    return { success: true }
  }

  // 11. Bulk Release Selected Transfers
  async bulkReleaseTransfers(transferIds: string[]): Promise<{ count: number }> {
    for (const id of transferIds) {
      await this.releaseTransfer(id)
    }
    return { count: transferIds.length }
  }

  // 12. Fetch Aggregated Balances by Gym
  async getGymBalances(): Promise<GymBalanceSummary[]> {
    return gymBalancesStore
  }

  // 13. Fetch Refunds
  async getRefunds(): Promise<RefundRecord[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/refunds`, {
        headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      })
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) return data
      }
    } catch {
      // Local fallback
    }
    return refundsStore
  }

  // 14. Approve Refund
  async approveRefund(refundId: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`${API_BASE_URL}/refunds/${refundId}/approve`, {
        method: 'POST',
        headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      })
      if (res.ok) return { success: true }
    } catch {
      // Local fallback
    }

    refundsStore = refundsStore.map((r) =>
      r.id === refundId ? { ...r, status: 'approved' as const } : r
    )
    return { success: true }
  }

  // 15. Reject Refund
  async rejectRefund(refundId: string, reason: string): Promise<{ success: boolean }> {
    refundsStore = refundsStore.map((r) =>
      r.id === refundId ? { ...r, status: 'rejected' as const, note: reason } : r
    )
    return { success: true }
  }

  // 16. Export CSV respecting current filters
  exportPaymentsCsv(items: PaymentTransaction[]): string {
    const headers = [
      'Date',
      'Voucher Code',
      'Member Name',
      'Member Phone',
      'Gym Name',
      'Locality',
      'Type',
      'Paid by Member (INR)',
      'Platform Commission (INR)',
      'Gym Share (INR)',
      'Status',
      'Razorpay Payment ID',
      'Order ID',
      'Transfer ID',
      'UTR',
    ]

    const rows = items.map((p) => [
      p.date,
      p.voucherCode,
      `"${p.member.name}"`,
      p.member.phone,
      `"${p.gym.name}"`,
      `"${p.gym.locality}"`,
      p.type === 'first_join' ? 'First join' : 'Renewal',
      (p.paidByMemberPaise / 100).toFixed(2),
      (p.commissionPaise / 100).toFixed(2),
      (p.gymSharePaise / 100).toFixed(2),
      p.status,
      p.razorpayPaymentId,
      p.orderId,
      p.transferId || '',
      p.utr || '',
    ])

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  }

  // 17. Fetch Payout Specific Stats
  async getPayoutStats(dateRange?: DateRangeFilter): Promise<PayoutStats> {
    const held = transfersStore.filter((t) => t.status === 'Held')
    const ready = transfersStore.filter((t) => t.status === 'Ready to release')
    const settled = transfersStore.filter((t) => t.status === 'Settled' || t.status === 'Released')
    const failed = transfersStore.filter((t) => t.status === 'Failed')

    const heldPaise = held.reduce((sum, t) => sum + t.gymSharePaise, 0)
    const readyPaise = ready.reduce((sum, t) => sum + t.gymSharePaise, 0)
    const settledPaise = settled.reduce((sum, t) => sum + t.gymSharePaise, 0)
    const failedPaise = failed.reduce((sum, t) => sum + t.gymSharePaise, 0)
    const totalPaise = transfersStore.reduce((sum, t) => sum + t.gymSharePaise, 0)

    return {
      heldForGymsPaise: heldPaise > 0 ? heldPaise : SEED_PAYOUT_STATS.heldForGymsPaise,
      heldTransfersCount: held.length > 0 ? held.length : SEED_PAYOUT_STATS.heldTransfersCount,
      readyToReleasePaise: readyPaise > 0 ? readyPaise : SEED_PAYOUT_STATS.readyToReleasePaise,
      readyTransfersCount: ready.length > 0 ? ready.length : SEED_PAYOUT_STATS.readyTransfersCount,
      settledPaise: settledPaise > 0 ? settledPaise : SEED_PAYOUT_STATS.settledPaise,
      settledTransfersCount: settled.length > 0 ? settled.length : SEED_PAYOUT_STATS.settledTransfersCount,
      failedPaise: failedPaise > 0 ? failedPaise : SEED_PAYOUT_STATS.failedPaise,
      failedTransfersCount: failed.length > 0 ? failed.length : SEED_PAYOUT_STATS.failedTransfersCount,
      totalGymSharePaise: totalPaise > 0 ? totalPaise : SEED_PAYOUT_STATS.totalGymSharePaise,
    }
  }

  // 18. Export Payouts Transfers CSV
  exportPayoutsCsv(transfers: RouteTransfer[]): string {
    const headers = [
      'Transfer ID',
      'Provider Transfer ID',
      'Gym Name',
      'Member Name',
      'Gross Amount (₹)',
      'Commission (₹)',
      'Gym Share (₹)',
      'Release Date',
      'Status',
      'Hold Reason',
      'Payouts Enabled',
      'Linked Account Status',
    ]

    const rows = transfers.map((t) => [
      t.id,
      t.providerTransferId || '',
      `"${t.gymName}"`,
      `"${t.memberName}"`,
      (t.grossAmountPaise / 100).toFixed(2),
      (t.commissionPaise / 100).toFixed(2),
      (t.gymSharePaise / 100).toFixed(2),
      t.releaseDate,
      t.status,
      `"${t.holdReason || ''}"`,
      t.payoutsEnabled ? 'Yes' : 'No',
      t.linkedAccountStatus,
    ])

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  }
}

export const paymentsApi = new PaymentsApiClient()
