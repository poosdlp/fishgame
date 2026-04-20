const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  emailVerificationToken: { type: String },
  emailVerified: { type: Boolean, default: false },
  password: { type: String, required: true },
  resetToken: { type: String },
  resetTokenExpires: { type: Date }
});

module.exports = mongoose.model('User', userSchema);