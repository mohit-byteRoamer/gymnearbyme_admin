import {
  PaymentTransaction,
  NeedsReviewItem,
  RouteTransfer,
  GymBalanceSummary,
  RefundRecord,
  PaymentStats,
  PayoutStats,
} from '../types/payments'

// Consistent Seed Transactions in Ludhiana
// Strict invariant: commissionPaise + gymSharePaise === paidByMemberPaise
export const SEED_PAYMENTS: PaymentTransaction[] = [
  {
    id: 'pay_LDH_1001',
    date: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    voucherId: 'vch_cult_01',
    voucherCode: 'GYM-LDH-9011',
    member: {
      id: 'usr_amrit_singh',
      name: 'Amritpal Singh',
      phone: '+91 98765 43210',
      email: 'amrit.singh@gmail.com',
    },
    gym: {
      id: 'gym-cult-sarabha',
      name: 'Cult Gym Sarabha Nagar',
      locality: 'Sarabha Nagar',
    },
    type: 'first_join',
    planName: '1 Month All-Access',
    paidByMemberPaise: 299900, // ₹2,999
    commissionPaise: 59980,    // 20% = ₹599.80
    gymSharePaise: 239920,     // 80% = ₹2,399.20
    processingCostPaise: 5998,
    status: 'paid',
    razorpayPaymentId: 'pay_OnrZ781290312',
    orderId: 'order_LDH_98124',
    transferId: 'trf_LDH_67123',
    utr: 'UPI982019482910',
    timeline: [
      { timestamp: new Date(Date.now() - 1000 * 60 * 26).toISOString(), event: 'Razorpay order created', actor: 'System' },
      { timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), event: 'Payment captured via UPI', actor: 'Amritpal Singh', note: 'Payment ID: pay_OnrZ781290312' },
      { timestamp: new Date(Date.now() - 1000 * 60 * 24).toISOString(), event: 'Webhook verified payment', actor: 'Razorpay Webhook' },
      { timestamp: new Date(Date.now() - 1000 * 60 * 24).toISOString(), event: 'Voucher issued to member', actor: 'System', note: 'Code: GYM-LDH-9011' },
    ],
  },
  {
    id: 'pay_LDH_1002',
    date: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    voucherId: 'vch_anytime_02',
    voucherCode: 'GYM-LDH-9012',
    member: {
      id: 'usr_vikram_malhotra',
      name: 'Vikram Malhotra',
      phone: '+91 98111 22334',
      email: 'vikram.m@gmail.com',
    },
    gym: {
      id: 'gym-anytime-model-town',
      name: 'Anytime Fitness Model Town',
      locality: 'Model Town',
    },
    type: 'first_join',
    planName: 'Starter Fitness Plan',
    paidByMemberPaise: 100000, // ₹1,000
    commissionPaise: 20000,    // 20% = ₹200
    gymSharePaise: 80000,      // 80% = ₹800
    processingCostPaise: 2000,
    status: 'held',
    razorpayPaymentId: 'pay_OnrZ991209341',
    orderId: 'order_LDH_98125',
    transferId: 'trf_LDH_67124',
    utr: 'UPI982019482911',
    timeline: [
      { timestamp: new Date(Date.now() - 1000 * 60 * 76).toISOString(), event: 'Razorpay order created', actor: 'System' },
      { timestamp: new Date(Date.now() - 1000 * 60 * 75).toISOString(), event: 'Payment captured via Google Pay', actor: 'Vikram Malhotra' },
      { timestamp: new Date(Date.now() - 1000 * 60 * 74).toISOString(), event: 'Webhook verified payment', actor: 'Razorpay Webhook' },
      { timestamp: new Date(Date.now() - 1000 * 60 * 74).toISOString(), event: 'Route transfer held on gym account', actor: 'System', note: 'Hold until activated' },
    ],
  },
  {
    id: 'pay_LDH_1003',
    date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    voucherId: 'vch_golds_03',
    voucherCode: 'GYM-LDH-9013',
    member: {
      id: 'usr_sneha_patel',
      name: 'Sneha Patel',
      phone: '+91 98222 33445',
      email: 'sneha.patel@outlook.com',
    },
    gym: {
      id: 'gym-golds-civil-lines',
      name: "Gold's Gym Civil Lines",
      locality: 'Civil Lines',
    },
    type: 'renewal',
    planName: 'Quarterly Renewal',
    paidByMemberPaise: 299900, // ₹2,999
    commissionPaise: 0,        // 0% for renewal
    gymSharePaise: 299900,     // 100% = ₹2,999
    processingCostPaise: 5998, // Pass-through gateway cost
    status: 'released',
    razorpayPaymentId: 'pay_OnrK441290315',
    orderId: 'order_LDH_98126',
    transferId: 'trf_LDH_67125',
    utr: 'UPI982019482912',
    timeline: [
      { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), event: 'Renewal order placed online', actor: 'Sneha Patel' },
      { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), event: 'Payment captured via Netbanking', actor: 'Payment Gateway' },
      { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), event: 'Webhook confirmed 0% commission renewal', actor: 'System' },
      { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), event: 'Transfer released to Gold\'s Gym bank', actor: 'Finance Desk' },
    ],
  },
  {
    id: 'pay_LDH_1004',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    voucherId: 'vch_titan_04',
    voucherCode: 'GYM-LDH-9014',
    member: {
      id: 'usr_arjun_nambiar',
      name: 'Arjun Nambiar',
      phone: '+91 98333 44556',
      email: 'arjun.n@yahoo.com',
    },
    gym: {
      id: 'gym-titan-brs',
      name: 'Titan Strength Club BRS Nagar',
      locality: 'BRS Nagar',
    },
    type: 'first_join',
    planName: 'Powerlifter Pass',
    paidByMemberPaise: 100000, // ₹1,000
    commissionPaise: 20000,    // ₹200
    gymSharePaise: 80000,      // ₹800
    processingCostPaise: 2000,
    status: 'settled',
    razorpayPaymentId: 'pay_OnrM111290316',
    orderId: 'order_LDH_98127',
    transferId: 'trf_LDH_67126',
    utr: 'UPI982019482913',
    timeline: [
      { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), event: 'Order completed', actor: 'Arjun Nambiar' },
      { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1.5).toISOString(), event: 'Gym reception activated pass', actor: 'Titan Strength Desk' },
      { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), event: 'Route transfer settled to ICICI bank account', actor: 'Razorpay Route' },
    ],
  },
  {
    id: 'pay_LDH_1005',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    voucherId: 'vch_burn_05',
    voucherCode: 'GYM-LDH-9015',
    member: {
      id: 'usr_priyanka_kaur',
      name: 'Priyanka Kaur',
      phone: '+91 98444 55667',
      email: 'priyanka.k@gmail.com',
    },
    gym: {
      id: 'gym-burn-ferozepur',
      name: 'Burn Gym Ferozepur Road',
      locality: 'Ferozepur Road',
    },
    type: 'first_join',
    planName: 'Monthly Unlimited',
    paidByMemberPaise: 299900,
    commissionPaise: 59980,
    gymSharePaise: 239920,
    processingCostPaise: 5998,
    status: 'refunded',
    razorpayPaymentId: 'pay_OnrP881290318',
    orderId: 'order_LDH_98128',
    transferId: 'trf_LDH_67127',
    utr: 'UPI982019482914',
    timeline: [
      { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), event: 'Payment captured', actor: 'System' },
      { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2.8).toISOString(), event: 'Member requested pre-activation 100% refund', actor: 'Priyanka Kaur', note: 'Reason: Selected wrong gym' },
      { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2.5).toISOString(), event: 'Full refund reversed to member bank account', actor: 'Finance Desk' },
    ],
  },
]

