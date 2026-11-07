import React, { useState, useMemo } from 'react'
import { useAdmin } from '@/context/admin-store'
import {
  ContentDocument,
  ContentPlatform,
  ContentCategory,
  ContentStatus,
} from '@/types'
import { Card, CardContent } from '@/components/ui/card'
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
  FileText,
  Plus,
  Search,
  Download,
  RotateCcw,
  Eye,
  Edit3,
  CheckCircle2,
  Clock,
  Globe,
  Smartphone,
  Building2,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  AlertCircle,
  BookOpen,
} from 'lucide-react'

const PLATFORM_LABELS: Record<ContentPlatform, { label: string; icon: any; color: string }> = {
  all: { label: 'All Platforms', icon: Globe, color: 'text-text' },
  member_app: { label: 'Member Mobile App', icon: Smartphone, color: 'text-primary' },
  partner_desk: { label: 'Partner Gym Desk', icon: Building2, color: 'text-successText' },
  web_portal: { label: 'Public Website', icon: Globe, color: 'text-indigo-600' },
  platform_wide: { label: 'Platform & Legal', icon: ShieldCheck, color: 'text-slate-600' },
}

const CATEGORY_LABELS: Record<ContentCategory, string> = {
  terms_of_service: 'Terms of Service',
  privacy_policy: 'Privacy Policy',
  refund_cancellation: 'Refund & Cancellation',
  partner_agreement: 'Partner Agreement',
  about_us: 'About Us',
  community_guidelines: 'Community Guidelines',
  grievance_legal: 'Grievance & Legal',
}

