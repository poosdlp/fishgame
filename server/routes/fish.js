const express = require('express');
const auth = require('../middleware/auth');
const CaughtFish = require('../models/caughtFish');
const { getRandomFish } = require('../data/fish');

const router = express.Router();

// Catch a fish — server rolls the fish, stores it, returns it
router.post('/catch', auth, async (req, res) => {
  try {
    const fish = getRandomFish();
    const caught = await CaughtFish.create({
      userId: req.user.id,
      name: fish.name,
      rarity: fish.rarity,
      length: fish.length,
      weight: fish.weight,
      journalEntry: fish.journalEntry,
    });
    res.status(201).json(caught);
  } catch (err) {
    res.status(500).json({ message: 'Failed to catch fish' });
  }
});

// Get user's inventory
router.get('/inventory', auth, async (req, res) => {
  try {
    const fish = await CaughtFish.find({ userId: req.user.id }).sort({ caughtAt: -1 });
    res.json(fish);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load inventory' });
  }
});

// Leaderboard — top players by total fish caught
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const leaders = await CaughtFish.aggregate([
      { $group: { _id: '$userId', totalFish: { $sum: 1 } } },
      { $sort: { totalFish: -1 } },
      { $limit: 20 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { _id: 0, username: '$user.username', totalFish: 1 } },
    ]);
    res.json(leaders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load leaderboard' });
  }
});

// Recent catches across all players
router.get('/recent', auth, async (req, res) => {
  try {
    const recent = await CaughtFish.find()
      .sort({ caughtAt: -1 })
      .limit(20)
      .populate('userId', 'username');
    const result = recent.map(f => ({
      _id: f._id,
      name: f.name,
      rarity: f.rarity,
      length: f.length,
      weight: f.weight,
      caughtAt: f.caughtAt,
      username: f.userId?.username || 'Unknown',
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load recent catches' });
  }
});

module.exports = router;
