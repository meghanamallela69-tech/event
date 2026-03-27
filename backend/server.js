import app from "./app.js";
import { Server } from "socket.io";

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server listening at port ${PORT}`);
});

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://192.168.1.16:5173'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

console.log('🔌 Socket.IO initialized');

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);
  
  // Join user's personal room for notifications
  socket.on('joinUserRoom', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined personal room: user_${userId}`);
  });
  
  // Leave user's personal room
  socket.on('leaveUserRoom', (userId) => {
    socket.leave(`user_${userId}`);
    console.log(`User ${userId} left personal room: user_${userId}`);
  });
  
  // Join a chat room
  socket.on('joinChat', (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.id} joined chat room: ${chatId}`);
  });
  
  // Leave a chat room
  socket.on('leaveChat', (chatId) => {
    socket.leave(chatId);
    console.log(`User ${socket.id} left chat room: ${chatId}`);
  });
  
  // Typing indicator
  socket.on('typing', (data) => {
    socket.to(data.chatId).emit('userTyping', {
      chatId: data.chatId,
      userId: data.userId
    });
  });
  
  // Stop typing
  socket.on('stopTyping', (data) => {
    socket.to(data.chatId).emit('userStoppedTyping', {
      chatId: data.chatId,
      userId: data.userId
    });
  });
  
  // Disconnect
  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
  });
});

// Make io accessible to routes
app.set('io', io);

// ... existing error handling code ...
