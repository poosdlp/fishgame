const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

const url = 'mongodb://database:27017';
const client = new MongoClient(url);

const dbName = 'myapp';
let db;

async function connectDB() {
  try {
    await client.connect();
    console.log('Successfully connected to MongoDB!');
    db = client.db(dbName);
    await db.collection('leaderboard').createIndex({ points: -1 });
    await db.collection('leaderboard').createIndex({ weight: -1 });
    await db.collection('leaderboard').createIndex({ length: -1 });
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
}

connectDB();

app.use(cors());
app.use(express.json());

// health check
app.get('/', (_req, res) => {
  const isConnected = client.topology && client.topology.isConnected();
  res.json({
    status: 'success',
    databaseState: isConnected ? 'Connected' : 'Disconnected',
    message: 'a mongo is speaking. listen and learn. (mogging emoji)'
  });
});

// Get a player's inventory
app.get('/inventory/:playerName', async (req, res) => {
  const { playerName } = req.params;
  try {
    const fish = await db
      .collection('inventory')
      .find({ playerName })
      .sort({ caughtAt: -1 })
      .toArray();
    res.json(fish);
  } catch (err) {
    console.error('Failed to fetch inventory:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save a caught fish to inventory
// Body: { playerName, id, name, rarity, points, weight, length }
app.post('/inventory', async (req, res) => {
  const { playerName, id, name, rarity, points, weight, length } = req.body;

  if (!playerName || !name || points == null || length == null) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const entry = {
      playerName,
      id,
      name,
      rarity,
      points,
      weight: typeof weight === 'number' ? weight : null,
      length,
      caughtAt: new Date(),
    };
    await db.collection('inventory').insertOne(entry);
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error('Failed to save inventory entry:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit a caught fish to the leaderboard
// Body: { playerName, fishName, rarity, points, weight, length }
app.post('/leaderboard', async (req, res) => {
  const { playerName, fishName, rarity, points, weight, length } = req.body;

  if (!playerName || !fishName || points == null || length == null) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const entry = {
      playerName,
      fishName,
      rarity,
      points,
      weight: typeof weight === 'number' ? weight : null,
      length,
      caughtAt: new Date(),
    };
    await db.collection('leaderboard').insertOne(entry);
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error('Failed to submit leaderboard entry:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get top 10 entries sorted by a category
// Query: ?category=points|weight|length
app.get('/leaderboard', async (req, res) => {
  const { category = 'points' } = req.query;
  const allowed = ['points', 'weight', 'length'];

  if (!allowed.includes(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  try {
    const pipeline = [
      ...(category === 'weight' ? [{ $match: { weight: { $ne: null } } }] : []),
      { $sort: { [category]: -1 } },
      { $group: { _id: '$playerName', doc: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$doc' } },
      { $sort: { [category]: -1 } },
      { $limit: 10 },
    ];

    const entries = await db.collection('leaderboard').aggregate(pipeline).toArray();
    res.json(entries);
  } catch (err) {
    console.error('Failed to fetch leaderboard:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});

process.on('SIGINT', async () => {
  console.log('\nStop signal received: Closing MongoDB connection...');
  try {
    await client.close();
    console.log('MongoDB connection safely closed.');
    server.close(() => {
      console.log('Express server closed. Exiting process.');
      process.exit(0);
    });
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
});
