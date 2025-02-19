const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/riderController');
const { protect, authorize } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');
const { validateRequest } = require('../middleware/errorMiddleware');

// Rate limiting configuration
const loginLimiter = rateLimit(5, 15); // 5 attempts per 15 minutes
const registerLimiter = rateLimit(3, 60); // 3 attempts per hour

// Input validation schemas
const riderSchema = {
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true, minLength: 6 },
  phone: { type: String, required: true },
  vehicleType: { type: String, enum: ['bicycle', 'motorcycle', 'car'], required: true },
  vehicleNumber: { type: String, required: true },
  licenseNumber: { type: String, required: true },
  currentLocation: {
    type: { type: String, enum: ['Point'] },
    coordinates: [Number],
  },
};

// Public routes
router.post('/register', registerLimiter, validateRequest(riderSchema), registerRider);
router.post('/login', loginLimiter, loginRider);

// Protected routes
router.use(protect);
router.use(authorize('rider'));

// Profile routes
router.route('/profile')
  .get(getRiderProfile)
  .put(updateRiderProfile);

// Location and availability routes
router.put('/location', updateLocation);
router.put('/availability', updateAvailability);

// Order routes
router.get('/active-order', getActiveOrder);

// Earnings routes
router.get('/earnings', getRiderEarnings);

// Statistics routes
router.get('/statistics', getRiderStatistics);

// Device token route
router.put('/device-token', updateDeviceToken);

// Location update middleware
router.use((req, res, next) => {
  if (req.body.coordinates) {
    req.user.currentLocation = {
      type: 'Point',
      coordinates: req.body.coordinates,
    };
    req.user.save().catch(err => console.error('Error updating rider location:', err));
  }
  next();
});

// Activity logging middleware
router.use((req, res, next) => {
  console.log(`Rider ${req.user._id} performed ${req.method} on ${req.originalUrl}`);
  next();
});

// Availability check middleware
router.use((req, res, next) => {
  if (req.user.status === 'suspended') {
    return res.status(403).json({
      message: 'Your account has been suspended. Please contact support.',
    });
  }
  next();
});

// Real-time status update middleware
router.use((req, res, next) => {
  const io = req.app.get('io');
  if (io) {
    io.emit('rider_status_update', {
      riderId: req.user._id,
      isAvailable: req.user.isAvailable,
      currentLocation: req.user.currentLocation,
    });
  }
  next();
});

// Error handling for rider-specific errors
router.use((err, req, res, next) => {
  if (err.name === 'RiderValidationError') {
    return res.status(400).json({
      message: 'Rider validation failed',
      errors: err.errors,
    });
  }
  next(err);
});

// Custom response handler
router.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function(data) {
    if (data && typeof data === 'object') {
      data.riderMetadata = {
        isAvailable: req.user.isAvailable,
        currentStatus: req.user.status,
        lastActive: req.user.updatedAt,
      };
    }
    return originalJson.call(this, data);
  };
  next();
});

module.exports = router;
