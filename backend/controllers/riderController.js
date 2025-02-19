const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const Rider = require('../models/riderModel');
const Order = require('../models/orderModel');
const { ValidationError, AuthenticationError } = require('../middleware/errorMiddleware');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id, role: 'rider' }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register new rider
// @route   POST /api/riders
// @access  Public
const registerRider = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    vehicleType,
    vehicleNumber,
    licenseNumber,
    currentLocation,
  } = req.body;

  // Validate input
  if (!name || !email || !password || !phone || !vehicleType || !vehicleNumber || !licenseNumber) {
    throw new ValidationError('Please fill in all required fields');
  }

  // Check if rider exists
  const riderExists = await Rider.findOne({ email });
  if (riderExists) {
    throw new ValidationError('Rider already exists');
  }

  // Create rider
  const rider = await Rider.create({
    name,
    email,
    password,
    phone,
    vehicleType,
    vehicleNumber,
    licenseNumber,
    currentLocation,
  });

  if (rider) {
    res.status(201).json({
      _id: rider._id,
      name: rider.name,
      email: rider.email,
      status: rider.status,
      token: generateToken(rider._id),
    });
  } else {
    throw new Error('Invalid rider data');
  }
});

// @desc    Authenticate rider
// @route   POST /api/riders/login
// @access  Public
const loginRider = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const rider = await Rider.findOne({ email });

  if (rider && (await rider.matchPassword(password))) {
    if (rider.status !== 'approved') {
      throw new AuthenticationError('Your account is pending approval');
    }

    res.json({
      _id: rider._id,
      name: rider.name,
      email: rider.email,
      status: rider.status,
      token: generateToken(rider._id),
    });
  } else {
    throw new AuthenticationError('Invalid email or password');
  }
});

// @desc    Get rider profile
// @route   GET /api/riders/profile
// @access  Private
const getRiderProfile = asyncHandler(async (req, res) => {
  const rider = await Rider.findById(req.user._id).select('-password');
  
  if (rider) {
    res.json(rider);
  } else {
    throw new Error('Rider not found');
  }
});

// @desc    Update rider profile
// @route   PUT /api/riders/profile
// @access  Private
const updateRiderProfile = asyncHandler(async (req, res) => {
  const rider = await Rider.findById(req.user._id);

  if (rider) {
    rider.name = req.body.name || rider.name;
    rider.email = req.body.email || rider.email;
    rider.phone = req.body.phone || rider.phone;
    rider.vehicleType = req.body.vehicleType || rider.vehicleType;
    rider.vehicleNumber = req.body.vehicleNumber || rider.vehicleNumber;
    rider.licenseNumber = req.body.licenseNumber || rider.licenseNumber;
    rider.preferences = req.body.preferences || rider.preferences;

    if (req.body.password) {
      rider.password = req.body.password;
    }

    const updatedRider = await rider.save();

    res.json({
      _id: updatedRider._id,
      name: updatedRider.name,
      email: updatedRider.email,
      status: updatedRider.status,
      token: generateToken(updatedRider._id),
    });
  } else {
    throw new Error('Rider not found');
  }
});

// @desc    Update rider location
// @route   PUT /api/riders/location
// @access  Private
const updateLocation = asyncHandler(async (req, res) => {
  const { coordinates } = req.body;

  const rider = await Rider.findById(req.user._id);
  if (!rider) {
    throw new Error('Rider not found');
  }

  await rider.updateLocation(coordinates);

  // If rider has an active order, update order's rider location
  if (rider.activeOrder) {
    const order = await Order.findById(rider.activeOrder);
    if (order) {
      await order.updateRiderLocation(coordinates);
      
      // Notify connected clients about location update
      req.io.to(`order_${order._id}`).emit('location_update', {
        orderId: order._id,
        location: coordinates,
      });
    }
  }

  res.json({ message: 'Location updated successfully' });
});

// @desc    Update rider availability
// @route   PUT /api/riders/availability
// @access  Private
const updateAvailability = asyncHandler(async (req, res) => {
  const { isAvailable } = req.body;

  const rider = await Rider.findById(req.user._id);
  if (!rider) {
    throw new Error('Rider not found');
  }

  rider.isAvailable = isAvailable;
  await rider.save();

  res.json({ message: 'Availability updated successfully' });
});

// @desc    Get rider's active order
// @route   GET /api/riders/active-order
// @access  Private
const getActiveOrder = asyncHandler(async (req, res) => {
  const rider = await Rider.findById(req.user._id);
  if (!rider || !rider.activeOrder) {
    return res.json(null);
  }

  const order = await Order.findById(rider.activeOrder)
    .populate('user', 'name phone')
    .populate('restaurant', 'name address phone');

  res.json(order);
});

// @desc    Get rider's earnings
// @route   GET /api/riders/earnings
// @access  Private
const getRiderEarnings = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const rider = await Rider.findById(req.user._id);
  if (!rider) {
    throw new Error('Rider not found');
  }

  const earnings = rider.earnings.history.filter(earning => {
    const earningDate = new Date(earning.date);
    return earningDate >= new Date(startDate) && earningDate <= new Date(endDate);
  });

  const totalEarnings = earnings.reduce((sum, earning) => sum + earning.amount, 0);
  const pendingPayouts = earnings
    .filter(earning => earning.status === 'pending')
    .reduce((sum, earning) => sum + earning.amount, 0);

  res.json({
    earnings,
    totalEarnings,
    pendingPayouts,
  });
});

// @desc    Get rider's statistics
// @route   GET /api/riders/statistics
// @access  Private
const getRiderStatistics = asyncHandler(async (req, res) => {
  const rider = await Rider.findById(req.user._id);
  if (!rider) {
    throw new Error('Rider not found');
  }

  res.json(rider.statistics);
});

// @desc    Update device token
// @route   PUT /api/riders/device-token
// @access  Private
const updateDeviceToken = asyncHandler(async (req, res) => {
  const { token } = req.body;

  const rider = await Rider.findById(req.user._id);
  if (!rider) {
    throw new Error('Rider not found');
  }

  rider.deviceToken = token;
  await rider.save();

  res.json({ message: 'Device token updated successfully' });
});

module.exports = {
  registerRider,
  loginRider,
  getRiderProfile,
  updateRiderProfile,
  updateLocation,
  updateAvailability,
  getActiveOrder,
  getRiderEarnings,
  getRiderStatistics,
  updateDeviceToken,
};
