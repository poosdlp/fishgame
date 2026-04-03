const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('../models/user');
const RefreshToken = require('../models/refreshToken');
const { hashToken, rotateRefreshToken } = require('../utils/tokens');
const {
  createJti,
  signAccessToken,
  signRefreshToken,
  persistRefreshToken,
  setRefreshCookie
} = require('../utils/tokens');
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse
} = require('@simplewebauthn/server');

const router = express.Router();

// In-memory store for challenges (use Redis in production)
const challengeStore = new Map();

function extractChallengeFromAuthenticationResponse(response) {
  const clientDataJSON = response?.response?.clientDataJSON;
  if (!clientDataJSON) return null;

  try {
    const parsed = JSON.parse(Buffer.from(clientDataJSON, 'base64url').toString('utf8'));
    return parsed.challenge || null;
  } catch {
    return null;
  }
}

function getExpectedOrigin(req) {
  if (process.env.EXPECTED_ORIGIN) return process.env.EXPECTED_ORIGIN;
  const forwardedProto = req.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const forwardedHost = req.get('x-forwarded-host')?.split(',')[0]?.trim();
  const proto = forwardedProto || req.protocol;
  const host = forwardedHost || req.get('host');
  return `${proto}://${host}`;
}

function getRpId(req) {
  if (process.env.RP_ID) return process.env.RP_ID;
  const forwardedHost = req.get('x-forwarded-host')?.split(',')[0]?.trim();
  const host = forwardedHost || req.get('host') || 'localhost';
  return host.split(':')[0];
}

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login and issue JWT
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const accessToken = signAccessToken(user);

    const jti = createJti();
    const refreshToken = signRefreshToken(user, jti);

    await persistRefreshToken({
      user,
      refreshToken,
      jti,
      ip: req.ip,
      userAgent: req.headers['user-agent'] || ''
    });

    setRefreshCookie(res, refreshToken);

    res.json({ accessToken });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Refresh access token
router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies?.refresh_token;
    if (!token) return res.status(401).json({ message: 'No refresh token' });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    const tokenHash = hashToken(token);
    const doc = await RefreshToken.findOne({ tokenHash, jti: decoded.jti }).populate('user');

    if (!doc) {
      return res.status(401).json({ message: 'Refresh token not recognized' });
    }
    if (doc.revokedAt) {
      return res.status(401).json({ message: 'Refresh token revoked' });
    }
    if (doc.expiresAt < new Date()) {
      return res.status(401).json({ message: 'Refresh token expired' });
    }

    const result = await rotateRefreshToken(doc, doc.user, req, res);
    return res.json({ accessToken: result.accessToken });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout and revoke refresh token
