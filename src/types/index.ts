export type StaffRole = 'super_admin' | 'finance' | 'support' | 'moderator'

export interface StaffUser {
  id: string
  name: string
  email: string
  role: StaffRole
  phone: string
  avatar: string
  status: 'active' | 'suspended'
  lastLogin: string
  twoFactorEnabled?: boolean
}

export interface AppUser {
  id: string
  name: string
  email: string
  phone: string
  city: string
  avatar: string
  status: 'active' | 'blocked'
  joinedAt: string
  totalVouchers: number
  activeMemberships: number
  blockReason?: string
}

export type GymStatus =
  | 'PENDING_APPROVAL'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'BLOCKED'
  | 'CHANGES_REQUESTED'
  | 'REJECTED'

export interface GymPlan {
  id: string
  name: string
  duration: string
  price: number
  features: string[]
}

export interface GymMedia {
  id: string
  url: string
  type: 'photo' | 'video'
  caption: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  uploadedAt: string
  rejectionReason?: string
  isCover?: boolean
  tag?: string
  resolution?: string
}

export interface GymDocument {
  id: string
  name: string
  type: 'gst' | 'pan' | 'trade_license' | 'rent_agreement'
  url: string
  verified: boolean
  uploadedAt: string
}

export interface GymChecklist {
  documents: boolean
  photos: boolean
  address: boolean
  upiVpa: boolean
}

export interface Gym {
  id: string
  name: string
  ownerName: string
  email: string
  phone: string
  status: GymStatus
  address: string
  locality: string
  city: string
  pincode: string
  geo: { lat: number; lng: number }
  upiVpa: string
  bankDetails: {
    accountName: string
    accountNumber: string
    ifsc: string
    bankName: string
  }
  isVerifiedBadge: boolean
  commissionOverride: number | null
  rating: number
  reviewCount: number
  memberCount: number
  plans: GymPlan[]
  services: string[]
  media: GymMedia[]
  documents: GymDocument[]
  checklist: GymChecklist
  rejectionReason?: string
  suspensionReason?: string
  blockReason?: string
  requestedChangesNote?: string
  createdAt: string
  updatedAt: string
}

export type VoucherStatus =
  | 'FEE_PENDING_VERIFICATION'
  | 'ACTIVE'
  | 'REDEEMED'
  | 'EXPIRED'
  | 'REFUND_REQUESTED'
  | 'REFUNDED'
  | 'CANCELLED'

export interface VoucherTimelineEvent {
  timestamp: string
  event: string
  actor: string
  note?: string
}

export interface Voucher {
  id: string
  code: string
  userId: string
  userName: string
  userPhone: string
  userEmail: string
  gymId: string
  gymName: string
  gymCity: string
  gymLocality: string
  planName: string
  amount: number
  feeAmount: number
  gymPayoutAmount: number
  utr: string
  status: VoucherStatus
  createdAt: string
  verifiedAt?: string
  verifiedBy?: string
  redeemedAt?: string
  rejectionReason?: string
  timeline: VoucherTimelineEvent[]
}

export type RefundStatus = 'REQUESTED' | 'APPROVED' | 'REFUNDED' | 'REJECTED'

export interface RefundRequest {
  id: string
  voucherId: string
  voucherCode: string
  userId: string
  userName: string
  userEmail: string
  userPhone: string
  gymId: string
  gymName: string
  amount: number
  reason: string
  status: RefundStatus
  requestedAt: string
  processedAt?: string
  processedBy?: string
  refundUtr?: string
  rejectionReason?: string
}

export interface FeaturedListing {
  id: string
  gymId: string
  gymName: string
  city: string
  locality: string
  slotNumber: number
  startDate: string
  endDate: string
  durationDays: number
  amount: number
  status: 'REQUESTED' | 'ACTIVE' | 'EXPIRED' | 'REJECTED'
  requestedAt: string
  activatedAt?: string
}

export interface City {
  id: string
  name: string
  state: string
  active: boolean
  gymCount: number
}

export interface Locality {
  id: string
  name: string
  cityId: string
  cityName: string
  pincode: string
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3'
  active: boolean
  maxFeaturedSlots: number
  gymCount: number
}

export interface Review {
  id: string
  gymId: string
  gymName: string
  userId: string
  userName: string
  userAvatar: string
  rating: number
  comment: string
  createdAt: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  flagged: boolean
  adminReply?: string
}

export interface SupportTicketMessage {
  id: string
  sender: string
  isStaff: boolean
  message: string
  timestamp: string
}

export interface SupportTicket {
  id: string
  ticketNumber: string
  subject: string
  category: 'PAYMENT' | 'VOUCHER' | 'GYM_ISSUE' | 'REFUND' | 'OTHER'
  userType: 'USER' | 'GYM_OWNER'
  userName: string
  userEmail: string
  userPhone: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  createdAt: string
  updatedAt: string
  messages: SupportTicketMessage[]
}

export interface BroadcastNotification {
  id: string
  title: string
  message: string
  target: 'ALL' | 'USERS' | 'GYMS'
  channel: 'IN_APP' | 'PUSH' | 'EMAIL'
  sentAt: string
  sentBy: string
  recipientsCount: number
}

export interface AuditLog {
  id: string
  timestamp: string
  actorId: string
  actorName: string
  actorEmail: string
  actorRole: StaffRole
  ipAddress: string
  action: string
  entityType: 'Gym' | 'Payment' | 'Voucher' | 'User' | 'Refund' | 'Settings' | 'Staff' | 'Media' | 'Review' | 'Broadcast' | 'Featured' | 'Ticket' | 'City' | 'MasterData'
  entityId: string
  details: string
  diff?: {
    before?: any
    after?: any
  }
}

export type MasterDataCategory =
  | 'amenities'
  | 'workout_types'
  | 'plan_durations'
  | 'localities'
  | 'trainer_certs'
  | 'refund_reasons'
  | 'support_categories'
  | 'kyc_documents'

export type SubPanelTarget = 'mobile' | 'partner' | 'admin' | 'web'

export interface MasterDataItem {
  id: string
  category: MasterDataCategory
  name: string
  code: string
  description?: string
  targetPanels?: SubPanelTarget[]
  icon?: string
  sortOrder: number
  isActive: boolean
  isSystem?: boolean
  meta?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface PlatformSettings {
  feePercentage: number
  firstCommissionPct?: number
  renewalCommissionPct?: number
  passThroughProcessingCostOnRenewal?: boolean
  releaseHoldHoursFirst?: number
  releaseHoldHoursRenewal?: number
  feeCap: number
  voucherExpiryDays: number
  companyUpiVpa: string
  companyName: string
  companyBrandName: string
  featuredPricingTier1Weekly: number
  featuredPricingTier1Monthly: number
  featuredPricingTier2Weekly: number
  featuredPricingTier2Monthly: number
}

export type ContentPlatform = 'all' | 'member_app' | 'partner_desk' | 'web_portal' | 'platform_wide'

export type ContentCategory =
  | 'terms_of_service'
  | 'privacy_policy'
  | 'refund_cancellation'
  | 'partner_agreement'
  | 'about_us'
  | 'community_guidelines'
  | 'grievance_legal'

export type ContentStatus = 'published' | 'draft' | 'archived'

export interface ContentDocument {
  id: string
  title: string
  slug: string
  platform: ContentPlatform
  category: ContentCategory
  version: string
  status: ContentStatus
  effectiveDate: string
  lastUpdated: string
  updatedBy: string
  revisionSummary: string
  content: string
}


