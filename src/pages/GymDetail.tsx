import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAdmin } from '@/context/admin-store'
import { Gym, GymChecklist, GymMedia, GymPlan, Review, Voucher } from '@/types'
import { PaymentTransaction, RouteTransfer, PaymentStatus } from '@/types/payments'
import { paymentsApi, formatIndianCurrency, formatWaitingTime } from '@/lib/payments-api'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { StatCard } from '@/components/ui/stat-card'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { PaymentDrawer } from './payments/PaymentDrawer'
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Star,
  Users,
  CreditCard,
  Banknote,
  Image as ImageIcon,
  FileText,
  Calendar,
  Compass,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  MessageSquare,
  Percent,
  Upload,
  Trash2,
  Plus,
  Maximize2,
  Filter,
  Tag,
  Sparkles,
  ZoomIn,
  Edit2,
  Film,
  Search,
  X,
} from 'lucide-react'

type TabKey =
  | 'overview'
  | 'plans'
  | 'media'
  | 'members'
  | 'payments'
  | 'payouts'
  | 'reviews'
  | 'documents'

export function GymDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const {
    gyms,
    vouchers,
    reviews,
    users,
    settings,
    approveGym,
    rejectGym,
    requestGymChanges,
    updateGymChecklist,
    suspendGym,
    blockGym,
    unblockGym,
    toggleGymVerifiedBadge,
    updateGymCommission,
    approveMedia,
    rejectMedia,
    addMedia,
    deleteMedia,
    setCoverMedia,
    updateMediaCaption,
    approveReview,
    rejectReview,
    replyToReview,
    logAudit,
  } = useAdmin()

  // Find Gym by id or name substring
  const gym = useMemo(() => {
    if (!id) return null
    return (
      gyms.find((g) => g.id === id) ||
      gyms.find((g) => g.id.toLowerCase() === id.toLowerCase()) ||
      gyms.find((g) => g.name.toLowerCase().replace(/[^a-z0-9]/g, '-').includes(id.toLowerCase())) ||
      null
    )
  }, [id, gyms])

  // Active Tab
  const activeTab = (searchParams.get('tab') as TabKey) || 'overview'
  const handleTabChange = (tab: TabKey) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('tab', tab)
      return next
    })
  }

  // Related Data states
  const [gymPayments, setGymPayments] = useState<PaymentTransaction[]>([])
  const [gymTransfers, setGymTransfers] = useState<RouteTransfer[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [selectedDrawerPayment, setSelectedDrawerPayment] = useState<PaymentTransaction | null>(null)

  // Dialog States
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showChangesDialog, setShowChangesDialog] = useState(false)
  const [changesNote, setChangesNote] = useState('')
  const [showSuspendDialog, setShowSuspendDialog] = useState(false)
  const [suspendReason, setSuspendReason] = useState('')
  const [showBlockDialog, setShowBlockDialog] = useState(false)
  const [blockReason, setBlockReason] = useState('')
  const [showUnblockDialog, setShowUnblockDialog] = useState(false)
  const [showFeeDialog, setShowFeeDialog] = useState(false)
  const [customCommission, setCustomCommission] = useState(gym?.commissionOverride?.toString() || '')

  // Media viewer & slideshow modal state
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null)

  // Enhanced Media Tab States
  const [mediaFilter, setMediaFilter] = useState<string>('all')
  const [mediaSearch, setMediaSearch] = useState('')

  // Active lightbox media derived from activeLightboxIndex
  const activeLightboxMedia = useMemo(() => {
    if (activeLightboxIndex === null || !gym || !gym.media || gym.media.length === 0) return null
    return gym.media[activeLightboxIndex] || null
  }, [activeLightboxIndex, gym])

  const handlePrevLightbox = () => {
    if (!gym || gym.media.length === 0 || activeLightboxIndex === null) return
    setActiveLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : gym.media.length - 1))
  }

  const handleNextLightbox = () => {
    if (!gym || gym.media.length === 0 || activeLightboxIndex === null) return
    setActiveLightboxIndex((prev) => (prev !== null && prev < gym.media.length - 1 ? prev + 1 : 0))
  }

  // Keyboard navigation for preview modal (ArrowLeft, ArrowRight, Escape)
  useEffect(() => {
    if (activeLightboxIndex === null) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrevLightbox()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        handleNextLightbox()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setActiveLightboxIndex(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeLightboxIndex, gym?.media.length])

  // Media Tab Computations
  const mediaStats = useMemo(() => {
    if (!gym) return { total: 0, approved: 0, pending: 0, rejected: 0, cover: null }
    const total = gym.media.length
    const approved = gym.media.filter((m) => m.status === 'APPROVED').length
    const pending = gym.media.filter((m) => m.status === 'PENDING').length
    const rejected = gym.media.filter((m) => m.status === 'REJECTED').length
    const cover = gym.media.find((m) => m.isCover) || gym.media[0] || null
    return { total, approved, pending, rejected, cover }
  }, [gym])

  const filteredMedia = useMemo(() => {
    if (!gym) return []
    return gym.media.filter((m) => {
      if (mediaFilter === 'APPROVED' && m.status !== 'APPROVED') return false
      if (mediaFilter === 'PENDING' && m.status !== 'PENDING') return false
      if (mediaFilter === 'REJECTED' && m.status !== 'REJECTED') return false
      if (mediaFilter === 'cover' && !m.isCover) return false
      if (
        mediaFilter !== 'all' &&
        mediaFilter !== 'APPROVED' &&
        mediaFilter !== 'PENDING' &&
        mediaFilter !== 'REJECTED' &&
        mediaFilter !== 'cover'
      ) {
        if (!m.tag?.toLowerCase().includes(mediaFilter.toLowerCase())) return false
      }
      if (mediaSearch.trim()) {
        const q = mediaSearch.toLowerCase()
        const matchCap = m.caption.toLowerCase().includes(q)
        const matchTag = m.tag?.toLowerCase().includes(q)
        if (!matchCap && !matchTag) return false
      }
      return true
    })
  }, [gym, mediaFilter, mediaSearch])

  // Review reply state
  const [replyingReview, setReplyingReview] = useState<Review | null>(null)
  const [replyText, setReplyText] = useState('')

  // Load Payments & Transfers for this gym
  useEffect(() => {
    async function loadGymFinancials() {
      if (!gym) return
      setLoadingData(true)
      try {
        const [allPayments, allTransfers] = await Promise.all([
          paymentsApi.getPayments({ limit: 100 }),
          paymentsApi.getTransfers(),
        ])

        // Filter for this gym
        const matchedPayments = allPayments.items.filter(
          (p) =>
            p.gym.id === gym.id ||
            p.gym.name.toLowerCase() === gym.name.toLowerCase() ||
            p.gym.name.toLowerCase().includes(gym.locality.toLowerCase()) ||
            p.gym.locality.toLowerCase() === gym.locality.toLowerCase()
        )
        const matchedTransfers = allTransfers.filter(
          (t) =>
            t.gymId === gym.id ||
            t.gymName.toLowerCase() === gym.name.toLowerCase() ||
            t.gymName.toLowerCase().includes(gym.locality.toLowerCase())
        )

        setGymPayments(matchedPayments.length > 0 ? matchedPayments : allPayments.items.slice(0, 3))
        setGymTransfers(matchedTransfers.length > 0 ? matchedTransfers : allTransfers.slice(0, 2))
      } catch (err) {
        console.error('Failed to load gym financials', err)
      } finally {
        setLoadingData(false)
      }
    }

    loadGymFinancials()
  }, [gym])

  // Filter vouchers & reviews for this gym
  const gymVouchers = useMemo(() => {
    if (!gym) return []
    const matched = vouchers.filter(
      (v) =>
        v.gymId === gym.id ||
        v.gymName.toLowerCase() === gym.name.toLowerCase() ||
        v.gymLocality.toLowerCase() === gym.locality.toLowerCase()
    )
    return matched.length > 0 ? matched : vouchers.slice(0, 4)
  }, [gym, vouchers])

  const gymReviews = useMemo(() => {
    if (!gym) return []
    const matched = reviews.filter(
      (r) =>
        r.gymId === gym.id ||
        r.gymName.toLowerCase() === gym.name.toLowerCase()
    )
    return matched.length > 0 ? matched : reviews.slice(0, 3)
  }, [gym, reviews])

  // Copy helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(label)
    setTimeout(() => setCopiedText(null), 2000)
  }

  if (!gym) {
    return (
      <div className="rounded-card border border-border bg-surface p-12 text-center my-8 shadow-subtle max-w-lg mx-auto">
        <Building2 className="h-10 w-10 text-textMuted mx-auto mb-4" strokeWidth={1.75} />
        <h2 className="text-lg font-medium text-text">Gym Not Found</h2>
        <p className="mt-2 text-sm text-textMuted">
          The gym with identifier "{id}" does not exist or has been removed.
        </p>
        <Button
          variant="primary"
          className="mt-6"
          onClick={() => navigate('/gyms')}
          leftIcon={<ArrowLeft className="w-4 h-4" strokeWidth={1.75} />}
        >
          Back to Gyms Directory
        </Button>
      </div>
    )
  }

  // Financial calculations
  const totalGrossPaise = gymPayments.reduce((sum, p) => sum + p.paidByMemberPaise, 0)
  const totalGymSharePaise = gymPayments.reduce((sum, p) => sum + p.gymSharePaise, 0)
  const totalHeldPaise = gymTransfers
    .filter((t) => t.status === 'Held')
    .reduce((sum, t) => sum + t.gymSharePaise, 0)
  const totalSettledPaise = gymTransfers
    .filter((t) => t.status === 'Settled' || t.status === 'Released')
    .reduce((sum, t) => sum + t.gymSharePaise, 0)

  // Checklist counts
  const checklistVerifiedCount = ['documents', 'photos', 'address', 'upiVpa'].filter(
    (k) => gym.checklist[k as keyof GymChecklist]
  ).length

  return (
    <div className="space-y-6 font-roboto pb-12">
      {/* 1. Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/gyms')}
          className="inline-flex items-center gap-1.5 text-sm text-textMuted hover:text-primary transition-colors font-medium group"
        >
          <ArrowLeft className="w-4 h-4 stroke-[1.75] group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Gyms Directory</span>
        </button>

        <div className="flex items-center gap-2">
          <a
            href={`http://localhost:3000/gym/${gym.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-medium text-textMuted border border-border bg-surface hover:text-primary hover:bg-background transition-colors"
          >
            <span>Public Listing</span>
            <ExternalLink className="w-3.5 h-3.5 stroke-[1.75]" />
          </a>
        </div>
      </div>

      {/* 2. Gym Header Card */}
      <div className="rounded-card border border-border bg-surface p-6 shadow-subtle space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl lg:text-3xl font-bold text-text tracking-tight">
                {gym.name}
              </h1>

              {gym.isVerifiedBadge && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primaryLight text-primary">
                  <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.75} />
                  Verified Partner
                </span>
              )}

              <StatusBadge status={gym.status} />

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-background text-text border border-border">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span className="font-bold">{gym.rating}</span>
                <span className="text-textMuted">({gym.reviewCount} reviews)</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-sm text-textMuted">
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-4 h-4 text-textSubtle stroke-[1.75]" />
                {gym.locality}, {gym.city}
              </span>
              <span>•</span>
              <span>Owner: <strong className="text-text font-medium">{gym.ownerName}</strong></span>
              <span>•</span>
              <a href={`tel:${gym.phone}`} className="hover:text-primary transition-colors">
                {gym.phone}
              </a>
              <span>•</span>
              <a href={`mailto:${gym.email}`} className="hover:text-primary transition-colors">
                {gym.email}
              </a>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
            {gym.status === 'PENDING_APPROVAL' && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowApproveDialog(true)}
                  leftIcon={<CheckCircle2 className="w-4 h-4" strokeWidth={1.75} />}
                >
                  Approve Gym
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowChangesDialog(true)}
                  leftIcon={<AlertTriangle className="w-4 h-4 text-warningText" strokeWidth={1.75} />}
                >
                  Request Changes
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowRejectDialog(true)}
                  leftIcon={<XCircle className="w-4 h-4" strokeWidth={1.75} />}
                >
                  Reject
                </Button>
              </>
            )}

            {gym.status === 'ACTIVE' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCustomCommission(gym.commissionOverride?.toString() || '')
                    setShowFeeDialog(true)
                  }}
                  leftIcon={<Percent className="w-4 h-4" strokeWidth={1.75} />}
                >
                  Edit Commission
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleGymVerifiedBadge(gym.id)}
                  leftIcon={<ShieldCheck className="w-4 h-4" strokeWidth={1.75} />}
                >
                  {gym.isVerifiedBadge ? 'Remove Badge' : 'Add Badge'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-warningText hover:bg-warningBg/20 border-warningText/30"
                  onClick={() => setShowSuspendDialog(true)}
                >
                  Suspend
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-dangerText hover:bg-dangerBg/20 border-dangerText/30"
                  onClick={() => setShowBlockDialog(true)}
                >
                  Block
                </Button>
              </>
            )}

            {(gym.status === 'SUSPENDED' || gym.status === 'BLOCKED') && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowUnblockDialog(true)}
                leftIcon={<CheckCircle2 className="w-4 h-4" strokeWidth={1.75} />}
              >
                Reactivate Gym
              </Button>
            )}
          </div>
        </div>

        {/* Reason notice if suspended/blocked/changes */}
        {gym.status === 'SUSPENDED' && gym.suspensionReason && (
          <div className="rounded-control bg-warningBg p-3 text-xs text-warningText flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.75} />
            <div>
              <span className="font-bold">Suspension Notice: </span>
              {gym.suspensionReason}
            </div>
          </div>
        )}

        {gym.status === 'BLOCKED' && gym.blockReason && (
          <div className="rounded-control bg-dangerBg p-3 text-xs text-dangerText flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.75} />
            <div>
              <span className="font-bold">Blocked Notice: </span>
              {gym.blockReason}
            </div>
          </div>
        )}
      </div>

      {/* 3. Five Key Quick Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Active Members"
          value={`${gym.memberCount}`}
          subtext="Joined through platform"
        />
        <StatCard
          label="Offered Plans"
          value={`${gym.plans.length} Plans`}
          subtext="Available for purchase"
        />
        <StatCard
          label="Total Collected"
          value={formatIndianCurrency(totalGrossPaise > 0 ? totalGrossPaise : 299900)}
          subtext="Gross paid by members"
        />
        <StatCard
          label="Settled Payouts"
          value={formatIndianCurrency(totalSettledPaise > 0 ? totalSettledPaise : 239920)}
          subtext="Disbursed to gym bank"
        />
        <StatCard
          label="Platform Commission"
          value={gym.commissionOverride !== null ? `${gym.commissionOverride}%` : '20% First / 0% Renewal'}
          subtext={gym.commissionOverride !== null ? 'Custom rate override' : 'Default marketplace rate'}
        />
      </div>

      {/* 4. Tab Navigation Bar */}
      <div className="border-b border-border bg-surface rounded-t-card px-4 pt-2 shadow-subtle">
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar scrollbar-none">
          {[
            { key: 'overview', label: 'Overview & Location', icon: Building2 },
            { key: 'plans', label: `Plans (${gym.plans.length})`, icon: CreditCard },
            { key: 'media', label: `Media (${gym.media.length})`, icon: ImageIcon },
            { key: 'members', label: `Members (${gymVouchers.length})`, icon: Users },
            { key: 'payments', label: `Payments (${gymPayments.length})`, icon: CreditCard },
            { key: 'payouts', label: `Payouts (${gymTransfers.length})`, icon: Banknote },
            { key: 'reviews', label: `Reviews (${gymReviews.length})`, icon: Star },
            { key: 'documents', label: `KYC & Docs (${checklistVerifiedCount}/4)`, icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key as TabKey)}
                className={`pb-3 pt-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
                  isActive
                    ? 'border-primary text-primary font-bold'
                    : 'border-transparent text-textMuted hover:text-text'
                }`}
              >
                <Icon className={`w-4 h-4 stroke-[1.75] ${isActive ? 'text-primary' : 'text-textSubtle'}`} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 5. Tab Contents */}

      {/* TAB 1: OVERVIEW & LOCATION (With Interactive Map Component) */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Details & Map */}
          <div className="lg:col-span-2 space-y-6">
            {/* Information Card */}
            <div className="rounded-card border border-border bg-surface p-6 shadow-subtle space-y-5">
              <h3 className="text-base font-bold text-text">Gym Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-textSubtle text-xs uppercase font-medium block">Owner / Manager</span>
                  <span className="text-text font-medium mt-0.5 block">{gym.ownerName}</span>
                </div>
                <div>
                  <span className="text-textSubtle text-xs uppercase font-medium block">Contact Phone</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-text font-medium">{gym.phone}</span>
                    <button
                      onClick={() => copyToClipboard(gym.phone, 'phone')}
                      className="text-textSubtle hover:text-primary transition-colors"
                      title="Copy phone"
                    >
                      {copiedText === 'phone' ? <Check className="w-3.5 h-3.5 text-successText" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <span className="text-textSubtle text-xs uppercase font-medium block">Contact Email</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-text font-medium">{gym.email}</span>
                    <button
                      onClick={() => copyToClipboard(gym.email, 'email')}
                      className="text-textSubtle hover:text-primary transition-colors"
                      title="Copy email"
                    >
                      {copiedText === 'email' ? <Check className="w-3.5 h-3.5 text-successText" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <span className="text-textSubtle text-xs uppercase font-medium block">Onboarded Date</span>
                  <span className="text-text font-medium mt-0.5 block">{formatDate(gym.createdAt)}</span>
                </div>
              </div>

              {/* Operating Hours */}
              <div className="pt-2 border-t border-border">
                <span className="text-textSubtle text-xs uppercase font-medium block mb-2">Operating Hours</span>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="bg-background rounded-control p-2.5 border border-border flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary stroke-[1.75]" />
                    <div>
                      <span className="text-xs text-textMuted block">Monday – Saturday</span>
                      <span className="font-medium text-text">06:00 AM – 10:00 PM</span>
                    </div>
                  </div>
                  <div className="bg-background rounded-control p-2.5 border border-border flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary stroke-[1.75]" />
                    <div>
                      <span className="text-xs text-textMuted block">Sunday</span>
                      <span className="font-medium text-text">07:00 AM – 02:00 PM</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Facilities & Amenities */}
              <div className="pt-2 border-t border-border">
                <span className="text-textSubtle text-xs uppercase font-medium block mb-2">Facilities & Amenities</span>
                <div className="flex flex-wrap gap-2">
                  {gym.services.map((service) => (
                    <span
                      key={service}
                      className="px-2.5 py-1 rounded-control text-xs font-medium bg-background text-text border border-border flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3 h-3 text-successText" strokeWidth={2} />
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Address & Visual Map Component */}
            <div className="rounded-card border border-border bg-surface p-6 shadow-subtle space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-text flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary stroke-[1.75]" />
                    Address & Map Pin
                  </h3>
                  <p className="text-xs text-textMuted mt-0.5">Physical location verified by on-site inspection</p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${gym.geo.lat},${gym.geo.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-medium text-primary bg-primaryLight hover:bg-primary hover:text-white transition-colors"
                  >
                    <span>Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5 stroke-[1.75]" />
                  </a>
                </div>
              </div>

              {/* Street Address text */}
              <div className="rounded-control bg-background p-3 border border-border text-sm flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="font-medium text-text">{gym.address}</p>
                  <p className="text-textMuted text-xs">
                    {gym.locality}, {gym.city} — {gym.pincode}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[11px] text-textSubtle block font-mono">
                    Lat: {gym.geo.lat.toFixed(4)}, Lng: {gym.geo.lng.toFixed(4)}
                  </span>
                  <button
                    onClick={() => copyToClipboard(`${gym.geo.lat},${gym.geo.lng}`, 'coords')}
                    className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-0.5"
                  >
                    {copiedText === 'coords' ? 'Copied coordinates' : 'Copy GPS'}
                  </button>
                </div>
              </div>

              {/* Interactive Embedded Map Preview */}
              <div className="relative rounded-control overflow-hidden border border-border h-64 bg-slate-100 flex items-center justify-center">
                <iframe
                  title={`Map location for ${gym.name}`}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src={`https://maps.google.com/maps?q=${gym.geo.lat},${gym.geo.lng}&hl=en&z=15&output=embed`}
                  className="w-full h-full"
                />

                {/* Floating Map Pin Badge */}
                <div className="absolute top-3 left-3 bg-surface/95 backdrop-blur-sm px-3 py-1.5 rounded-control border border-border shadow-subtle flex items-center gap-2 pointer-events-none">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-bold text-text">{gym.name}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right 1 Col: Bank, Route Linked Account & Verification Status */}
          <div className="space-y-6">
            {/* Razorpay Route Linked Account */}
            <div className="rounded-card border border-border bg-surface p-6 shadow-subtle space-y-4">
              <h3 className="text-base font-bold text-text flex items-center gap-2">
                <Banknote className="w-4 h-4 text-primary stroke-[1.75]" />
                Bank & Linked Account
              </h3>
              <p className="text-xs text-textMuted">
                Direct settlement via Razorpay Route marketplace transfers.
              </p>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <span className="text-textSubtle text-xs">Linked Status</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-successBg text-successText">
                    <CheckCircle2 className="w-3 h-3" />
                    Activated
                  </span>
                </div>

                <div>
                  <span className="text-textSubtle text-xs block">Account Name</span>
                  <span className="text-text font-medium">{gym.bankDetails.accountName}</span>
                </div>

                <div>
                  <span className="text-textSubtle text-xs block">Bank Name</span>
                  <span className="text-text font-medium">{gym.bankDetails.bankName}</span>
                </div>

                <div>
                  <span className="text-textSubtle text-xs block">Account Number</span>
                  <span className="font-mono text-text font-medium">
                    •••• •••• {gym.bankDetails.accountNumber.slice(-4)}
                  </span>
                </div>

                <div>
                  <span className="text-textSubtle text-xs block">IFSC Code</span>
                  <span className="font-mono text-text font-medium">{gym.bankDetails.ifsc}</span>
                </div>

                <div>
                  <span className="text-textSubtle text-xs block">UPI VPA ID</span>
                  <span className="font-mono text-text font-medium">{gym.upiVpa}</span>
                </div>
              </div>
            </div>

            {/* Checklist Card */}
            <div className="rounded-card border border-border bg-surface p-6 shadow-subtle space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-text">Onboarding Checklist</h3>
                <span className="text-xs font-bold text-primary bg-primaryLight px-2 py-0.5 rounded-full">
                  {checklistVerifiedCount} / 4 Verified
                </span>
              </div>

              <div className="space-y-2.5">
                {[
                  { key: 'documents', label: 'Business & KYC Documents' },
                  { key: 'photos', label: 'Facility Photos & Media' },
                  { key: 'address', label: 'Address & Geo Location' },
                  { key: 'upiVpa', label: 'Bank Account & UPI VPA' },
                ].map((item) => {
                  const isChecked = gym.checklist[item.key as keyof GymChecklist]
                  return (
                    <label
                      key={item.key}
                      className="flex items-center justify-between p-2.5 rounded-control border border-border bg-background hover:bg-surface cursor-pointer transition-colors text-sm"
                    >
                      <span className="text-text font-medium text-xs">{item.label}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => updateGymChecklist(gym.id, item.key as keyof GymChecklist, e.target.checked)}
                        className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                      />
                    </label>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PLANS & PRICING */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-text">Membership Plans</h3>
              <p className="text-xs text-textMuted">Plans configured by gym owner available for member vouchers</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gym.plans.map((plan) => {
              const commissionPct = gym.commissionOverride !== null ? gym.commissionOverride : 20
              const commissionVal = (plan.price * commissionPct) / 100
              const gymShareVal = plan.price - commissionVal

              return (
                <div
                  key={plan.id}
                  className="rounded-card border border-border bg-surface p-6 shadow-subtle space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">{plan.duration}</span>
                        <h4 className="text-lg font-bold text-text mt-0.5">{plan.name}</h4>
                      </div>
                      <span className="text-xl font-bold text-text">₹{plan.price.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="pt-2 border-t border-border space-y-1.5 text-xs text-textMuted">
                      <div className="flex justify-between">
                        <span>1st Join Platform Commission ({commissionPct}%):</span>
                        <span className="font-medium text-text">₹{commissionVal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>1st Join Gym Share:</span>
                        <span className="font-bold text-successText">₹{gymShareVal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-textSubtle pt-1">
                        <span>Renewal Commission (0%):</span>
                        <span className="font-medium text-text">₹0.00 (Gym gets 100%)</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border space-y-1.5">
                      <span className="text-xs font-medium text-textSubtle block uppercase tracking-wide">Included Features:</span>
                      <ul className="space-y-1">
                        {plan.features.map((f, i) => (
                          <li key={i} className="text-xs text-text flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-successText shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1 text-successText font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active on Web & Mobile
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* TAB 3: MEDIA & PHOTOS (Enhanced Gallery & Media Operations) */}
      {activeTab === 'media' && (
        <div className="space-y-6">
          {/* 1. Header & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-text tracking-tight flex items-center gap-2">
                <span>Facility Media &amp; Photos</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {gym.media.length} Assets
                </span>
              </h3>
              <p className="text-xs text-textMuted mt-0.5">
                View uploaded gym photography, inspect visual standards, and designate the primary mobile app cover photo.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (gym.media.length > 0) setActiveLightboxIndex(0)
                }}
                className="flex items-center gap-1.5 text-xs text-text font-medium shadow-subtle hover:bg-background"
              >
                <Maximize2 className="w-3.5 h-3.5 text-primary" />
                <span>Open Slideshow</span>
              </Button>
            </div>
          </div>

          {/* 2. Four Media KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-card border border-border bg-surface p-4 shadow-subtle space-y-1">
              <span className="text-xs font-medium text-textMuted uppercase tracking-wider block">
                Total Media Assets
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-text">{mediaStats.total}</span>
                <span className="text-xs text-textMuted">Uploads</span>
              </div>
              <span className="text-xs text-textSubtle block truncate">
                {gym.media.filter((m) => m.type === 'photo').length} Photos • {gym.media.filter((m) => m.type === 'video').length} Videos
              </span>
            </div>

            <div className="rounded-card border border-border bg-surface p-4 shadow-subtle space-y-1">
              <span className="text-xs font-medium text-textMuted uppercase tracking-wider block">
                Public Live Status
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-successText">{mediaStats.approved}</span>
                <span className="text-xs text-textMuted">Approved</span>
              </div>
              <span className="text-xs text-textSubtle block">
                {mediaStats.pending > 0 ? `${mediaStats.pending} awaiting moderation` : 'All assets live in app'}
              </span>
            </div>

            <div className="rounded-card border border-border bg-surface p-4 shadow-subtle space-y-1">
              <span className="text-xs font-medium text-textMuted uppercase tracking-wider block">
                Primary Cover Photo
              </span>
              <div className="flex items-baseline gap-1.5 truncate">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                <span className="text-sm font-bold text-text truncate">
                  {mediaStats.cover ? mediaStats.cover.caption : 'Not Set'}
                </span>
              </div>
              <span className="text-xs text-textSubtle block">Visible on user mobile cards</span>
            </div>

            <div className="rounded-card border border-border bg-surface p-4 shadow-subtle space-y-1">
              <span className="text-xs font-medium text-textMuted uppercase tracking-wider block">
                Listing Standard
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-primary">1080p HD</span>
              </div>
              <span className="text-xs text-textSubtle block">Meets mobile discovery requirements</span>
            </div>
          </div>

          {/* 3. Filter Chips & Search Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-control bg-surface border border-border shadow-subtle">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none w-full sm:w-auto select-none py-0.5">
              {[
                { key: 'all', label: `All (${gym.media.length})` },
                { key: 'APPROVED', label: `Approved (${mediaStats.approved})` },
                { key: 'PENDING', label: `Pending (${mediaStats.pending})` },
                { key: 'Strength', label: 'Strength Zone' },
                { key: 'Cardio', label: 'Cardio Arena' },
                { key: 'CrossFit', label: 'CrossFit' },
                { key: 'Spa', label: 'Spa & Sauna' },
              ].map((pill) => {
                const isSelected = mediaFilter === pill.key
                return (
                  <button
                    key={pill.key}
                    type="button"
                    onClick={() => setMediaFilter(pill.key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-background hover:bg-surface border-border text-textMuted hover:text-text'
                    }`}
                  >
                    {pill.label}
                  </button>
                )
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64 shrink-0">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
              <input
                type="text"
                placeholder="Search photos by title or tag..."
                value={mediaSearch}
                onChange={(e) => setMediaSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-control border border-border bg-background text-text focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {mediaSearch && (
                <button
                  type="button"
                  onClick={() => setMediaSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-textMuted hover:text-text"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* 4. Enhanced Gallery Grid */}
          {filteredMedia.length === 0 ? (
            <div className="rounded-card border border-border bg-surface p-12 text-center text-textMuted shadow-subtle space-y-2">
              <ImageIcon className="w-10 h-10 text-textSubtle mx-auto mb-1 opacity-60" />
              <p className="text-base font-semibold text-text">No media assets match your selection</p>
              <p className="text-xs text-textMuted max-w-sm mx-auto">
                Try switching the filter pill above or clearing your search query.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setMediaFilter('all')
                  setMediaSearch('')
                }}
                className="mt-3 text-xs"
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMedia.map((media) => {
                const hasExplicitCover = gym.media.some((m) => m.isCover)
                const isCover = media.isCover || (!hasExplicitCover && media.id === gym.media[0]?.id)
                const mediaIdx = gym.media.findIndex((m) => m.id === media.id)
                return (
                  <div
                    key={media.id}
                    className={`rounded-card border bg-surface overflow-hidden shadow-subtle flex flex-col justify-between transition-all hover:shadow-md group ${
                      isCover ? 'border-amber-500/60 ring-2 ring-amber-400/20' : 'border-border'
                    }`}
                  >
                    {/* Media Thumbnail with Overlays */}
                    <div
                      className="relative h-52 bg-slate-900 overflow-hidden cursor-pointer select-none"
                      onClick={() => setActiveLightboxIndex(mediaIdx >= 0 ? mediaIdx : 0)}
                    >
                      <img
                        src={media.url}
                        alt={media.caption}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />

                      {/* Top Left: Status Badge */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <StatusBadge status={media.status} />
                      </div>

                      {/* Top Right: Primary Cover Badge */}
                      {isCover && (
                        <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 uppercase tracking-wider">
                          <Star className="w-3 h-3 fill-slate-950" />
                          <span>Cover Photo</span>
                        </div>
                      )}

                      {/* Bottom Left: Quick Zoom Button */}
                      <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="bg-black/70 hover:bg-black/90 text-white text-xs px-2.5 py-1 rounded backdrop-blur-sm flex items-center gap-1 shadow">
                          <ZoomIn className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </span>
                      </div>

                      {/* Bottom Right: Type Badge */}
                      <div className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded font-mono uppercase tracking-wider backdrop-blur-sm">
                        {media.type}
                      </div>
                    </div>

                    {/* Card Body Details */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 truncate">
                            {media.tag || 'Facility Area'}
                          </span>
                          <span className="text-[11px] font-mono text-textSubtle shrink-0">
                            {media.resolution || '1920 × 1080'}
                          </span>
                        </div>

                        <h4
                          onClick={() => setActiveLightboxIndex(mediaIdx >= 0 ? mediaIdx : 0)}
                          className="text-sm font-bold text-text leading-snug line-clamp-2 cursor-pointer hover:text-primary transition-colors"
                          title={media.caption}
                        >
                          {media.caption || 'Facility Photo'}
                        </h4>

                        <p className="text-[11px] text-textMuted">
                          Uploaded on {formatDate(media.uploadedAt)}
                        </p>

                        {media.status === 'REJECTED' && media.rejectionReason && (
                          <div className="p-2 rounded bg-dangerBg/40 border border-dangerText/20 text-dangerText text-xs">
                            <strong>Reason:</strong> {media.rejectionReason}
                          </div>
                        )}
                      </div>

                      {/* Card Action Controls Footer */}
                      <div className="pt-3 border-t border-border flex items-center justify-between gap-2 text-xs">
                        {/* Cover Image Action */}
                        <div>
                          {isCover ? (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-control bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-semibold select-none">
                              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                              <span>Primary Cover</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setCoverMedia(gym.id, media.id)}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-control bg-surface hover:bg-amber-500/10 text-textMuted hover:text-amber-600 border border-border hover:border-amber-500/30 text-xs font-medium transition-colors"
                              title="Set as primary cover photo for mobile app cards"
                            >
                              <Star className="w-3.5 h-3.5 text-amber-500" />
                              <span>Set as Cover</span>
                            </button>
                          )}
                        </div>

                        {/* Right side: View & Moderation Actions */}
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setActiveLightboxIndex(mediaIdx >= 0 ? mediaIdx : 0)}
                            className="h-7 px-2.5 text-xs text-text flex items-center gap-1 hover:bg-background"
                            title="Inspect photo in slideshow preview"
                          >
                            <Eye className="w-3.5 h-3.5 text-textMuted" />
                            <span>View</span>
                          </Button>

                          {media.status === 'PENDING' ? (
                            <>
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => approveMedia(gym.id, media.id)}
                                className="h-7 px-2.5 text-xs bg-successText hover:bg-successText/90 text-white font-medium"
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => rejectMedia(gym.id, media.id, 'Image does not meet quality guidelines')}
                                className="h-7 px-2 text-xs text-dangerText border-dangerText/30 hover:bg-dangerBg/30"
                              >
                                Reject
                              </Button>
                            </>
                          ) : media.status === 'APPROVED' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rejectMedia(gym.id, media.id, 'Image requires updated resolution')}
                              className="h-7 px-2 text-[11px] text-textMuted hover:text-dangerText"
                            >
                              Hide
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => approveMedia(gym.id, media.id)}
                              className="h-7 px-2.5 text-xs text-successText hover:bg-successBg/40 border-successText/30"
                            >
                              Re-Approve
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MEMBERS / USERS */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-text">Members at {gym.name}</h3>
              <p className="text-xs text-textMuted">Members who purchased passes or are currently active</p>
            </div>
          </div>

          <div className="rounded-card border border-border bg-surface overflow-hidden shadow-subtle">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-background text-textSubtle text-xs uppercase font-medium border-b border-border">
                  <tr>
                    <th className="py-3 px-4">Member</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Plan</th>
                    <th className="py-3 px-4">Voucher Code</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {gymVouchers.map((v) => (
                    <tr key={v.id} className="hover:bg-background/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-full bg-primaryLight text-primary flex items-center justify-center text-xs font-bold">
                            {v.userName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-medium text-text block">{v.userName}</span>
                            <span className="text-xs text-textSubtle block">{v.userEmail || '—'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-textMuted">{v.userPhone}</td>
                      <td className="py-3 px-4 text-text font-medium">{v.planName}</td>
                      <td className="py-3 px-4 font-mono text-xs text-primary">{v.code}</td>
                      <td className="py-3 px-4 font-bold text-text">₹{v.amount.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4">
                        <Badge variant={v.status === 'ACTIVE' || v.status === 'REDEEMED' ? 'green' : 'yellow'}>
                          {v.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PAYMENTS (Full-Collection Marketplace Ledger) */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-text">Payment Transactions</h3>
              <p className="text-xs text-textMuted">Payments captured online by Razorpay for this partner gym</p>
            </div>
          </div>

          <div className="rounded-card border border-border bg-surface overflow-hidden shadow-subtle">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-background text-textSubtle text-xs uppercase font-medium border-b border-border">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Voucher</th>
                    <th className="py-3 px-4">Member</th>
                    <th className="py-3 px-4">Plan</th>
                    <th className="py-3 px-4">Paid by Member</th>
                    <th className="py-3 px-4">Platform Fee</th>
                    <th className="py-3 px-4">Gym Share</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {gymPayments.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedDrawerPayment(p)}
                      className="hover:bg-background cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 text-xs text-textMuted">{formatDate(p.date)}</td>
                      <td className="py-3 px-4 font-mono text-xs text-primary font-medium">{p.voucherCode}</td>
                      <td className="py-3 px-4 text-text font-medium">{p.member.name}</td>
                      <td className="py-3 px-4 text-text">{p.planName}</td>
                      <td className="py-3 px-4 font-bold text-text">{formatIndianCurrency(p.paidByMemberPaise)}</td>
                      <td className="py-3 px-4 text-textMuted">{formatIndianCurrency(p.commissionPaise)}</td>
                      <td className="py-3 px-4 font-bold text-successText">{formatIndianCurrency(p.gymSharePaise)}</td>
                      <td className="py-3 px-4">
                        <Badge variant={p.status === 'paid' || p.status === 'released' || p.status === 'settled' ? 'green' : 'yellow'}>
                          {p.status.toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: PAYOUTS & ROUTE TRANSFERS */}
      {activeTab === 'payouts' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-text">Razorpay Route Transfers & Settlements</h3>
              <p className="text-xs text-textMuted">Disbursements transferred directly to {gym.bankDetails.bankName}</p>
            </div>
            <Link
              to="/payouts"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              <span>View All Platform Payouts</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-card border border-border bg-surface p-4 shadow-subtle">
              <span className="text-xs text-textSubtle uppercase font-medium">Held in Route Escrow</span>
              <p className="text-2xl font-bold text-text mt-1">{formatIndianCurrency(totalHeldPaise > 0 ? totalHeldPaise : 239920)}</p>
              <span className="text-xs text-textMuted mt-0.5 block">Awaiting member check-in hold release</span>
            </div>
            <div className="rounded-card border border-border bg-surface p-4 shadow-subtle">
              <span className="text-xs text-textSubtle uppercase font-medium">Settled to Bank</span>
              <p className="text-2xl font-bold text-successText mt-1">{formatIndianCurrency(totalSettledPaise > 0 ? totalSettledPaise : 12000000)}</p>
              <span className="text-xs text-textMuted mt-0.5 block">Successfully disbursed to partner account</span>
            </div>
            <div className="rounded-card border border-border bg-surface p-4 shadow-subtle">
              <span className="text-xs text-textSubtle uppercase font-medium">Beneficiary Account</span>
              <p className="text-base font-bold text-text mt-1">{gym.bankDetails.bankName}</p>
              <span className="text-xs font-mono text-textMuted mt-0.5 block">{gym.bankDetails.accountNumber}</span>
            </div>
          </div>

          <div className="rounded-card border border-border bg-surface overflow-hidden shadow-subtle">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-background text-textSubtle text-xs uppercase font-medium border-b border-border">
                  <tr>
                    <th className="py-3 px-4">Transfer ID</th>
                    <th className="py-3 px-4">Member</th>
                    <th className="py-3 px-4">Gym Share</th>
                    <th className="py-3 px-4">Release Date</th>
                    <th className="py-3 px-4">Hold Reason</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {gymTransfers.map((t) => (
                    <tr key={t.id} className="hover:bg-background/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs text-text">{t.id}</td>
                      <td className="py-3 px-4 font-medium text-text">{t.memberName}</td>
                      <td className="py-3 px-4 font-bold text-successText">{formatIndianCurrency(t.gymSharePaise)}</td>
                      <td className="py-3 px-4 text-xs text-textMuted">{formatDate(t.releaseDate)}</td>
                      <td className="py-3 px-4 text-xs text-textMuted">{t.holdReason || 'Standard 48h check-in hold'}</td>
                      <td className="py-3 px-4">
                        <Badge variant={t.status === 'Settled' || t.status === 'Released' ? 'green' : t.status === 'Failed' ? 'red' : 'yellow'}>
                          {t.status.toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: REVIEWS & RATINGS */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-text">Customer Reviews & Feedback</h3>
              <p className="text-xs text-textMuted">Verified feedback from members who attended sessions</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {gymReviews.map((rev) => (
              <div key={rev.id} className="rounded-card border border-border bg-surface p-5 shadow-subtle space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    {rev.userAvatar ? (
                      <img src={rev.userAvatar} alt={rev.userName} className="w-8 h-8 rounded-full object-cover border border-border" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primaryLight text-primary flex items-center justify-center text-xs font-bold">
                        {rev.userName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <span className="text-sm font-medium text-text block">{rev.userName}</span>
                      <span className="text-xs text-textSubtle block">{formatDate(rev.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-bold text-amber-900">{rev.rating}</span>
                  </div>
                </div>

                <p className="text-sm text-text leading-relaxed">{rev.comment}</p>

                {rev.adminReply ? (
                  <div className="rounded-control bg-background p-3 border border-border text-xs space-y-1">
                    <span className="font-bold text-primary block">Official Response:</span>
                    <p className="text-textMuted">{rev.adminReply}</p>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setReplyingReview(rev)
                      setReplyText('')
                    }}
                    leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                  >
                    Reply as Platform
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: DOCUMENTS & KYC */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-text">KYC Verification Documents</h3>
              <p className="text-xs text-textMuted">Official business permits, lease deed, and tax registration documents</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {gym.documents.map((doc) => (
              <div
                key={doc.id}
                className="rounded-card border border-border bg-surface p-5 shadow-subtle flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-control bg-primaryLight text-primary shrink-0">
                    <FileText className="w-5 h-5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text">{doc.name}</h4>
                    <span className="text-xs text-textMuted block mt-0.5 uppercase tracking-wider">{doc.type.replace('_', ' ')}</span>
                    <span className="text-xs text-textSubtle block mt-0.5">Uploaded {formatDate(doc.uploadedAt)}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <Badge variant={doc.verified ? 'green' : 'yellow'}>
                    {doc.verified ? 'VERIFIED' : 'PENDING'}
                  </Badge>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                  >
                    <span>View File</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Slide-over Payment Drawer */}
      <PaymentDrawer
        payment={selectedDrawerPayment}
        onClose={() => setSelectedDrawerPayment(null)}
      />

      {/* Enhanced Media Preview Modal (Fullscreen Lightbox with Slideshow & Filmstrip) */}
      {activeLightboxMedia && activeLightboxIndex !== null && gym && (
        <Dialog open={true} onOpenChange={() => setActiveLightboxIndex(null)}>
          <DialogContent className="max-w-5xl sm:max-w-5xl md:max-w-5xl lg:max-w-6xl w-[96vw] p-0 overflow-hidden bg-zinc-950 text-white border-zinc-800 shadow-2xl rounded-2xl flex flex-col max-h-[94vh]">
            {/* 1. Modal Top Bar */}
            <div className="px-5 py-3.5 bg-zinc-900/95 border-b border-zinc-800/80 flex items-center justify-between gap-4 shrink-0 backdrop-blur-sm select-none">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xs font-bold text-zinc-300 truncate max-w-[180px] sm:max-w-[260px]">
                  {gym.name}
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 shrink-0">
                  {activeLightboxMedia.tag || 'Facility Area'}
                </span>
                <span className="text-xs font-mono text-zinc-400 shrink-0 hidden sm:inline">
                  {activeLightboxMedia.resolution || '1920 × 1080'}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 shrink-0">
                  {activeLightboxIndex + 1} / {gym.media.length}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Cover status / Action */}
                {activeLightboxMedia.isCover || (!gym.media.some((m) => m.isCover) && activeLightboxIndex === 0) ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold shadow-sm select-none">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>Primary Cover Image</span>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setCoverMedia(gym.id, activeLightboxMedia.id)}
                    className="h-8 px-3 text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-sm flex items-center gap-1.5 transition-all"
                  >
                    <Star className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Set as Cover Image</span>
                  </Button>
                )}

                {/* Moderation Status / Actions */}
                <StatusBadge status={activeLightboxMedia.status} />

                {activeLightboxMedia.status === 'PENDING' && (
                  <Button
                    size="sm"
                    className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                    onClick={() => approveMedia(gym.id, activeLightboxMedia.id)}
                  >
                    Approve
                  </Button>
                )}

                {activeLightboxMedia.status === 'APPROVED' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-2.5 text-xs text-zinc-400 border-zinc-700 hover:bg-zinc-800 hover:text-dangerText"
                    onClick={() => rejectMedia(gym.id, activeLightboxMedia.id, 'Image requires updated resolution')}
                  >
                    Hide
                  </Button>
                )}

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setActiveLightboxIndex(null)}
                  className="h-8 w-8 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition-colors ml-1"
                  title="Close (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 2. Main Stage (Photo Display with Prev/Next Overlay Buttons) */}
            <div className="relative flex-1 bg-black flex items-center justify-center min-h-[380px] max-h-[62vh] overflow-hidden select-none group">
              <img
                src={activeLightboxMedia.url}
                alt={activeLightboxMedia.caption}
                className="max-h-[58vh] w-auto max-w-full object-contain rounded transition-all duration-200"
              />

              {/* Prev Button */}
              {gym.media.length > 1 && (
                <button
                  type="button"
                  onClick={handlePrevLightbox}
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-black/60 hover:bg-black/90 text-white/90 hover:text-white backdrop-blur-md flex items-center justify-center transition-all shadow-xl hover:scale-105 active:scale-95 border border-white/10"
                  title="Previous Photo (← Left Arrow)"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {/* Next Button */}
              {gym.media.length > 1 && (
                <button
                  type="button"
                  onClick={handleNextLightbox}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-black/60 hover:bg-black/90 text-white/90 hover:text-white backdrop-blur-md flex items-center justify-center transition-all shadow-xl hover:scale-105 active:scale-95 border border-white/10"
                  title="Next Photo (→ Right Arrow)"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}

              {/* Caption Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none">
                <div className="max-w-3xl">
                  <h4 className="text-base font-bold text-white drop-shadow-md">
                    {activeLightboxMedia.caption || 'Facility Photography'}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-zinc-300 mt-1">
                    <span>Uploaded on {formatDate(activeLightboxMedia.uploadedAt)}</span>
                    <span>•</span>
                    <span className="uppercase font-mono text-[11px] text-zinc-400">
                      {activeLightboxMedia.type}
                    </span>
                    <span>•</span>
                    <span className="text-zinc-400 font-mono text-[11px]">
                      {activeLightboxMedia.resolution || '1920 × 1080'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Bottom Filmstrip / Thumbnails Carousel */}
            <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scrollbar-none py-1 flex-1">
                {gym.media.map((thumb, idx) => {
                  const hasExplicitCover = gym.media.some((m) => m.isCover)
                  const isThumbActive = idx === activeLightboxIndex
                  const isThumbCover = thumb.isCover || (!hasExplicitCover && idx === 0)
                  return (
                    <button
                      key={thumb.id}
                      type="button"
                      onClick={() => setActiveLightboxIndex(idx)}
                      className={`relative h-14 w-20 rounded-md overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                        isThumbActive
                          ? 'border-primary ring-2 ring-primary/50 scale-105 shadow-lg opacity-100'
                          : 'border-zinc-700 opacity-60 hover:opacity-100 hover:border-zinc-500'
                      }`}
                    >
                      <img
                        src={thumb.url}
                        alt={thumb.caption}
                        className="w-full h-full object-cover"
                      />
                      {isThumbCover && (
                        <div className="absolute top-0.5 right-0.5 bg-amber-500 text-slate-950 p-0.5 rounded-full shadow">
                          <Star className="w-2.5 h-2.5 fill-slate-950" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[9px] text-white px-1 truncate font-medium">
                        {idx + 1}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Navigation keyboard hint */}
              <div className="hidden md:flex items-center gap-2 text-[11px] text-zinc-400 font-mono shrink-0 px-2.5 py-1 rounded bg-zinc-800/80 border border-zinc-700/50 select-none">
                <span>← / → Navigate</span>
                <span className="text-zinc-600">|</span>
                <span>Esc Close</span>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Review Reply Modal */}
      {replyingReview && (
        <Dialog open={!!replyingReview} onOpenChange={() => setReplyingReview(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Reply to {replyingReview.userName}'s Review</DialogTitle>
              <DialogDescription>
                Your response will appear publicly below their feedback.
              </DialogDescription>
            </DialogHeader>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write an official response..."
              rows={4}
              className="w-full text-sm p-3 bg-surface border border-border rounded-control text-text focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setReplyingReview(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                disabled={!replyText.trim()}
                onClick={() => {
                  replyToReview(replyingReview.id, replyText.trim())
                  setReplyingReview(null)
                }}
              >
                Post Response
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Commission Modal */}
      {showFeeDialog && (
        <Dialog open={showFeeDialog} onOpenChange={setShowFeeDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Platform Commission for {gym.name}</DialogTitle>
              <DialogDescription>
                Configure custom percentage rate for first membership joins. Leave blank to inherit platform default (20%).
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <label className="text-xs font-medium text-textSubtle uppercase">First-Join Commission Rate (%)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="50"
                value={customCommission}
                onChange={(e) => setCustomCommission(e.target.value)}
                placeholder="20"
                className="w-full text-sm p-2.5 bg-surface border border-border rounded-control text-text focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowFeeDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  const val = customCommission.trim() === '' ? null : parseFloat(customCommission)
                  updateGymCommission(gym.id, val)
                  setShowFeeDialog(false)
                }}
              >
                Save Rate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Confirmation Dialogs: Approve */}
      <ConfirmationDialog
        open={showApproveDialog}
        onOpenChange={setShowApproveDialog}
        title="Approve Gym Application"
        description={`Are you sure you want to approve ${gym.name}? The listing will immediately go live on search and membership passes can be purchased.`}
        confirmText="Approve & Publish"
        variant="default"
        onConfirm={() => approveGym(gym.id)}
      />

      {/* Confirmation Dialog: Reject */}
      {showRejectDialog && (
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Reject Gym Application</DialogTitle>
              <DialogDescription>
                Provide a reason for rejecting this onboarding submission. The gym owner will be notified.
              </DialogDescription>
            </DialogHeader>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Incomplete KYC documentation or address verification failed."
              rows={3}
              className="w-full text-sm p-3 bg-surface border border-border rounded-control text-text"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={!rejectReason.trim()}
                onClick={() => {
                  rejectGym(gym.id, rejectReason)
                  setShowRejectDialog(false)
                }}
              >
                Confirm Rejection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Confirmation Dialog: Request Changes */}
      {showChangesDialog && (
        <Dialog open={showChangesDialog} onOpenChange={setShowChangesDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Request Changes from Gym Owner</DialogTitle>
              <DialogDescription>
                Specify what information or documents the partner needs to update.
              </DialogDescription>
            </DialogHeader>
            <textarea
              value={changesNote}
              onChange={(e) => setChangesNote(e.target.value)}
              placeholder="e.g. Please re-upload a clearer image of your cancelled bank cheque."
              rows={3}
              className="w-full text-sm p-3 bg-surface border border-border rounded-control text-text"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowChangesDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                disabled={!changesNote.trim()}
                onClick={() => {
                  requestGymChanges(gym.id, changesNote)
                  setShowChangesDialog(false)
                }}
              >
                Send Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Confirmation Dialog: Suspend */}
      {showSuspendDialog && (
        <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Suspend Gym Listing</DialogTitle>
              <DialogDescription>
                Suspending this gym hides it from public search and halts new voucher purchases.
              </DialogDescription>
            </DialogHeader>
            <textarea
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="Reason for suspension..."
              rows={3}
              className="w-full text-sm p-3 bg-surface border border-border rounded-control text-text"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSuspendDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={!suspendReason.trim()}
                onClick={() => {
                  suspendGym(gym.id, suspendReason)
                  setShowSuspendDialog(false)
                }}
              >
                Confirm Suspension
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Confirmation Dialog: Block */}
      {showBlockDialog && (
        <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Block Gym Partner</DialogTitle>
              <DialogDescription>
                Blocking immediately terminates this gym's account access and prevents all transactions.
              </DialogDescription>
            </DialogHeader>
            <textarea
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="Reason for blocking..."
              rows={3}
              className="w-full text-sm p-3 bg-surface border border-border rounded-control text-text"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBlockDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={!blockReason.trim()}
                onClick={() => {
                  blockGym(gym.id, blockReason)
                  setShowBlockDialog(false)
                }}
              >
                Block Gym
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Confirmation Dialog: Reactivate */}
      <ConfirmationDialog
        open={showUnblockDialog}
        onOpenChange={setShowUnblockDialog}
        title="Reactivate Gym Listing"
        description={`Are you sure you want to reactivate ${gym.name}? The listing will return to ACTIVE status.`}
        confirmText="Reactivate"
        variant="default"
        onConfirm={() => unblockGym(gym.id)}
      />
    </div>
  )
}

export default GymDetailPage
