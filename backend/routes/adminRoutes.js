const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');
const { validateRequest } = require('../middleware/errorMiddleware');

// Rate limiting configuration
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // 5 attempts per window
});

// Input validation schemas
const adminSchema = {
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true, minLength: 6 },
  permissions: {
    users: {
      view: Boolean,
      create: Boolean,
      edit: Boolean,
      delete: Boolean,
    },
    restaurants: {
      view: Boolean,
      create: Boolean,
      edit: Boolean,
      delete: Boolean,
      approve: Boolean,
    },
    riders: {
      view: Boolean,
      create: Boolean,
      edit: Boolean,
      delete: Boolean,
      approve: Boolean,
    },
    orders: {
      view: Boolean,
      manage: Boolean,
    },
    analytics: {
      view: Boolean,
    },
    settings: {
      view: Boolean,
      edit: Boolean,
    },
  },
};

// Public routes
router.post('/login', loginLimiter, loginAdmin);

// Protected routes
router.use(protect);
router.use(authorize('admin', 'super_admin'));

// Profile routes
router.get('/profile', getAdminProfile);

// User management routes
router.get('/users', getUsers);
router.route('/users/:id')
  .get(getUserById)
  .put(updateUserStatus);

// Restaurant management routes
router.get('/restaurants', getRestaurants);
router.put('/restaurants/:id/status', updateRestaurantStatus);

// Rider management routes
router.get('/riders', getRiders);
router.put('/riders/:id/status', updateRiderStatus);

// Analytics routes
router.get('/analytics', getSystemAnalytics);

// Admin management routes
router.post('/', authorize('super_admin'), validateRequest(adminSchema), createAdmin);
router.put('/:id/permissions', authorize('super_admin'), updateAdminPermissions);

// Audit logging middleware
router.use((req, res, next) => {
  // Log admin actions for auditing
  const adminAction = {
    adminId: req.user._id,
    action: req.method,
    path: req.originalUrl,
    params: req.params,
    query: req.query,
    body: req.body,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    timestamp: new Date(),
  };
  
  // TODO: Save admin action to audit log
  console.log('Admin Action:', adminAction);
  
  next();
});

// Permission check middleware
router.use((req, res, next) => {
  const path = req.path;
  const method = req.method;
  
  // Check if admin has required permissions
  if (!req.user.hasPermission(getResourceFromPath(path), getActionFromMethod(method))) {
    return res.status(403).json({
      message: 'You do not have permission to perform this action',
    });
  }
  
  next();
});

// Real-time notification middleware
router.use((req, res, next) => {
  // Send real-time notifications for important admin actions
  const io = req.app.get('io');
  if (io) {
    const notifyAdmins = (action, data) => {
      io.to('admin_channel').emit('admin_action', {
        action,
        data,
        adminId: req.user._id,
        timestamp: new Date(),
      });
    };
    
    // Attach notification function to response object
    res.notifyAdmins = notifyAdmins;
  }
  
  next();
});

// Error handling for admin-specific errors
router.use((err, req, res, next) => {
  if (err.name === 'AdminValidationError') {
    return res.status(400).json({
      message: 'Admin validation failed',
      errors: err.errors,
    });
  }
  next(err);
});

// Helper functions
function getResourceFromPath(path) {
  const resources = ['users', 'restaurants', 'riders', 'orders', 'analytics', 'settings'];
  return resources.find(resource => path.includes(resource)) || 'unknown';
}

function getActionFromMethod(method) {
  const actionMap = {
    GET: 'view',
    POST: 'create',
    PUT: 'edit',
    DELETE: 'delete',
  };
  return actionMap[method] || 'unknown';
}

module.exports = router;
