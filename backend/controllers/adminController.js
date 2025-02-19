const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel');
const User = require('../models/userModel');
const Restaurant = require('../models/restaurantModel');
const Rider = require('../models/riderModel');
const Order = require('../models/orderModel');
const { ValidationError, AuthenticationError } = require('../middleware/errorMiddleware');
const { Request } = require('express');

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Login admin
// @route   POST /api/admin/login
// @access  Public
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });

  if (admin && (await admin.matchPassword(password))) {
    if (admin.status !== 'active') {
      throw new AuthenticationError('Your account has been deactivated');
    }

    // Update last login
    await admin.updateLastLogin();

    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      token: generateToken(admin._id, admin.role),
    });
  } else {
    throw new AuthenticationError('Invalid email or password');
  }
});

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private/Admin
const getAdminProfile = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.user._id).select('-password');
  
  if (admin) {
    res.json(admin);
  } else {
    throw new Error('Admin not found');
  }
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json(users);
});

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password')
    .populate('orderHistory');

  if (user) {
    res.json(user);
  } else {
    throw new Error('User not found');
  }
});

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.status = req.body.status;
    const updatedUser = await user.save();
    res.json(updatedUser);
  } else {
    throw new Error('User not found');
  }
});

// @desc    Get all restaurants
// @route   GET /api/admin/restaurants
// @access  Private/Admin
const getRestaurants = asyncHandler(async (req, res) => {
  const restaurants = await Restaurant.find({}).select('-password');
  res.json(restaurants);
});

// @desc    Update restaurant status
// @route   PUT /api/admin/restaurants/:id/status
// @access  Private/Admin
const updateRestaurantStatus = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (restaurant) {
    restaurant.status = req.body.status;
    const updatedRestaurant = await restaurant.save();
    res.json(updatedRestaurant);
  } else {
    throw new Error('Restaurant not found');
  }
});

// @desc    Get all riders
// @route   GET /api/admin/riders
// @access  Private/Admin
const getRiders = asyncHandler(async (req, res) => {
  const riders = await Rider.find({}).select('-password');
  res.json(riders);
});

// @desc    Update rider status
// @route   PUT /api/admin/riders/:id/status
// @access  Private/Admin
const updateRiderStatus = asyncHandler(async (req, res) => {
  const rider = await Rider.findById(req.params.id);

  if (rider) {
    rider.status = req.body.status;
    const updatedRider = await rider.save();
    res.json(updatedRider);
  } else {
    throw new Error('Rider not found');
  }
});

