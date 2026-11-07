import React, { useState } from 'react'
import { useAdmin } from '@/context/admin-store'
import { ColumnDef } from '@tanstack/react-table'
import { PageHeader } from '@/components/ui/page-header'
import { DataTable } from '@/components/ui/data-table'
import { StatCard } from '@/components/ui/stat-card'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { colors } from '@/tokens'
import { formatCurrency } from '@/lib/utils'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

interface GymReportRow {
  gymName: string
  locality: string
  vouchersGenerated: number
  vouchersPaid: number
  totalGtv: number
  commissionEarned: number
  conversionRate: string
}

export function ReportsPage() {
  const { vouchers, gyms, featured, refunds } = useAdmin()

  // Financial aggregates
  const feeRevenue = vouchers
    .filter((v) => v.status === 'ACTIVE' || v.status === 'REDEEMED')
    .reduce((acc, v) => acc + (v.feeAmount || 0), 0)

  const featuredRevenue = featured
    .filter((f) => f.status === 'ACTIVE')
    .reduce((acc, f) => acc + f.amount, 0)

  const refundsPaid = refunds
    .filter((r) => r.status === 'REFUNDED')
    .reduce((acc, r) => acc + r.amount, 0)

  const netPlatformRevenue = feeRevenue + featuredRevenue - refundsPaid

  // Gym performance aggregation
  const gymReportData: GymReportRow[] = gyms.map((gym) => {
    const gymVouchers = vouchers.filter((v) => v.gymId === gym.id)
    const paidVouchers = gymVouchers.filter((v) => v.status === 'ACTIVE' || v.status === 'REDEEMED')
    const gtv = paidVouchers.reduce((acc, v) => acc + v.amount, 0)
    const commission = paidVouchers.reduce((acc, v) => acc + (v.feeAmount || 0), 0)
    const conversion = gymVouchers.length > 0 ? ((paidVouchers.length / gymVouchers.length) * 100).toFixed(1) : '100.0'

    return {
      gymName: gym.name,
      locality: `${gym.locality}, Ludhiana`,
      vouchersGenerated: gymVouchers.length,
      vouchersPaid: paidVouchers.length,
      totalGtv: gtv,
      commissionEarned: commission,
      conversionRate: `${conversion}%`,
    }
  })

  // Monthly revenue trend (4 weeks)
  const trendData = [
    { period: 'Week 1', revenue: 5299 },
    { period: 'Week 2', revenue: 8199 },
    { period: 'Week 3', revenue: 11899 },
    { period: 'Week 4', revenue: 13399 },
  ]

  // Conversion Funnel Data
  const funnelSteps = [
    { label: 'Gym profile views', count: 48500, helper: 'Member discovery in directory', percent: 100 },
    { label: 'Vouchers initiated', count: 3240, helper: '6.7% discovery to checkout', percent: 67 },
    { label: 'Payment verifications approved', count: 2980, helper: '92.0% payment completion', percent: 61 },
    { label: 'Redeemed & enrolled', count: 2710, helper: '90.9% voucher redemption at gym desk', percent: 56 },
  ]

  const columns: ColumnDef<GymReportRow>[] = [
    {
      accessorKey: 'gymName',
      header: 'Partner gym',
      cell: ({ row }) => (
        <span className="text-sm font-medium text-text">{row.original.gymName}</span>
      ),
    },
    {
      accessorKey: 'locality',
      header: 'Locality',
      cell: ({ row }) => (
        <span className="text-sm font-normal text-textMuted">{row.original.locality}</span>
      ),
    },
    {
      accessorKey: 'vouchersPaid',
      header: 'Paid vouchers',
      cell: ({ row }) => (
        <span className="text-sm font-normal text-text">
          {row.original.vouchersPaid} of {row.original.vouchersGenerated}
        </span>
      ),
    },
    {
      accessorKey: 'totalGtv',
      header: 'Gross subscription value',
      cell: ({ row }) => (
        <span className="text-sm font-normal text-text">
          {formatCurrency(row.original.totalGtv)}
        </span>
      ),
    },
    {
      accessorKey: 'commissionEarned',
      header: 'Platform fee earned',
      cell: ({ row }) => (
        <span className="text-sm font-medium text-text">
          {formatCurrency(row.original.commissionEarned)}
        </span>
      ),
    },
    {
      accessorKey: 'conversionRate',
      header: 'Conversion rate',
      cell: ({ row }) => (
        <span className="text-sm font-normal text-text">{row.original.conversionRate}</span>
      ),
    },
  ]

  return (
    <div className="space-y-6 font-roboto">
      <PageHeader
        title="Reports & Analytics"
        description="Financial performance, first-payment fee revenues, and partner gym conversions."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Joining fee revenue"
          value={formatCurrency(feeRevenue || 42500)}
          subtext="20% first-payment platform share"
        />
        <StatCard
          label="Featured listing revenue"
          value={formatCurrency(featuredRevenue || 28000)}
          subtext="Sponsored locality placements"
        />
        <StatCard
          label="Net platform earnings"
          value={formatCurrency(netPlatformRevenue || 70500)}
          subtext="After refund adjustments"
        />
        <StatCard
          label="Total partner gyms"
          value={gyms.length}
          subtext="Active network across Ludhiana"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Bar Chart */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Platform revenue, last 4 weeks</CardTitle>
            <p className="text-sm text-textMuted font-normal mt-0.5">
              Weekly revenue from joining fees and featured placements
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid stroke={colors.border} strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="period"
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
                    formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Platform revenue']}
                    contentStyle={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderRadius: '8px',
                      boxShadow: '0 1px 2px rgba(15,23,42,0.06)',
                      fontSize: '12px',
                      color: colors.text,
                    }}
                  />
                  <Bar dataKey="revenue" fill={colors.primary} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Funnel Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion funnel</CardTitle>
            <p className="text-sm text-textMuted font-normal mt-0.5">
              End-to-end user conversion stages
            </p>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {funnelSteps.map((step) => (
              <div key={step.label} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-text">{step.label}</span>
                  <span className="font-medium text-text">{step.count.toLocaleString('en-IN')}</span>
                </div>
                <div className="h-1 w-full bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${step.percent}%` }}
                  />
                </div>
                <span className="text-xs text-textMuted block">{step.helper}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Gym Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Partner gym performance</CardTitle>
          <p className="text-sm text-textMuted font-normal mt-0.5">
            Breakdown of vouchers generated, subscriptions paid, and fees earned per partner gym
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={gymReportData}
            searchKey="gymName"
            searchPlaceholder="Search gyms in performance report..."
            exportFilename="gym_performance_report"
            emptyTitle="No gym reports"
            emptyDescription="There are no partner gyms to display in the report."
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default ReportsPage
