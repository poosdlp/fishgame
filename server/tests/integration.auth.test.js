process.env.JWT_SECRET = 'test-access-secret'
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret'
process.env.RESEND_API_KEY = 're_test_key'

const request = require('supertest')

const mongoose = require('mongoose')
const User = require('../models/user')
const RefreshToken = require('../models/refreshToken')
const emailUtil = require('../utils/email')
const app = require('../app')

emailUtil.sendEmailVerificationEmail = vi.fn()
emailUtil.sendPasswordResetEmail = vi.fn()

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('POST /auth/register', () => {
  it('returns 201 when registering a new user', async () => {
    vi.spyOn(User, 'findOne').mockResolvedValue(null)
    vi.spyOn(mongoose.Model.prototype, 'save').mockResolvedValue(true)

    const res = await request(app)
      .post('/auth/register')
      .send({ username: 'Marcus', email: 'marcus@test.com', password: 'pass123' })

    expect(res.status).toBe(201)
    expect(res.body.message).toBe('User created successfully')
  })

  it('returns 400 when the email is already registered', async () => {
    vi.spyOn(User, 'findOne').mockResolvedValue({ email: 'marcus@test.com' })

    const res = await request(app)
      .post('/auth/register')
      .send({ username: 'Marcus', email: 'marcus@test.com', password: 'pass123' })

    expect(res.status).toBe(400)
    expect(res.body.message).toBe('User already exists')
  })
})

describe('POST /auth/login', () => {
  it('returns 400 when user does not exist', async () => {
    vi.spyOn(User, 'findOne').mockResolvedValue(null)

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'nobody@test.com', password: 'pass123' })

    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Invalid credentials')
  })

  it('returns 400 when password is wrong', async () => {
    vi.spyOn(User, 'findOne').mockResolvedValue({
      _id: { toString: () => 'u1' },
      email: 'marcus@test.com',
      password: 'wronghash',
      emailVerified: true,
    })

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'marcus@test.com', password: 'wrongpassword' })

    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Invalid credentials')
  })

  it('returns 400 when email is not verified', async () => {
    const bcrypt = require('bcryptjs')
    const hash = await bcrypt.hash('pass123', 10)

    vi.spyOn(User, 'findOne').mockResolvedValue({
      _id: { toString: () => 'u1' },
      email: 'marcus@test.com',
      password: hash,
      emailVerified: false,
    })

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'marcus@test.com', password: 'pass123' })

    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Please verify your email first')
  })

  it('returns 200 with an accessToken on valid login', async () => {
    const bcrypt = require('bcryptjs')
    const hash = await bcrypt.hash('pass123', 10)

    vi.spyOn(User, 'findOne').mockResolvedValue({
      _id: { toString: () => 'u1' },
      email: 'marcus@test.com',
      password: hash,
      emailVerified: true,
    })
    vi.spyOn(RefreshToken, 'create').mockResolvedValue(true)

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'marcus@test.com', password: 'pass123' })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('accessToken')
  })
})

describe('POST /auth/logout', () => {
  it('returns 200 even with no refresh cookie', async () => {
    const res = await request(app).post('/auth/logout')
    expect(res.status).toBe(200)
    expect(res.body.message).toBe('Logged out')
  })
})

describe('POST /auth/refresh', () => {
  it('returns 401 when no refresh cookie is present', async () => {
    const res = await request(app).post('/auth/refresh')
    expect(res.status).toBe(401)
    expect(res.body.message).toBe('No refresh token')
  })
})
