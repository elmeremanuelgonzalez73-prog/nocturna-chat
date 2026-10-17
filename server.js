const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(express.static(path.join(__dirname, 'public')));

// rooms: { roomId: { name, messages: [], createdAt } }
const rooms = new Map();

// Clean messages older than 24 hours every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [roomId, room] of rooms.entries()) {
    room.messages = room.messages.filter(m => now - m.timestamp < 24 * 60 * 60 * 1000);
    if (room.messages.length === 0 && now - room.createdAt > 24 * 60 * 60 * 1000) {
      rooms.delete(roomId);
    }
  }
}, 5 * 60 * 1000);

io.on('connection', (socket) => {
  socket.on('join', ({ roomId, username, roomName }) => {
    if (!roomId || !username) return;

    roomId = String(roomId).trim().slice(0, 12);
    username = String(username).trim().slice(0, 20);

    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        name: roomName ? String(roomName).trim().slice(0, 30) : `Sala ${roomId}`,
        messages: [],
        createdAt: Date.now()
      });
    } else if (roomName && rooms.get(roomId).name.startsWith('Sala ')) {
      // First person who sets a custom name wins
      rooms.get(roomId).name = String(roomName).trim().slice(0, 30);
    }

    socket.join(roomId);
    socket.roomId = roomId;
    socket.username = username;

    const room = rooms.get(roomId);
    socket.emit('room-info', {
      roomId,
      roomName: room.name,
      messages: room.messages
    });

    socket.to(roomId).emit('system', {
      text: `${username} entró a la sala`,
      timestamp: Date.now()
    });
  });

  socket.on('message', ({ text }) => {
    if (!socket.roomId || !socket.username || !text) return;
    text = String(text).trim().slice(0, 500);
    if (!text) return;

    const msg = {
      id: uuidv4(),
      username: socket.username,
      text,
      timestamp: Date.now()
    };

    const room = rooms.get(socket.roomId);
    if (room) {
      room.messages.push(msg);
      // Keep only last 200 messages per room to avoid memory issues
      if (room.messages.length > 200) room.messages.shift();
      io.to(socket.roomId).emit('message', msg);
    }
  });

  socket.on('set-room-name', (name) => {
    if (!socket.roomId || !name) return;
    const room = rooms.get(socket.roomId);
    if (room) {
      room.name = String(name).trim().slice(0, 30);
      io.to(socket.roomId).emit('room-name', room.name);
    }
  });

  socket.on('disconnect', () => {
    if (socket.roomId && socket.username) {
      socket.to(socket.roomId).emit('system', {
        text: `${socket.username} salió`,
        timestamp: Date.now()
      });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Nocturna Chat running on port ${PORT}`);
});
