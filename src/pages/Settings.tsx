import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { MapPin, ArrowRight } from 'lucide-react'
import { useAdmin } from '@/context/admin-store'
import { ColumnDef } from '@tanstack/react-table'
import { PageHeader } from '@/components/ui/page-header'
import { DataTable, FilterOption } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { formatCurrency, formatDate } from '@/lib/utils'
import { City, Locality, AuditLog } from '@/types'

export function SettingsPage() {
  const {
    settings,
    updateSettings,
    localities,
    cities,
    addCity,
    addLocality,
    toggleLocality,
    toggleCity,
    auditLogs,
    resetToDefaultData,
    currentUser,
    switchRole,
    logAudit,
  } = useAdmin()

  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') || 'general'
  const [activeTab, setActiveTab] = useState(initialTab)

  // Sync tab with URL parameter
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'staff') {
      navigate('/staff', { replace: true })
      return
    }
    if (tab === 'master-data') {
      navigate('/master-data', { replace: true })
      return
    }
    if (tab && ['general', 'localities', 'audit', 'dev'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams, navigate])

  const handleTabChange = (val: string) => {
    setActiveTab(val)
    if (val === 'general') setSearchParams({})
    else setSearchParams({ tab: val })
  }

  // --- GENERAL SETTINGS FORM ---
  const [formData, setFormData] = useState({
    feePercentage: settings.feePercentage,
    firstCommissionPct: settings.firstCommissionPct ?? settings.feePercentage ?? 20,
    renewalCommissionPct: settings.renewalCommissionPct ?? 0,
    passThroughProcessingCostOnRenewal: settings.passThroughProcessingCostOnRenewal ?? true,
    releaseHoldHoursFirst: settings.releaseHoldHoursFirst ?? 48,
    releaseHoldHoursRenewal: settings.releaseHoldHoursRenewal ?? 24,
    feeCap: settings.feeCap,
    voucherExpiryDays: settings.voucherExpiryDays,
    companyUpiVpa: settings.companyUpiVpa,
    companyName: settings.companyName,
    companyBrandName: settings.companyBrandName,
    featuredPricingTier1Weekly: settings.featuredPricingTier1Weekly,
    featuredPricingTier1Monthly: settings.featuredPricingTier1Monthly,
    featuredPricingTier2Weekly: settings.featuredPricingTier2Weekly,
    featuredPricingTier2Monthly: settings.featuredPricingTier2Monthly,
  })
  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    updateSettings({
      feePercentage: Number(formData.firstCommissionPct),
      firstCommissionPct: Number(formData.firstCommissionPct),
      renewalCommissionPct: Number(formData.renewalCommissionPct),
      passThroughProcessingCostOnRenewal: Boolean(formData.passThroughProcessingCostOnRenewal),
      releaseHoldHoursFirst: Number(formData.releaseHoldHoursFirst),
      releaseHoldHoursRenewal: Number(formData.releaseHoldHoursRenewal),
      feeCap: Number(formData.feeCap),
      voucherExpiryDays: Number(formData.voucherExpiryDays),
      companyUpiVpa: formData.companyUpiVpa.trim(),
      companyName: formData.companyName.trim(),
      companyBrandName: formData.companyBrandName.trim(),
      featuredPricingTier1Weekly: Number(formData.featuredPricingTier1Weekly),
      featuredPricingTier1Monthly: Number(formData.featuredPricingTier1Monthly),
      featuredPricingTier2Weekly: Number(formData.featuredPricingTier2Weekly),
      featuredPricingTier2Monthly: Number(formData.featuredPricingTier2Monthly),
    })

    logAudit(
      'SETTINGS_UPDATED',
      'Settings',
      'global',
      `Updated marketplace fee settings: first payment ${formData.firstCommissionPct}%, renewal ${formData.renewalCommissionPct}%, pass-through ${formData.passThroughProcessingCostOnRenewal ? 'ON' : 'OFF'}, hold ${formData.releaseHoldHoursFirst}h/${formData.releaseHoldHoursRenewal}h, cap ₹${formData.feeCap}.`
    )

    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 4000)
  }

  // --- LOCALITIES & CITIES ---
  const [showAddLocalityModal, setShowAddLocalityModal] = useState(false)
  const [locName, setLocName] = useState('')
  const [locPincode, setLocPincode] = useState('')
  const [locTier, setLocTier] = useState<'Tier 1' | 'Tier 2' | 'Tier 3'>('Tier 1')
  const [locSlots, setLocSlots] = useState('3')

  const handleCreateLocality = (e: React.FormEvent) => {
    e.preventDefault()
    if (!locName.trim()) return
    addLocality({
      name: locName.trim(),
      cityId: 'city-1',
      cityName: 'Ludhiana',
      pincode: locPincode.trim() || '141001',
      tier: locTier,
      maxFeaturedSlots: parseInt(locSlots) || 3,
    })
    setLocName('')
    setLocPincode('')
    setShowAddLocalityModal(false)
  }

  const localityColumns: ColumnDef<Locality>[] = [
    {
      accessorKey: 'name',
      header: 'Locality',
      cell: ({ row }) => (
        <span className="text-sm font-medium text-text">{row.original.name}</span>
      ),
    },
    {
      accessorKey: 'cityName',
      header: 'City & state',
      cell: ({ row }) => (
        <span className="text-sm text-text font-normal">{row.original.cityName}, Punjab</span>
      ),
    },
    {
      accessorKey: 'pincode',
      header: 'PIN code',
      cell: ({ row }) => (
        <span className="text-sm text-textMuted font-normal">{row.original.pincode}</span>
      ),
    },
    {
      accessorKey: 'tier',
      header: 'Tier',
      cell: ({ row }) => (
        <Badge variant={row.original.tier === 'Tier 1' ? 'blue' : 'grey'}>
          {row.original.tier}
        </Badge>
      ),
    },
    {
      accessorKey: 'maxFeaturedSlots',
      header: 'Max slots',
      cell: ({ row }) => (
        <span className="text-sm text-text font-normal">{row.original.maxFeaturedSlots} slots</span>
      ),
    },
    {
      accessorKey: 'active',
      header: 'Status',
      cell: ({ row }) => (
        <StatusBadge status={row.original.active ? 'active' : 'inactive'} />
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => toggleLocality(row.original.id)}
        >
          {row.original.active ? 'Deactivate' : 'Activate'}
        </Button>
      ),
    },
  ]

  // --- AUDIT LOGS ---
  const [inspectLog, setInspectLog] = useState<AuditLog | null>(null)

  const auditColumns: ColumnDef<AuditLog>[] = [
    {
      accessorKey: 'timestamp',
      header: 'Timestamp',
      cell: ({ row }) => (
        <span className="text-sm text-textMuted font-normal">{formatDate(row.original.timestamp)}</span>
      ),
    },
    {
      accessorKey: 'actorName',
      header: 'Staff actor',
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <span className="text-sm font-medium text-text block">{row.original.actorName}</span>
          <span className="text-sm font-normal text-textMuted block">
            {row.original.actorRole.replace('_', ' ')} • {row.original.actorEmail}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }) => {
        const act = row.original.action
        const isDanger = act.includes('BLOCKED') || act.includes('SUSPENDED') || act.includes('REJECTED')
        const isSuccess = act.includes('APPROVED') || act.includes('VERIFIED') || act.includes('PAID')
        return (
          <Badge variant={isDanger ? 'red' : isSuccess ? 'green' : 'grey'}>
            {act.replace(/_/g, ' ')}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'details',
      header: 'Summary',
      cell: ({ row }) => (
        <span className="text-sm text-text font-normal max-w-sm block truncate" title={row.original.details}>
          {row.original.details}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setInspectLog(row.original)}
        >
          Details
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6 font-roboto">
      <PageHeader
        title="Settings"
        description="Configure platform fees, manage operating localities, and audit logs."
      />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="general">
            General & Fee
          </TabsTrigger>
          <TabsTrigger value="localities">
            Localities & Cities ({localities.length})
          </TabsTrigger>
          <TabsTrigger value="audit">
            Audit logs ({auditLogs.length})
          </TabsTrigger>
          {import.meta.env.DEV && (
            <TabsTrigger value="dev">
              Dev tools
            </TabsTrigger>
          )}
        </TabsList>

        {/* TAB 1: GENERAL & FEE SETTINGS */}
        <TabsContent value="general" className="mt-4">
          <form onSubmit={handleSaveSettings} className="space-y-6 max-w-3xl">
            {savedSuccess && (
              <div className="p-3 rounded-control bg-successBg text-successText text-sm font-medium">
                Platform settings saved successfully. Updated configuration recorded in audit trail.
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Platform Fee & Marketplace Commission</CardTitle>
                <p className="text-sm text-textMuted font-normal mt-0.5">
                  Route commission rules, payment hold hours, and processing fee policies
                </p>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text">
                    First payment commission (%)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="50"
                    value={formData.firstCommissionPct}
                    onChange={(e) => setFormData({ ...formData, firstCommissionPct: parseFloat(e.target.value) || 0 })}
                    required
                  />
                  <span className="text-xs text-textMuted block">Commission on member&apos;s first gym booking (default 20%)</span>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text">
                    Renewal commission (%)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="50"
                    value={formData.renewalCommissionPct}
                    onChange={(e) => setFormData({ ...formData, renewalCommissionPct: parseFloat(e.target.value) || 0 })}
                    required
                  />
                  <span className="text-xs text-textMuted block">Platform cut on subsequent renewals (default 0%)</span>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text">
                    Commission cap (₹)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.feeCap}
                    onChange={(e) => setFormData({ ...formData, feeCap: parseInt(e.target.value) || 0 })}
                    required
                  />
                  <span className="text-xs text-textMuted block">Maximum platform fee cap (default ₹1,000)</span>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text">
                    Voucher validity period (days)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="90"
                    value={formData.voucherExpiryDays}
                    onChange={(e) => setFormData({ ...formData, voucherExpiryDays: parseInt(e.target.value) || 30 })}
                    required
                  />
                  <span className="text-xs text-textMuted block">Days before unredeemed voucher expires</span>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text">
                    Hold hours (First payment)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="168"
                    value={formData.releaseHoldHoursFirst}
                    onChange={(e) => setFormData({ ...formData, releaseHoldHoursFirst: parseInt(e.target.value) || 0 })}
                    required
                  />
                  <span className="text-xs text-textMuted block">Hours to hold funds after desk redemption (default 48h)</span>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text">
                    Hold hours (Renewals)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="168"
                    value={formData.releaseHoldHoursRenewal}
                    onChange={(e) => setFormData({ ...formData, releaseHoldHoursRenewal: parseInt(e.target.value) || 0 })}
                    required
                  />
                  <span className="text-xs text-textMuted block">Hours to hold funds on renewal transfers (default 24h)</span>
                </div>

                <div className="sm:col-span-2 pt-2 border-t border-border">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.passThroughProcessingCostOnRenewal}
                      onChange={(e) => setFormData({ ...formData, passThroughProcessingCostOnRenewal: e.target.checked })}
                      className="mt-0.5 h-4 w-4 rounded-control border-border text-primary focus:ring-primary"
                    />
                    <div>
                      <span className="font-medium text-text text-sm block">
                        Pass through gateway &amp; transfer processing cost on renewals
                      </span>
                      <span className="text-xs text-textMuted block">
                        When enabled, gateway fees (2% + 18% GST) and transfer costs (0.25%) are deducted from the gym share on 0% commission renewals.
                      </span>
                    </div>
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Company & Settlement Details</CardTitle>
                <p className="text-sm text-textMuted font-normal mt-0.5">
                  Receiving UPI VPA and registered legal company information
                </p>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text">
                    Company UPI VPA for payments
                  </label>
                  <Input
                    type="text"
                    value={formData.companyUpiVpa}
                    onChange={(e) => setFormData({ ...formData, companyUpiVpa: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text">
                    Portal brand name
                  </label>
                  <Input
                    type="text"
                    value={formData.companyBrandName}
                    onChange={(e) => setFormData({ ...formData, companyBrandName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-sm font-medium text-text">
                    Registered legal company entity
                  </label>
                  <Input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Featured Listing Pricing Tiers</CardTitle>
                <p className="text-sm text-textMuted font-normal mt-0.5">
                  Standard advertising rates per locality tier
                </p>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text">
                    Tier 1 weekly rate (₹)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.featuredPricingTier1Weekly}
                    onChange={(e) => setFormData({ ...formData, featuredPricingTier1Weekly: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text">
                    Tier 1 monthly rate (₹)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.featuredPricingTier1Monthly}
                    onChange={(e) => setFormData({ ...formData, featuredPricingTier1Monthly: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text">
                    Tier 2 weekly rate (₹)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.featuredPricingTier2Weekly}
                    onChange={(e) => setFormData({ ...formData, featuredPricingTier2Weekly: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text">
                    Tier 2 monthly rate (₹)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.featuredPricingTier2Monthly}
                    onChange={(e) => setFormData({ ...formData, featuredPricingTier2Monthly: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary">
                Save settings
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* TAB 2: LOCALITIES & CITIES */}
        <TabsContent value="localities" className="mt-4 space-y-4">
          <div className="flex items-center justify-between p-3.5 rounded-control bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2.5">
              <MapPin className="h-5 w-5 text-primary shrink-0" />
              <div>
                <span className="text-sm font-semibold text-text block">Dedicated Locations &amp; Cities Module</span>
                <span className="text-xs text-textMuted block">
                  Locations is now a dedicated top-level module in the sidebar with operating clusters, zones directory, and partner gym listings.
                </span>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => navigate('/localities')}
              className="flex items-center gap-1.5 text-xs bg-primary hover:bg-primaryHover text-white shrink-0 ml-3"
            >
              <span>Open Locations Module</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => setShowAddLocalityModal(true)}
            >
              Add locality
            </Button>
          </div>

          <DataTable
            columns={localityColumns}
            data={localities}
            searchKey="name"
            searchPlaceholder="Search localities..."
            exportFilename="localities_list"
            emptyTitle="No localities configured"
            emptyDescription="There are no localities added to the system."
          />
        </TabsContent>

        {/* TAB 3: AUDIT LOGS */}
        <TabsContent value="audit" className="mt-4 space-y-4">
          <DataTable
            columns={auditColumns}
            data={auditLogs}
            searchKey="actorName"
            searchPlaceholder="Search audit logs by actor..."
            exportFilename="audit_logs"
            emptyTitle="No audit records"
            emptyDescription="No administrative actions logged in this period."
          />
        </TabsContent>

        {/* TAB 5: DEV TOOLS (Dev-only flag) */}
        {import.meta.env.DEV && (
          <TabsContent value="dev" className="mt-4 max-w-2xl space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Developer & Demo Tools</CardTitle>
                <p className="text-sm text-textMuted font-normal mt-0.5">
                  Testing controls visible only in development environments
                </p>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                {/* Reset Demo Data */}
                <div className="flex items-center justify-between p-4 rounded-control border border-border bg-background">
                  <div>
                    <span className="font-medium text-sm text-text block">Reset demo data</span>
                    <span className="text-xs text-textMuted block">
                      Restores all mock records in local storage back to initial Ludhiana state
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (confirm('Reset all mock data in LocalStorage to initial Ludhiana state?')) {
                        resetToDefaultData()
                        alert('Demo data reset successfully.')
                      }
                    }}
                  >
                    Reset demo data
                  </Button>
                </div>

                {/* Role Switcher */}
                <div className="flex items-center justify-between p-4 rounded-control border border-border bg-background">
                  <div>
                    <span className="font-medium text-sm text-text block">Switch test role</span>
                    <span className="text-xs text-textMuted block">
                      Current: {currentUser?.role} ({currentUser?.name})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={currentUser?.role === 'super_admin' ? 'primary' : 'outline'}
                      onClick={() => switchRole('super_admin')}
                    >
                      Super Admin
                    </Button>
                    <Button
                      size="sm"
                      variant={currentUser?.role === 'finance' ? 'primary' : 'outline'}
                      onClick={() => switchRole('finance')}
                    >
                      Finance
                    </Button>
                    <Button
                      size="sm"
                      variant={currentUser?.role === 'moderator' ? 'primary' : 'outline'}
                      onClick={() => switchRole('moderator')}
                    >
                      Moderator
                    </Button>
                    <Button
                      size="sm"
                      variant={currentUser?.role === 'support' ? 'primary' : 'outline'}
                      onClick={() => switchRole('support')}
                    >
                      Support
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Add Locality Modal */}
      {showAddLocalityModal && (
        <Dialog open={showAddLocalityModal} onOpenChange={setShowAddLocalityModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Operating Locality</DialogTitle>
              <DialogDescription>
                Define a new operational locality zone in Ludhiana, Punjab.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateLocality} className="space-y-3 py-2 text-sm">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text">Locality name</label>
                <Input
                  placeholder="e.g. Model Town Extension"
                  value={locName}
                  onChange={(e) => setLocName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text">PIN code</label>
                  <Input
                    placeholder="141002"
                    value={locPincode}
                    onChange={(e) => setLocPincode(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text">Locality tier</label>
                  <select
                    value={locTier}
                    onChange={(e) => setLocTier(e.target.value as any)}
                    className="w-full min-h-[40px] max-md:min-h-[44px] rounded-control border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    <option value="Tier 1">Tier 1</option>
                    <option value="Tier 2">Tier 2</option>
                    <option value="Tier 3">Tier 3</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text">Max featured listing slots</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={locSlots}
                  onChange={(e) => setLocSlots(e.target.value)}
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                <Button variant="outline" onClick={() => setShowAddLocalityModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Create locality
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Inspect Audit Log Modal */}
      {inspectLog && (
        <Dialog open={!!inspectLog} onOpenChange={() => setInspectLog(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Audit Record Details</DialogTitle>
              <DialogDescription>
                Recorded on {formatDate(inspectLog.timestamp)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-sm">
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-textMuted">Staff actor</span>
                <span className="font-medium text-text">{inspectLog.actorName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-textMuted">Role</span>
                <span className="font-medium text-text">{inspectLog.actorRole}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-textMuted">Action</span>
                <span className="font-medium text-text">{inspectLog.action}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-textMuted">Entity</span>
                <span className="font-medium text-text">{inspectLog.entityType} ({inspectLog.entityId})</span>
              </div>
              <div className="space-y-1 pt-1">
                <span className="text-xs text-textMuted block">Details</span>
                <p className="p-2.5 rounded-control bg-background border border-border text-sm text-text font-normal">
                  {inspectLog.details}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setInspectLog(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default SettingsPage
