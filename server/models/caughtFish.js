const mongoose = require('mongoose');

const caughtFishSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  rarity: { type: String, required: true },
  length: { type: Number, required: true },
  weight: { type: mongoose.Schema.Types.Mixed, required: true },
  journalEntry: { type: String, default: "" },
  caughtAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CaughtFish', caughtFishSchema);
