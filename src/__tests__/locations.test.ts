import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { INITIAL_LOCALITIES, INITIAL_CITIES } from '../data/mock-data'
import { NAVIGATION_ITEMS } from '../config/navigation'

describe('Locations & Operating Cities Governance Rules', () => {
  it('verifies default operating cities contain Ludhiana, Punjab', () => {
    assert.ok(INITIAL_CITIES.length >= 1, 'Should have at least 1 operating city')
    const ludhiana = INITIAL_CITIES.find((c) => c.name.toLowerCase() === 'ludhiana')
    assert.ok(ludhiana, 'Ludhiana must be an operating city')
    assert.equal(ludhiana?.state, 'Punjab')
  })

  it('verifies all default localities belong to valid cities and have PIN codes', () => {
    assert.ok(INITIAL_LOCALITIES.length >= 6, 'Should have at least 6 operating localities')
    
    for (const loc of INITIAL_LOCALITIES) {
      assert.ok(loc.id, 'Locality must have an id')
      assert.ok(loc.name, 'Locality must have a name')
      assert.ok(loc.pincode && loc.pincode.length === 6, `Locality ${loc.name} must have a valid 6-digit PIN code`)
      assert.ok(['Tier 1', 'Tier 2', 'Tier 3'].includes(loc.tier), `Locality ${loc.name} must have a valid Tier`)
      assert.equal(loc.active, true, `Locality ${loc.name} must be active by default`)
      assert.ok(loc.maxFeaturedSlots >= 1, `Locality ${loc.name} must support at least 1 featured slot`)
    }
  })

  it('verifies core Ludhiana localities exist for partner gym onboarding', () => {
    const locNames = INITIAL_LOCALITIES.map((l) => l.name.toLowerCase())
    const expected = ['model town', 'sarabha nagar', 'brs nagar', 'pakhowal road', 'dugri', 'civil lines']
    
    for (const exp of expected) {
      assert.ok(
        locNames.includes(exp),
        `Core operating locality "${exp}" must be configured in database for gym onboarding`
      )
    }
  })

  it('verifies Locations navigation item is configured right below Gyms', () => {
    const gymsIndex = NAVIGATION_ITEMS.findIndex((n) => n.title === 'Gyms')
    const locationsIndex = NAVIGATION_ITEMS.findIndex((n) => n.title === 'Locations')

    assert.ok(gymsIndex !== -1, 'Gyms must exist in navigation')
    assert.ok(locationsIndex !== -1, 'Locations must exist in navigation')
    assert.equal(locationsIndex, gymsIndex + 1, 'Locations must be placed directly below Gyms')
    assert.equal(NAVIGATION_ITEMS[locationsIndex].href, '/localities')
  })
})
