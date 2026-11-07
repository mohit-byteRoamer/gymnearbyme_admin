import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  StaffUser,
  StaffRole,
  AppUser,
  Gym,
  GymChecklist,
  GymMedia,
  Voucher,
  RefundRequest,
  FeaturedListing,
  City,
  Locality,
  Review,
  SupportTicket,
  BroadcastNotification,
  AuditLog,
  PlatformSettings,
  MasterDataItem,
  ContentDocument,
} from '@/types'
import {
  INITIAL_STAFF,
  INITIAL_USERS,
  INITIAL_GYMS,
  INITIAL_VOUCHERS,
  INITIAL_REFUNDS,
  INITIAL_FEATURED,
  INITIAL_CITIES,
  INITIAL_LOCALITIES,
  INITIAL_REVIEWS,
  INITIAL_TICKETS,
  INITIAL_BROADCASTS,
  INITIAL_SETTINGS,
  INITIAL_AUDIT_LOGS,
  INITIAL_MASTER_DATA,
  INITIAL_CONTENT_DOCUMENTS,
} from '@/data/mock-data'

interface AdminContextType {
  currentUser: StaffUser | null
  login: (email: string, password?: string, otp?: string) => { success: boolean; error?: string }
  logout: () => void
  switchRole: (role: StaffRole) => void
  staff: StaffUser[]
  users: AppUser[]
  gyms: Gym[]
  vouchers: Voucher[]
  refunds: RefundRequest[]
  featured: FeaturedListing[]
  cities: City[]
  localities: Locality[]
  reviews: Review[]
  tickets: SupportTicket[]
  broadcasts: BroadcastNotification[]
  settings: PlatformSettings
  auditLogs: AuditLog[]

  // Core Actions
  verifyPayment: (voucherId: string) => void
  rejectPayment: (voucherId: string, reason: string) => void
  bulkApprovePayments: (voucherIds: string[]) => void

  approveGym: (gymId: string) => void
  rejectGym: (gymId: string, reason: string) => void
  requestGymChanges: (gymId: string, note: string) => void
  updateGymChecklist: (gymId: string, item: keyof GymChecklist, value: boolean) => void
  suspendGym: (gymId: string, reason: string) => void
  blockGym: (gymId: string, reason: string) => void
  unblockGym: (gymId: string) => void
  toggleGymVerifiedBadge: (gymId: string) => void
  updateGymCommission: (gymId: string, commission: number | null) => void

  blockUser: (userId: string, reason: string) => void
  unblockUser: (userId: string) => void

  approveRefund: (refundId: string) => void
  rejectRefund: (refundId: string, reason: string) => void
  markRefundPaid: (refundId: string, refundUtr: string) => void

  activateFeatured: (featuredId: string) => void
  rejectFeatured: (featuredId: string, reason: string) => void

  approveMedia: (gymId: string, mediaId: string) => void
  rejectMedia: (gymId: string, mediaId: string, reason: string) => void
  addMedia: (gymId: string, media: Partial<GymMedia>) => void
  deleteMedia: (gymId: string, mediaId: string) => void
  setCoverMedia: (gymId: string, mediaId: string) => void
  updateMediaCaption: (gymId: string, mediaId: string, caption: string, tag?: string) => void
  approveReview: (reviewId: string) => void
  rejectReview: (reviewId: string) => void
  replyToReview: (reviewId: string, reply: string) => void

  toggleCity: (cityId: string) => void
  addCity: (name: string, state: string) => void
  addLocality: (locality: Partial<Locality>) => void
  toggleLocality: (localityId: string) => void

  updateSettings: (newSettings: Partial<PlatformSettings>) => void

  addStaff: (member: Omit<StaffUser, 'id' | 'lastLogin'>) => void
  updateStaffRole: (staffId: string, role: StaffRole) => void
  toggleStaffStatus: (staffId: string) => void

  sendBroadcast: (broadcast: Omit<BroadcastNotification, 'id' | 'sentAt' | 'sentBy'>) => void
  replyToTicket: (ticketId: string, message: string) => void
  updateTicketStatus: (ticketId: string, status: SupportTicket['status']) => void

