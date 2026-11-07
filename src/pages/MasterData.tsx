import React, { useState, useMemo } from 'react'
import { useAdmin } from '@/context/admin-store'
import { MasterDataItem, MasterDataCategory } from '@/types'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
  Plus,
  Search,
  Download,
  RotateCcw,
  Edit2,
  Trash2,
  CheckCircle2,
  Sparkles,
  Sliders,
  Layers,
  Globe,
  AlertCircle,
  Shield,
  FileText,
} from 'lucide-react'

export interface CategoryMeta {
  key: MasterDataCategory
  label: string
  singular: string
  description: string
  placeholderName: string
  placeholderCode: string
}

export const CATEGORIES: CategoryMeta[] = [
  {
    key: 'amenities',
    label: 'Amenities & Facilities',
    singular: 'Amenity',
    description: 'Gym facilities, floor equipment, and amenities displayed in filters and profiles.',
    placeholderName: 'e.g. Steam & Sauna, Swimming Pool',
    placeholderCode: 'e.g. steam_sauna, swimming_pool',
  },
  {
    key: 'workout_types',
    label: 'Workout Types',
    singular: 'Workout Type',
    description: 'Training disciplines, fitness classes, and specialized workout activities.',
    placeholderName: 'e.g. CrossFit & HIIT, Powerlifting',
    placeholderCode: 'e.g. crossfit_hiit, powerlifting',
  },
  {
    key: 'plan_durations',
    label: 'Plan Durations',
    singular: 'Plan Duration',
    description: 'Standard membership durations, packages, and special passes created by gyms.',
    placeholderName: 'e.g. 1 Month Standard, 3 Months Quarterly',
    placeholderCode: 'e.g. pass_1m, pass_3m',
  },
  {
    key: 'localities',
    label: 'Localities & Zones',
    singular: 'Locality',
    description: 'Operating micro-markets, zones, and neighborhood areas for gym discovery.',
    placeholderName: 'e.g. Model Town, Sarabha Nagar',
    placeholderCode: 'e.g. loc_model_town, loc_sarabha_nagar',
  },
  {
    key: 'trainer_certs',
    label: 'Trainer Certifications',
    singular: 'Certification',
    description: 'Recognized professional fitness credentials and coaching accreditations.',
    placeholderName: 'e.g. ACE Personal Trainer, ACSM Certified',
    placeholderCode: 'e.g. cert_ace, cert_acsm',
  },
  {
    key: 'refund_reasons',
    label: 'Refund Reasons',
    singular: 'Refund Reason',
    description: 'Standardized cancellation reasons available for member refund requests.',
    placeholderName: 'e.g. Relocating, Medical condition',
    placeholderCode: 'e.g. reason_relocation, reason_medical',
  },
  {
    key: 'support_categories',
    label: 'Support Categories',
    singular: 'Support Category',
    description: 'Inquiry and escalation classifications for member and gym partner tickets.',
    placeholderName: 'e.g. Payment & UPI, QR Voucher Activation',
    placeholderCode: 'e.g. cat_payment, cat_voucher',
  },
  {
    key: 'kyc_documents',
    label: 'KYC Document Types',
    singular: 'KYC Document',
    description: 'Compliance and identity proof documents required for partner verification.',
    placeholderName: 'e.g. GST Certificate, Commercial Electricity Bill',
    placeholderCode: 'e.g. doc_gst, doc_utility_bill',
  },
]