router.post('/logout', async (req, res) => {
  try {
    const token = req.cookies?.refresh_token;
    if (token) {
      const tokenHash = hashToken(token);
      const doc = await RefreshToken.findOne({ tokenHash });
      if (doc && !doc.revokedAt) {
        doc.revokedAt = new Date();
        await doc.save();
      }
    }
    res.clearCookie('refresh_token', { path: '/api/auth/refresh' });
    res.json({ message: 'Logged out' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Who am I endpoint
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('username email');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ id: user._id, email: user.email, username: user.username });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Passkey registration options
router.post('/passkey/register/options', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const rpID = getRpId(req);

    const options = await generateRegistrationOptions({
      rpName: 'Fish Game',
      rpID,
      // SimpleWebAuthn now expects userID as bytes, not a string.
      userID: Buffer.from(user._id.toString(), 'utf8'),
      userName: user.username,
      userDisplayName: user.username,
      attestationType: 'direct',
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'preferred'
      },
      excludeCredentials: user.passkeys.map(passkey => ({
        id: passkey.credentialId,
        type: 'public-key',
        transports: passkey.transports
      }))
    });

    // Store challenge for verification
    challengeStore.set(user._id.toString(), options.challenge);

    res.json(options);
  } catch (err) {
    console.error('Passkey registration options error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Passkey registration verification
router.post('/passkey/register/verify', async (req, res) => {
  try {
    const { email, response } = req.body;
    if (!email || !response) return res.status(400).json({ message: 'Email and response required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const expectedChallenge = challengeStore.get(user._id.toString());
    if (!expectedChallenge) return res.status(400).json({ message: 'No challenge found' });

    const expectedOrigin = getExpectedOrigin(req);
    const expectedRPID = getRpId(req);

    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin,
      expectedRPID
    });

    if (!verification.verified) {
      return res.status(400).json({ message: 'Passkey verification failed' });
    }

    const registrationInfo = verification.registrationInfo;
    if (!registrationInfo?.credential?.id || !registrationInfo?.credential?.publicKey) {
      return res.status(400).json({ message: 'Invalid passkey registration data' });
    }

    // Store the passkey from SimpleWebAuthn's current registrationInfo shape
    user.passkeys.push({
      credentialId: registrationInfo.credential.id,
      publicKey: Buffer.from(registrationInfo.credential.publicKey),
      counter: registrationInfo.credential.counter,
      transports: registrationInfo.credential.transports || response.response.transports || []
    });

    await user.save();

    // Clean up challenge
    challengeStore.delete(user._id.toString());

    res.json({ message: 'Passkey registered successfully' });
  } catch (err) {
    console.error('Passkey registration verification error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Passkey authentication options
router.post('/passkey/authenticate/options', async (req, res) => {
  try {
    const { email } = req.body;

    const rpID = getRpId(req);

    let allowCredentials;
    if (email) {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: 'User not found' });

      if (user.passkeys.length === 0) {
        return res.status(400).json({ message: 'No passkeys registered for this user' });
      }

      allowCredentials = user.passkeys.map(passkey => ({
        id: passkey.credentialId,
        type: 'public-key',
        transports: passkey.transports
      }));
    }

    const options = await generateAuthenticationOptions({
      rpID,
      ...(allowCredentials ? { allowCredentials } : {})
    });

    // Store challenge for verification
    challengeStore.set(options.challenge, true);

    res.json(options);
  } catch (err) {
    console.error('Passkey authentication options error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Passkey authentication verification
router.post('/passkey/authenticate/verify', async (req, res) => {
  try {
    const { email, response } = req.body;
    if (!response) return res.status(400).json({ message: 'Authentication response required' });

    const expectedChallenge = extractChallengeFromAuthenticationResponse(response);
    if (!expectedChallenge || !challengeStore.has(expectedChallenge)) {
      return res.status(400).json({ message: 'No challenge found' });
    }

    let user;
    if (email) {
      user = await User.findOne({ email });
    } else {
      user = await User.findOne({ 'passkeys.credentialId': response.id });
    }
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Find the passkey that was used
    const passkey = user.passkeys.find(pk => pk.credentialId === response.id);
    if (!passkey) return res.status(400).json({ message: 'Passkey not found' });

    const expectedOrigin = getExpectedOrigin(req);
    const expectedRPID = getRpId(req);

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin,
      expectedRPID,
      credential: {
        id: passkey.credentialId,
        publicKey: new Uint8Array(passkey.publicKey),
        counter: passkey.counter,
        transports: passkey.transports
      }
    });

    if (!verification.verified) {
      return res.status(400).json({ message: 'Passkey authentication failed' });
    }

    // Update counter
    passkey.counter = verification.authenticationInfo.newCounter;
    await user.save();

    // Clean up challenge
    challengeStore.delete(expectedChallenge);

    // Issue JWT tokens
    const accessToken = signAccessToken(user);

    const jti = createJti();
    const refreshToken = signRefreshToken(user, jti);

    await persistRefreshToken({
      user,
      refreshToken,
      jti,
      ip: req.ip,
      userAgent: req.headers['user-agent'] || ''
    });

    setRefreshCookie(res, refreshToken);

    res.json({ accessToken });
  } catch (err) {
    console.error('Passkey authentication verification error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;