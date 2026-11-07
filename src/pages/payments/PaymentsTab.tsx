import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { PaymentTransaction } from '../../types/payments'
import { formatIndianCurrency } from '../../lib/payments-api'
import { formatDate } from '@/shared/ui'
import { Badge } from '../../components/ui/badge'
import { Search, Filter, ChevronLeft, ChevronRight, Inbox } from 'lucide-react'

interface PaymentsTabProps {
  payments: PaymentTransaction[]
  totalCount: number
  page: number
  limit: number
  onPageChange: (newPage: number) => void
  search: string
  onSearchChange: (val: string) => void
  selectedGym: string
  onGymChange: (val: string) => void
  selectedType: string
  onTypeChange: (val: string) => void
  selectedStatus: string
  onStatusChange: (val: string) => void
  gymOptions: { id: string; name: string }[]
  onSelectPayment: (payment: PaymentTransaction) => void
  loading?: boolean
}

export function PaymentsTab({
  payments,
  totalCount,
  page,
  limit,
  onPageChange,
  search,
  onSearchChange,
  selectedGym,
  onGymChange,
  selectedType,
  onTypeChange,
  selectedStatus,
  onStatusChange,
  gymOptions,
  onSelectPayment,
  loading = false,
}: PaymentsTabProps) {
  const totalPages = Math.ceil(totalCount / limit) || 1
  const startItem = totalCount === 0 ? 0 : (page - 1) * limit + 1
  const endItem = Math.min(page * limit, totalCount)

  const getStatusBadge = (status: PaymentTransaction['status']) => {
    switch (status) {
      case 'paid':
        return <Badge variant="green">PAID</Badge>
      case 'released':
        return <Badge variant="green">RELEASED</Badge>
      case 'settled':
        return <Badge variant="green">SETTLED</Badge>
      case 'held':
        return <Badge variant="yellow">HELD</Badge>
      case 'failed':
        return <Badge variant="red">FAILED</Badge>
      case 'refunded':
        return <Badge variant="red">REFUNDED</Badge>
      default:
        return <Badge variant="grey">{String(status).toUpperCase()}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted stroke-[1.75]" />
          <input
            type="text"
            placeholder="Search voucher, member, gym, or payment ID..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-10 pl-9 pr-3 text-sm bg-surface border border-border rounded-control focus:outline-none focus:ring-1 focus:ring-primary text-text placeholder:text-textSubtle"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Gym Filter */}
          <select
            value={selectedGym}
            onChange={(e) => onGymChange(e.target.value)}
            className="h-10 px-3 text-sm bg-surface border border-border rounded-control text-text focus:outline-none focus:ring-1 focus:ring-primary"
            aria-label="Filter by gym"
          >
            <option value="all">All gyms</option>
            {gymOptions.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="h-10 px-3 text-sm bg-surface border border-border rounded-control text-text focus:outline-none focus:ring-1 focus:ring-primary"
            aria-label="Filter by transaction type"
          >
            <option value="all">All types</option>
            <option value="first_join">First join</option>
            <option value="renewal">Renewal</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="h-10 px-3 text-sm bg-surface border border-border rounded-control text-text focus:outline-none focus:ring-1 focus:ring-primary"
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            <option value="paid">Paid</option>
            <option value="held">Held</option>
            <option value="released">Released</option>
            <option value="settled">Settled</option>
            <option value="refunded">Refunded</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-surface border border-border rounded-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-textMuted">Loading payments...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Inbox className="w-10 h-10 text-textSubtle mx-auto stroke-[1.5]" />
            <p className="text-base font-medium text-text">No payments found</p>
            <p className="text-sm text-textMuted max-w-sm mx-auto">
              No transactions match your current search and filters.
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
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Paid by member</th>
                  <th className="py-3 px-4 text-right">Commission</th>
                  <th className="py-3 px-4 text-right">Gym share</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {payments.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => onSelectPayment(p)}
                    className="hover:bg-background/60 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 text-text whitespace-nowrap">
                      {formatDate(p.date)}
                    </td>
                    <td className="py-3 px-4 font-mono text-sm font-medium text-primary">
                      {p.voucherCode}
                    </td>
                    <td className="py-3 px-4 text-text">
                      <span className="font-medium block">{p.member.name}</span>
                      <span className="text-xs text-textMuted">{p.member.phone}</span>
                    </td>
                    <td className="py-3 px-4 text-text">
                      <Link
                        to={`/gyms/${p.gym.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-medium block hover:text-primary hover:underline transition-colors"
                      >
                        {p.gym.name}
                      </Link>
                      <span className="text-xs text-textMuted">{p.gym.locality}</span>
                    </td>
                    <td className="py-3 px-4 text-text whitespace-nowrap">
                      {p.type === 'first_join' ? (
                        <span className="inline-flex items-center text-xs font-medium text-text">First join</span>
                      ) : (
                        <span className="inline-flex items-center text-xs font-medium text-textMuted">Renewal</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-text whitespace-nowrap">
                      {formatIndianCurrency(p.paidByMemberPaise)}
                    </td>
                    <td className="py-3 px-4 text-right text-textMuted whitespace-nowrap">
                      {formatIndianCurrency(p.commissionPaise)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-successText whitespace-nowrap">
                      {formatIndianCurrency(p.gymSharePaise)}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {getStatusBadge(p.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Server-Side Pagination Footer */}
        <div className="px-4 py-3 border-t border-border flex items-center justify-between text-sm bg-background/30">
          <span className="text-textMuted">
            {totalCount > 0 ? `${startItem}-${endItem} of ${totalCount}` : '0 of 0'}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-1.5 border border-border rounded-control bg-surface text-text hover:bg-background disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4 stroke-[1.75]" />
            </button>
            <span className="text-xs font-medium text-text px-1">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 border border-border rounded-control bg-surface text-text hover:bg-background disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4 stroke-[1.75]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
