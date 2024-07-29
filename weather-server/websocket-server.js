const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);

  ws.on('message', (message) => {
    try {
      const parsedMessage = JSON.parse(message);

      clients.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(parsedMessage));
        }
      });
    } catch (error) {
      console.error('Error parsing or broadcasting message:', error);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket server error:', error);
  });
});

server.listen(process.env.PORT || 8080, () => {
  console.log(`Server is running on port ${server.address().port}`);
});
