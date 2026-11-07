import React, { useState } from 'react'
import { useAdmin } from '@/context/admin-store'
import { FeaturedListing } from '@/types'
import { ColumnDef } from '@tanstack/react-table'
import { PageHeader } from '@/components/ui/page-header'
import { DataTable, FilterOption } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { formatCurrency, formatDate } from '@/lib/utils'

export function FeaturedListingsPage() {
  const {
    featured,
    localities,
    settings,
    activateFeatured,
    rejectFeatured,
  } = useAdmin()

  const [activeTab, setActiveTab] = useState<'campaigns' | 'calendar' | 'pricing'>('campaigns')
  const [rejectModalListing, setRejectModalListing] = useState<FeaturedListing | null>(null)
  const [activateModalListing, setActivateModalListing] = useState<FeaturedListing | null>(null)

  // Columns for listings table: Gym, Locality, Dates, Fee, Status
  const columns: ColumnDef<FeaturedListing>[] = [
    {
      accessorKey: 'gymName',
      header: 'Gym',
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <span className="text-sm font-medium text-text block">{row.original.gymName}</span>
          <span className="text-sm font-normal text-textMuted block">Slot #{row.original.slotNumber}</span>
        </div>
      ),
    },
    {
      accessorKey: 'locality',
      header: 'Locality',
      cell: ({ row }) => (
        <span className="text-sm font-normal text-text">{row.original.locality}</span>
      ),
    },
    {
      accessorKey: 'startDate',
      header: 'Dates',
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <span className="text-sm font-normal text-text block">
            {formatDate(row.original.startDate)} - {formatDate(row.original.endDate)}
          </span>
          <span className="text-sm font-normal text-textMuted block">
            {row.original.durationDays} days
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Fee',
      cell: ({ row }) => (
        <span className="text-sm font-medium text-text">
          {formatCurrency(row.original.amount)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex items-center gap-2">
            {item.status === 'REQUESTED' ? (
              <>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={(e) => {
                    e.stopPropagation()
                    setActivateModalListing(item)
                  }}
                >
                  Activate
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={(e) => {
                    e.stopPropagation()
                    setRejectModalListing(item)
                  }}
                >
                  Reject
                </Button>
              </>
            ) : item.status === 'ACTIVE' ? (
              <span className="text-sm text-textMuted font-normal">Active</span>
            ) : (
              <span className="text-sm text-textMuted font-normal">Completed</span>
            )}
          </div>
        )
      },
    },
  ]

  const filterOptions: FilterOption[] = [
    {
      id: 'status',
      label: 'Status',
      options: [
        { label: 'Active', value: 'ACTIVE' },
        { label: 'Requested (Pending)', value: 'REQUESTED' },
        { label: 'Expired', value: 'EXPIRED' },
        { label: 'Rejected', value: 'REJECTED' },
      ],
    },
  ]

  // Slot availability data
  const slotAvailability = localities.map((loc) => {
    const activeInLoc = featured.filter(
      (f) => f.locality === loc.name && f.status === 'ACTIVE'
    ).length
    const maxSlots = loc.maxFeaturedSlots || 3
    const percent = Math.min(100, Math.round((activeInLoc / maxSlots) * 100))
    return {
      locality: loc.name,
      booked: activeInLoc,
      maxSlots,
      percent,
    }
  })

  return (
    <div className="space-y-6 font-roboto">
      {/* Page Header */}
      <PageHeader
        title="Featured Listings"
        description="Manage sponsored locality placements, slot availability, and promotion schedules."
      />

      {/* ONE Card: Slot availability */}
      <Card>
        <CardHeader>
          <CardTitle>Slot availability</CardTitle>
          <p className="text-sm text-textMuted font-normal mt-0.5">
            Current sponsored placements across Ludhiana localities (maximum 3 slots per locality)
          </p>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="divide-y divide-border">
            {slotAvailability.map((item) => (
              <div
                key={item.locality}
                className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-2"
              >
                <div className="sm:w-1/3">
                  <span className="text-sm font-medium text-text block">{item.locality}</span>
                </div>
                <div className="flex items-center gap-4 sm:w-2/3 justify-between sm:justify-end">
                  <span className="text-sm text-textMuted font-normal whitespace-nowrap">
                    {item.booked} of {item.maxSlots} booked
                  </span>
                  <div className="h-1 w-32 bg-border rounded-full overflow-hidden shrink-0">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs: Campaigns, Calendar, Pricing */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="campaigns">
            Campaigns ({featured.length})
          </TabsTrigger>
          <TabsTrigger value="calendar">
            Calendar
          </TabsTrigger>
          <TabsTrigger value="pricing">
            Pricing
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Campaigns Table */}
        <TabsContent value="campaigns" className="mt-4">
          <DataTable
            columns={columns}
            data={featured}
            searchKey="gymName"
            searchPlaceholder="Search campaigns by gym name..."
            filters={filterOptions}
            exportFilename="featured_campaigns"
            emptyTitle="No featured campaigns"
            emptyDescription="There are no active or pending featured listing requests."
          />
        </TabsContent>

        {/* Tab 2: Calendar */}
        <TabsContent value="calendar" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Calendar & slot occupancy</CardTitle>
              <p className="text-sm text-textMuted font-normal mt-0.5">
                Upcoming campaign schedules by locality
              </p>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm font-roboto border-collapse">
                  <thead className="bg-background border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-sm font-medium text-textMuted">Locality</th>
                      <th className="px-4 py-3 text-sm font-medium text-textMuted">Slot #1</th>
                      <th className="px-4 py-3 text-sm font-medium text-textMuted">Slot #2</th>
                      <th className="px-4 py-3 text-sm font-medium text-textMuted">Slot #3</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-surface">
                    {localities.map((loc) => {
                      const campaigns = featured.filter((f) => f.locality === loc.name && f.status === 'ACTIVE')
                      return (
                        <tr key={loc.id} className="h-14">
                          <td className="px-4 py-3 text-sm font-medium text-text">{loc.name}</td>
                          <td className="px-4 py-3 text-sm text-textMuted">
                            {campaigns[0] ? campaigns[0].gymName : 'Available'}
                          </td>
                          <td className="px-4 py-3 text-sm text-textMuted">
                            {campaigns[1] ? campaigns[1].gymName : 'Available'}
                          </td>
                          <td className="px-4 py-3 text-sm text-textMuted">
                            {campaigns[2] ? campaigns[2].gymName : 'Available'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Pricing */}
        <TabsContent value="pricing" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tier 1 Localities</CardTitle>
                <p className="text-sm text-textMuted font-normal mt-0.5">
                  High footfall prime zones (Model Town, Sarabha Nagar, BRS Nagar, Civil Lines)
                </p>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                <div className="flex justify-between py-2 border-b border-border text-sm">
                  <span className="text-textMuted">Weekly placement (7 days)</span>
                  <span className="font-medium text-text">{formatCurrency(settings.featuredPricingTier1Weekly || 1499)}</span>
                </div>
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-textMuted">Monthly placement (30 days)</span>
                  <span className="font-medium text-text">{formatCurrency(settings.featuredPricingTier1Monthly || 4999)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tier 2 Localities</CardTitle>
                <p className="text-sm text-textMuted font-normal mt-0.5">
                  Residential suburban markets (Dugri, Pakhowal Road)
                </p>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                <div className="flex justify-between py-2 border-b border-border text-sm">
                  <span className="text-textMuted">Weekly placement (7 days)</span>
                  <span className="font-medium text-text">{formatCurrency(settings.featuredPricingTier2Weekly || 999)}</span>
                </div>
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-textMuted">Monthly placement (30 days)</span>
                  <span className="font-medium text-text">{formatCurrency(settings.featuredPricingTier2Monthly || 3499)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialogs */}
      {activateModalListing && (
        <ConfirmationDialog
          open={!!activateModalListing}
          onOpenChange={(open) => !open && setActivateModalListing(null)}
          title="Activate Featured Campaign"
          description={`Activate sponsored placement for ${activateModalListing.gymName} in ${activateModalListing.locality} (Slot #${activateModalListing.slotNumber}).`}
          confirmText="Activate campaign"
          variant="default"
          onConfirm={() => {
            activateFeatured(activateModalListing.id)
            setActivateModalListing(null)
          }}
        />
      )}

      {rejectModalListing && (
        <ConfirmationDialog
          open={!!rejectModalListing}
          onOpenChange={(open) => !open && setRejectModalListing(null)}
          title="Reject Featured Campaign"
          description={`Reject placement request for ${rejectModalListing.gymName}.`}
          confirmText="Reject campaign"
          variant="destructive"
          requireReason={true}
          reasonLabel="Rejection reason"
          onConfirm={(reason) => {
            rejectFeatured(rejectModalListing.id, reason || 'Slot unavailable')
            setRejectModalListing(null)
          }}
        />
      )}
    </div>
  )
}

export default FeaturedListingsPage
