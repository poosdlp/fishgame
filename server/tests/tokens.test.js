const jwt = require('jsonwebtoken')

process.env.JWT_SECRET = 'test-access-secret'
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret'

vi.mock('../models/refreshToken', () => ({
  default: { create: vi.fn() },
}))

const { hashToken, createJti, signAccessToken, signRefreshToken } = require('../utils/tokens')

describe('hashToken', () => {
  it('returns a 64-char hex string', () => {
    expect(hashToken('sometoken')).toMatch(/^[a-f0-9]{64}$/)
  })

  it('is deterministic', () => {
    expect(hashToken('abc')).toBe(hashToken('abc'))
  })

  it('different inputs produce different hashes', () => {
    expect(hashToken('a')).not.toBe(hashToken('b'))
  })
})

describe('createJti', () => {
  it('returns a 32-char hex string', () => {
    expect(createJti()).toMatch(/^[a-f0-9]{32}$/)
  })

  it('produces unique values', () => {
    const ids = new Set(Array.from({ length: 100 }, createJti))
    expect(ids.size).toBe(100)
  })
})

describe('signAccessToken', () => {
  const fakeUser = { _id: { toString: () => 'user123' }, email: 'test@example.com' }

  it('returns a valid JWT with correct payload', () => {
    const token = signAccessToken(fakeUser)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    expect(decoded.id).toBe('user123')
    expect(decoded.email).toBe('test@example.com')
  })

  it('expires in 60 minutes', () => {
    const token = signAccessToken(fakeUser)
    const decoded = jwt.decode(token)
    expect(decoded.exp - decoded.iat).toBe(60 * 60)
  })
})

describe('signRefreshToken', () => {
  const fakeUser = { _id: { toString: () => 'user456' }, email: 'other@example.com' }

  it('returns a valid JWT with the correct jti', () => {
    const jti = createJti()
    const token = signRefreshToken(fakeUser, jti)
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
    expect(decoded.id).toBe('user456')
    expect(decoded.jti).toBe(jti)
  })

  it('expires in 7 days', () => {
    const jti = createJti()
    const token = signRefreshToken(fakeUser, jti)
    const decoded = jwt.decode(token)
    expect(decoded.exp - decoded.iat).toBe(60 * 60 * 24 * 7)
  })
})