// Seed Needs Review Exception Queue (2 recent cases, < 2 hours old)
export const SEED_NEEDS_REVIEW: NeedsReviewItem[] = [
  {
    id: 'rev_LDH_01',
    paymentId: 'pay_OnrZ991209341',
    voucherCode: 'GYM-LDH-9081',
    member: {
      name: 'Gurpreet Singh',
      phone: '+91 98555 66778',
    },
    gym: {
      name: 'Cult Gym Sarabha Nagar',
      locality: 'Sarabha Nagar',
    },
    amountPaise: 299900,
    reason: 'amount_mismatch',
    reasonLabel: 'Amount mismatch',
    explanation: 'Member paid ₹2,999 but plan price was recently updated to ₹3,499. Needs admin verification to activate pass.',
    waitingMinutes: 130, // 2 h 10 min
    createdAt: new Date(Date.now() - 1000 * 60 * 130).toISOString(),
    status: 'pending',
  },
  {
    id: 'rev_LDH_02',
    paymentId: 'pay_OnrK441290315',
    voucherCode: 'GYM-LDH-9082',
    member: {
      name: 'Simranjeet Kaur',
      phone: '+91 98666 77889',
    },
    gym: {
      name: 'Titan Strength Club BRS Nagar',
      locality: 'BRS Nagar',
    },
    amountPaise: 100000,
    reason: 'gym_not_activated',
    reasonLabel: 'Gym not activated',
    explanation: 'Gym bank KYC verification is currently pending with Razorpay Route. Transfer cannot be routed until linked account is active.',
    waitingMinutes: 45, // 45 min
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    status: 'pending',
  },
]

