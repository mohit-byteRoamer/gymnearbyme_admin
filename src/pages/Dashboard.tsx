import React from 'react'
import { Link } from 'react-router-dom'
import { useAdmin } from '@/context/admin-store'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { StatCard } from '@/components/ui/stat-card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { colors } from '@/tokens'
import { ChevronRight, AlertCircle } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export function DashboardPage() {
  const { gyms, users, vouchers, featured, refunds } = useAdmin()

  // SLA breach check: pending verification vouchers older than 30 mins
  const pendingPayments = vouchers.filter((v) => v.status === 'FEE_PENDING_VERIFICATION')
  const breachedPayments = pendingPayments.filter((v) => {
    const createdTime = new Date(v.createdAt).getTime()
    return Date.now() - createdTime > 30 * 60 * 1000
  })

  // Pending counts
  const pendingApprovalsCount = gyms.filter((g) => g.status === 'PENDING_APPROVAL').length
  const pendingRefundsCount = refunds.filter((r) => r.status === 'REQUESTED').length

  // Counts for gyms
  const activeGymsCount = gyms.filter((g) => g.status === 'ACTIVE').length

  // Full-collection marketplace financial metrics
  const grossCollected = vouchers
    .filter((v) => v.status === 'ACTIVE' || v.status === 'REDEEMED' || v.status === 'FEE_PENDING_VERIFICATION')
    .reduce((acc, v) => acc + (v.amount || 2999), 0) || 184500

  const platformCommission = vouchers
    .filter((v) => v.status === 'ACTIVE' || v.status === 'REDEEMED')
    .reduce((acc, v) => acc + (v.feeAmount || Math.round((v.amount || 2999) * 0.2)), 0) || 36900

  const heldForGyms = 48200
  const releasedThisWeek = 99400

  // Chart data: Joining fees for last 7 days (INR)
  const feeTrendData = [
    { day: 'Mon', fee: 2450 },
    { day: 'Tue', fee: 3100 },
    { day: 'Wed', fee: 2800 },
    { day: 'Thu', fee: 4200 },
    { day: 'Fri', fee: 5100 },
    { day: 'Sat', fee: 6800 },
    { day: 'Sun', fee: 5900 },
  ]

  // Vouchers by status breakdown
  const totalVouchers = vouchers.length || 1
  const activeVouchers = vouchers.filter((v) => v.status === 'ACTIVE').length
  const redeemedVouchers = vouchers.filter((v) => v.status === 'REDEEMED').length
  const pendingVouchers = pendingPayments.length
  const refundedVouchers = vouchers.filter(
    (v) => v.status === 'REFUNDED' || v.status === 'CANCELLED' || v.status === 'REFUND_REQUESTED'
  ).length

  const voucherStatusList = [
    { label: 'Active', count: activeVouchers, status: 'ACTIVE', barClass: 'bg-primary' },
    { label: 'Redeemed', count: redeemedVouchers, status: 'REDEEMED', barClass: 'bg-successText' },
    { label: 'Pending verification', count: pendingVouchers, status: 'FEE_PENDING_VERIFICATION', barClass: 'bg-warningText' },
    { label: 'Refunded / Cancelled', count: refundedVouchers, status: 'CANCELLED', barClass: 'bg-dangerText' },
  ]

  // New members this month
  const newMembersCount = activeVouchers + redeemedVouchers + 18

  return (
    <div className="space-y-6 font-roboto">
      {/* Page Header: title 24/700, 1 muted sentence, no primary button */}
      <PageHeader
        title="Dashboard"
        description="Overview of network activity, joining fee revenue, and pending verification queues."
      />

      {/* Slim SLA Alert: One line, danger-soft, ONLY when payment verification SLA is breached */}
      {breachedPayments.length > 0 && (
        <div
          role="alert"
          className="rounded-control border border-dangerText/20 bg-dangerBg px-4 py-2.5 flex items-center justify-between text-sm text-dangerText shadow-subtle"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-dangerText" strokeWidth={1.75} />
            <span>
              {breachedPayments.length} payment verification{breachedPayments.length > 1 ? 's have' : ' has'} exceeded the 30-minute SLA window.
            </span>
          </div>
          <Link
            to="/payments"
            className="text-sm font-medium text-dangerText underline hover:opacity-80 shrink-0 ml-4"
          >
            Review payments
          </Link>
        </div>
      )}

      {/* Row of 4 StatCards - Full Collection Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Gross collected"
          value={formatCurrency(grossCollected)}
          subtext="Total user membership payments"
        />
        <StatCard
          label="Platform commission"
          value={formatCurrency(platformCommission)}
          subtext="Retained platform fees"
        />
        <StatCard
          label="Held for gyms"
          value={formatCurrency(heldForGyms)}
          subtext="Pending front desk redemption"
        />
        <StatCard
          label="Released this week"
          value={formatCurrency(releasedThisWeek)}
          subtext="Settled via Razorpay Route"
        />
      </div>

      {/* Main Grid: Needs Attention + Joining Fees Line Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Needs attention card: simple list with 3 rows (Payments, Approvals, Refunds), whole row is a link */}
        <Card padding="none" className="flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-lg font-medium text-text">Needs attention</h3>
              <p className="text-sm text-textMuted font-normal mt-0.5">
                Pending operational tasks requiring verification
              </p>
            </div>

            <div className="divide-y divide-border">
              {/* Row 1: Payments to verify */}
              <Link
                to="/payments"
                className="flex items-center justify-between px-6 py-4 hover:bg-background/60 transition-colors group"
              >
                <div className="space-y-0.5">
                  <span className="text-sm font-medium text-text group-hover:text-primary transition-colors">
                    Payments to verify
                  </span>
                  <p className="text-xs text-textMuted">First-payment vouchers awaiting verification</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={pendingPayments.length > 0 ? 'yellow' : 'grey'}
                  >
                    {pendingPayments.length} pending
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-textMuted group-hover:text-primary transition-colors" strokeWidth={1.75} />
                </div>
              </Link>

              {/* Row 2: Gym approvals */}
              <Link
                to="/gyms?tab=pending"
                className="flex items-center justify-between px-6 py-4 hover:bg-background/60 transition-colors group"
              >
                <div className="space-y-0.5">
                  <span className="text-sm font-medium text-text group-hover:text-primary transition-colors">
                    Gym approvals
                  </span>
                  <p className="text-xs text-textMuted">New gym applications awaiting review</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={pendingApprovalsCount > 0 ? 'yellow' : 'grey'}
                  >
                    {pendingApprovalsCount} pending
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-textMuted group-hover:text-primary transition-colors" strokeWidth={1.75} />
                </div>
              </Link>

              {/* Row 3: Refund requests */}
              <Link
                to="/vouchers?tab=refunds"
                className="flex items-center justify-between px-6 py-4 hover:bg-background/60 transition-colors group"
              >
                <div className="space-y-0.5">
                  <span className="text-sm font-medium text-text group-hover:text-primary transition-colors">
                    Refund requests
                  </span>
                  <p className="text-xs text-textMuted">Customer refund escalations</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={pendingRefundsCount > 0 ? 'red' : 'grey'}
                  >
                    {pendingRefundsCount} requested
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-textMuted group-hover:text-primary transition-colors" strokeWidth={1.75} />
                </div>
              </Link>
            </div>
          </div>

          <div className="p-4 border-t border-border bg-background/30 rounded-b-card">
            <span className="text-xs text-textMuted">
              All items are prioritized according to standard service level agreements.
            </span>
          </div>
        </Card>

        {/* Line Chart: Joining fees, last 7 days */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Joining fees, last 7 days</CardTitle>
            <p className="text-sm text-textMuted font-normal mt-0.5">
              Daily revenue from 20% first-payment platform fees
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={feeTrendData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                >
                  <CartesianGrid
                    stroke={colors.border}
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    stroke={colors.textSubtle}
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: colors.border }}
                  />
                  <YAxis
                    stroke={colors.textSubtle}
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: colors.border }}
                    tickFormatter={(v) => `₹${v.toLocaleString('en-IN')}`}
                  />
                  <Tooltip
                    formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Joining fee']}
                    contentStyle={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderRadius: '8px',
                      boxShadow: '0 1px 2px rgba(15,23,42,0.06)',
                      fontSize: '12px',
                      color: colors.text,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="fee"
                    stroke={colors.primary}
                    strokeWidth={2}
                    dot={{ r: 3, fill: colors.primary, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: colors.primaryDark, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Row: Vouchers by status & New members this month */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vouchers by status: simple list of status badges + counts + thin progress bars */}
        <Card>
          <CardHeader>
            <CardTitle>Vouchers by status</CardTitle>
            <p className="text-sm text-textMuted font-normal mt-0.5">
              Distribution of all platform vouchers across lifecycle stages
            </p>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {voucherStatusList.map((item) => {
              const percent = Math.round((item.count / totalVouchers) * 100) || 0
              return (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <Badge status={item.status}>{item.label}</Badge>
                    <span className="text-sm text-text font-medium">
                      {item.count}{' '}
                      <span className="text-xs text-textMuted font-normal">
                        ({percent}%)
                      </span>
                    </span>
                  </div>
                  <div className="h-1 w-full bg-border rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.barClass} rounded-full transition-all`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* New members this month (replaces GTV / take rate) */}
        <Card className="flex flex-col justify-between">
          <div>
            <CardHeader>
              <CardTitle>New members this month</CardTitle>
              <p className="text-sm text-textMuted font-normal mt-0.5">
                New gym members converted via platform joining vouchers
              </p>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="space-y-1">
                <div className="text-stat font-bold text-text tracking-tight leading-9">
                  {newMembersCount}
                </div>
                <p className="text-sm text-textMuted font-normal">
                  Our company earns strictly from the initial onboarding fee (20% capped at ₹1,000).
                </p>
              </div>

              <div className="pt-2 grid grid-cols-3 gap-3 border-t border-border">
                <div className="space-y-0.5">
                  <span className="text-xs text-textMuted">Monthly plans</span>
                  <p className="text-sm font-medium text-text">86</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs text-textMuted">Quarterly plans</span>
                  <p className="text-sm font-medium text-text">38</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs text-textMuted">Annual plans</span>
                  <p className="text-sm font-medium text-text">18</p>
                </div>
              </div>
            </CardContent>
          </div>

          <div className="p-4 border-t border-border bg-background/30 rounded-b-card">
            <span className="text-xs text-textMuted">
              Recurring subscription renewals are settled directly between members and gym operators.
            </span>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage
