const { fishTypes, getRandomFish, isValidFishName, VALID_RARITIES } = require('../data/fish')

describe('isValidFishName', () => {
  it('returns true for known fish names', () => {
    expect(isValidFishName('Salmon')).toBe(true)
    expect(isValidFishName('Golden Koi')).toBe(true)
    expect(isValidFishName('livia fish')).toBe(true)
  })

  it('returns false for unknown names', () => {
    expect(isValidFishName('Shark')).toBe(false)
    expect(isValidFishName('')).toBe(false)
  })

  it('is case-sensitive', () => {
    expect(isValidFishName('salmon')).toBe(false)
  })
})

describe('getRandomFish', () => {
  it('returns a fish with all required fields', () => {
    const fish = getRandomFish()
    expect(fish).toHaveProperty('name')
    expect(fish).toHaveProperty('rarity')
    expect(fish).toHaveProperty('length')
    expect(fish).toHaveProperty('weight')
    expect(fish).toHaveProperty('journalEntry')
  })

  it('always returns a valid rarity across 100 rolls', () => {
    for (let i = 0; i < 100; i++) {
      expect(VALID_RARITIES).toContain(getRandomFish().rarity)
    }
  })

  it('always returns a known fish name', () => {
    for (let i = 0; i < 100; i++) {
      expect(isValidFishName(getRandomFish().name)).toBe(true)
    }
  })

  it('roll < 0.6 gives a common fish', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    expect(getRandomFish().rarity).toBe('common')
    vi.restoreAllMocks()
  })

  it('0.6 <= roll < 0.75 gives an uncommon fish', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.6)
    expect(getRandomFish().rarity).toBe('uncommon')
    vi.restoreAllMocks()
  })

  it('0.75 <= roll < 0.87 gives a rare fish', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.75)
    expect(getRandomFish().rarity).toBe('rare')
    vi.restoreAllMocks()
  })

  it('0.87 <= roll < 0.9 gives a legendary fish', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.87)
    expect(getRandomFish().rarity).toBe('legendary')
    vi.restoreAllMocks()
  })

  it('0.9 <= roll < 0.99 gives a mythical fish', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9)
    expect(getRandomFish().rarity).toBe('mythical')
    vi.restoreAllMocks()
  })

  it('roll >= 0.99 gives "the one that got away" with fixed weight', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.995)
    const fish = getRandomFish()
    expect(fish.rarity).toBe('the one that got away')
    expect(fish.weight).toBe('how rude to ask')
    vi.restoreAllMocks()
  })

  it('common fish length is in the expected range', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const fish = getRandomFish()
    expect(fish.length).toBeGreaterThanOrEqual(20)
    expect(fish.length).toBeLessThanOrEqual(59)
    vi.restoreAllMocks()
  })
})

describe('fishTypes data', () => {
  it('every fish has a name and valid rarity', () => {
    for (const fish of fishTypes) {
      expect(typeof fish.name).toBe('string')
      expect(fish.name.length).toBeGreaterThan(0)
      expect(VALID_RARITIES).toContain(fish.rarity)
    }
  })
})
