const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  tokenHash: { type: String, required: true, unique: true },
  jti: { type: String, required: true, index: true },
  expiresAt: { type: Date, required: true, index: true },
  revokedAt: { type: Date, default: null },
  replacedBy: { type: String, default: null }, // new jti when rotated
  createdAt: { type: Date, default: Date.now },
  ip: String,
  userAgent: String
});

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);