// Seed Route Transfers
export const SEED_TRANSFERS: RouteTransfer[] = [
  {
    id: 'trf-101',
    providerTransferId: 'trf_rzp_9812401',
    gymId: 'gym-cult-sarabha',
    gymName: 'Cult Gym Sarabha Nagar',
    memberId: 'usr_amrit_singh',
    memberName: 'Amritpal Singh',
    grossAmountPaise: 299900,
    commissionPaise: 59980,
    gymSharePaise: 239920,
    releaseDate: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    status: 'Held',
    holdHours: 48,
    holdReason: 'Awaiting member first visit check-in',
    payoutsEnabled: true,
    linkedAccountStatus: 'activated',
  },
  {
    id: 'trf-102',
    providerTransferId: 'trf_rzp_9812402',
    gymId: 'gym-anytime-model-town',
    gymName: 'Anytime Fitness Model Town',
    memberId: 'usr_vikram_malhotra',
    memberName: 'Vikram Malhotra',
    grossAmountPaise: 100000,
    commissionPaise: 20000,
    gymSharePaise: 80000,
    releaseDate: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
    status: 'Ready to release',
    payoutsEnabled: true,
    linkedAccountStatus: 'activated',
  },
  {
    id: 'trf-103',
    providerTransferId: 'trf_rzp_9812403',
    gymId: 'gym-golds-civil-lines',
    gymName: "Gold's Gym Civil Lines",
    memberId: 'usr_sneha_patel',
    memberName: 'Sneha Patel',
    grossAmountPaise: 299900,
    commissionPaise: 0,
    gymSharePaise: 299900,
    releaseDate: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    status: 'Released',
    payoutsEnabled: true,
    linkedAccountStatus: 'activated',
  },
  {
    id: 'trf-104',
    providerTransferId: 'trf_rzp_9812404',
    gymId: 'gym-titan-brs',
    gymName: 'Titan Strength Club BRS Nagar',
    memberId: 'usr_arjun_nambiar',
    memberName: 'Arjun Nambiar',
    grossAmountPaise: 100000,
    commissionPaise: 20000,
    gymSharePaise: 80000,
    releaseDate: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    status: 'Settled',
    payoutsEnabled: false,
    linkedAccountStatus: 'pending',
  },
  {
    id: 'trf-105',
    providerTransferId: 'trf_rzp_9812405',
    gymId: 'gym-burn-ferozepur',
    gymName: 'Burn Gym Ferozepur Road',
    memberId: 'usr_priyanka_kaur',
    memberName: 'Priyanka Kaur',
    grossAmountPaise: 299900,
    commissionPaise: 59980,
    gymSharePaise: 239920,
    releaseDate: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    status: 'Failed',
    holdReason: 'Beneficiary bank IFSC lookup failed',
    payoutsEnabled: true,
    linkedAccountStatus: 'needs_clarification',
  },
]

