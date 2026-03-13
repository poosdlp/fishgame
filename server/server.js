const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

const url = 'mongodb://database:27017';
const client = new MongoClient(url);

const dbName = 'myapp';
let db;

// Connect to MongoDB
async function connectDB() {
  try {
    await client.connect();
    console.log('Successfully connected to MongoDB!');
    db = client.db(dbName);
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
}

connectDB();

// test
app.get('/', (req, res) => {
  // connected?
  const isConnected = client.topology && client.topology.isConnected();
  
  res.json({
    status: 'success',
    databaseState: isConnected ? 'Connected' : 'Disconnected',
    message: 'a mongo is speaking. listen and learn. (mogging emoji)'
  });
});

// start the server
const server = app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});

// shutdown
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