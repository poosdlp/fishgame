const { WebSocketServer } = require('ws');
const jwt = require('jsonwebtoken');
const url = require('url');

// userId -> Set<ws>
const clients = new Map();

function setupWebSocket(server) {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (req, socket, head) => {
    const { pathname, query } = url.parse(req.url, true);
    if (pathname !== '/ws') {
      socket.destroy();
      return;
    }

    const token = query.token;
    if (!token) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      ws.userId = decoded.id;
      wss.emit('connection', ws, req);
    });
  });

  wss.on('connection', (ws) => {
    const userId = ws.userId;

    if (!clients.has(userId)) {
      clients.set(userId, new Set());
    }
    clients.get(userId).add(ws);

    ws.on('message', (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw);
      } catch {
        return;
      }

      // Broadcast to all of this user's OTHER connected devices
      const userClients = clients.get(userId);
      if (!userClients) return;

      const outgoing = JSON.stringify(msg);
      for (const client of userClients) {
        if (client !== ws && client.readyState === 1) {
          client.send(outgoing);
        }
      }
    });

    ws.on('close', () => {
      const userClients = clients.get(userId);
      if (userClients) {
        userClients.delete(ws);
        if (userClients.size === 0) {
          clients.delete(userId);
        }
      }
    });
  });

  return wss;
}

// Send a message to all devices for a given userId
function sendToUser(userId, data) {
  const userClients = clients.get(userId);
  if (!userClients) return;
  const msg = JSON.stringify(data);
  for (const client of userClients) {
    if (client.readyState === 1) {
      client.send(msg);
    }
  }
}

module.exports = { setupWebSocket, sendToUser };
