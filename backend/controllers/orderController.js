const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');
const Restaurant = require('../models/restaurantModel');
const Rider = require('../models/riderModel');
const User = require('../models/userModel');
const { ValidationError } = require('../middleware/errorMiddleware');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const {
    restaurantId,
    items,
    deliveryAddress,
    paymentMethod,
    orderNotes,
  } = req.body;

  // Validate restaurant
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    throw new Error('Restaurant not found');
  }

  if (!restaurant.isOpen) {
    throw new ValidationError('Restaurant is currently closed');
  }

  // Calculate order totals
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = restaurant.deliveryFee;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + deliveryFee + tax;

  // Validate minimum order amount
  if (subtotal < restaurant.minimumOrder) {
    throw new ValidationError(`Minimum order amount is $${restaurant.minimumOrder}`);
  }

  // Create order
  const order = await Order.create({
    user: req.user._id,
    restaurant: restaurantId,
    items,
    deliveryAddress,
    subtotal,
    deliveryFee,
    tax,
    total,
    payment: {
      method: paymentMethod,
    },
    orderNotes,
    estimatedDeliveryTime: new Date(Date.now() + 45 * 60000), // 45 minutes from now
    preparationTime: restaurant.preparationTime,
  });

  if (order) {
    // Update restaurant's active orders
    restaurant.activeOrders.push(order._id);
    await restaurant.save();

    // Update user's order history
    const user = await User.findById(req.user._id);
    user.orderHistory.push(order._id);
    await user.save();

    // Notify restaurant about new order
    req.io.to(`restaurant_${restaurantId}`).emit('new_order', {
      orderId: order._id,
      type: 'new_order',
    });

    // Find available riders
    const availableRiders = await Rider.find({
      isAvailable: true,
      status: 'approved',
      activeOrder: null,
    });

    // Notify available riders about new order
    availableRiders.forEach(rider => {
      if (rider.checkAvailability(order.deliveryAddress.coordinates)) {
        req.io.to(`rider_${rider._id}`).emit('new_order', {
          orderId: order._id,
          type: 'order_request',
        });
      }
    });

    res.status(201).json(order);
  } else {
    throw new Error('Failed to create order');
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name phone')
    .populate('restaurant', 'name address phone')
    .populate('rider', 'name phone vehicleType vehicleNumber');

  if (order) {
    res.json(order);
  } else {
    throw new Error('Order not found');
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new Error('Order not found');
  }

  // Update order status
  await order.updateStatus(status, note);

  // Handle status-specific actions
  switch (status) {
    case 'confirmed':
      // Notify user
      req.io.to(`user_${order.user}`).emit('order_update', {
        orderId: order._id,
        status: 'confirmed',
      });
      break;

    case 'ready_for_pickup':
      // Notify assigned rider
      if (order.rider) {
        req.io.to(`rider_${order.rider}`).emit('order_update', {
          orderId: order._id,
          status: 'ready_for_pickup',
        });
      }
      break;

    case 'delivered':
      // Update restaurant's active orders
      await Restaurant.findByIdAndUpdate(order.restaurant, {
        $pull: { activeOrders: order._id },
      });

      // Update rider's status
      if (order.rider) {
        const rider = await Rider.findById(order.rider);
        rider.activeOrder = null;
        rider.orderHistory.push(order._id);
        await rider.save();
      }

      // Add earnings to rider
      const deliveryEarning = order.deliveryFee * 0.8; // 80% of delivery fee
      await rider.addEarnings(order._id, deliveryEarning);
      break;

    case 'cancelled':
      // Remove from restaurant's active orders
      await Restaurant.findByIdAndUpdate(order.restaurant, {
        $pull: { activeOrders: order._id },
      });

      // Update rider if assigned
      if (order.rider) {
        const rider = await Rider.findById(order.rider);
        rider.activeOrder = null;
        await rider.save();
      }
      break;
  }

  res.json({ message: 'Order status updated' });
});

// @desc    Assign rider to order
// @route   PUT /api/orders/:id/assign-rider
// @access  Private/Rider
const assignRider = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  const rider = await Rider.findById(req.user._id);

  if (!order || !rider) {
    throw new Error('Order or rider not found');
  }

  if (order.rider) {
    throw new ValidationError('Order already has an assigned rider');
  }

  if (rider.activeOrder) {
    throw new ValidationError('Rider already has an active order');
  }

  // Assign rider to order
  order.rider = rider._id;
  await order.save();

  // Update rider's active order
  rider.activeOrder = order._id;
  await rider.save();

  // Notify user and restaurant
  req.io.to(`user_${order.user}`).emit('rider_assigned', {
    orderId: order._id,
    rider: {
      name: rider.name,
      phone: rider.phone,
      vehicleType: rider.vehicleType,
      vehicleNumber: rider.vehicleNumber,
    },
  });

  req.io.to(`restaurant_${order.restaurant}`).emit('rider_assigned', {
    orderId: order._id,
    rider: {
      name: rider.name,
      phone: rider.phone,
    },
  });

  res.json({ message: 'Rider assigned successfully' });
});

// @desc    Rate order
// @route   POST /api/orders/:id/rate
// @access  Private
const rateOrder = asyncHandler(async (req, res) => {
  const { restaurantRating, riderRating, restaurantReview, riderReview } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    throw new Error('Order not found');
  }

  // Update order ratings
  await order.rateOrder('restaurant', restaurantRating, restaurantReview);
  if (order.rider) {
    await order.rateOrder('rider', riderRating, riderReview);
  }

  // Update restaurant rating
  const restaurant = await Restaurant.findById(order.restaurant);
  restaurant.totalRatings += 1;
  restaurant.rating = (
    (restaurant.rating * (restaurant.totalRatings - 1) + restaurantRating) /
    restaurant.totalRatings
  );
  await restaurant.save();

  // Update rider rating
  if (order.rider) {
    const rider = await Rider.findById(order.rider);
    rider.totalRatings += 1;
    rider.rating = (
      (rider.rating * (rider.totalRatings - 1) + riderRating) /
      rider.totalRatings
    );
    await rider.save();
  }

  res.json({ message: 'Rating submitted successfully' });
});

// @desc    Update order payment
// @route   PUT /api/orders/:id/payment
// @access  Private
const updateOrderPayment = asyncHandler(async (req, res) => {
  const { method, status, transactionId } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new Error('Order not found');
  }

  // Update payment details
  order.payment = {
    method,
    status,
    transactionId,
  };

  // If payment is completed, notify restaurant
  if (status === 'completed') {
    req.io.to(`restaurant_${order.restaurant}`).emit('payment_completed', {
      orderId: order._id,
    });
  }

  await order.save();
  res.json(order);
});

module.exports = {
  createOrder,
  getOrderById,
  updateOrderStatus,
  assignRider,
  rateOrder,
  updateOrderPayment,
};
