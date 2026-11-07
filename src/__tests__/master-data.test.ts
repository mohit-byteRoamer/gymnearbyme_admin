import { test, describe } from 'node:test'
import assert from 'node:assert'
import { INITIAL_MASTER_DATA } from '../data/mock-data'
import { MasterDataCategory, SubPanelTarget } from '../types'

describe('Master Data Governance & Dropdown Reference Rules', () => {
  test('verifies all 8 master data categories are populated', () => {
    const requiredCategories: MasterDataCategory[] = [
      'amenities',
      'workout_types',
      'plan_durations',
      'localities',
      'trainer_certs',
      'refund_reasons',
      'support_categories',
      'kyc_documents',
    ]

    const presentCategories = new Set(INITIAL_MASTER_DATA.map((item) => item.category))
    for (const cat of requiredCategories) {
      assert.strictEqual(
        presentCategories.has(cat),
        true,
        `Expected category "${cat}" to be present in master data`
      )
    }
  })

  test('verifies total master data count exceeds 60 canonical reference records', () => {
    assert.ok(
      INITIAL_MASTER_DATA.length >= 60,
      `Expected >= 60 master records, got ${INITIAL_MASTER_DATA.length}`
    )
  })

  test('enforces unique slugs/codes across each master category', () => {
    const categoryCodeMap = new Map<MasterDataCategory, Set<string>>()

    for (const item of INITIAL_MASTER_DATA) {
      if (!categoryCodeMap.has(item.category)) {
        categoryCodeMap.set(item.category, new Set())
      }
      const codes = categoryCodeMap.get(item.category)!
      assert.strictEqual(
        codes.has(item.code),
        false,
        `Duplicate code "${item.code}" found in category "${item.category}"`
      )
      codes.add(item.code)
    }
  })

  test('validates targetPanels are strictly valid sub-panel enum targets', () => {
    const validPanels: SubPanelTarget[] = ['mobile', 'partner', 'admin', 'web']

    for (const item of INITIAL_MASTER_DATA) {
      assert.ok(item.targetPanels.length > 0, `Item ${item.code} has empty targetPanels`)
      for (const p of item.targetPanels) {
        assert.ok(
          validPanels.includes(p),
          `Invalid targetPanel "${p}" in master item "${item.code}"`
        )
      }
    }
  })

  test('verifies plan durations contain standard passes with day metadata', () => {
    const planPasses = INITIAL_MASTER_DATA.filter((m) => m.category === 'plan_durations')
    assert.ok(planPasses.length >= 6, 'Expected at least 6 plan durations')

    const oneDay = planPasses.find((p) => p.code === 'pass_1d')
    assert.ok(oneDay, 'Expected pass_1d')
    assert.strictEqual(oneDay?.meta?.days, 1)

    const oneMonth = planPasses.find((p) => p.code === 'pass_1m')
    assert.ok(oneMonth, 'Expected pass_1m')
    assert.strictEqual(oneMonth?.meta?.days, 30)

    const oneYear = planPasses.find((p) => p.code === 'pass_1y')
    assert.ok(oneYear, 'Expected pass_1y')
    assert.strictEqual(oneYear?.meta?.days, 365)
  })

  test('verifies KYC document catalog includes GSTIN and PAN as mandatory', () => {
    const kycDocs = INITIAL_MASTER_DATA.filter((m) => m.category === 'kyc_documents')
    const gstDoc = kycDocs.find((d) => d.code === 'doc_gst')
    const panDoc = kycDocs.find((d) => d.code === 'doc_pan')

    assert.ok(gstDoc, 'Expected GSTIN document option')
    assert.strictEqual(gstDoc?.meta?.mandatory, true)
    assert.ok(panDoc, 'Expected PAN card document option')
    assert.strictEqual(panDoc?.meta?.mandatory, true)
  })
})

