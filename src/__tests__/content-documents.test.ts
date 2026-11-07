import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { INITIAL_CONTENT_DOCUMENTS } from '../data/mock-data'
import { NAVIGATION_ITEMS } from '../config/navigation'

describe('Content & Static Legal Pages Governance Rules', () => {
  it('verifies baseline legal documents cover all 4 target platforms separately', () => {
    assert.ok(INITIAL_CONTENT_DOCUMENTS.length >= 14, 'Must have at least 14 canonical legal documents')

    const platforms = new Set(INITIAL_CONTENT_DOCUMENTS.map((d) => d.platform))
    assert.ok(platforms.has('member_app'), 'Must have documents for Member Mobile App')
    assert.ok(platforms.has('partner_desk'), 'Must have documents for Partner Gym Desk')
    assert.ok(platforms.has('web_portal'), 'Must have documents for Public Web Portal')
    assert.ok(platforms.has('platform_wide'), 'Must have platform-wide statutory legal notices')
  })

  it('verifies Member Mobile App has dedicated Terms, Privacy, and Refund policies', () => {
    const memberDocs = INITIAL_CONTENT_DOCUMENTS.filter((d) => d.platform === 'member_app')
    const categories = memberDocs.map((d) => d.category)

    assert.ok(categories.includes('terms_of_service'), 'Member App must have Terms of Service')
    assert.ok(categories.includes('privacy_policy'), 'Member App must have Privacy Policy')
    assert.ok(categories.includes('refund_cancellation'), 'Member App must have Refund & Cancellation policy')
    assert.ok(categories.includes('community_guidelines'), 'Member App must have Community Guidelines')
  })

  it('verifies Partner Gym Desk has dedicated Commercial Agreement and Razorpay Route Payout Terms', () => {
    const partnerDocs = INITIAL_CONTENT_DOCUMENTS.filter((d) => d.platform === 'partner_desk')
    const categories = partnerDocs.map((d) => d.category)

    assert.ok(categories.includes('partner_agreement'), 'Partner Desk must have Commercial Agreement')
    assert.ok(categories.includes('privacy_policy'), 'Partner Desk must have Partner Privacy Policy')
    assert.ok(categories.includes('refund_cancellation'), 'Partner Desk must have Payout & Settlement Rules')
  })

  it('verifies Public Web Portal has dedicated Terms of Use, Privacy, and About Us pages', () => {
    const webDocs = INITIAL_CONTENT_DOCUMENTS.filter((d) => d.platform === 'web_portal')
    const categories = webDocs.map((d) => d.category)

    assert.ok(categories.includes('terms_of_service'), 'Web portal must have Terms of Use')
    assert.ok(categories.includes('privacy_policy'), 'Web portal must have Privacy Policy')
    assert.ok(categories.includes('about_us'), 'Web portal must have About Us page')
  })

  it('enforces unique slugs, valid versions, and non-empty content across all documents', () => {
    const slugs = new Set<string>()

    for (const doc of INITIAL_CONTENT_DOCUMENTS) {
      assert.ok(!slugs.has(doc.slug), `Duplicate slug detected: ${doc.slug}`)
      slugs.add(doc.slug)

      assert.ok(doc.title && doc.title.length > 3, `Document title too short: ${doc.id}`)
      assert.ok(doc.version.startsWith('v'), `Version should start with 'v': ${doc.version}`)
      assert.ok(doc.content.length > 50, `Document content must be substantial: ${doc.title}`)
      assert.equal(doc.status, 'published', `Default initial policy must be published: ${doc.title}`)
    }
  })

  it('verifies Content & Legal navigation item is configured before Staff and Settings', () => {
    const contentIndex = NAVIGATION_ITEMS.findIndex((n) => n.title === 'Content & Legal')
    const staffIndex = NAVIGATION_ITEMS.findIndex((n) => n.title === 'Staff')
    const settingsIndex = NAVIGATION_ITEMS.findIndex((n) => n.title === 'Settings')

    assert.ok(contentIndex !== -1, 'Content & Legal must exist in navigation')
    assert.ok(staffIndex !== -1, 'Staff must exist in navigation')
    assert.ok(settingsIndex !== -1, 'Settings must exist in navigation')
    assert.ok(contentIndex < staffIndex, 'Content & Legal must come before Staff')
    assert.equal(NAVIGATION_ITEMS[contentIndex].href, '/content')
  })
})

