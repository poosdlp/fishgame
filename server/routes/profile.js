const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/user');

const router = express.Router();

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

module.exports = router;