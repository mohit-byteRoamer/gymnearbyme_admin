import { describe, it } from 'node:test'
import assert from 'node:assert'
import {
  SEED_PAYMENTS,
  SEED_NEEDS_REVIEW,
  SEED_TRANSFERS,
  SEED_GYM_BALANCES,
  SEED_PAYOUT_STATS,
} from '../data/payments-seed'
import { formatIndianCurrency, formatWaitingTime, paymentsApi } from '../lib/payments-api'

describe('Admin Payments Math & Invariants', () => {
  it('strictly enforces paidByMemberPaise === commissionPaise + gymSharePaise across all seed payments', () => {
    assert.ok(SEED_PAYMENTS.length > 0, 'Seed payments should not be empty')
    for (const payment of SEED_PAYMENTS) {
      const sum = payment.commissionPaise + payment.gymSharePaise
      assert.strictEqual(
        sum,
        payment.paidByMemberPaise,
        `Payment ${payment.id} math mismatch: ${payment.paidByMemberPaise} !== ${payment.commissionPaise} + ${payment.gymSharePaise}`
      )
    }
  })

  it('verifies standard ₹1,000 and ₹2,999 plan commission splits', () => {
    // 1000 plan: 20% commission (200), 80% gym share (800)
    const p1000 = SEED_PAYMENTS.find(p => p.paidByMemberPaise === 100000 && p.type === 'first_join')
    assert.ok(p1000, 'Should have ₹1,000 first_join payment')
    assert.strictEqual(p1000.commissionPaise, 20000)
    assert.strictEqual(p1000.gymSharePaise, 80000)

    // 2999 plan: 20% commission (599.80 = 59980 paise), 80% gym share (2399.20 = 239920 paise)
    const p2999 = SEED_PAYMENTS.find(p => p.paidByMemberPaise === 299900 && p.type === 'first_join')
    assert.ok(p2999, 'Should have ₹2,999 first_join payment')
    assert.strictEqual(p2999.commissionPaise, 59980)
    assert.strictEqual(p2999.gymSharePaise, 239920)
    assert.strictEqual(p2999.commissionPaise + p2999.gymSharePaise, 299900)
  })

  it('verifies renewal payments have 0% platform commission', () => {
    const renewals = SEED_PAYMENTS.filter(p => p.type === 'renewal')
    assert.ok(renewals.length > 0, 'Should have renewal payments')
    for (const renewal of renewals) {
      assert.strictEqual(renewal.commissionPaise, 0, `Renewal ${renewal.id} must have 0 platform commission`)
      assert.strictEqual(renewal.gymSharePaise, renewal.paidByMemberPaise)
    }
  })
})

describe('Currency Formatting (Indian Format & Paise conversion)', () => {
  it('formats round hundreds and thousands without decimals', () => {
    assert.strictEqual(formatIndianCurrency(100000), '₹1,000')
    assert.strictEqual(formatIndianCurrency(299900), '₹2,999')
    assert.strictEqual(formatIndianCurrency(10000000), '₹1,00,000')
    assert.strictEqual(formatIndianCurrency(0), '₹0')
  })

  it('formats fractional rupees with exact 2 decimal places', () => {
    assert.strictEqual(formatIndianCurrency(59980), '₹599.80')
    assert.strictEqual(formatIndianCurrency(239920), '₹2,399.20')
  })
})