export function ContentPages() {
  const {
    contentDocuments,
    addContentDocument,
    updateContentDocument,
    toggleContentDocumentStatus,
    deleteContentDocument,
    resetContentDocuments,
  } = useAdmin()

  const [activePlatformTab, setActivePlatformTab] = useState<ContentPlatform>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Modals state
  const [editorDoc, setEditorDoc] = useState<ContentDocument | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isNewDoc, setIsNewDoc] = useState(false)

  const [previewDoc, setPreviewDoc] = useState<ContentDocument | null>(null)
  const [deleteConfirmDoc, setDeleteConfirmDoc] = useState<ContentDocument | null>(null)
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Editor form fields
  const [formTitle, setFormTitle] = useState('')
  const [formSlug, setFormSlug] = useState('')
  const [formPlatform, setFormPlatform] = useState<ContentPlatform>('member_app')
  const [formCategory, setFormCategory] = useState<ContentCategory>('terms_of_service')
  const [formVersion, setFormVersion] = useState('v1.0')
  const [formStatus, setFormStatus] = useState<ContentStatus>('published')
  const [formEffectiveDate, setFormEffectiveDate] = useState(new Date().toISOString().slice(0, 10))
  const [formRevisionSummary, setFormRevisionSummary] = useState('')
  const [formContent, setFormContent] = useState('')
  const [editorTab, setEditorTab] = useState<'write' | 'preview'>('write')

  // Platform counts
  const platformCounts = useMemo(() => {
    return {
      all: contentDocuments.length,
      member_app: contentDocuments.filter((d) => d.platform === 'member_app').length,
      partner_desk: contentDocuments.filter((d) => d.platform === 'partner_desk').length,
      web_portal: contentDocuments.filter((d) => d.platform === 'web_portal').length,
      platform_wide: contentDocuments.filter((d) => d.platform === 'platform_wide').length,
    }
  }, [contentDocuments])

  // Filtered documents
  const filteredDocs = useMemo(() => {
    return contentDocuments.filter((doc) => {
      // Platform tab
      if (activePlatformTab !== 'all' && doc.platform !== activePlatformTab) {
        return false
      }
      // Category filter
      if (categoryFilter !== 'all' && doc.category !== categoryFilter) {
        return false
      }
      // Status filter
      if (statusFilter !== 'all' && doc.status !== statusFilter) {
        return false
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = doc.title.toLowerCase().includes(q)
        const matchSlug = doc.slug.toLowerCase().includes(q)
        const matchContent = doc.content.toLowerCase().includes(q)
        const matchSummary = doc.revisionSummary.toLowerCase().includes(q)
        if (!matchTitle && !matchSlug && !matchContent && !matchSummary) {
          return false
        }
      }
      return true
    })
  }, [contentDocuments, activePlatformTab, categoryFilter, statusFilter, searchQuery])

  // Open Editor for new document
  const handleOpenNewDoc = () => {
    setIsNewDoc(true)
    setFormTitle('')
    setFormSlug('/legal/')
    setFormPlatform(activePlatformTab === 'all' ? 'member_app' : activePlatformTab)
    setFormCategory('terms_of_service')
    setFormVersion('v1.0')
    setFormStatus('published')
    setFormEffectiveDate(new Date().toISOString().slice(0, 10))
    setFormRevisionSummary('Initial document creation.')
    setFormContent(
      '# Document Title\n\nEnter the full terms, privacy policy, or legal clauses here using standard Markdown...'
    )
    setEditorTab('write')
    setIsEditorOpen(true)
  }

  // Open Editor for existing document
  const handleOpenEditDoc = (doc: ContentDocument) => {
    setIsNewDoc(false)
    setEditorDoc(doc)
    setFormTitle(doc.title)
    setFormSlug(doc.slug)
    setFormPlatform(doc.platform)
    setFormCategory(doc.category)
    setFormVersion(doc.version)
    setFormStatus(doc.status)
    setFormEffectiveDate(doc.effectiveDate)
    setFormRevisionSummary(doc.revisionSummary)
    setFormContent(doc.content)
    setEditorTab('write')
    setIsEditorOpen(true)
  }

  // Save handler (create or update)
  const handleSaveDocument = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim()) return

    if (isNewDoc) {
      addContentDocument({
        title: formTitle.trim(),
        slug: formSlug.trim() || `/legal/${formTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        platform: formPlatform,
        category: formCategory,
        version: formVersion.trim() || 'v1.0',
        status: formStatus,
        effectiveDate: formEffectiveDate,
        revisionSummary: formRevisionSummary.trim() || 'Updated content document.',
        content: formContent,
      })
    } else if (editorDoc) {
      updateContentDocument(editorDoc.id, {
        title: formTitle.trim(),
        slug: formSlug.trim(),
        platform: formPlatform,
        category: formCategory,
        version: formVersion.trim(),
        status: formStatus,
        effectiveDate: formEffectiveDate,
        revisionSummary: formRevisionSummary.trim(),
        content: formContent,
      })
    }

    setIsEditorOpen(false)
  }

  // Copy Markdown content
  const handleCopyMarkdown = (doc: ContentDocument) => {
    navigator.clipboard.writeText(doc.content)
    setCopiedId(doc.id)
    setTimeout(() => setCopiedId(null), 2500)
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Title', 'Slug', 'Platform', 'Category', 'Version', 'Status', 'EffectiveDate', 'LastUpdated', 'Summary']
    const rows = contentDocuments.map((d) => [
      `"${d.title.replace(/"/g, '""')}"`,
      `"${d.slug}"`,
      d.platform,
      d.category,
      d.version,
      d.status,
      d.effectiveDate,
      d.lastUpdated,
      `"${d.revisionSummary.replace(/"/g, '""')}"`,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `gymapp-legal-content-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  // Export JSON Bundle
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(contentDocuments, null, 2))
    const link = document.createElement('a')
    link.setAttribute('href', dataStr)
    link.setAttribute('download', `gymapp-content-bundle-${new Date().toISOString().slice(0, 10)}.json`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  return (
    <div className="space-y-6 font-roboto">
      {/* 1. Top Header & Global Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text tracking-tight">Content &amp; Legal Pages</h1>
          <p className="text-sm text-textMuted mt-0.5">
            Centrally update static content, terms of service, and privacy policies. Manage separately for each application.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 text-xs"
            title="Download full JSON bundle"
          >
            <Download className="h-4 w-4" />
            Export JSON
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 text-xs"
            title="Export summary CSV"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setResetConfirmOpen(true)}
            className="flex items-center gap-1.5 text-xs text-textMuted hover:text-danger"
            title="Restore canonical baseline legal policies"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Defaults
          </Button>

          <Button
            onClick={handleOpenNewDoc}
            size="sm"
            className="flex items-center gap-1.5 bg-primary hover:bg-primaryHover text-white font-medium shadow-sm"
          >
            <Plus className="h-4 w-4" />
            New Document
          </Button>
        </div>
      </div>

      {/* 2. Four Governance Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-surface border-border">
          <CardContent className="p-4">
            <span className="text-xs font-medium text-textMuted uppercase tracking-wider block">
              Published Policies
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-successText">
                {contentDocuments.filter((d) => d.status === 'published').length}
              </span>
              <span className="text-xs text-textMuted">Live documents</span>
            </div>
            <span className="text-xs text-textSubtle mt-1 block">Active across ecosystem</span>
          </CardContent>
        </Card>

        <Card className="bg-surface border-border">
          <CardContent className="p-4">
            <span className="text-xs font-medium text-textMuted uppercase tracking-wider block">
              Applications Governed
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-text">3 Platforms</span>
            </div>
            <span className="text-xs text-textSubtle mt-1 block">Mobile App, Partner Desk, Web</span>
          </CardContent>
        </Card>

        <Card className="bg-surface border-border">
          <CardContent className="p-4">
            <span className="text-xs font-medium text-textMuted uppercase tracking-wider block">
              Draft Revisions
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-600">
                {contentDocuments.filter((d) => d.status === 'draft').length}
              </span>
              <span className="text-xs text-textMuted">Pending review</span>
            </div>
            <span className="text-xs text-textSubtle mt-1 block">Unpublished changes</span>
          </CardContent>
        </Card>

        <Card className="bg-surface border-border">
          <CardContent className="p-4">
            <span className="text-xs font-medium text-textMuted uppercase tracking-wider block">
              Compliance Standard
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary">DPDP 2023</span>
            </div>
            <span className="text-xs text-textSubtle mt-1 block">Compliant with Indian IT Rules</span>
          </CardContent>
        </Card>
      </div>

      {/* 3. Platform Navigation Tabs ("Manage Separately for All") */}
      <Tabs value={activePlatformTab} onValueChange={(val) => setActivePlatformTab(val as ContentPlatform)}>
        <TabsList className="flex items-center gap-2 sm:gap-4 border-b border-border bg-transparent p-0 overflow-x-auto no-scrollbar scrollbar-none w-full select-none">
          <TabsTrigger value="all" className="whitespace-nowrap text-sm">
            All Documents ({platformCounts.all})
          </TabsTrigger>
          <TabsTrigger value="member_app" className="whitespace-nowrap text-sm flex items-center gap-1.5">
            <Smartphone className="h-3.5 w-3.5 text-primary" />
            <span>Member Mobile App ({platformCounts.member_app})</span>
          </TabsTrigger>
          <TabsTrigger value="partner_desk" className="whitespace-nowrap text-sm flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-successText" />
            <span>Partner Gym Desk ({platformCounts.partner_desk})</span>
          </TabsTrigger>
          <TabsTrigger value="web_portal" className="whitespace-nowrap text-sm flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-indigo-600" />
            <span>Public Website ({platformCounts.web_portal})</span>
          </TabsTrigger>
          <TabsTrigger value="platform_wide" className="whitespace-nowrap text-sm flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-slate-600" />
            <span>Platform &amp; Legal ({platformCounts.platform_wide})</span>
          </TabsTrigger>
        </TabsList>

        {/* 4. Filter & Search Controls */}
        <div className="mt-4 space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textMuted" />
              <Input
                type="text"
                placeholder="Search policies by title, slug, or content keywords..."
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
              <div className="flex items-center gap-1.5 min-w-[150px]">
                <span className="text-xs text-textMuted whitespace-nowrap">Category:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="h-9 px-3 rounded-control border border-border bg-surface text-xs text-text focus:outline-none focus:ring-1 focus:ring-primary w-full cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  <option value="terms_of_service">Terms of Service</option>
                  <option value="privacy_policy">Privacy Policy</option>
                  <option value="refund_cancellation">Refund &amp; Cancellation</option>
                  <option value="partner_agreement">Partner Agreement</option>
                  <option value="about_us">About Us</option>
                  <option value="community_guidelines">Community Guidelines</option>
                  <option value="grievance_legal">Grievance &amp; Legal</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 min-w-[120px]">
                <span className="text-xs text-textMuted whitespace-nowrap">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 px-3 rounded-control border border-border bg-surface text-xs text-text focus:outline-none focus:ring-1 focus:ring-primary w-full cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* 5. Documents Table */}
          <Card className="bg-surface border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-background/50 text-xs font-semibold text-textMuted uppercase tracking-wider">
                    <th className="py-3 px-4">Document Title &amp; Slug</th>
                    <th className="py-3 px-4">Target Application</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Version</th>
                    <th className="py-3 px-4">Last Updated</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredDocs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-textMuted">
                        <FileText className="h-8 w-8 mx-auto text-textSubtle mb-2" />
                        <span className="block text-sm font-medium text-text">No documents found</span>
                        <span className="block text-xs text-textSubtle mt-0.5">
                          Try adjusting your search keywords or platform filter.
                        </span>
                      </td>
                    </tr>
                  ) : (
                    filteredDocs.map((doc) => {
                      const platformMeta = PLATFORM_LABELS[doc.platform] || PLATFORM_LABELS.all
                      const PlatformIcon = platformMeta.icon
                      return (
                        <tr key={doc.id} className="hover:bg-background/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              <span className="font-semibold text-text text-sm block">
                                {doc.title}
                              </span>
                              <span className="text-xs text-textMuted font-mono block">
                                {doc.slug}
                              </span>
                              <span className="text-[11px] text-textSubtle block truncate max-w-md">
                                {doc.revisionSummary}
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-background border border-border text-xs font-medium text-text">
                              <PlatformIcon className={`h-3.5 w-3.5 ${platformMeta.color}`} />
                              <span>{platformMeta.label}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <Badge variant="grey" className="text-xs">
                              {CATEGORY_LABELS[doc.category] || doc.category}
                            </Badge>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="text-xs font-mono font-bold text-text bg-background px-2 py-0.5 rounded border border-border">
                              {doc.version}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="space-y-0.5">
                              <span className="text-xs text-text block">{doc.lastUpdated}</span>
                              <span className="text-[11px] text-textMuted block">{doc.updatedBy}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <Badge variant={doc.status === 'published' ? 'green' : 'amber'}>
                              {doc.status.toUpperCase()}
                            </Badge>
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setPreviewDoc(doc)}
                                className="h-8 px-2.5 text-xs flex items-center gap-1"
                                title="Live Preview Document"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span>Preview</span>
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenEditDoc(doc)}
                                className="h-8 px-2.5 text-xs flex items-center gap-1"
                                title="Edit Content & Revision"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                                <span>Edit</span>
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleContentDocumentStatus(doc.id)}
                                className="h-8 px-2.5 text-xs"
                                title={doc.status === 'published' ? 'Unpublish to Draft' : 'Publish Document'}
                              >
                                {doc.status === 'published' ? 'Draft' : 'Publish'}
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setDeleteConfirmDoc(doc)}
                                className="h-8 px-2 text-textMuted hover:text-danger"
                                title="Delete Document"
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
          </Card>
        </div>
      </Tabs>

      {/* 6. Document Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-primary" />
              <span>{isNewDoc ? 'Create Static Content Document' : `Edit: ${formTitle}`}</span>
            </DialogTitle>
            <DialogDescription>
              Configure legal text, effective dates, and target platform rules. Published changes reflect across all connected sub-panels.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveDocument} className="space-y-4 py-2 text-sm">
            {/* Row 1: Title & Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-text">Document Title *</label>
                <Input
                  placeholder="e.g. Member Terms of Service"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-text">Canonical URI / Slug *</label>
                <Input
                  placeholder="e.g. /legal/member-terms"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  required
                  className="h-9 text-sm font-mono"
                />
              </div>
            </div>

            {/* Row 2: Target Platform & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-text">Target Application *</label>
                <select
                  value={formPlatform}
                  onChange={(e) => setFormPlatform(e.target.value as ContentPlatform)}
                  className="w-full h-9 rounded-control border border-border bg-surface px-3 py-1.5 text-xs text-text focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="member_app">📱 Member Mobile App</option>
                  <option value="partner_desk">🏋️ Partner Gym Desk</option>
                  <option value="web_portal">🌐 Public Web Portal</option>
                  <option value="platform_wide">⚖️ Platform &amp; Legal</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-text">Category *</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as ContentCategory)}
                  className="w-full h-9 rounded-control border border-border bg-surface px-3 py-1.5 text-xs text-text focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="terms_of_service">Terms of Service</option>
                  <option value="privacy_policy">Privacy Policy</option>
                  <option value="refund_cancellation">Refund &amp; Cancellation</option>
                  <option value="partner_agreement">Partner Agreement</option>
                  <option value="about_us">About Us</option>
                  <option value="community_guidelines">Community Guidelines</option>
                  <option value="grievance_legal">Grievance &amp; Legal</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-text">Version *</label>
                  <Input
                    placeholder="v2.4"
                    value={formVersion}
                    onChange={(e) => setFormVersion(e.target.value)}
                    required
                    className="h-9 text-sm font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-text">Status *</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as ContentStatus)}
                    className="w-full h-9 rounded-control border border-border bg-surface px-2.5 py-1.5 text-xs text-text focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Row 3: Revision Note */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-text">Revision Summary / Change Log Note</label>
              <Input
                placeholder="e.g. Updated Razorpay Route payment clause and DPDP Act data rights"
                value={formRevisionSummary}
                onChange={(e) => setFormRevisionSummary(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            {/* Row 4: Markdown Content Editor + Preview Tabs */}
            <div className="space-y-2 border border-border rounded-control p-3 bg-background/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 border border-border rounded p-0.5 bg-surface text-xs">
                  <button
                    type="button"
                    onClick={() => setEditorTab('write')}
                    className={`px-3 py-1 rounded transition-colors ${
                      editorTab === 'write' ? 'bg-primary text-white font-medium' : 'text-textMuted hover:text-text'
                    }`}
                  >
                    Write (Markdown)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorTab('preview')}
                    className={`px-3 py-1 rounded transition-colors ${
                      editorTab === 'preview' ? 'bg-primary text-white font-medium' : 'text-textMuted hover:text-text'
                    }`}
                  >
                    Live Preview
                  </button>
                </div>

                {editorTab === 'write' && (
                  <div className="hidden sm:flex items-center gap-1 text-xs text-textMuted">
                    <span className="font-mono bg-background px-1.5 py-0.5 rounded border border-border"># H1</span>
                    <span className="font-mono bg-background px-1.5 py-0.5 rounded border border-border">### H3</span>
                    <span className="font-mono bg-background px-1.5 py-0.5 rounded border border-border">**bold**</span>
                    <span className="font-mono bg-background px-1.5 py-0.5 rounded border border-border">* list</span>
                  </div>
                )}
              </div>

              {editorTab === 'write' ? (
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  rows={14}
                  className="w-full rounded-control border border-border bg-surface p-3 text-xs font-mono text-text focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed resize-y"
                  placeholder="Enter markdown formatted static legal text..."
                />
              ) : (
                <div className="p-4 rounded-control border border-border bg-surface min-h-[280px] max-h-[380px] overflow-y-auto prose prose-sm max-w-none text-text">
                  <div className="space-y-3 whitespace-pre-wrap font-sans text-xs leading-relaxed">
                    {formContent}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditorOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="bg-primary hover:bg-primaryHover text-white">
                {isNewDoc ? 'Create Document' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 7. Live Preview Modal */}
      {previewDoc && (
        <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="border-b border-border pb-3">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <DialogTitle className="text-xl font-bold text-text">
                    {previewDoc.title}
                  </DialogTitle>
                  <DialogDescription className="text-xs font-mono text-textMuted mt-0.5">
                    {previewDoc.slug} • {previewDoc.version} • Effective {previewDoc.effectiveDate}
                  </DialogDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={previewDoc.status === 'published' ? 'green' : 'amber'}>
                    {previewDoc.status.toUpperCase()}
                  </Badge>
                  <Badge variant="blue">
                    {PLATFORM_LABELS[previewDoc.platform]?.label || previewDoc.platform}
                  </Badge>
                </div>
              </div>
            </DialogHeader>

            {/* Document Rendered Body */}
            <div className="py-4 space-y-4">
              <div className="p-3 rounded-control bg-background border border-border flex items-center justify-between text-xs text-textMuted">
                <span>
                  <strong>Revision Note:</strong> {previewDoc.revisionSummary} (Updated by {previewDoc.updatedBy})
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyMarkdown(previewDoc)}
                  className="h-7 text-xs flex items-center gap-1 shrink-0 ml-2"
                >
                  {copiedId === previewDoc.id ? (
                    <>
                      <Check className="h-3 w-3 text-successText" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy Markdown</span>
                    </>
                  )}
                </Button>
              </div>

              <div className="p-6 rounded-card border border-border bg-surface text-text font-roboto space-y-4 shadow-subtle">
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-text">
                  {previewDoc.content}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 border-t border-border pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const doc = previewDoc
                  setPreviewDoc(null)
                  handleOpenEditDoc(doc)
                }}
                className="flex items-center gap-1.5"
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit Document</span>
              </Button>
              <Button size="sm" onClick={() => setPreviewDoc(null)}>
                Close Preview
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* 8. Delete Confirmation Modal */}
      {deleteConfirmDoc && (
        <Dialog open={!!deleteConfirmDoc} onOpenChange={() => setDeleteConfirmDoc(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-dangerText">
                <AlertCircle className="h-5 w-5" />
                <span>Delete Static Document</span>
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete <strong>{deleteConfirmDoc.title}</strong> ({deleteConfirmDoc.slug})? Connected apps will lose access to this static policy.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button variant="outline" onClick={() => setDeleteConfirmDoc(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  deleteContentDocument(deleteConfirmDoc.id)
                  setDeleteConfirmDoc(null)
                }}
              >
                Delete Policy
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* 9. Reset Confirmation Modal */}
      {resetConfirmOpen && (
        <Dialog open={resetConfirmOpen} onOpenChange={setResetConfirmOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-dangerText">
                <RotateCcw className="h-5 w-5" />
                <span>Reset Legal Content to Defaults</span>
              </DialogTitle>
              <DialogDescription>
                This will restore all 14 canonical baseline policies for Member App, Partner Desk, and Web Portal, resetting custom drafts.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button variant="outline" onClick={() => setResetConfirmOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  resetContentDocuments()
                  setResetConfirmOpen(false)
                }}
              >
                Restore Canonical Defaults
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default ContentPages

