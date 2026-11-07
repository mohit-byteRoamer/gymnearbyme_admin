import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '@/context/admin-store'
import { Locality, City, Gym } from '@/types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  MapPin,
  Building2,
  Plus,
  Search,
  Download,
  CheckCircle2,
  ExternalLink,
  Globe,
  Dumbbell,
  Layers,
  Sparkles,
} from 'lucide-react'

export function LocalitiesPage() {
  const navigate = useNavigate()
  const {
    localities,
    cities,
    gyms,
    addLocality,
    toggleLocality,
    addCity,
    toggleCity,
  } = useAdmin()

  const [activeTab, setActiveTab] = useState<'localities' | 'cities'>('localities')
  const [searchQuery, setSearchQuery] = useState('')
  const [cityFilter, setCityFilter] = useState<string>('all')
  const [tierFilter, setTierFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Modals state
  const [showAddLocalityModal, setShowAddLocalityModal] = useState(false)
  const [showAddCityModal, setShowAddCityModal] = useState(false)
  const [inspectGymsLocality, setInspectGymsLocality] = useState<Locality | null>(null)

  // Add Locality Form State
  const [newLocName, setNewLocName] = useState('')
  const [newLocCityId, setNewLocCityId] = useState(cities[0]?.id || 'city-1')
  const [newLocPincode, setNewLocPincode] = useState('')
  const [newLocTier, setNewLocTier] = useState<'Tier 1' | 'Tier 2' | 'Tier 3'>('Tier 1')
  const [newLocSlots, setNewLocSlots] = useState('3')

  // Add City Form State
  const [newCityName, setNewCityName] = useState('')
  const [newCityState, setNewCityState] = useState('Punjab')

  // Map gyms to localities
  const gymsByLocality = useMemo(() => {
    const map = new Map<string, Gym[]>()
    localities.forEach((loc) => {
      const matched = gyms.filter(
        (g) =>
          g.locality.toLowerCase() === loc.name.toLowerCase() ||
          g.address.toLowerCase().includes(loc.name.toLowerCase()) ||
          g.name.toLowerCase().includes(loc.name.toLowerCase())
      )
      map.set(loc.id, matched)
    })
    return map
  }, [localities, gyms])

  // Filtered localities
  const filteredLocalities = useMemo(() => {
    return localities.filter((loc) => {
      if (cityFilter !== 'all' && loc.cityId !== cityFilter) {
        return false
      }
      if (tierFilter !== 'all' && loc.tier !== tierFilter) {
        return false
      }
      if (statusFilter === 'active' && !loc.active) return false
      if (statusFilter === 'inactive' && loc.active) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = loc.name.toLowerCase().includes(q)
        const matchCity = loc.cityName.toLowerCase().includes(q)
        const matchPin = loc.pincode.toLowerCase().includes(q)
        if (!matchName && !matchCity && !matchPin) return false
      }
      return true
    })
  }, [localities, cityFilter, tierFilter, statusFilter, searchQuery])

  // Create locality handler
  const handleCreateLocality = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLocName.trim()) return

    const selectedCity = cities.find((c) => c.id === newLocCityId) || cities[0]
    addLocality({
      name: newLocName.trim(),
      cityId: selectedCity ? selectedCity.id : 'city-1',
      cityName: selectedCity ? selectedCity.name : 'Ludhiana',
      pincode: newLocPincode.trim() || '141001',
      tier: newLocTier,
      maxFeaturedSlots: parseInt(newLocSlots) || 3,
    })

    setNewLocName('')
    setNewLocPincode('')
    setNewLocTier('Tier 1')
    setNewLocSlots('3')
    setShowAddLocalityModal(false)
  }

  // Create city handler
  const handleCreateCity = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCityName.trim() || !newCityState.trim()) return

    addCity(newCityName.trim(), newCityState.trim())
    setNewCityName('')
    setShowAddCityModal(false)
  }

  // Export CSV handler
  const handleExportCSV = () => {
    const headers = ['Locality', 'City', 'State', 'PIN Code', 'Tier', 'MaxSlots', 'Status', 'OnboardedGyms']
    const rows = localities.map((l) => {
      const onboarded = gymsByLocality.get(l.id) || []
      return [
        `"${l.name.replace(/"/g, '""')}"`,
        l.cityName,
        'Punjab',
        l.pincode,
        l.tier,
        l.maxFeaturedSlots,
        l.active ? 'Active' : 'Inactive',
        onboarded.length,
      ]
    })
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `gymapp-locations-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  // Stats
  const activeLocalitiesCount = localities.filter((l) => l.active).length
  const totalOnboardedGyms = gyms.length

  return (
    <div className="space-y-6 font-roboto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text tracking-tight">Locations &amp; Operating Cities</h1>
          <p className="text-sm text-textMuted mt-0.5">
            Active geographic clusters where GymApp is live. Manage database localities for partner gym onboarding.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 text-xs"
            title="Download locations CSV"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddCityModal(true)}
            className="flex items-center gap-1.5 text-xs text-text"
            title="Add a new operational city"
          >
            <Globe className="h-4 w-4 text-textMuted" />
            Add City
          </Button>

          <Button
            onClick={() => setShowAddLocalityModal(true)}
            size="sm"
            className="flex items-center gap-1.5 bg-primary hover:bg-primaryHover text-white font-medium shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Locality
          </Button>
        </div>
      </div>

      {/* 4 Geographic Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-surface border-border">
          <CardContent className="p-4">
            <span className="text-xs font-medium text-textMuted uppercase tracking-wider block">
              Active Cities
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-text">{cities.length}</span>
              <span className="text-xs text-textMuted">Operational</span>
            </div>
            <span className="text-xs text-textSubtle mt-1 block">Ludhiana Hub live</span>
          </CardContent>
        </Card>

        <Card className="bg-surface border-border">
          <CardContent className="p-4">
            <span className="text-xs font-medium text-textMuted uppercase tracking-wider block">
              Operating Localities
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-successText">{activeLocalitiesCount}</span>
              <span className="text-xs text-textMuted">Active zones</span>
            </div>
            <span className="text-xs text-textSubtle mt-1 block">Ready for gym onboarding</span>
          </CardContent>
        </Card>

        <Card className="bg-surface border-border">
          <CardContent className="p-4">
            <span className="text-xs font-medium text-textMuted uppercase tracking-wider block">
              Onboarded Partner Gyms
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary">{totalOnboardedGyms}</span>
              <span className="text-xs text-textMuted">Facilities</span>
            </div>
            <span className="text-xs text-textSubtle mt-1 block">Linked across local zones</span>
          </CardContent>
        </Card>

        <Card className="bg-surface border-border">
          <CardContent className="p-4">
            <span className="text-xs font-medium text-textMuted uppercase tracking-wider block">
              Primary State
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-text">Punjab</span>
            </div>
            <span className="text-xs text-textSubtle mt-1 block">Expanding to Tri-City</span>
          </CardContent>
        </Card>
      </div>

      {/* Tabs: Operating Localities vs Cities Directory */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="flex items-center gap-4 border-b border-border bg-transparent p-0 overflow-x-auto no-scrollbar scrollbar-none select-none">
          <TabsTrigger value="localities" className="text-sm">
            Operating Localities &amp; Zones ({localities.length})
          </TabsTrigger>
          <TabsTrigger value="cities" className="text-sm">
            Cities Directory ({cities.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: OPERATING LOCALITIES */}
        <TabsContent value="localities" className="mt-4 space-y-4">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textMuted" />
              <Input
                type="text"
                placeholder="Search localities by name, city, or PIN code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm w-full bg-surface border-border"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-textMuted hover:text-text"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-1.5 min-w-[130px]">
                <span className="text-xs text-textMuted whitespace-nowrap">City:</span>
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="h-9 px-3 rounded-control border border-border bg-surface text-xs text-text focus:outline-none focus:ring-1 focus:ring-primary w-full"
                >
                  <option value="all">All Cities</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 min-w-[110px]">
                <span className="text-xs text-textMuted whitespace-nowrap">Tier:</span>
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className="h-9 px-3 rounded-control border border-border bg-surface text-xs text-text focus:outline-none focus:ring-1 focus:ring-primary w-full"
                >
                  <option value="all">All Tiers</option>
                  <option value="Tier 1">Tier 1</option>
                  <option value="Tier 2">Tier 2</option>
                  <option value="Tier 3">Tier 3</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 min-w-[120px]">
                <span className="text-xs text-textMuted whitespace-nowrap">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 px-3 rounded-control border border-border bg-surface text-xs text-text focus:outline-none focus:ring-1 focus:ring-primary w-full"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Localities Table */}
          <Card className="bg-surface border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-background/50 text-xs font-semibold text-textMuted uppercase tracking-wider">
                    <th className="py-3 px-4">Locality &amp; Zone</th>
                    <th className="py-3 px-4">City &amp; State</th>
                    <th className="py-3 px-4">PIN Code</th>
                    <th className="py-3 px-4">Pricing Tier</th>
                    <th className="py-3 px-4">Onboarded Gyms</th>
                    <th className="py-3 px-4">Featured Slots</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLocalities.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-textMuted">
                        <MapPin className="h-8 w-8 mx-auto text-textSubtle mb-2 opacity-50" />
                        <p className="font-medium text-sm">No localities match your filter.</p>
                        <p className="text-xs text-textSubtle mt-1">
                          Click &quot;Add Locality&quot; to configure a new micro-market.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredLocalities.map((loc) => {
                      const onboarded = gymsByLocality.get(loc.id) || []
                      return (
                        <tr
                          key={loc.id}
                          className="hover:bg-background/40 transition-colors group"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-control bg-primaryLight text-primary flex items-center justify-center shrink-0">
                                <MapPin className="h-4 w-4" />
                              </div>
                              <span className="font-semibold text-text text-sm">
                                {loc.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-xs text-text">
                            {loc.cityName}, Punjab
                          </td>
                          <td className="py-3 px-4 text-xs text-textMuted font-mono">
                            {loc.pincode}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={loc.tier === 'Tier 1' ? 'blue' : 'grey'}
                              className="text-xs"
                            >
                              {loc.tier}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            {onboarded.length > 0 ? (
                              <button
                                type="button"
                                onClick={() => setInspectGymsLocality(loc)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-control bg-primaryLight text-primary text-xs font-medium hover:bg-primary hover:text-white transition-colors"
                                title="Click to view onboarded partner gyms"
                              >
                                <Dumbbell className="h-3.5 w-3.5" />
                                <span>{onboarded.length} Gym{onboarded.length > 1 ? 's' : ''}</span>
                              </button>
                            ) : (
                              <span className="text-xs text-textSubtle italic">0 Gyms</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-xs text-textMuted">
                            {loc.maxFeaturedSlots} slots
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => toggleLocality(loc.id)}
                              className="cursor-pointer focus:outline-none"
                              title={loc.active ? 'Click to deactivate' : 'Click to activate'}
                            >
                              <Badge variant={loc.active ? 'green' : 'grey'}>
                                {loc.active ? 'Active' : 'Inactive'}
                              </Badge>
                            </button>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleLocality(loc.id)}
                                className={`h-7 px-2.5 text-xs ${
                                  loc.active
                                    ? 'text-danger hover:bg-danger/10 border-danger/30'
                                    : 'text-successText hover:bg-successBg border-successText/30'
                                }`}
                              >
                                {loc.active ? 'Deactivate' : 'Activate'}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3 border-t border-border bg-background/50 flex items-center justify-between text-xs text-textMuted">
              <span>Showing {filteredLocalities.length} of {localities.length} localities</span>
              <span>Gym onboarding constraint: active localities populate partner address dropdown</span>
            </div>
          </Card>
        </TabsContent>

        {/* TAB 2: CITIES DIRECTORY */}
        <TabsContent value="cities" className="mt-4 space-y-4">
          <Card className="bg-surface border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-background/50 text-xs font-semibold text-textMuted uppercase tracking-wider">
                    <th className="py-3 px-4">City</th>
                    <th className="py-3 px-4">State</th>
                    <th className="py-3 px-4">Active Localities</th>
                    <th className="py-3 px-4">Total Gyms</th>
                    <th className="py-3 px-4 text-center">Operational Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {cities.map((city) => {
                    const cityLocalities = localities.filter((l) => l.cityId === city.id)
                    const cityGyms = gyms.filter((g) => g.city.toLowerCase() === city.name.toLowerCase())
                    return (
                      <tr key={city.id} className="hover:bg-background/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-primary" />
                            <span className="font-semibold text-text text-sm">{city.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-textMuted">{city.state}</td>
                        <td className="py-3 px-4 text-sm font-medium text-text">
                          {cityLocalities.length} zones
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-text">
                          {cityGyms.length} gyms
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={city.active ? 'green' : 'grey'}>
                            {city.active ? 'Operational' : 'Paused'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleCity(city.id)}
                            className="h-7 px-2.5 text-xs"
                          >
                            {city.active ? 'Pause City' : 'Resume City'}
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ADD LOCALITY MODAL */}
      <Dialog open={showAddLocalityModal} onOpenChange={setShowAddLocalityModal}>
        <DialogContent className="max-w-md bg-surface font-roboto">
          <DialogHeader>
            <DialogTitle>Add Operating Locality</DialogTitle>
            <DialogDescription>
              Register a new micro-market in the database. Partner gyms will be able to select this locality during onboarding.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateLocality} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-text">Locality Name</label>
              <Input
                placeholder="e.g. South City, Ferozepur Road"
                value={newLocName}
                onChange={(e) => setNewLocName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-text">Operating City</label>
              <select
                value={newLocCityId}
                onChange={(e) => setNewLocCityId(e.target.value)}
                className="w-full h-9 rounded-control border border-border bg-background px-3 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}, {c.state}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-text">PIN Code</label>
                <Input
                  placeholder="141001"
                  value={newLocPincode}
                  onChange={(e) => setNewLocPincode(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-text">Pricing Tier</label>
                <select
                  value={newLocTier}
                  onChange={(e) => setNewLocTier(e.target.value as any)}
                  className="w-full h-9 rounded-control border border-border bg-background px-3 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Tier 1">Tier 1 (Prime)</option>
                  <option value="Tier 2">Tier 2 (Standard)</option>
                  <option value="Tier 3">Tier 3 (Emerging)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-text">Max Featured Ad Slots</label>
              <Input
                type="number"
                min="1"
                max="10"
                value={newLocSlots}
                onChange={(e) => setNewLocSlots(e.target.value)}
                required
              />
              <span className="text-[11px] text-textSubtle block">
                Number of sponsored gym spots available in this locality.
              </span>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddLocalityModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-white">
                Save to Database
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ADD CITY MODAL */}
      <Dialog open={showAddCityModal} onOpenChange={setShowAddCityModal}>
        <DialogContent className="max-w-md bg-surface font-roboto">
          <DialogHeader>
            <DialogTitle>Add Operating City</DialogTitle>
            <DialogDescription>
              Launch GymApp in a new city or regional hub.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCity} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-text">City Name</label>
              <Input
                placeholder="e.g. Chandigarh, Jalandhar, Mohali"
                value={newCityName}
                onChange={(e) => setNewCityName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-text">State</label>
              <Input
                placeholder="e.g. Punjab, Haryana, Delhi"
                value={newCityState}
                onChange={(e) => setNewCityState(e.target.value)}
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddCityModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-white">
                Launch City
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* INSPECT ONBOARDED GYMS IN LOCALITY MODAL */}
      <Dialog
        open={Boolean(inspectGymsLocality)}
        onOpenChange={(open) => !open && setInspectGymsLocality(null)}
      >
        <DialogContent className="max-w-lg bg-surface font-roboto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span>Onboarded Gyms in {inspectGymsLocality?.name}</span>
            </DialogTitle>
            <DialogDescription>
              All active partner facilities registered in {inspectGymsLocality?.name}, {inspectGymsLocality?.cityName}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {inspectGymsLocality && (gymsByLocality.get(inspectGymsLocality.id) || []).length === 0 ? (
              <p className="text-sm text-textMuted py-4 text-center">
                No gyms have onboarded into this locality yet.
              </p>
            ) : (
              (inspectGymsLocality ? gymsByLocality.get(inspectGymsLocality.id) || [] : []).map((gym) => (
                <div
                  key={gym.id}
                  className="p-3 rounded-control border border-border bg-background flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <span className="font-semibold text-text text-sm block">{gym.name}</span>
                    <span className="text-xs text-textMuted block">{gym.address}</span>
                    <span className="text-[11px] text-textSubtle block font-mono">
                      Rating: {gym.rating} ★ ({gym.reviewCount} reviews) • Phone: {gym.phone}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setInspectGymsLocality(null)
                      navigate(`/gyms/${gym.id}`)
                    }}
                    className="h-8 text-xs shrink-0 flex items-center gap-1"
                  >
                    <span>View Gym</span>
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInspectGymsLocality(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default LocalitiesPage
