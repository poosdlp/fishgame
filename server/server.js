const express = require('express');
const { MongoClient } = require('mongodb');
const { WebSocketServer } = require('ws');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// sessionId -> { token, clients: Set<WebSocket> }
const sessions = {};

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
  const isConnected = client.topology && client.topology.isConnected();
  res.json({
    status: 'success',
    databaseState: isConnected ? 'Connected' : 'Disconnected',
    message: 'a mongo is speaking. listen and learn. (mogging emoji)'
  });
});

// Create a session — called by the web app when Play is pressed
app.post('/session', (_req, res) => {
  const sessionId = crypto.randomUUID();
  const token = crypto.randomBytes(32).toString('hex');
  sessions[sessionId] = { token, clients: new Set(), claimed: false };
  console.log(`Session created: ${sessionId}`);
  res.json({ sessionId });
});

// Join a session — called by the mobile scanner after reading the QR code
// Returns the token once, then marks the session as claimed
app.post('/session/:sessionId/join', (req, res) => {
  const session = sessions[req.params.sessionId];
  if (!session) return res.status(404).json({ error: 'Unknown session' });
  if (session.claimed) return res.status(403).json({ error: 'Session already claimed' });
  session.claimed = true;
  res.json({ token: session.token });
});

// start the server
const server = app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});

// WebSocket server attached to the same HTTP server
const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  // expect URL like /session/<sessionId>
  const match = req.url.match(/^\/session\/([^/?]+)/);
  if (!match) {
    ws.close(4000, 'Missing sessionId');
    return;
  }

  const sessionId = match[1];
  const session = sessions[sessionId];

  if (!session) {
    ws.close(4001, 'Unknown session');
    return;
  }

  session.clients.add(ws);
  ws.authenticated = false;
  console.log(`WS connected to session ${sessionId} (${session.clients.size} clients)`);

  ws.on('message', (data) => {
    let msg;
    try {
      msg = JSON.parse(data.toString());
    } catch {
      return;
    }

    // Mobile must authenticate first
    if (msg.event === 'auth') {
      if (msg.token === session.token) {
        ws.authenticated = true;
        // notify the web client that mobile is authenticated
        session.clients.forEach(c => {
          if (c !== ws && c.readyState === 1) {
            c.send(JSON.stringify({ event: 'authenticated' }));
          }
        });
        console.log(`Mobile authenticated on session ${sessionId}`);
      } else {
        ws.send(JSON.stringify({ event: 'auth_failed' }));
        ws.close(4003, 'Invalid token');
      }
      return;
    }

    // All other events require authentication
    if (!ws.authenticated) {
      ws.close(4002, 'Not authenticated');
      return;
    }

    // Broadcast to all other clients in the session
    session.clients.forEach(c => {
      if (c !== ws && c.readyState === 1) {
        c.send(data.toString());
      }
    });
  });

  ws.on('close', () => {
    session.clients.delete(ws);
    if (session.clients.size === 0) delete sessions[sessionId];
    console.log(`WS disconnected from session ${sessionId}`);
  });
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
