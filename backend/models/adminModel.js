const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: ['admin', 'super_admin'],
      default: 'admin',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    permissions: {
      users: {
        view: { type: Boolean, default: true },
        create: { type: Boolean, default: false },
        edit: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
      },
      restaurants: {
        view: { type: Boolean, default: true },
        create: { type: Boolean, default: false },
        edit: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
        approve: { type: Boolean, default: false },
      },
      riders: {
        view: { type: Boolean, default: true },
        create: { type: Boolean, default: false },
        edit: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
        approve: { type: Boolean, default: false },
      },
      orders: {
        view: { type: Boolean, default: true },
        manage: { type: Boolean, default: false },
      },
      analytics: {
        view: { type: Boolean, default: true },
      },
      settings: {
        view: { type: Boolean, default: false },
        edit: { type: Boolean, default: false },
      },
    },
    lastLogin: Date,
    avatar: String,
    activityLog: [{
      action: {
        type: String,
        required: true,
      },
      details: mongoose.Schema.Types.Mixed,
      timestamp: {
        type: Date,
        default: Date.now,
      },
      ip: String,
      userAgent: String,
    }],
    notifications: [{
      type: {
        type: String,
        enum: ['alert', 'info', 'warning'],
        required: true,
      },
      title: String,
      message: String,
      read: {
        type: Boolean,
        default: false,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    settings: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      dashboardLayout: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light',
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Hash password before saving
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password method
adminSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check permission method
adminSchema.methods.hasPermission = function(resource, action) {
  if (this.role === 'super_admin') return true;
  return this.permissions[resource]?.[action] || false;
};

// Log activity method
adminSchema.methods.logActivity = function(action, details, ip, userAgent) {
  this.activityLog.unshift({
    action,
    details,
    ip,
    userAgent,
  });
  return this.save();
};

// Add notification method
adminSchema.methods.addNotification = function(type, title, message) {
  this.notifications.unshift({
    type,
    title,
    message,
  });
  return this.save();
};

// Mark notification as read
adminSchema.methods.markNotificationAsRead = function(notificationId) {
  const notification = this.notifications.id(notificationId);
  if (notification) {
    notification.read = true;
    return this.save();
  }
  return Promise.reject(new Error('Notification not found'));
};

// Update last login
adminSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Update dashboard layout
adminSchema.methods.updateDashboardLayout = function(layout) {
  this.settings.dashboardLayout = layout;
  return this.save();
};

// Static method to create super admin
adminSchema.statics.createSuperAdmin = async function(adminData) {
  const admin = new this({
    ...adminData,
    role: 'super_admin',
    permissions: {
      users: {
        view: true,
        create: true,
        edit: true,
        delete: true,
      },
      restaurants: {
        view: true,
        create: true,
        edit: true,
        delete: true,
        approve: true,
      },
      riders: {
        view: true,
        create: true,
        edit: true,
        delete: true,
        approve: true,
      },
      orders: {
        view: true,
        manage: true,
      },
      analytics: {
        view: true,
      },
      settings: {
        view: true,
        edit: true,
      },
    },
  });

  return admin.save();
};

// Indexes
adminSchema.index({ email: 1 }, { unique: true });
adminSchema.index({ role: 1 });
adminSchema.index({ status: 1 });

module.exports = mongoose.model('Admin', adminSchema);
