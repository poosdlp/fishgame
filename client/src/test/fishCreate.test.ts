// vitest tools for writing tests
import { describe, it, expect, vi, beforeEach } from 'vitest'
// the function we are testing
import { createFish } from '../utils/fishCreate'
// lake size constants — used to check spawn coords are right
import { LakeWidth, LakeHeight } from '../data/lakeDim'

// describe = group of tests for one thing (createFish)
describe('createFish', () => {
  // reset any fake Math.random before each test so they don't mess each other up
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // check the returned fish has every field the game needs
  it('returns an object with all required fields', () => {
    const fish = createFish()
    expect(fish).toHaveProperty('id')
    expect(fish).toHaveProperty('name')
    expect(fish).toHaveProperty('rarity')
    expect(fish).toHaveProperty('imagePath')
    expect(fish).toHaveProperty('x')
    expect(fish).toHaveProperty('y')
    expect(fish).toHaveProperty('vx')
    expect(fish).toHaveProperty('vy')
    expect(fish).toHaveProperty('behavior')
    expect(fish).toHaveProperty('tapCount')
    expect(fish).toHaveProperty('requiredTaps')
  })

  // a new fish should start clean — swimming, 0 taps done
  it('starts with behavior "swimming" and tapCount 0', () => {
    const fish = createFish()
    expect(fish.behavior).toBe('swimming')
    expect(fish.tapCount).toBe(0)
  })

  // the code does Math.floor(Math.random() * 5) + 3 so result must be 3 to 7
  it('requiredTaps is between 3 and 7', () => {
    for (let i = 0; i < 50; i++) {
      const fish = createFish()
      expect(fish.requiredTaps).toBeGreaterThanOrEqual(3)
      expect(fish.requiredTaps).toBeLessThanOrEqual(7)
    }
  })

  it('id is a non-empty string', () => {
    const fish = createFish()
    expect(typeof fish.id).toBe('string')
    expect(fish.id.length).toBeGreaterThan(0)
  })

  // Set = collection without duplicates. if size is 50, all 50 ids are unique
  it('each fish gets a unique id', () => {
    const ids = new Set(Array.from({ length: 50 }, () => createFish().id))
    expect(ids.size).toBe(50)
  })

  // fish spawn outside the lake and should swim toward the middle
  it('velocity points toward the center of the lake', () => {
    const fish = createFish()
    const centerX = LakeWidth / 2
    const centerY = LakeHeight / 2
    if (fish.x < centerX) expect(fish.vx).toBeGreaterThan(0)
    if (fish.x > centerX) expect(fish.vx).toBeLessThan(0)
    if (fish.y < centerY) expect(fish.vy).toBeGreaterThan(0)
    if (fish.y > centerY) expect(fish.vy).toBeLessThan(0)
  })

  // mockReturnValueOnce = only fake the FIRST call to Math.random (the side pick)
  // mockReturnValue = fake every call after that
  // this way we force side = 0 (left edge) and check x lands at -20
  it('spawns off the left edge when side === 0', () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0)
      .mockReturnValue(0.5)
    const fish = createFish()
    expect(fish.x).toBe(-20)
  })

  // 0.25 * 4 = 1, so side = 1 (right edge)
  it('spawns off the right edge when side === 1', () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.25)
      .mockReturnValue(0.5)
    const fish = createFish()
    expect(fish.x).toBe(LakeWidth + 20)
  })

  // 0.5 * 4 = 2, so side = 2 (top edge)
  it('spawns off the top edge when side === 2', () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.5)
      .mockReturnValue(0.5)
    const fish = createFish()
    expect(fish.y).toBe(-20)
  })

  // 0.75 * 4 = 3, so side = 3 (bottom edge)
  it('spawns off the bottom edge when side === 3', () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.75)
      .mockReturnValue(0.5)
    const fish = createFish()
    expect(fish.y).toBe(LakeHeight + 20)
  })
})
