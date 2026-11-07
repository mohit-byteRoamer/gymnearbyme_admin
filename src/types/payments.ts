// Types for Full-Collection Marketplace Payments (Razorpay Route) in Admin Panel

export type PaymentType = 'first_join' | 'renewal'

export type PaymentStatus =
  | 'paid'
  | 'released'
  | 'settled'
  | 'held'
  | 'failed'
  | 'refunded'

export interface PaymentTimelineEvent {
  timestamp: string
  event: string
  actor: string
  note?: string
}

export interface PaymentTransaction {
  id: string
  date: string
  voucherId: string
  voucherCode: string
  member: {
    id: string
    name: string
    phone: string
    email?: string
  }
  gym: {
    id: string
    name: string
    locality: string
  }
  type: PaymentType
  planName: string
  paidByMemberPaise: number
  commissionPaise: number
  gymSharePaise: number
  processingCostPaise: number
  status: PaymentStatus
  razorpayPaymentId: string
  orderId: string
  transferId?: string
  utr?: string
  timeline: PaymentTimelineEvent[]
}

export type ReviewReason =
  | 'amount_mismatch'
  | 'paid_after_expired'
  | 'webhook_missing'
  | 'duplicate_payment'
  | 'gym_not_activated'

export interface NeedsReviewItem {
  id: string
  paymentId: string
  voucherCode: string
  member: {
    name: string
    phone: string
  }
  gym: {
    name: string
    locality: string
  }
  amountPaise: number
  reason: ReviewReason
  reasonLabel: string
  explanation: string
  waitingMinutes: number // e.g. 130 min -> "2 h 10 min"
  createdAt: string
  status: 'pending' | 'approved' | 'refunded'
}

export type TransferStatus =
  | 'Held'
  | 'Ready to release'
  | 'Released'
  | 'Settled'
  | 'Failed'

export interface RouteTransfer {
  id: string
  providerTransferId: string
  gymId: string
  gymName: string
  memberId: string
  memberName: string
  grossAmountPaise: number
  commissionPaise: number
  gymSharePaise: number
  releaseDate: string
  status: TransferStatus
  holdHours?: number
  holdReason?: string
  payoutsEnabled: boolean
  linkedAccountStatus: 'activated' | 'pending' | 'needs_clarification' | 'rejected'
}

export interface GymBalanceSummary {
  gymId: string
  gymName: string
  locality: string
  heldBalancePaise: number
  releasedPaise: number
  settledPaise: number
  linkedAccountStatus: 'activated' | 'pending' | 'needs_clarification' | 'rejected'
  payoutsEnabled: boolean
  transfersCount: number
}

export type RefundStatus = 'requested' | 'approved' | 'processed' | 'rejected'

export interface RefundRecord {
  id: string
  paymentId: string
  voucherCode: string
  member: {
    name: string
    phone: string
  }
  gym: {
    name: string
  }
  amountPaise: number
  reason: string
  status: RefundStatus
  createdAt: string
  processedAt?: string
  processedBy?: string
  note?: string
}

export type DateRangePreset = 'today' | '7d' | '30d' | 'custom'

export interface DateRangeFilter {
  preset: DateRangePreset
  startDate?: string
  endDate?: string
}

export interface PaymentStats {
  grossCollectedPaise: number
  grossPaymentsCount: number
  platformCommissionPaise: number
  commissionPaymentsCount: number
  heldForGymsPaise: number
  heldTransfersCount: number
  releasedThisWeekPaise: number
  releasedTransfersCount: number
}

export interface PayoutStats {
  heldForGymsPaise: number
  heldTransfersCount: number
  readyToReleasePaise: number
  readyTransfersCount: number
  settledPaise: number
  settledTransfersCount: number
  failedPaise: number
  failedTransfersCount: number
  totalGymSharePaise: number
}


