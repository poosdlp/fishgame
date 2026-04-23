const jwt = require('jsonwebtoken')

process.env.JWT_SECRET = 'test-secret'

const auth = require('../middleware/auth')

function makeRes() {
  const res = {}
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res
}

describe('auth middleware', () => {
  it('calls next() with a valid Bearer token', () => {
    const token = jwt.sign({ id: 'u1', email: 'a@b.com' }, process.env.JWT_SECRET)
    const req = { headers: { authorization: `Bearer ${token}` } }
    const res = makeRes()
    const next = vi.fn()

    auth(req, res, next)

    expect(next).toHaveBeenCalledOnce()
    expect(req.user).toEqual({ id: 'u1', email: 'a@b.com' })
  })

  it('returns 401 when Authorization header is missing', () => {
    const req = { headers: {} }
    const res = makeRes()
    const next = vi.fn()

    auth(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('returns 401 when scheme is not Bearer', () => {
    const req = { headers: { authorization: 'Basic sometoken' } }
    const res = makeRes()
    const next = vi.fn()

    auth(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('returns 401 with "Access token expired" for an expired token', () => {
    const token = jwt.sign({ id: 'u1', email: 'a@b.com' }, process.env.JWT_SECRET, { expiresIn: -1 })
    const req = { headers: { authorization: `Bearer ${token}` } }
    const res = makeRes()
    const next = vi.fn()

    auth(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ message: 'Access token expired' })
    expect(next).not.toHaveBeenCalled()
  })

  it('returns 401 with "Invalid token" for a tampered token', () => {
    const req = { headers: { authorization: 'Bearer thisisnotavalidjwt' } }
    const res = makeRes()
    const next = vi.fn()

    auth(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' })
    expect(next).not.toHaveBeenCalled()
  })
})
