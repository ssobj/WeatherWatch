// const express = require('express');
// const http = require('http');
// const socketIo = require('socket.io');

// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server, {
//   cors: {
//     origin: "http://localhost:3000",
//     methods: ["GET", "POST"]
//   }
// });

// app.use(express.static('public'));

// io.on('connection', (socket) => {
//   console.log('A user connected');

//   socket.on('report', (message) => {
//     console.log('Received report:', message);
//     io.emit('newMessage', message);
//   });

//   socket.on('disconnect', () => {
//     console.log('User disconnected');
//   });
// });

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
