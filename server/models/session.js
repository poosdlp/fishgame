const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true, index: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'expired'],
    default: 'pending'
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Grace period: MongoDB deletes 5 minutes after expiresAt so the app-level
// expiry logic handles it first without races.
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 300 });

module.exports = mongoose.model('Session', sessionSchema);