// Seed By-Gym Aggregated Balances
export const SEED_GYM_BALANCES: GymBalanceSummary[] = [
  {
    gymId: 'gym-cult-sarabha',
    gymName: 'Cult Gym Sarabha Nagar',
    locality: 'Sarabha Nagar',
    heldBalancePaise: 239920,
    releasedPaise: 12500000,
    settledPaise: 12000000,
    linkedAccountStatus: 'activated',
    payoutsEnabled: true,
    transfersCount: 14,
  },
  {
    gymId: 'gym-anytime-model-town',
    gymName: 'Anytime Fitness Model Town',
    locality: 'Model Town',
    heldBalancePaise: 80000,
    releasedPaise: 8900000,
    settledPaise: 8900000,
    linkedAccountStatus: 'activated',
    payoutsEnabled: true,
    transfersCount: 10,
  },
  {
    gymId: 'gym-golds-civil-lines',
    gymName: "Gold's Gym Civil Lines",
    locality: 'Civil Lines',
    heldBalancePaise: 0,
    releasedPaise: 15400000,
    settledPaise: 15400000,
    linkedAccountStatus: 'activated',
    payoutsEnabled: true,
    transfersCount: 18,
  },
  {
    gymId: 'gym-titan-brs',
    gymName: 'Titan Strength Club BRS Nagar',
    locality: 'BRS Nagar',
    heldBalancePaise: 80000,
    releasedPaise: 0,
    settledPaise: 80000,
    linkedAccountStatus: 'pending',
    payoutsEnabled: false, // Bank details pending
    transfersCount: 2,
  },
  {
    gymId: 'gym-burn-ferozepur',
    gymName: 'Burn Gym Ferozepur Road',
    locality: 'Ferozepur Road',
    heldBalancePaise: 239920,
    releasedPaise: 4200000,
    settledPaise: 3960080,
    linkedAccountStatus: 'needs_clarification',
    payoutsEnabled: true,
    transfersCount: 6,
  },
]

// Seed Refunds
export const SEED_REFUNDS: RefundRecord[] = [
  {
    id: 'ref_101',
    paymentId: 'pay_LDH_1005',
    voucherCode: 'GYM-LDH-9015',
    member: {
      name: 'Priyanka Kaur',
      phone: '+91 98444 55667',
    },
    gym: {
      name: 'Burn Gym Ferozepur Road',
    },
    amountPaise: 299900,
    reason: 'Selected wrong gym or plan before activation',
    status: 'processed',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    processedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1.5).toISOString(),
    processedBy: 'Finance Desk',
    note: '100% pre-activation guarantee honored.',
  },
  {
    id: 'ref_102',
    paymentId: 'pay_LDH_1002',
    voucherCode: 'GYM-LDH-9012',
    member: {
      name: 'Jaspreet Singh',
      phone: '+91 98777 88990',
    },
    gym: {
      name: 'Anytime Fitness Model Town',
    },
    amountPaise: 100000,
    reason: 'Changed my mind within 24 hours of purchase',
    status: 'requested',
    createdAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
  },
]

// Seed Stats
export const SEED_PAYMENT_STATS: PaymentStats = {
  grossCollectedPaise: 1099600, // ₹10,996.00
  grossPaymentsCount: 86,
  platformCommissionPaise: 159960, // ₹1,599.60
  commissionPaymentsCount: 86,
  heldForGymsPaise: 319920, // ₹3,199.20
  heldTransfersCount: 4,
  releasedThisWeekPaise: 299900, // ₹2,999.00
  releasedTransfersCount: 12,
}

export const SEED_PAYOUT_STATS: PayoutStats = {
  heldForGymsPaise: 319920, // ₹3,199.20
  heldTransfersCount: 4,
  readyToReleasePaise: 80000, // ₹800.00
  readyTransfersCount: 1,
  settledPaise: 12080000, // ₹1,20,800.00
  settledTransfersCount: 14,
  failedPaise: 239920, // ₹2,399.20
  failedTransfersCount: 1,
  totalGymSharePaise: 12719840,
}