  // Master Data Management
  masterData: MasterDataItem[]
  addMasterItem: (item: Omit<MasterDataItem, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateMasterItem: (id: string, updates: Partial<MasterDataItem>) => void
  toggleMasterItemStatus: (id: string) => void
  deleteMasterItem: (id: string) => void
  resetMasterData: () => void

  // Content & Static Legal Pages Management
  contentDocuments: ContentDocument[]
  addContentDocument: (doc: Partial<ContentDocument>) => void
  updateContentDocument: (id: string, updates: Partial<ContentDocument>) => void
  toggleContentDocumentStatus: (id: string) => void
  deleteContentDocument: (id: string) => void
  resetContentDocuments: () => void

  logAudit: (
    action: string,
    entityType: AuditLog['entityType'],
    entityId: string,
    details: string,
    diff?: { before?: any; after?: any }
  ) => void
  resetToDefaultData: () => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

const STORAGE_KEYS = {
  CURRENT_USER: 'gymapp_admin_v3_current_user',
  STAFF: 'gymapp_admin_v3_staff',
  USERS: 'gymapp_admin_v3_users',
  GYMS: 'gymapp_admin_v3_gyms',
  VOUCHERS: 'gymapp_admin_v3_vouchers',
  REFUNDS: 'gymapp_admin_v3_refunds',
  FEATURED: 'gymapp_admin_v3_featured',
  CITIES: 'gymapp_admin_v3_cities',
  LOCALITIES: 'gymapp_admin_v3_localities',
  REVIEWS: 'gymapp_admin_v3_reviews',
  TICKETS: 'gymapp_admin_v3_tickets',
  BROADCASTS: 'gymapp_admin_v3_broadcasts',
  SETTINGS: 'gymapp_admin_v3_settings',
  AUDIT: 'gymapp_admin_v3_audit_logs',
  MASTER_DATA: 'gymapp_admin_v3_master_data',
  CONTENT_DOCUMENTS: 'gymapp_admin_v3_content_documents',
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallback
  } catch (e) {
    return fallback
  }
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<StaffUser | null>(() =>
    loadFromStorage<StaffUser | null>(STORAGE_KEYS.CURRENT_USER, INITIAL_STAFF[0])
  )
  const [staff, setStaff] = useState<StaffUser[]>(() =>
    loadFromStorage<StaffUser[]>(STORAGE_KEYS.STAFF, INITIAL_STAFF)
  )
  const [users, setUsers] = useState<AppUser[]>(() =>
    loadFromStorage<AppUser[]>(STORAGE_KEYS.USERS, INITIAL_USERS)
  )
  const [gyms, setGyms] = useState<Gym[]>(() =>
    loadFromStorage<Gym[]>(STORAGE_KEYS.GYMS, INITIAL_GYMS)
  )
  const [vouchers, setVouchers] = useState<Voucher[]>(() =>
    loadFromStorage<Voucher[]>(STORAGE_KEYS.VOUCHERS, INITIAL_VOUCHERS)
  )
  const [refunds, setRefunds] = useState<RefundRequest[]>(() =>
    loadFromStorage<RefundRequest[]>(STORAGE_KEYS.REFUNDS, INITIAL_REFUNDS)
  )
  const [featured, setFeatured] = useState<FeaturedListing[]>(() =>
    loadFromStorage<FeaturedListing[]>(STORAGE_KEYS.FEATURED, INITIAL_FEATURED)
  )
  const [cities, setCities] = useState<City[]>(() =>
    loadFromStorage<City[]>(STORAGE_KEYS.CITIES, INITIAL_CITIES)
  )
  const [localities, setLocalities] = useState<Locality[]>(() =>
    loadFromStorage<Locality[]>(STORAGE_KEYS.LOCALITIES, INITIAL_LOCALITIES)
  )
  const [reviews, setReviews] = useState<Review[]>(() =>
    loadFromStorage<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS)
  )
  const [tickets, setTickets] = useState<SupportTicket[]>(() =>
    loadFromStorage<SupportTicket[]>(STORAGE_KEYS.TICKETS, INITIAL_TICKETS)
  )
  const [broadcasts, setBroadcasts] = useState<BroadcastNotification[]>(() =>
    loadFromStorage<BroadcastNotification[]>(STORAGE_KEYS.BROADCASTS, INITIAL_BROADCASTS)
  )
  const [settings, setSettings] = useState<PlatformSettings>(() =>
    loadFromStorage<PlatformSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS)
  )
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() =>
    loadFromStorage<AuditLog[]>(STORAGE_KEYS.AUDIT, INITIAL_AUDIT_LOGS)
  )
  const [masterData, setMasterData] = useState<MasterDataItem[]>(() =>
    loadFromStorage<MasterDataItem[]>(STORAGE_KEYS.MASTER_DATA, INITIAL_MASTER_DATA)
  )
  const [contentDocuments, setContentDocuments] = useState<ContentDocument[]>(() =>
    loadFromStorage<ContentDocument[]>(STORAGE_KEYS.CONTENT_DOCUMENTS, INITIAL_CONTENT_DOCUMENTS)
  )

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser))
  }, [currentUser])
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff))
  }, [staff])
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
  }, [users])
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GYMS, JSON.stringify(gyms))
  }, [gyms])
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VOUCHERS, JSON.stringify(vouchers))
  }, [vouchers])
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REFUNDS, JSON.stringify(refunds))
  }, [refunds])
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FEATURED, JSON.stringify(featured))
  }, [featured])
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CITIES, JSON.stringify(cities))
  }, [cities])
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOCALITIES, JSON.stringify(localities))
  }, [localities])
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews))
  }, [reviews])
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets))
  }, [tickets])
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BROADCASTS, JSON.stringify(broadcasts))
  }, [broadcasts])
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
  }, [settings])
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(auditLogs))
  }, [auditLogs])
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MASTER_DATA, JSON.stringify(masterData))
  }, [masterData])
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONTENT_DOCUMENTS, JSON.stringify(contentDocuments))
  }, [contentDocuments])

  // Universal Audit Logger
  const logAudit = (
    action: string,
    entityType: AuditLog['entityType'],
    entityId: string,
    details: string,
    diff?: { before?: any; after?: any }
  ) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      actorId: currentUser?.id || 'sys-admin',
      actorName: currentUser?.name || 'System Administrator',
      actorEmail: currentUser?.email || 'admin@gympass.internal',
      actorRole: currentUser?.role || 'super_admin',
      ipAddress: '192.168.1.10',
      action,
      entityType,
      entityId,
      details,
      diff,
    }
    setAuditLogs((prev) => [newLog, ...prev])
  }

  // Authentication
  const login = (email: string, _password?: string, otp?: string) => {
    const member = staff.find((s) => s.email.toLowerCase() === email.toLowerCase())
    if (!member) {
      return { success: false, error: 'Staff account not found with this email' }
    }
    if (member.status === 'suspended') {
      return { success: false, error: 'Account is suspended. Please contact super_admin.' }
    }
    if (member.twoFactorEnabled && otp && otp.trim() !== '123456' && otp.trim().length !== 6) {
      return { success: false, error: 'Invalid 2FA Verification Code (Demo code is 123456)' }
    }

    const updated = { ...member, lastLogin: new Date().toISOString() }
    setCurrentUser(updated)
    setStaff((prev) => prev.map((s) => (s.id === member.id ? updated : s)))
    logAudit('STAFF_LOGIN', 'Staff', member.id, `${member.name} logged in successfully`)
    return { success: true }
  }

  const logout = () => {
    if (currentUser) {
      logAudit('STAFF_LOGOUT', 'Staff', currentUser.id, `${currentUser.name} logged out`)
    }
    setCurrentUser(null)
  }

  const switchRole = (role: StaffRole) => {
    const targetStaff = staff.find((s) => s.role === role) || {
      ...INITIAL_STAFF[0],
      role,
      name: `${role.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())} Admin`,
      email: `${role}@gymapp.internal`,
    }
    setCurrentUser(targetStaff)
    logAudit('ROLE_SWITCH', 'Staff', targetStaff.id, `Switched active role perspective to ${role}`)
  }

  // Payment Verification Actions
  const verifyPayment = (voucherId: string) => {
    const target = vouchers.find((v) => v.id === voucherId)
    if (!target) return

    const now = new Date().toISOString()
    const updated: Voucher = {
      ...target,
      status: 'ACTIVE',
      verifiedAt: now,
      verifiedBy: currentUser?.email || 'admin@gympass.internal',
      timeline: [
        {
          timestamp: now,
          event: 'Fee payment verified & voucher activated',
          actor: currentUser?.name || 'Finance Staff',
          note: `UTR: ${target.utr} confirmed in bank credits`,
        },
        ...target.timeline,
      ],
    }

    setVouchers((prev) => prev.map((v) => (v.id === voucherId ? updated : v)))
    logAudit(
      'PAYMENT_VERIFIED',
      'Payment',
      voucherId,
      `Verified payment of ₹${target.amount} for voucher ${target.code} (UTR: ${target.utr})`,
      { before: { status: target.status }, after: { status: 'ACTIVE' } }
    )
  }

  const rejectPayment = (voucherId: string, reason: string) => {
    const target = vouchers.find((v) => v.id === voucherId)
    if (!target) return

    const now = new Date().toISOString()
    const updated: Voucher = {
      ...target,
      status: 'CANCELLED',
      rejectionReason: reason,
      timeline: [
        {
          timestamp: now,
          event: 'Payment rejected',
          actor: currentUser?.name || 'Finance Staff',
          note: `Reason: ${reason}`,
        },
        ...target.timeline,
      ],
    }

    setVouchers((prev) => prev.map((v) => (v.id === voucherId ? updated : v)))
    logAudit(
      'PAYMENT_REJECTED',
      'Payment',
      voucherId,
      `Rejected payment for voucher ${target.code}. Reason: ${reason}`,
      { before: { status: target.status }, after: { status: 'CANCELLED', rejectionReason: reason } }
    )
  }

  const bulkApprovePayments = (voucherIds: string[]) => {
    if (!voucherIds.length) return
    const now = new Date().toISOString()
    setVouchers((prev) =>
      prev.map((v) => {
        if (voucherIds.includes(v.id)) {
          return {
            ...v,
            status: 'ACTIVE',
            verifiedAt: now,
            verifiedBy: currentUser?.email || 'admin@gympass.internal',
            timeline: [
              {
                timestamp: now,
                event: 'Bulk auto-matched fee verified & activated',
                actor: currentUser?.name || 'Finance System',
                note: `Bank statement auto-match UTR: ${v.utr}`,
              },
              ...v.timeline,
            ],
          }
        }
        return v
      })
    )
    logAudit(
      'BULK_PAYMENTS_VERIFIED',
      'Payment',
      `bulk-${voucherIds.length}`,
      `Bulk verified ${voucherIds.length} pending payments via bank statement auto-match`
    )
  }

  // Gym Management Actions
  const approveGym = (gymId: string) => {
    const gym = gyms.find((g) => g.id === gymId)
    if (!gym) return
    const updated: Gym = { ...gym, status: 'ACTIVE', isVerifiedBadge: true }
    setGyms((prev) => prev.map((g) => (g.id === gymId ? updated : g)))
    logAudit(
      'GYM_APPROVED',
      'Gym',
      gymId,
      `Approved gym application for "${gym.name}" (Status: ACTIVE)`,
      { before: { status: gym.status }, after: { status: 'ACTIVE' } }
    )
  }

  const rejectGym = (gymId: string, reason: string) => {
    const gym = gyms.find((g) => g.id === gymId)
    if (!gym) return
    const updated: Gym = { ...gym, status: 'REJECTED', rejectionReason: reason }
    setGyms((prev) => prev.map((g) => (g.id === gymId ? updated : g)))
    logAudit(
      'GYM_REJECTED',
      'Gym',
      gymId,
      `Rejected gym onboarding for "${gym.name}". Reason: ${reason}`,
      { before: { status: gym.status }, after: { status: 'REJECTED', rejectionReason: reason } }
    )
  }

  const requestGymChanges = (gymId: string, note: string) => {
    const gym = gyms.find((g) => g.id === gymId)
    if (!gym) return
    const updated: Gym = { ...gym, status: 'CHANGES_REQUESTED', requestedChangesNote: note }
    setGyms((prev) => prev.map((g) => (g.id === gymId ? updated : g)))
    logAudit(
      'GYM_CHANGES_REQUESTED',
      'Gym',
      gymId,
      `Requested documentation changes for "${gym.name}": ${note}`,
      { before: { status: gym.status }, after: { status: 'CHANGES_REQUESTED', requestedChangesNote: note } }
    )
  }

  const updateGymChecklist = (gymId: string, item: keyof GymChecklist, value: boolean) => {
    setGyms((prev) =>
      prev.map((g) => {
        if (g.id === gymId) {
          const newChecklist = { ...g.checklist, [item]: value }
          return { ...g, checklist: newChecklist }
        }
        return g
      })
    )
    logAudit('GYM_CHECKLIST_UPDATE', 'Gym', gymId, `Updated approval checklist item "${item}" to ${value}`)
  }

  const suspendGym = (gymId: string, reason: string) => {
    const gym = gyms.find((g) => g.id === gymId)
    if (!gym) return
    const updated: Gym = { ...gym, status: 'SUSPENDED', suspensionReason: reason }
    setGyms((prev) => prev.map((g) => (g.id === gymId ? updated : g)))
    logAudit(
      'GYM_SUSPENDED',
      'Gym',
      gymId,
      `Suspended gym "${gym.name}". Reason: ${reason}`,
      { before: { status: gym.status }, after: { status: 'SUSPENDED', suspensionReason: reason } }
    )
  }

  const blockGym = (gymId: string, reason: string) => {
    const gym = gyms.find((g) => g.id === gymId)
    if (!gym) return
    const updated: Gym = { ...gym, status: 'BLOCKED', blockReason: reason }
    setGyms((prev) => prev.map((g) => (g.id === gymId ? updated : g)))
    logAudit(
      'GYM_BLOCKED',
      'Gym',
      gymId,
      `Permanently blocked gym "${gym.name}". Reason: ${reason}`,
      { before: { status: gym.status }, after: { status: 'BLOCKED', blockReason: reason } }
    )
  }

  const unblockGym = (gymId: string) => {
    const gym = gyms.find((g) => g.id === gymId)
    if (!gym) return
    const updated: Gym = { ...gym, status: 'ACTIVE', blockReason: undefined, suspensionReason: undefined }
    setGyms((prev) => prev.map((g) => (g.id === gymId ? updated : g)))
    logAudit(
      'GYM_UNBLOCKED',
      'Gym',
      gymId,
      `Restored and unblocked gym "${gym.name}" to ACTIVE status`,
      { before: { status: gym.status }, after: { status: 'ACTIVE' } }
    )
  }

  const toggleGymVerifiedBadge = (gymId: string) => {
    const gym = gyms.find((g) => g.id === gymId)
    if (!gym) return
    const updated: Gym = { ...gym, isVerifiedBadge: !gym.isVerifiedBadge }
    setGyms((prev) => prev.map((g) => (g.id === gymId ? updated : g)))
    logAudit(
      'GYM_BADGE_TOGGLED',
      'Gym',
      gymId,
      `Toggled verified badge for "${gym.name}" to ${updated.isVerifiedBadge}`,
      { before: { isVerifiedBadge: gym.isVerifiedBadge }, after: { isVerifiedBadge: updated.isVerifiedBadge } }
    )
  }

  const updateGymCommission = (gymId: string, commission: number | null) => {
    const gym = gyms.find((g) => g.id === gymId)
    if (!gym) return
    const updated: Gym = { ...gym, commissionOverride: commission }
    setGyms((prev) => prev.map((g) => (g.id === gymId ? updated : g)))
    logAudit(
      'GYM_COMMISSION_OVERRIDE',
      'Gym',
      gymId,
      `Updated commission override for "${gym.name}" to ${commission !== null ? `${commission}%` : 'Standard default'}`,
      { before: { commissionOverride: gym.commissionOverride }, after: { commissionOverride: commission } }
    )
  }

  // User Actions
  const blockUser = (userId: string, reason: string) => {
    const user = users.find((u) => u.id === userId)
    if (!user) return
    const updated: AppUser = { ...user, status: 'blocked', blockReason: reason }
    setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)))
    logAudit(
      'USER_BLOCKED',
      'User',
      userId,
      `Blocked user "${user.name}" (${user.email}). Reason: ${reason}`,
      { before: { status: user.status }, after: { status: 'blocked', blockReason: reason } }
    )
  }

  const unblockUser = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    if (!user) return
    const updated: AppUser = { ...user, status: 'active', blockReason: undefined }
    setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)))
    logAudit(
      'USER_UNBLOCKED',
      'User',
      userId,
      `Unblocked user "${user.name}" (${user.email})`,
      { before: { status: user.status }, after: { status: 'active' } }
    )
  }

  // Refund Actions
  const approveRefund = (refundId: string) => {
    const refund = refunds.find((r) => r.id === refundId)
    if (!refund) return
    const updated: RefundRequest = {
      ...refund,
      status: 'APPROVED',
      processedAt: new Date().toISOString(),
      processedBy: currentUser?.email || 'finance@gympass.internal',
    }
    setRefunds((prev) => prev.map((r) => (r.id === refundId ? updated : r)))
    logAudit(
      'REFUND_APPROVED',
      'Refund',
      refundId,
      `Approved refund of ₹${refund.amount} for ${refund.userName} (Voucher ${refund.voucherCode})`,
      { before: { status: refund.status }, after: { status: 'APPROVED' } }
    )
  }

  const rejectRefund = (refundId: string, reason: string) => {
    const refund = refunds.find((r) => r.id === refundId)
    if (!refund) return
    const updated: RefundRequest = {
      ...refund,
      status: 'REJECTED',
      rejectionReason: reason,
      processedAt: new Date().toISOString(),
      processedBy: currentUser?.email || 'finance@gympass.internal',
    }
    setRefunds((prev) => prev.map((r) => (r.id === refundId ? updated : r)))
    logAudit(
      'REFUND_REJECTED',
      'Refund',
      refundId,
      `Rejected refund request ${refund.id}. Reason: ${reason}`,
      { before: { status: refund.status }, after: { status: 'REJECTED', rejectionReason: reason } }
    )
  }

  const markRefundPaid = (refundId: string, refundUtr: string) => {
    const refund = refunds.find((r) => r.id === refundId)
    if (!refund) return
    const updated: RefundRequest = {
      ...refund,
      status: 'REFUNDED',
      refundUtr,
      processedAt: new Date().toISOString(),
      processedBy: currentUser?.email || 'finance@gympass.internal',
    }
    setRefunds((prev) => prev.map((r) => (r.id === refundId ? updated : r)))

    // Also update voucher status to REFUNDED
    setVouchers((prev) =>
      prev.map((v) => {
        if (v.code === refund.voucherCode || v.id === refund.voucherId) {
          return {
            ...v,
            status: 'REFUNDED',
            timeline: [
              {
                timestamp: new Date().toISOString(),
                event: 'Refund credited to user bank account',
                actor: currentUser?.name || 'Finance Staff',
                note: `Refund UTR: ${refundUtr}`,
              },
              ...v.timeline,
            ],
          }
        }
        return v
      })
    )

    logAudit(
      'REFUND_PAID',
      'Refund',
      refundId,
      `Marked refund of ₹${refund.amount} paid with Refund UTR: ${refundUtr}`,
      { before: { status: refund.status }, after: { status: 'REFUNDED', refundUtr } }
    )
  }

  // Featured Listings
  const activateFeatured = (featuredId: string) => {
    const listing = featured.find((f) => f.id === featuredId)
    if (!listing) return
    const updated: FeaturedListing = {
      ...listing,
      status: 'ACTIVE',
      activatedAt: new Date().toISOString(),
    }
    setFeatured((prev) => prev.map((f) => (f.id === featuredId ? updated : f)))
    logAudit(
      'FEATURED_ACTIVATED',
      'Featured',
      featuredId,
      `Activated featured listing for ${listing.gymName} in ${listing.locality}`,
      { before: { status: listing.status }, after: { status: 'ACTIVE' } }
    )
  }

  const rejectFeatured = (featuredId: string, reason: string) => {
    const listing = featured.find((f) => f.id === featuredId)
    if (!listing) return
    const updated: FeaturedListing = { ...listing, status: 'REJECTED' }
    setFeatured((prev) => prev.map((f) => (f.id === featuredId ? updated : f)))
    logAudit(
      'FEATURED_REJECTED',
      'Featured',
      featuredId,
      `Rejected featured listing for ${listing.gymName}. Reason: ${reason}`
    )
  }

  // Media & Reviews
  const approveMedia = (gymId: string, mediaId: string) => {
    setGyms((prev) =>
      prev.map((g) => {
        if (g.id === gymId) {
          return {
            ...g,
            media: g.media.map((m) => (m.id === mediaId ? { ...m, status: 'APPROVED' } : m)),
          }
        }
        return g
      })
    )
    logAudit('MEDIA_APPROVED', 'Media', mediaId, `Approved media asset for gym ID ${gymId}`)
  }

  const rejectMedia = (gymId: string, mediaId: string, reason: string) => {
    setGyms((prev) =>
      prev.map((g) => {
        if (g.id === gymId) {
          return {
            ...g,
            media: g.media.map((m) =>
              m.id === mediaId ? { ...m, status: 'REJECTED', rejectionReason: reason } : m
            ),
          }
        }
        return g
      })
    )
    logAudit('MEDIA_REJECTED', 'Media', mediaId, `Rejected media asset for gym ID ${gymId}. Reason: ${reason}`)
  }

  const addMedia = (gymId: string, mediaData: Partial<GymMedia>) => {
    const newMediaItem: GymMedia = {
      id: `m-${Date.now()}`,
      url: mediaData.url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
      type: mediaData.type || 'photo',
      caption: mediaData.caption || 'Facility Photo',
      status: mediaData.status || 'APPROVED',
      uploadedAt: new Date().toISOString(),
      isCover: !!mediaData.isCover,
      tag: mediaData.tag || 'Gym Area',
      resolution: mediaData.resolution || '1920x1080',
    }
    setGyms((prev) =>
      prev.map((g) => {
        if (g.id === gymId) {
          const updatedMedia = newMediaItem.isCover
            ? g.media.map((m) => ({ ...m, isCover: false }))
            : g.media
          return {
            ...g,
            media: [...updatedMedia, newMediaItem],
          }
        }
        return g
      })
    )
    logAudit('MEDIA_ADDED', 'Media', newMediaItem.id, `Uploaded new media "${newMediaItem.caption}" for gym ID ${gymId}`)
  }

  const deleteMedia = (gymId: string, mediaId: string) => {
    setGyms((prev) =>
      prev.map((g) => {
        if (g.id === gymId) {
          return {
            ...g,
            media: g.media.filter((m) => m.id !== mediaId),
          }
        }
        return g
      })
    )
    logAudit('MEDIA_DELETED', 'Media', mediaId, `Deleted media item ${mediaId} from gym ID ${gymId}`)
  }

  const setCoverMedia = (gymId: string, mediaId: string) => {
    setGyms((prev) =>
      prev.map((g) => {
        if (g.id === gymId) {
          return {
            ...g,
            media: g.media.map((m) => ({
              ...m,
              isCover: m.id === mediaId,
            })),
          }
        }
        return g
      })
    )
    logAudit('MEDIA_COVER_SET', 'Media', mediaId, `Set media item ${mediaId} as primary cover for gym ID ${gymId}`)
  }

  const updateMediaCaption = (gymId: string, mediaId: string, caption: string, tag?: string) => {
    setGyms((prev) =>
      prev.map((g) => {
        if (g.id === gymId) {
          return {
            ...g,
            media: g.media.map((m) => (m.id === mediaId ? { ...m, caption, tag: tag || m.tag } : m)),
          }
        }
        return g
      })
    )
    logAudit('MEDIA_UPDATED', 'Media', mediaId, `Updated caption/tag for media item ${mediaId} in gym ID ${gymId}`)
  }

  const approveReview = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, status: 'APPROVED', flagged: false } : r))
    )
    logAudit('REVIEW_APPROVED', 'Review', reviewId, `Approved review ${reviewId}`)
  }

  const rejectReview = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, status: 'REJECTED' } : r))
    )
    logAudit('REVIEW_REJECTED', 'Review', reviewId, `Rejected review ${reviewId}`)
  }

  const replyToReview = (reviewId: string, reply: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, adminReply: reply } : r))
    )
    logAudit('REVIEW_REPLIED', 'Review', reviewId, `Added admin response to review ${reviewId}`)
  }

  // Localities & Cities
  const toggleCity = (cityId: string) => {
    setCities((prev) =>
      prev.map((c) => {
        if (c.id === cityId) {
          const nextActive = !c.active
          logAudit('CITY_TOGGLE', 'City', cityId, `Toggled city ${c.name} active status to ${nextActive}`)
          return { ...c, active: nextActive }
        }
        return c
      })
    )
  }

  const addCity = (name: string, state: string) => {
    const newCity: City = {
      id: `city-${Date.now()}`,
      name,
      state,
      active: true,
      gymCount: 0,
    }
    setCities((prev) => [...prev, newCity])
    logAudit('CITY_ADDED', 'City', newCity.id, `Created new operational city "${name}, ${state}"`)
  }

  const addLocality = (data: Partial<Locality>) => {
    const newLoc: Locality = {
      id: `loc-${Date.now()}`,
      name: data.name || 'New Locality',
      cityId: data.cityId || cities[0]?.id || 'city-1',
      cityName: data.cityName || cities[0]?.name || 'Bengaluru',
      pincode: data.pincode || '560001',
      tier: data.tier || 'Tier 1',
      active: true,
      maxFeaturedSlots: data.maxFeaturedSlots || 3,
      gymCount: 0,
    }
    setLocalities((prev) => [...prev, newLoc])
    logAudit('LOCALITY_ADDED', 'City', newLoc.id, `Created locality "${newLoc.name}" in ${newLoc.cityName}`)
  }

  const toggleLocality = (localityId: string) => {
    setLocalities((prev) =>
      prev.map((l) => {
        if (l.id === localityId) {
          const next = !l.active
          logAudit('LOCALITY_TOGGLED', 'City', localityId, `Toggled locality ${l.name} active to ${next}`)
          return { ...l, active: next }
        }
        return l
      })
    )
  }

  // Settings
  const updateSettings = (newSettings: Partial<PlatformSettings>) => {
    setSettings((prev) => {
      const merged = { ...prev, ...newSettings }
      logAudit(
        'SETTINGS_SAVED',
        'Settings',
        'platform-config',
        'Updated platform configuration settings',
        { before: prev, after: merged }
      )
      return merged
    })
  }

  // Staff Management
  const addStaff = (member: Omit<StaffUser, 'id' | 'lastLogin'>) => {
    const newMember: StaffUser = {
      ...member,
      id: `staff-${Date.now()}`,
      lastLogin: 'Never',
    }
    setStaff((prev) => [...prev, newMember])
    logAudit('STAFF_ADDED', 'Staff', newMember.id, `Created staff account for ${newMember.name} (${newMember.role})`)
  }

  const updateStaffRole = (staffId: string, role: StaffRole) => {
    setStaff((prev) =>
      prev.map((s) => {
        if (s.id === staffId) {
          logAudit('STAFF_ROLE_UPDATED', 'Staff', staffId, `Changed role for ${s.name} from ${s.role} to ${role}`)
          return { ...s, role }
        }
        return s
      })
    )
  }

  const toggleStaffStatus = (staffId: string) => {
    setStaff((prev) =>
      prev.map((s) => {
        if (s.id === staffId) {
          const next = s.status === 'active' ? 'suspended' : 'active'
          logAudit('STAFF_STATUS_CHANGED', 'Staff', staffId, `Changed ${s.name} status to ${next}`)
          return { ...s, status: next }
        }
        return s
      })
    )
  }

  // Support & Broadcasts
  const sendBroadcast = (broadcast: Omit<BroadcastNotification, 'id' | 'sentAt' | 'sentBy'>) => {
    const newBc: BroadcastNotification = {
      ...broadcast,
      id: `bc-${Date.now()}`,
      sentAt: new Date().toISOString(),
      sentBy: `${currentUser?.name} (${currentUser?.role})`,
    }
    setBroadcasts((prev) => [newBc, ...prev])
    logAudit(
      'BROADCAST_SENT',
      'Broadcast',
      newBc.id,
      `Dispatched broadcast notification "${newBc.title}" to target ${newBc.target} via ${newBc.channel}`
    )
  }

  const replyToTicket = (ticketId: string, message: string) => {
    const now = new Date().toISOString()
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const newMsg = {
            id: `msg-${Date.now()}`,
            sender: `${currentUser?.name || 'Support'} (Staff)`,
            isStaff: true,
            message,
            timestamp: now,
          }
          return {
            ...t,
            updatedAt: now,
            messages: [...t.messages, newMsg],
          }
        }
        return t
      })
    )
    logAudit('TICKET_REPLIED', 'Ticket', ticketId, `Replied to support ticket ${ticketId}`)
  }

  const updateTicketStatus = (ticketId: string, status: SupportTicket['status']) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          logAudit('TICKET_STATUS_CHANGED', 'Ticket', ticketId, `Changed status from ${t.status} to ${status}`)
          return { ...t, status, updatedAt: new Date().toISOString() }
        }
        return t
      })
    )
  }

  // Master Data Actions
  const addMasterItem = (item: Omit<MasterDataItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem: MasterDataItem = {
      ...item,
      targetPanels: item.targetPanels || ['mobile', 'partner', 'admin', 'web'],
      id: `md-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setMasterData((prev) => [...prev, newItem])
    logAudit(
      'MASTER_DATA_CREATED',
      'MasterData',
      newItem.id,
      `Created master option "${newItem.name}" under category "${newItem.category}"`
    )
  }

  const updateMasterItem = (id: string, updates: Partial<MasterDataItem>) => {
    setMasterData((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...updates, updatedAt: new Date().toISOString() }
          logAudit(
            'MASTER_DATA_UPDATED',
            'MasterData',
            id,
            `Updated master option "${updated.name}" (${updated.code})`
          )
          return updated
        }
        return item
      })
    )
  }

  const toggleMasterItemStatus = (id: string) => {
    setMasterData((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus = !item.isActive
          logAudit(
            'MASTER_DATA_STATUS_TOGGLED',
            'MasterData',
            id,
            `Changed status of "${item.name}" to ${nextStatus ? 'ACTIVE' : 'INACTIVE'}`
          )
          return { ...item, isActive: nextStatus, updatedAt: new Date().toISOString() }
        }
        return item
      })
    )
  }

  const deleteMasterItem = (id: string) => {
    const target = masterData.find((m) => m.id === id)
    setMasterData((prev) => prev.filter((item) => item.id !== id))
    if (target) {
      logAudit(
        'MASTER_DATA_DELETED',
        'MasterData',
        id,
        `Deleted master option "${target.name}" (${target.code}) from ${target.category}`
      )
    }
  }

  const resetMasterData = () => {
    setMasterData(INITIAL_MASTER_DATA)
    localStorage.setItem(STORAGE_KEYS.MASTER_DATA, JSON.stringify(INITIAL_MASTER_DATA))
    logAudit(
      'MASTER_DATA_RESET',
      'MasterData',
      'all',
      'Restored master reference data to system canonical defaults'
    )
  }

  // Content & Legal Documents Actions
  const addContentDocument = (data: Partial<ContentDocument>) => {
    const newDoc: ContentDocument = {
      id: `doc-${Date.now()}`,
      title: data.title || 'Untitled Document',
      slug: data.slug || `/legal/doc-${Date.now()}`,
      platform: data.platform || 'member_app',
      category: data.category || 'terms_of_service',
      version: data.version || 'v1.0',
      status: data.status || 'published',
      effectiveDate: data.effectiveDate || new Date().toISOString().slice(0, 10),
      lastUpdated: new Date().toISOString().slice(0, 10),
      updatedBy: currentUser ? `${currentUser.name} (${currentUser.role})` : 'System Administrator',
      revisionSummary: data.revisionSummary || 'Initial document creation.',
      content: data.content || '# Document Title\n\nEnter static content here...',
    }
    setContentDocuments((prev) => [newDoc, ...prev])
    logAudit(
      'CONTENT_DOCUMENT_CREATED',
      'ContentDocument' as any,
      newDoc.id,
      `Created legal document "${newDoc.title}" (${newDoc.version}) for ${newDoc.platform}`
    )
  }

  const updateContentDocument = (id: string, updates: Partial<ContentDocument>) => {
    setContentDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === id) {
          const updated: ContentDocument = {
            ...doc,
            ...updates,
            lastUpdated: new Date().toISOString().slice(0, 10),
            updatedBy: currentUser ? `${currentUser.name} (${currentUser.role})` : doc.updatedBy,
          }
          logAudit(
            'CONTENT_DOCUMENT_UPDATED',
            'ContentDocument' as any,
            id,
            `Updated document "${updated.title}" to ${updated.version} (${updated.status}): ${updated.revisionSummary}`
          )
          return updated
        }
        return doc
      })
    )
  }

  const toggleContentDocumentStatus = (id: string) => {
    setContentDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === id) {
          const nextStatus = doc.status === 'published' ? 'draft' : 'published'
          logAudit(
            'CONTENT_DOCUMENT_STATUS_CHANGED',
            'ContentDocument' as any,
            id,
            `Changed status of "${doc.title}" to ${nextStatus.toUpperCase()}`
          )
          return {
            ...doc,
            status: nextStatus,
            lastUpdated: new Date().toISOString().slice(0, 10),
          }
        }
        return doc
      })
    )
  }

  const deleteContentDocument = (id: string) => {
    const target = contentDocuments.find((d) => d.id === id)
    setContentDocuments((prev) => prev.filter((d) => d.id !== id))
    if (target) {
      logAudit(
        'CONTENT_DOCUMENT_DELETED',
        'ContentDocument' as any,
        id,
        `Deleted legal document "${target.title}" from ${target.platform}`
      )
    }
  }

  const resetContentDocuments = () => {
    setContentDocuments(INITIAL_CONTENT_DOCUMENTS)
    localStorage.setItem(STORAGE_KEYS.CONTENT_DOCUMENTS, JSON.stringify(INITIAL_CONTENT_DOCUMENTS))
    logAudit(
      'CONTENT_DOCUMENTS_RESET',
      'ContentDocument' as any,
      'all',
      'Restored static content and legal policy documents to canonical defaults'
    )
  }

  const resetToDefaultData = () => {
    setCurrentUser(INITIAL_STAFF[0])
    setStaff(INITIAL_STAFF)
    setUsers(INITIAL_USERS)
    setGyms(INITIAL_GYMS)
    setVouchers(INITIAL_VOUCHERS)
    setRefunds(INITIAL_REFUNDS)
    setFeatured(INITIAL_FEATURED)
    setCities(INITIAL_CITIES)
    setLocalities(INITIAL_LOCALITIES)
    setReviews(INITIAL_REVIEWS)
    setTickets(INITIAL_TICKETS)
    setBroadcasts(INITIAL_BROADCASTS)
    setSettings(INITIAL_SETTINGS)
    setAuditLogs(INITIAL_AUDIT_LOGS)
    setMasterData(INITIAL_MASTER_DATA)
    setContentDocuments(INITIAL_CONTENT_DOCUMENTS)
    localStorage.clear()
    alert('Mock data has been reset to defaults!')
  }

  return (
    <AdminContext.Provider
      value={{
        currentUser,
        login,
        logout,
        switchRole,
        staff,
        users,
        gyms,
        vouchers,
        refunds,
        featured,
        cities,
        localities,
        reviews,
        tickets,
        broadcasts,
        settings,
        auditLogs,

        verifyPayment,
        rejectPayment,
        bulkApprovePayments,

        approveGym,
        rejectGym,
        requestGymChanges,
        updateGymChecklist,
        suspendGym,
        blockGym,
        unblockGym,
        toggleGymVerifiedBadge,
        updateGymCommission,

        blockUser,
        unblockUser,

        approveRefund,
        rejectRefund,
        markRefundPaid,

        activateFeatured,
        rejectFeatured,

        approveMedia,
        rejectMedia,
        addMedia,
        deleteMedia,
        setCoverMedia,
        updateMediaCaption,
        approveReview,
        rejectReview,
        replyToReview,

        toggleCity,
        addCity,
        addLocality,
        toggleLocality,

        updateSettings,

        addStaff,
        updateStaffRole,
        toggleStaffStatus,

        sendBroadcast,
        replyToTicket,
        updateTicketStatus,

        // Master Data
        masterData,
        addMasterItem,
        updateMasterItem,
        toggleMasterItemStatus,
        deleteMasterItem,
        resetMasterData,

        // Content & Legal Documents
        contentDocuments,
        addContentDocument,
        updateContentDocument,
        toggleContentDocumentStatus,
        deleteContentDocument,
        resetContentDocuments,

        logAudit,
        resetToDefaultData,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}

