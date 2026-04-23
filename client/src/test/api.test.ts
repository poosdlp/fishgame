// vitest tools for testing
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// functions we are testing
import { apiUrl, wsUrl } from '../api'

// group of tests for apiUrl
describe('apiUrl', () => {

  // checks if correct path is returned when slash exists
  it('appends a path with leading slash', () => {
    expect(apiUrl('/api/fish')).toBe('/api/fish')
  })

  // makes sure function adds slash if missing (prevents broken URLs)
  it('adds a leading slash if path does not have one', () => {
    expect(apiUrl('api/fish')).toBe('/api/fish')
  })

  // ensures no double slashes (avoids invalid URLs)
  it('does not double-slash when base ends with /', () => {
    expect(apiUrl('/api/fish')).not.toMatch(/\/\//)
  })
})

// group of tests for wsUrl (websocket URL builder)
describe('wsUrl', () => {

  // save original browser location
  const originalLocation = window.location

  beforeEach(() => {
    // fake browser origin for testing (so tests are consistent)
    vi.stubGlobal('location', { ...originalLocation, origin: 'http://localhost:3000' })
  })

  afterEach(() => {
    // reset mocks after each test (prevents bugs between tests)
    vi.unstubAllGlobals()
  })

  // checks correct protocol for http (ws://)
  it('uses ws:// for http origins', () => {
    const url = wsUrl('mytoken')
    expect(url).toMatch(/^ws:\/\//)
  })

  // checks secure protocol for https (wss://)
  it('uses wss:// for https origins', () => {
    vi.stubGlobal('location', { ...originalLocation, origin: 'https://example.com' })
    const url = wsUrl('mytoken')
    expect(url).toMatch(/^wss:\/\//)
  })

  // ensures token is included (needed for auth)
  it('includes the token as a query param', () => {
    const url = wsUrl('abc123')
    expect(url).toContain('token=abc123')
  })

  // ensures special characters are encoded (prevents broken URLs)
  it('URL-encodes special characters in the token', () => {
    const url = wsUrl('tok en+val')
    expect(url).toContain('token=tok%20en%2Bval')
  })
})