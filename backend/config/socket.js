const socketIO = require('socket.io');

function initializeSocket(server) {
  const io = socketIO(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? 'https://your-production-domain.com' 
        : 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Socket middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    // TODO: Verify JWT token
    next();
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join user-specific room
    socket.on('join_user', (userId) => {
      socket.join(`user_${userId}`);
    });

    // Join restaurant-specific room
    socket.on('join_restaurant', (restaurantId) => {
      socket.join(`restaurant_${restaurantId}`);
    });

    // Join rider-specific room
    socket.on('join_rider', (riderId) => {
      socket.join(`rider_${riderId}`);
    });

    // Join order-specific room
    socket.on('join_order', (orderId) => {
      socket.join(`order_${orderId}`);
    });

    // Handle order status updates
    socket.on('update_order_status', ({ orderId, status, data }) => {
      io.to(`order_${orderId}`).emit('status_update', {
        orderId,
        status,
        data,
      });
    });

    // Handle rider location updates
    socket.on('update_rider_location', ({ orderId, location }) => {
      io.to(`order_${orderId}`).emit('location_update', {
        orderId,
        location,
      });
    });

    // Handle new order notifications
    socket.on('new_order', ({ restaurantId, order }) => {
      io.to(`restaurant_${restaurantId}`).emit('order_notification', {
        type: 'new_order',
        order,
      });
    });

    // Handle order assignment to rider
    socket.on('assign_order', ({ riderId, order }) => {
      io.to(`rider_${riderId}`).emit('order_notification', {
        type: 'new_assignment',
        order,
      });
    });

    // Handle chat messages
    socket.on('send_message', ({ room, message }) => {
      io.to(room).emit('receive_message', message);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

module.exports = initializeSocket;