// @desc    Get system analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getSystemAnalytics = asyncHandler(async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Ensure valid date range
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid date range provided');
    }

    // Get orders within date range
    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
    }).populate('restaurant', 'name');

    // Get user growth
    const users = await User.find({
      createdAt: { $gte: start, $lte: end },
    });

    // Get restaurant growth
    const restaurants = await Restaurant.find({
      createdAt: { $gte: start, $lte: end },
    });

    // Get rider growth
    const riders = await Rider.find({
      createdAt: { $gte: start, $lte: end },
    });

    // Process orders by date for revenue data
    const revenueData = [];
    const dateMap = new Map();
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!dateMap.has(date)) {
        dateMap.set(date, { date, revenue: 0, orders: 0 });
      }
      const data = dateMap.get(date);
      data.revenue += order.total || 0;
      data.orders += 1;
    });
    revenueData.push(...Array.from(dateMap.values())
      .sort((a, b) => new Date(a.date) - new Date(b.date)));

    // Process orders by status
    const ordersByStatus = [
      { status: 'Pending', value: orders.filter(order => order.orderStatus === 'pending').length },
      { status: 'Confirmed', value: orders.filter(order => order.orderStatus === 'confirmed').length },
      { status: 'Preparing', value: orders.filter(order => order.orderStatus === 'preparing').length },
      { status: 'Ready for Pickup', value: orders.filter(order => order.orderStatus === 'ready_for_pickup').length },
      { status: 'Picked Up', value: orders.filter(order => order.orderStatus === 'picked_up').length },
      { status: 'On the Way', value: orders.filter(order => order.orderStatus === 'on_the_way').length },
      { status: 'Delivered', value: orders.filter(order => order.orderStatus === 'delivered').length },
      { status: 'Cancelled', value: orders.filter(order => order.orderStatus === 'cancelled').length },
    ].filter(status => status.value > 0); // Only include statuses that have orders

    // Get top restaurants by orders
    const restaurantOrders = new Map();
    orders.forEach(order => {
      if (!restaurantOrders.has(order.restaurant.toString())) {
        restaurantOrders.set(order.restaurant.toString(), { orders: 0, revenue: 0 });
      }
      const data = restaurantOrders.get(order.restaurant.toString());
      data.orders += 1;
      data.revenue += order.total || 0;
    });

    const topRestaurants = await Promise.all(
      Array.from(restaurantOrders.entries())
        .sort((a, b) => b[1].orders - a[1].orders)
        .slice(0, 5)
        .map(async ([restaurantId, data]) => {
          const restaurant = await Restaurant.findById(restaurantId);
          return {
            name: restaurant ? restaurant.name : 'Unknown',
            orders: data.orders,
            revenue: data.revenue,
          };
        })
    );

    // Process user growth data
    const userGrowth = [];
    const userDateMap = new Map();
    [...users, ...restaurants, ...riders].forEach(entity => {
      const date = entity.createdAt.toISOString().split('T')[0];
      if (!userDateMap.has(date)) {
        userDateMap.set(date, { date, users: 0, restaurants: 0, riders: 0 });
      }
      const data = userDateMap.get(date);
      if (entity.constructor.modelName === 'User') data.users += 1;
      if (entity.constructor.modelName === 'Restaurant') data.restaurants += 1;
      if (entity.constructor.modelName === 'Rider') data.riders += 1;
    });
    userGrowth.push(...Array.from(userDateMap.values())
      .sort((a, b) => new Date(a.date) - new Date(b.date)));

    // Calculate growth rates
    const previousPeriodStart = new Date(start.getTime() - (end.getTime() - start.getTime()));
    const previousOrders = await Order.find({
      createdAt: { $gte: previousPeriodStart, $lt: start },
    });

    const currentPeriodRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const previousPeriodRevenue = previousOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    const analytics = {
      period: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
      },
      growth: {
        revenue: previousPeriodRevenue === 0 ? 100 : 
          Math.round(((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100 * 100) / 100,
        orders: previousOrders.length === 0 ? 100 :
          Math.round(((orders.length - previousOrders.length) / previousOrders.length) * 100 * 100) / 100,
      },
      userCount: await User.countDocuments(),
      restaurantCount: await Restaurant.countDocuments(),
      riderCount: await Rider.countDocuments(),
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + (order.total || 0), 0),
      revenueData,
      ordersByStatus,
      topRestaurants,
      userGrowth,
      previousPeriod: {
        totalOrders: previousOrders.length,
        totalRevenue: previousOrders.reduce((sum, order) => sum + (order.total || 0), 0),
      },
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error in getSystemAnalytics:', error);
    throw new Error('Failed to fetch analytics data: ' + error.message);
  }
});

// @desc    Create admin
// @route   POST /api/admin
// @access  Private/SuperAdmin
const createAdmin = asyncHandler(async (req, res) => {
  if (req.user.role !== 'super_admin') {
    throw new Error('Not authorized to create admin accounts');
  }

  const { name, email, password, permissions } = req.body;

  const adminExists = await Admin.findOne({ email });
  if (adminExists) {
    throw new ValidationError('Admin already exists');
  }

  const admin = await Admin.create({
    name,
    email,
    password,
    permissions,
  });

  if (admin) {
    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    });
  } else {
    throw new Error('Invalid admin data');
  }
});

// @desc    Update admin permissions
// @route   PUT /api/admin/:id/permissions
// @access  Private/SuperAdmin
const updateAdminPermissions = asyncHandler(async (req, res) => {
  if (req.user.role !== 'super_admin') {
    throw new Error('Not authorized to update admin permissions');
  }

  const admin = await Admin.findById(req.params.id);

  if (admin) {
    admin.permissions = req.body.permissions;
    const updatedAdmin = await admin.save();
    res.json(updatedAdmin);
  } else {
    throw new Error('Admin not found');
  }
});

module.exports = {
  loginAdmin,
  getAdminProfile,
  getUsers,
  getUserById,
  updateUserStatus,
  getRestaurants,
  updateRestaurantStatus,
  getRiders,
  updateRiderStatus,
  getSystemAnalytics,
  createAdmin,
  updateAdminPermissions,
};
