const crypto = require('crypto');
const express = require('express');
const auth = require('../middleware/auth');
const Session = require('../models/session');
const User = require('../models/user');
const {
  signAccessToken,
  createJti,
  signRefreshToken,
  persistRefreshToken,
  setRefreshCookie
} = require('../utils/tokens');

const router = express.Router();

const SESSION_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Web client creates a pending session
router.post('/create', async (req, res) => {
  try {
    const sessionId = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

    await Session.create({ sessionId, expiresAt });

    res.json({ sessionId, expiresAt });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Web client polls for approval
router.get('/:sessionId/status', async (req, res) => {
  try {
    const doc = await Session.findOne({ sessionId: req.params.sessionId });

    if (!doc) {
      return res.status(404).json({ message: 'Session not found' });
    }
    if (doc.expiresAt < new Date()) {
      doc.status = 'expired';
      await doc.save();
      return res.json({ status: 'expired' });
    }
    if (doc.status === 'pending') {
      return res.json({ status: 'pending' });
    }
    if (doc.status === 'approved') {
      const user = await User.findById(doc.user);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Issue tokens for the web session
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

      // Mark session consumed so tokens can't be issued again
      // await Session.deleteOne({ _id: doc._id });

      return res.json({ status: 'approved', accessToken });
    }

    res.json({ status: doc.status });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Mobile app approves a session (requires JWT auth)
router.post('/:sessionId/approve', auth, async (req, res) => {
  try {
    const doc = await Session.findOne({ sessionId: req.params.sessionId });

    if (!doc) {
      return res.status(404).json({ message: 'Session not found' });
    }
    if (doc.expiresAt < new Date()) {
      doc.status = 'expired';
      await doc.save();
      return res.status(410).json({ message: 'Session expired' });
    }
    if (doc.status !== 'pending') {
      return res.status(409).json({ message: 'Session already handled' });
    }

    doc.status = 'approved';
    doc.user = req.user.id;
    await doc.save();

    res.json({ message: 'Session approved' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
