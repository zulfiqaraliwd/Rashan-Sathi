const ChatMessage = require('../models/ChatMessage');
const Request = require('../models/Request');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const chatSocket = (io) => {
  // Auth middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Token nahi mila'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('name profileImage');
      if (!user) return next(new Error('User nahi mila'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Auth fail'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.user.name} (${socket.id})`);

    // Join a request room (chat is per-request)
    socket.on('joinRequest', async ({ requestId }) => {
      try {
        const request = await Request.findById(requestId);
        if (!request) return socket.emit('error', 'Request nahi mili');

        const userId = socket.user._id.toString();
        const allowed =
          request.requesterId.toString() === userId ||
          request.shopperId.toString() === userId;

        if (!allowed) return socket.emit('error', 'Permission nahi');

        socket.join(`request_${requestId}`);
        console.log(`👥 ${socket.user.name} joined room request_${requestId}`);

        // Purane messages bhej do
        const messages = await ChatMessage.find({ requestId })
          .sort({ createdAt: 1 })
          .limit(100)
          .populate('senderId', 'name profileImage');

        socket.emit('previousMessages', messages);
      } catch (err) {
        socket.emit('error', err.message);
      }
    });

    // Send message
    socket.on('sendMessage', async ({ requestId, message, messageType, imageUrl }) => {
      try {
        if (!message && !imageUrl) return;

        const request = await Request.findById(requestId);
        if (!request) return socket.emit('error', 'Request nahi mili');

        const userId = socket.user._id.toString();
        const allowed =
          request.requesterId.toString() === userId ||
          request.shopperId.toString() === userId;

        if (!allowed) return socket.emit('error', 'Permission nahi');

        const chatMsg = await ChatMessage.create({
          requestId,
          senderId: socket.user._id,
          message: message || '',
          messageType: messageType || 'text',
          imageUrl: imageUrl || '',
        });

        await chatMsg.populate('senderId', 'name profileImage');

        io.to(`request_${requestId}`).emit('newMessage', chatMsg);
      } catch (err) {
        socket.emit('error', err.message);
      }
    });

    // Mark messages read
    socket.on('markRead', async ({ requestId }) => {
      try {
        await ChatMessage.updateMany(
          { requestId, senderId: { $ne: socket.user._id }, isRead: false },
          { isRead: true, readAt: new Date() }
        );
        io.to(`request_${requestId}`).emit('messagesRead', {
          by: socket.user._id,
          at: new Date(),
        });
      } catch (err) {
        socket.emit('error', err.message);
      }
    });

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.user.name}`);
    });
  });
};

module.exports = chatSocket;