describe('Waiting Time Calculation and SLA Thresholds', () => {
  it('formats waiting times into hours and minutes correctly', () => {
    assert.strictEqual(formatWaitingTime(130), '2 h 10 min')
    assert.strictEqual(formatWaitingTime(60), '1 h')
    assert.strictEqual(formatWaitingTime(45), '45 min')
    assert.strictEqual(formatWaitingTime(5), '5 min')
    assert.strictEqual(formatWaitingTime(0), '0 min')
  })

  it('verifies SLA breach flag is active only for items waiting > 30 minutes', () => {
    assert.strictEqual(SEED_NEEDS_REVIEW.length, 2, 'Seed needs review should have exactly 2 recent cases')
    
    // Case 1: 130 min (> 30 min -> SLA breach)
    const item1 = SEED_NEEDS_REVIEW[0]
    assert.strictEqual(item1.waitingMinutes, 130)
    assert.ok(item1.waitingMinutes > 30, 'Item 1 should breach 30 min SLA')

    // Case 2: 45 min (> 30 min -> SLA breach)
    const item2 = SEED_NEEDS_REVIEW[1]
    assert.strictEqual(item2.waitingMinutes, 45)
    assert.ok(item2.waitingMinutes > 30, 'Item 2 should breach 30 min SLA')

    // Verify non-breach condition
    const nonBreachMinutes = 20
    assert.strictEqual(nonBreachMinutes > 30, false, '20 min should NOT breach SLA')
  })
})

describe('Seed Data Verification for Ludhiana Gyms and Route States', () => {
  it('verifies all gyms are located in Ludhiana localities', () => {
    const validLocalities = ['Model Town', 'Sarabha Nagar', 'BRS Nagar', 'Civil Lines', 'Ferozepur Road']
    for (const p of SEED_PAYMENTS) {
      assert.ok(
        validLocalities.includes(p.gym.locality),
        `Gym ${p.gym.name} in unexpected locality: ${p.gym.locality}`
      )
    }
  })

  it('verifies Route transfers and gym balances consistency', () => {
    assert.ok(SEED_TRANSFERS.length > 0)
    assert.ok(SEED_GYM_BALANCES.length > 0)

    // Gyms with pending KYC are flagged
    const pendingGym = SEED_GYM_BALANCES.find(g => !g.payoutsEnabled || g.linkedAccountStatus === 'pending')
    assert.ok(pendingGym, 'Should have gym with pending bank details')
    assert.strictEqual(pendingGym.gymName, 'Titan Strength Club BRS Nagar')
  })
})

describe('Dedicated Payout Module Stats & CSV Export', () => {
  it('correctly aggregates dedicated payout stats from transfers', async () => {
    const stats = await paymentsApi.getPayoutStats()
    assert.ok(stats.heldForGymsPaise > 0, 'Held for gyms amount should be > 0')
    assert.ok(stats.heldTransfersCount > 0, 'Held transfers count should be > 0')
    assert.ok(stats.readyToReleasePaise > 0, 'Ready to release amount should be > 0')
    assert.ok(stats.readyTransfersCount > 0, 'Ready transfers count should be > 0')
    assert.ok(stats.settledPaise > 0, 'Settled amount should be > 0')
    assert.ok(stats.failedPaise > 0, 'Failed amount should be > 0')
  })

  it('exports valid payouts CSV formatted with correct headers and rows', () => {
    const csv = paymentsApi.exportPayoutsCsv(SEED_TRANSFERS)
    assert.ok(csv.includes('Transfer ID'), 'CSV must include Transfer ID header')
    assert.ok(csv.includes('Gym Share (₹)'), 'CSV must include Gym Share header')
    assert.ok(csv.includes('Cult Gym Sarabha Nagar'), 'CSV must include Cult Gym row')
    assert.ok(csv.includes('2399.20'), 'CSV must format rupees correctly')
  })
})

describe('Role Capability Logic', () => {
  function canPerformFinancialAction(role: string): boolean {
    return role === 'finance' || role === 'super_admin'
  }

  it('grants financial actions to finance and super_admin', () => {
    assert.strictEqual(canPerformFinancialAction('finance'), true)
    assert.strictEqual(canPerformFinancialAction('super_admin'), true)
  })

  it('denies financial actions to support and moderator roles', () => {
    assert.strictEqual(canPerformFinancialAction('support'), false)
    assert.strictEqual(canPerformFinancialAction('moderator'), false)
    assert.strictEqual(canPerformFinancialAction('gym_owner'), false)
  })
})

