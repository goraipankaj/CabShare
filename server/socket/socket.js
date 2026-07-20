const { Server } = require('socket.io');
const { verifyAccessToken } = require('../utils/tokens');

let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      credentials: true,
    },
  });

  // Authenticate socket connections using the same JWT access token as REST APIs
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error('Authentication token required'));
      const decoded = verifyAccessToken(token);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] User connected: ${socket.userId} (${socket.userRole})`);

    // Personal room for direct notifications
    socket.join(`user:${socket.userId}`);

    // Join a ride "room" to receive/send live tracking + chat for that ride
    socket.on('ride:join', (rideId) => {
      socket.join(`ride:${rideId}`);
    });

    socket.on('ride:leave', (rideId) => {
      socket.leave(`ride:${rideId}`);
    });

    // Driver broadcasts live GPS location to everyone tracking this ride
    socket.on('ride:location-update', ({ rideId, lat, lng }) => {
      socket.to(`ride:${rideId}`).emit('ride:location-update', { rideId, lat, lng, updatedAt: new Date() });
    });

    // Ride status changes (started / driver arrived / completed) broadcast to the room
    socket.on('ride:status-update', ({ rideId, status }) => {
      io.to(`ride:${rideId}`).emit('ride:status-update', { rideId, status, updatedAt: new Date() });
    });

    // In-ride chat between driver and passengers
    socket.on('chat:message', ({ rideId, message }) => {
      const payload = { rideId, senderId: socket.userId, message, sentAt: new Date() };
      io.to(`ride:${rideId}`).emit('chat:message', payload);
    });

    socket.on('chat:typing', ({ rideId, isTyping }) => {
      socket.to(`ride:${rideId}`).emit('chat:typing', { rideId, userId: socket.userId, isTyping });
    });

    // Driver toggles online/available status (for matching engine / admin dashboard)
    socket.on('driver:availability', ({ isAvailable }) => {
      socket.broadcast.emit('driver:availability', { driverId: socket.userId, isAvailable });
    });

    // Emergency SOS - broadcasts to admin room and emergency contacts service
    socket.on('sos:trigger', ({ rideId, lat, lng }) => {
      io.to('admins').emit('sos:alert', { userId: socket.userId, rideId, lat, lng, triggeredAt: new Date() });
    });

    if (socket.userRole === 'admin') {
      socket.join('admins');
    }

    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

// Helper used by controllers/services to push a notification to a specific user in real time
const emitToUser = (userId, event, data) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
};

const getIO = () => {
  if (!io) throw new Error('Socket.IO has not been initialized yet');
  return io;
};

module.exports = { initSocket, emitToUser, getIO };
