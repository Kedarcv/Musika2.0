const express = require('express');
const router = express.Router();
const Restaurant = require('../models/restaurantModel');
const {
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
} = require('../controllers/restaurantController');
const { protect, authorize } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');
const { validateRequest } = require('../middleware/errorMiddleware');

// Rate limiting configuration
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // 5 attempts per window
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3 // 3 attempts per window
});

// Input validation schemas
const restaurantSchema = {
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true, minLength: 6 },
  phone: { type: String, required: true },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    coordinates: {
      type: { type: String, enum: ['Point'] },
      coordinates: [Number],
    },
  },
  cuisine: [{ type: String, required: true }],
  deliveryFee: { type: Number, required: true, min: 0 },
  minimumOrder: { type: Number, required: true, min: 0 },
};

// Public routes
router.get('/', getAllRestaurants);
router.get('/search', getAllRestaurants); // Add search endpoint that uses the same controller

router.post('/register', registerLimiter, validateRequest(restaurantSchema), registerRestaurant);
router.post('/login', loginLimiter, loginRestaurant);

// Public restaurant menu route
router.get('/:id/menu', getRestaurantMenu);

// Protected routes
router.use(protect);
router.use(authorize('restaurant'));

// Profile routes
router.route('/profile')
  .get(getRestaurantProfile)
  .put(updateRestaurantProfile);

// Menu management routes
router.route('/menu')
  .put(updateMenu);

router.route('/menu/:itemId')
  .put(updateMenuItem);

// Order management routes
router.get('/orders', getRestaurantOrders);

// Analytics routes
router.get('/analytics', getRestaurantAnalytics);

// Status update route
router.put('/status', updateRestaurantStatus);

// Middleware to log restaurant activity
router.use((req, res, next) => {
  // Log activity for auditing
  console.log(`Restaurant ${req.user?._id || 'public'} performed ${req.method} on ${req.originalUrl}`);
  next();
});

// Error handling for restaurant-specific errors
router.use((err, req, res, next) => {
  if (err.name === 'RestaurantValidationError') {
    return res.status(400).json({
      message: 'Restaurant validation failed',
      errors: err.errors,
    });
  }
  next(err);
});

module.exports = router;
