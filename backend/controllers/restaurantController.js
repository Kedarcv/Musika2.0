const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const Restaurant = require('../models/restaurantModel');
const Order = require('../models/orderModel');
const { ValidationError, AuthenticationError } = require('../middleware/errorMiddleware');

// @desc    Get all restaurants
// @route   GET /api/restaurants
// @access  Public
const getAllRestaurants = asyncHandler(async (req, res) => {
  console.log('Getting all restaurants...');
  try {
    const restaurants = await Restaurant.find({ status: 'approved' })
      .select('-password')
      .sort({ rating: -1 });
    
    console.log(`Found ${restaurants.length} restaurants`);
    console.log('Restaurant names:', restaurants.map(r => r.name));
    
    res.json(restaurants);
  } catch (error) {
    console.error('Error getting restaurants:', error);
    throw error;
  }
});

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id, role: 'restaurant' }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register new restaurant
// @route   POST /api/restaurants
// @access  Public
const registerRestaurant = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    address,
    cuisine,
    deliveryFee,
    minimumOrder,
    preparationTime,
  } = req.body;

  // Validate input
  if (!name || !email || !password || !phone || !address || !cuisine) {
    throw new ValidationError('Please fill in all required fields');
  }

  // Check if restaurant exists
  const restaurantExists = await Restaurant.findOne({ email });
  if (restaurantExists) {
    throw new ValidationError('Restaurant already exists');
  }

  // Create restaurant
  const restaurant = await Restaurant.create({
    name,
    email,
    password,
    phone,
    address,
    cuisine,
    deliveryFee,
    minimumOrder,
    preparationTime,
  });

  if (restaurant) {
    res.status(201).json({
      _id: restaurant._id,
      name: restaurant.name,
      email: restaurant.email,
      status: restaurant.status,
      token: generateToken(restaurant._id),
    });
  } else {
    throw new Error('Invalid restaurant data');
  }
});

// @desc    Authenticate restaurant
// @route   POST /api/restaurants/login
// @access  Public
const loginRestaurant = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const restaurant = await Restaurant.findOne({ email });

  if (restaurant && (await restaurant.matchPassword(password))) {
    if (restaurant.status !== 'approved') {
      throw new AuthenticationError('Your account is pending approval');
    }

    res.json({
      _id: restaurant._id,
      name: restaurant.name,
      email: restaurant.email,
      status: restaurant.status,
      token: generateToken(restaurant._id),
    });
  } else {
    throw new AuthenticationError('Invalid email or password');
  }
});

// @desc    Get restaurant profile
// @route   GET /api/restaurants/profile
// @access  Private
const getRestaurantProfile = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.user._id).select('-password');
  
  if (restaurant) {
    res.json(restaurant);
  } else {
    throw new Error('Restaurant not found');
  }
});

// @desc    Update restaurant profile
// @route   PUT /api/restaurants/profile
// @access  Private
const updateRestaurantProfile = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.user._id);

  if (restaurant) {
    restaurant.name = req.body.name || restaurant.name;
    restaurant.email = req.body.email || restaurant.email;
    restaurant.phone = req.body.phone || restaurant.phone;
    restaurant.address = req.body.address || restaurant.address;
    restaurant.cuisine = req.body.cuisine || restaurant.cuisine;
    restaurant.deliveryFee = req.body.deliveryFee || restaurant.deliveryFee;
    restaurant.minimumOrder = req.body.minimumOrder || restaurant.minimumOrder;
    restaurant.preparationTime = req.body.preparationTime || restaurant.preparationTime;
    restaurant.businessHours = req.body.businessHours || restaurant.businessHours;
    restaurant.settings = req.body.settings || restaurant.settings;

    if (req.body.password) {
      restaurant.password = req.body.password;
    }

    const updatedRestaurant = await restaurant.save();

    res.json({
      _id: updatedRestaurant._id,
      name: updatedRestaurant.name,
      email: updatedRestaurant.email,
      status: updatedRestaurant.status,
      token: generateToken(updatedRestaurant._id),
    });
  } else {
    throw new Error('Restaurant not found');
  }
});

// @desc    Get restaurant menu
// @route   GET /api/restaurants/:id/menu
// @access  Public
const getRestaurantMenu = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id).select('menu');
  
  if (restaurant) {
    res.json(restaurant.menu);
  } else {
    throw new Error('Restaurant not found');
  }
});

// @desc    Update restaurant menu
// @route   PUT /api/restaurants/menu
// @access  Private
const updateMenu = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.user._id);

  if (restaurant) {
    restaurant.menu = req.body.menu;
    const updatedRestaurant = await restaurant.save();
    res.json(updatedRestaurant.menu);
  } else {
    throw new Error('Restaurant not found');
  }
});

// @desc    Update menu item
// @route   PUT /api/restaurants/menu/:itemId
// @access  Private
const updateMenuItem = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.user._id);
  
  if (restaurant) {
    await restaurant.updateMenuItem(req.params.itemId, req.body);
    res.json({ message: 'Menu item updated successfully' });
  } else {
    throw new Error('Restaurant not found');
  }
});

// @desc    Get restaurant orders
// @route   GET /api/restaurants/orders
// @access  Private
const getRestaurantOrders = asyncHandler(async (req, res) => {
  const { status, startDate, endDate } = req.query;
  
  let query = { restaurant: req.user._id };
  
  if (status) {
    query.orderStatus = status;
  }
  
  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const orders = await Order.find(query)
    .populate('user', 'name phone')
    .populate('rider', 'name phone')
    .sort('-createdAt');

  res.json(orders);
});

// @desc    Get restaurant analytics
// @route   GET /api/restaurants/analytics
// @access  Private
const getRestaurantAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  const orders = await Order.find({
    restaurant: req.user._id,
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  });

  const analytics = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
    completedOrders: orders.filter(order => order.orderStatus === 'delivered').length,
    averageOrderValue: orders.length > 0 ? 
      orders.reduce((sum, order) => sum + order.total, 0) / orders.length : 0,
    completionRate: orders.length > 0 ?
      (orders.filter(order => order.orderStatus === 'delivered').length / orders.length) * 100 : 0,
  };

  res.json(analytics);
});

// @desc    Update restaurant status (open/closed)
// @route   PUT /api/restaurants/status
// @access  Private
const updateRestaurantStatus = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.user._id);

  if (restaurant) {
    restaurant.isOpen = req.body.isOpen;
    await restaurant.save();
    
    // Notify connected clients about status change
    req.io.emit('restaurant_status_changed', {
      restaurantId: restaurant._id,
      isOpen: restaurant.isOpen,
    });

    res.json({ message: 'Status updated successfully' });
  } else {
    throw new Error('Restaurant not found');
  }
});

module.exports = {
  registerRestaurant,
  loginRestaurant,
  getRestaurantProfile,
  updateRestaurantProfile,
  getRestaurantMenu,
  updateMenu,
  updateMenuItem,
  getRestaurantOrders,
  getRestaurantAnalytics,
  updateRestaurantStatus,
  getAllRestaurants,
};
