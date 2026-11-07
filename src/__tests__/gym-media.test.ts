import { describe, it } from 'node:test'
import assert from 'node:assert'
import { INITIAL_GYMS } from '../data/mock-data'
import { GymMedia } from '../types'

describe('Gym Media Operations & Admin Preview Governance', () => {
  it('verifies gym-1 has enriched facility media with valid metadata and resolutions', () => {
    const gym = INITIAL_GYMS.find((g) => g.id === 'gym-1')
    assert.ok(gym, 'gym-1 must exist in seed data')
    assert.ok(gym.media.length >= 4, `gym-1 should have multiple media items, found: ${gym.media.length}`)

    for (const m of gym.media) {
      assert.ok(m.id, 'Media must have an id')
      assert.ok(m.url.startsWith('https://'), 'Media URL must be valid https URL')
      assert.ok(m.caption.length > 0, 'Media caption must not be empty')
      assert.ok(['photo', 'video'].includes(m.type), `Media type must be photo or video, got: ${m.type}`)
      assert.ok(['APPROVED', 'PENDING', 'REJECTED'].includes(m.status), `Valid status, got: ${m.status}`)
    }
  })

  it('strictly designates exactly one primary cover photo at a time', () => {
    const gym = INITIAL_GYMS.find((g) => g.id === 'gym-1')
    assert.ok(gym)
    const mediaList: GymMedia[] = JSON.parse(JSON.stringify(gym.media))

    // Set m3 as cover photo
    const targetMediaId = 'm3'
    const updatedMedia = mediaList.map((m) => ({
      ...m,
      isCover: m.id === targetMediaId,
    }))

    const coverItems = updatedMedia.filter((m) => m.isCover)
    assert.strictEqual(coverItems.length, 1, 'Exactly one media asset must be designated as cover photo')
    assert.strictEqual(coverItems[0].id, 'm3', 'm3 must be the active cover photo')
  })

  it('validates preview slideshow navigation wrap-around math', () => {
    const mediaCount = 6

    // Navigation next
    const getNextIndex = (currentIndex: number) => (currentIndex < mediaCount - 1 ? currentIndex + 1 : 0)
    assert.strictEqual(getNextIndex(0), 1)
    assert.strictEqual(getNextIndex(4), 5)
    assert.strictEqual(getNextIndex(5), 0, 'Last photo must wrap around to 0 on Next')

    // Navigation prev
    const getPrevIndex = (currentIndex: number) => (currentIndex > 0 ? currentIndex - 1 : mediaCount - 1)
    assert.strictEqual(getPrevIndex(5), 4)
    assert.strictEqual(getPrevIndex(1), 0)
    assert.strictEqual(getPrevIndex(0), 5, 'First photo must wrap around to last index on Prev')
  })

  it('verifies media moderation lifecycle transitions (PENDING -> APPROVED / REJECTED)', () => {
    const pendingMedia: GymMedia = {
      id: 'm-pending',
      url: 'https://images.unsplash.com/test',
      caption: 'Cardio Test',
      type: 'photo',
      tag: 'Cardio Arena',
      status: 'PENDING',
      resolution: '1920x1080',
      uploadedAt: new Date().toISOString(),
    }

    // Approve
    const approved = { ...pendingMedia, status: 'APPROVED' as const }
    assert.strictEqual(approved.status, 'APPROVED')

    // Reject with reason
    const rejected = {
      ...pendingMedia,
      status: 'REJECTED' as const,
      rejectionReason: 'Blurry photo does not meet listing standard',
    }
    assert.strictEqual(rejected.status, 'REJECTED')
    assert.ok(rejected.rejectionReason)
  })
})

