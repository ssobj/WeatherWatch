// websocket-server.js
const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

const clients = new Set();

server.on('connection', (ws) => {
  clients.add(ws);

  ws.on('message', (message) => {
    try {
      // Ensure the message is a valid JSON string
      const parsedMessage = JSON.parse(message);

      // Broadcast the message to all connected clients
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

console.log('WebSocket server is running on ws://localhost:8080');
