// imports the tools vitest gives us (describe, it, expect, etc)
import { describe, it, expect, vi, beforeEach } from 'vitest'
// imports the real code we want to test
import { fishAssets, getFishAssetByName, getRandomFishAsset } from '../utils/fishAssets'

// the list of rarities we expect to see — used to check outputs are valid
const VALID_RARITIES = ['common', 'uncommon', 'rare', 'legendary', 'mythical', 'the one that got away']

// describe groups related tests together so the output is easy to read
describe('fishAssets data', () => {
  // it = one single test. checks every fish in the list has the right shape
  it('every entry has a name, rarity, and imagePath', () => {
    for (const fish of fishAssets) {
      expect(typeof fish.name).toBe('string')
      expect(fish.name.length).toBeGreaterThan(0)
      expect(VALID_RARITIES).toContain(fish.rarity)
      expect(fish.imagePath).toMatch(/^\/fish\//)
    }
  })

  // special fish use fixedLength/fixedWeight instead of a range
  it('"the one that got away" fish have fixedLength and fixedWeight', () => {
    const specials = fishAssets.filter(f => f.rarity === 'the one that got away')
    expect(specials.length).toBeGreaterThan(0)
    for (const fish of specials) {
      expect(typeof fish.fixedLength).toBe('number')
      expect(fish.fixedWeight).toBe('how rude to ask')
    }
  })

  // normal fish should have a length/weight range instead
  it('standard rarity fish have lengthRange and weightRange', () => {
    const standard = fishAssets.filter(f => f.rarity !== 'the one that got away')
    for (const fish of standard) {
      expect(Array.isArray(fish.lengthRange)).toBe(true)
      expect(Array.isArray(fish.weightRange)).toBe(true)
    }
  })
})

// tests for the "find a fish by name" function
describe('getFishAssetByName', () => {
  it('returns the correct asset for a known name', () => {
    const fish = getFishAssetByName('Salmon')
    expect(fish).toBeDefined()
    expect(fish?.rarity).toBe('common')
  })

  // if the name does not exist, we should get undefined back (not a crash)
  it('returns undefined for an unknown name', () => {
    expect(getFishAssetByName('Shark')).toBeUndefined()
    expect(getFishAssetByName('')).toBeUndefined()
  })

  // "salmon" != "Salmon" — names must match exactly
  it('is case-sensitive', () => {
    expect(getFishAssetByName('salmon')).toBeUndefined()
  })
})

// tests the random fish picker. we fake Math.random so the "random" roll is predictable
describe('getRandomFishAsset', () => {
  // beforeEach runs before every test — here we reset fake Math.random
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns an asset with required fields', () => {
    const fish = getRandomFishAsset()
    expect(fish).toHaveProperty('name')
    expect(fish).toHaveProperty('rarity')
    expect(fish).toHaveProperty('imagePath')
  })

  // run it 100 times to make sure no roll ever returns a bad rarity
  it('always returns a valid rarity across 100 rolls', () => {
    for (let i = 0; i < 100; i++) {
      expect(VALID_RARITIES).toContain(getRandomFishAsset().rarity)
    }
  })

  // vi.spyOn lets us force Math.random to return a fixed value, so we can test each rarity branch
  it('roll < 0.6 picks a common fish', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    expect(getRandomFishAsset().rarity).toBe('common')
  })

  it('0.6 <= roll < 0.75 picks an uncommon fish', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.6)
    expect(getRandomFishAsset().rarity).toBe('uncommon')
  })

  it('0.75 <= roll < 0.87 picks a rare fish', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.75)
    expect(getRandomFishAsset().rarity).toBe('rare')
  })

  it('0.87 <= roll < 0.9 picks a legendary fish', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.87)
    expect(getRandomFishAsset().rarity).toBe('legendary')
  })

  it('0.9 <= roll < 0.99 picks a mythical fish', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9)
    expect(getRandomFishAsset().rarity).toBe('mythical')
  })

  it('roll >= 0.99 picks "the one that got away"', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.995)
    expect(getRandomFishAsset().rarity).toBe('the one that got away')
  })
})
