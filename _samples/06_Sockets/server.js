const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);

app.use(express.static(path.join(__dirname, 'public')));

// Настраиваем Socket.IO с CORS (на всякий случай)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Хранилище активных пользователей
const users = {};

// MIDDLEWARE
app.use(cors());
app.use(express.json()); // нужно для req.body в /api/notify

// Статика: папка public
app.use(express.static(path.join(__dirname, 'public')));

// Отдаём index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ====================== ЧАТ (дефолтный namespace) ======================
io.on('connection', (socket) => {
  console.log('Пользователь подключился:', socket.id);

  // Событие присоединения к комнате чата
  socket.on('join-room', (data) => {
    const { roomId, username } = data;

    if (!roomId || !username) return;

    // Присоединяем пользователя к комнате
    socket.join(roomId);
    users[socket.id] = { username, roomId };

    // Отправляем сообщение только в эту комнату
    io.to(roomId).emit('user-joined', {
      username,
      message: `${username} присоединился к чату`,
    });

    console.log(`${username} присоединился к комнате ${roomId}`);
  });

  // Событие получения сообщения
  socket.on('send-message', (data) => {
    const { message } = data || {};
    const user = users[socket.id];

    if (user && message) {
      io.to(user.roomId).emit('receive-message', {
        username: user.username,
        message,
        timestamp: new Date().toLocaleTimeString(),
      });
    }
  });

  // Событие ввода (три точки в чате)
  socket.on('user-typing', () => {
    const user = users[socket.id];
    if (user) {
      socket.broadcast.to(user.roomId).emit('user-is-typing', {
        username: user.username,
      });
    }
  });

  // Событие отключения
  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (user) {
      io.to(user.roomId).emit('user-left', {
        username: user.username,
        message: `${user.username} покинул чат`,
      });
      delete users[socket.id];
    }
    console.log('Пользователь отключился:', socket.id);
  });
});

// ====================== NAMESPACE ДЛЯ УВЕДОМЛЕНИЙ ======================
const notificationNamespace = io.of('/notifications');

notificationNamespace.on('connection', (socket) => {
  console.log('Клиент подключился к уведомлениям:', socket.id);

  socket.on('subscribe-notifications', (userId) => {
    if (!userId) return;
    socket.join(`user-${userId}`);
    console.log(`Пользователь ${userId} подписался на уведомления`);
  });

  socket.on('disconnect', () => {
    console.log('Клиент отключился от уведомлений:', socket.id);
  });
});

// Маршрут для отправки уведомления конкретному пользователю
app.post('/api/notify/:userId', (req, res) => {
  const { userId } = req.params;
  const { title, message } = req.body || {};

  notificationNamespace.to(`user-${userId}`).emit('notification', {
    title,
    message,
    timestamp: new Date().toISOString(),
  });

  res.json({ sent: true });
});

// ====================== ЗАПУСК СЕРВЕРА ======================
server.listen(3000, () => {
  console.log('Socket.IO сервер запущен на http://localhost:3000');
});
