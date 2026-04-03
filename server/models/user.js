const mongoose = require('mongoose');

const passkeySchema = new mongoose.Schema({
  credentialId: { type: String, required: true },
  publicKey: { type: Buffer, required: true },
  counter: { type: Number, default: 0 },
  transports: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional for passkey-only users
  passkeys: [passkeySchema]
});

module.exports = mongoose.model('User', userSchema);