export function MasterDataPage() {
  const {
    masterData,
    addMasterItem,
    updateMasterItem,
    toggleMasterItemStatus,
    deleteMasterItem,
    resetMasterData,
  } = useAdmin()

  const [activeCategory, setActiveCategory] = useState<string>('amenities')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MasterDataItem | null>(null)
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<MasterDataItem | null>(null)
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)

  // Simple Add/Edit Form State (NO Target Sub-Panels)
  const [formCategory, setFormCategory] = useState<MasterDataCategory>('amenities')
  const [formName, setFormName] = useState('')
  const [formCode, setFormCode] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formSortOrder, setFormSortOrder] = useState<number>(1)
  const [formIsActive, setFormIsActive] = useState(true)

  // Current active category meta
  const currentCategoryMeta = useMemo(() => {
    return CATEGORIES.find((c) => c.key === activeCategory) || null
  }, [activeCategory])

  // Category counts
  const counts = useMemo(() => {
    const map: Record<string, number> = { all: masterData.length }
    for (const cat of CATEGORIES) {
      map[cat.key] = masterData.filter((m) => m.category === cat.key).length
    }
    return map
  }, [masterData])

  // Filtered items based on active tab, search, and status filter
  const filteredItems = useMemo(() => {
    return masterData.filter((item) => {
      // Category tab
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false
      }
      // Status filter
      if (statusFilter === 'active' && !item.isActive) return false
      if (statusFilter === 'inactive' && item.isActive) return false

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = item.name.toLowerCase().includes(q)
        const matchCode = item.code.toLowerCase().includes(q)
        const matchDesc = item.description?.toLowerCase().includes(q)
        if (!matchName && !matchCode && !matchDesc) return false
      }
      return true
    })
  }, [masterData, activeCategory, statusFilter, searchQuery])

  // Auto-slugify code when name changes (if creating new)
  const handleNameChange = (val: string) => {
    setFormName(val)
    if (!editingItem) {
      const slug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
      setFormCode(slug)
    }
  }

  // Open modal for adding option
  const openAddModal = (categoryOverride?: MasterDataCategory) => {
    const targetCat = categoryOverride || (activeCategory !== 'all' ? (activeCategory as MasterDataCategory) : 'amenities')
    setEditingItem(null)
    setFormCategory(targetCat)
    setFormName('')
    setFormCode('')
    setFormDescription('')
    setFormSortOrder(masterData.filter((m) => m.category === targetCat).length + 1)
    setFormIsActive(true)
    setIsModalOpen(true)
  }

  // Open modal for editing option
  const openEditModal = (item: MasterDataItem) => {
    setEditingItem(item)
    setFormCategory(item.category)
    setFormName(item.name)
    setFormCode(item.code)
    setFormDescription(item.description || '')
    setFormSortOrder(item.sortOrder || 1)
    setFormIsActive(item.isActive)
    setIsModalOpen(true)
  }

  // Save option (Create or Edit)
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim() || !formCode.trim()) return

    if (editingItem) {
      updateMasterItem(editingItem.id, {
        category: formCategory,
        name: formName.trim(),
        code: formCode.trim(),
        description: formDescription.trim(),
        sortOrder: Number(formSortOrder) || 1,
        isActive: formIsActive,
      })
    } else {
      addMasterItem({
        category: formCategory,
        name: formName.trim(),
        code: formCode.trim(),
        description: formDescription.trim(),
        sortOrder: Number(formSortOrder) || masterData.length + 1,
        isActive: formIsActive,
      })
    }
    setIsModalOpen(false)
  }

  // Export CSV handler
  const handleExportCSV = () => {
    const headers = ['Category', 'Name', 'Code', 'Status', 'SortOrder', 'Description']
    const rows = masterData.map((item) => [
      item.category,
      `"${item.name.replace(/"/g, '""')}"`,
      item.code,
      item.isActive ? 'Active' : 'Inactive',
      item.sortOrder,
      `"${(item.description || '').replace(/"/g, '""')}"`,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `gymapp-master-data-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  // Selected category singular name for the button
  const currentSingularName = currentCategoryMeta ? currentCategoryMeta.singular : 'Option'

  return (
    <div className="space-y-6 font-roboto">
      {/* Top Header: Title + Global Actions (NO STATS CARDS) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text tracking-tight">Master Data</h1>
          <p className="text-sm text-textMuted mt-0.5">
            Manage reference data and dropdown options across the platform.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 text-xs"
            title="Download full master data CSV"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setResetConfirmOpen(true)}
            className="flex items-center gap-1.5 text-xs text-textMuted hover:text-danger"
            title="Restore canonical defaults"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Defaults
          </Button>

          <Button
            onClick={() => openAddModal()}
            size="sm"
            className="flex items-center gap-1.5 bg-primary hover:bg-primaryHover text-white font-medium shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Master Option
          </Button>
        </div>
      </div>

      {/* Main Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="flex items-center gap-2 sm:gap-4 border-b border-border bg-transparent p-0 overflow-x-auto no-scrollbar scrollbar-none w-full select-none">
          <TabsTrigger value="all" className="whitespace-nowrap text-sm">
            All Options ({counts.all})
          </TabsTrigger>
          {CATEGORIES.map((cat) => (
            <TabsTrigger key={cat.key} value={cat.key} className="whitespace-nowrap text-sm">
              {cat.label} ({counts[cat.key] || 0})
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Unified Tab Content for Active Category */}
        <div className="mt-4 space-y-4">
          {/* Category Panel Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-card bg-surface border border-border">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-text truncate">
                {currentCategoryMeta ? currentCategoryMeta.label : 'All Master Data Options'}
              </h2>
              <p className="text-xs text-textMuted mt-0.5">
                {currentCategoryMeta
                  ? currentCategoryMeta.description
                  : 'Review and manage all system dropdown values and classifications.'}
              </p>
            </div>

            {/* SEPARATE BUTTON IN MASTER DATA PANEL */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                onClick={() => openAddModal(currentCategoryMeta ? currentCategoryMeta.key : undefined)}
                size="sm"
                className="flex items-center gap-1.5 bg-primary hover:bg-primaryHover text-white font-medium shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Add {currentSingularName}
              </Button>
            </div>
          </div>

          {/* Search & Status Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textMuted" />
              <Input
                type="text"
                placeholder={`Search ${currentCategoryMeta ? currentCategoryMeta.label.toLowerCase() : 'options'} by name or key...`}
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

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-textMuted whitespace-nowrap">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="h-9 px-3 rounded-control border border-border bg-surface text-xs text-text focus:outline-none focus:ring-1 focus:ring-primary min-w-[130px]"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>

          {/* Clean Data Table */}
          <Card className="bg-surface border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-background/50 text-xs font-semibold text-textMuted uppercase tracking-wider">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4">Option Name &amp; Key</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-textMuted">
                        <FileText className="h-8 w-8 mx-auto text-textSubtle mb-2 opacity-50" />
                        <p className="font-medium text-sm">No options match your criteria.</p>
                        <p className="text-xs text-textSubtle mt-1">
                          Try adjusting search terms or status filter.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item, idx) => {
                      const catMeta = CATEGORIES.find((c) => c.key === item.category)
                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-background/40 transition-colors group"
                        >
                          <td className="py-3 px-4 text-xs text-textMuted text-center font-mono">
                            {item.sortOrder || idx + 1}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <span className="font-medium text-text text-sm">
                                {item.name}
                              </span>
                              <span className="text-xs text-textMuted font-mono">
                                {item.code}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="blue" className="text-xs whitespace-nowrap">
                              {catMeta ? catMeta.label : item.category}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className="text-xs text-textMuted line-clamp-2 max-w-md block"
                              title={item.description}
                            >
                              {item.description || (
                                <span className="text-textSubtle italic">No description</span>
                              )}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => toggleMasterItemStatus(item.id)}
                              className="cursor-pointer focus:outline-none"
                              title={item.isActive ? 'Click to disable' : 'Click to enable'}
                            >
                              <Badge variant={item.isActive ? 'green' : 'grey'}>
                                {item.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </button>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditModal(item)}
                                className="h-7 px-2.5 text-xs"
                                title="Edit option"
                              >
                                <Edit2 className="h-3.5 w-3.5 mr-1" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setDeleteConfirmItem(item)}
                                className="h-7 w-7 p-0 text-textMuted hover:text-danger hover:bg-danger/10"
                                title="Delete option"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
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
              <span>Showing {filteredItems.length} options</span>
              <span>Click any status badge to instantly toggle availability</span>
            </div>
          </Card>
        </div>
      </Tabs>

      {/* SIMPLE ADD / EDIT MASTER OPTION MODAL (NO TARGET SUB-PANELS) */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md bg-surface font-roboto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Master Option' : `Add New ${currentSingularName}`}
            </DialogTitle>
            <DialogDescription>
              Enter the option label and identifier key for this dropdown value.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveItem} className="space-y-4 pt-2">
            {/* Category */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-text">Category</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as MasterDataCategory)}
                className="w-full h-9 rounded-control border border-border bg-background px-3 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary"
                disabled={Boolean(editingItem)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.key} value={cat.key}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Option Label / Name */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-text">Option Label / Name</label>
              <Input
                type="text"
                placeholder={
                  CATEGORIES.find((c) => c.key === formCategory)?.placeholderName || 'e.g. Option Name'
                }
                value={formName}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                autoFocus
              />
            </div>

            {/* System Code / Key */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-text">System Code / Slug (Unique)</label>
              <Input
                type="text"
                placeholder={
                  CATEGORIES.find((c) => c.key === formCategory)?.placeholderCode || 'e.g. option_code'
                }
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                required
                className="font-mono text-xs"
              />
              <span className="text-[11px] text-textSubtle block">
                Unique identifier stored in the database.
              </span>
            </div>

            {/* Description (Optional) */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-text">Description (Optional)</label>
              <Input
                type="text"
                placeholder="Short explanation or helper text..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </div>

            {/* Status Checkbox */}
            <div className="pt-1">
              <label className="flex items-center gap-2 text-xs font-medium text-text cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="h-4 w-4 rounded-control border-border text-primary focus:ring-primary"
                />
                <span>Active and available in dropdowns</span>
              </label>
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-white">
                {editingItem ? 'Save Changes' : 'Create Option'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CONFIRM DELETE DIALOG */}
      <Dialog
        open={Boolean(deleteConfirmItem)}
        onOpenChange={(open) => !open && setDeleteConfirmItem(null)}
      >
        <DialogContent className="max-w-md bg-surface font-roboto">
          <DialogHeader>
            <DialogTitle>Confirm Option Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove &quot;{deleteConfirmItem?.name}&quot; (
              <span className="font-mono text-xs">{deleteConfirmItem?.code}</span>)?
            </DialogDescription>
          </DialogHeader>
          <div className="p-3 rounded-control bg-warningBg text-warningText text-xs font-normal">
            This option will be removed from future dropdown selections. Existing records with this identifier will remain intact.
          </div>
          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirmItem(null)}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (deleteConfirmItem) {
                  deleteMasterItem(deleteConfirmItem.id)
                  setDeleteConfirmItem(null)
                }
              }}
              className="text-danger hover:bg-danger/10 border-danger/30"
            >
              Delete Option
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CONFIRM RESET DEFAULTS DIALOG */}
      <Dialog open={resetConfirmOpen} onOpenChange={setResetConfirmOpen}>
        <DialogContent className="max-w-md bg-surface font-roboto">
          <DialogHeader>
            <DialogTitle>Reset Master Data to Defaults?</DialogTitle>
            <DialogDescription>
              This will reload the initial reference set of options across all categories.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setResetConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                resetMasterData()
                setResetConfirmOpen(false)
              }}
              className="bg-primary text-white"
            >
              Reset to Defaults
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default MasterDataPage
