const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const locationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point',
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true,
  },
});

const riderSchema = new mongoose.Schema(
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
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    avatar: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'suspended'],
      default: 'pending',
    },
    isAvailable: {
      type: Boolean,
      default: false,
    },
    currentLocation: {
      type: locationSchema,
      required: [true, 'Current location is required'],
    },
    vehicleType: {
      type: String,
      enum: ['bicycle', 'motorcycle', 'car'],
      required: [true, 'Vehicle type is required'],
    },
    vehicleNumber: {
      type: String,
      required: [true, 'Vehicle number is required'],
    },
    licenseNumber: {
      type: String,
      required: [true, 'License number is required'],
    },
    documents: {
      license: String,
      insurance: String,
      vehicleRegistration: String,
      identityProof: String,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    activeOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    orderHistory: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    }],
    earnings: {
      total: {
        type: Number,
        default: 0,
      },
      pending: {
        type: Number,
        default: 0,
      },
      history: [{
        orderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Order',
        },
        amount: Number,
        date: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ['pending', 'paid'],
          default: 'pending',
        },
      }],
    },
    bankInfo: {
      accountHolder: String,
      accountNumber: String,
      bankName: String,
      routingNumber: String,
    },
    notifications: [{
      type: {
        type: String,
        enum: ['order', 'system', 'earnings'],
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
    preferences: {
      maxDistance: {
        type: Number,
        default: 10, // in kilometers
      },
      autoAcceptOrders: {
        type: Boolean,
        default: false,
      },
      notificationPreferences: {
        email: {
          type: Boolean,
          default: true,
        },
        sms: {
          type: Boolean,
          default: true,
        },
        push: {
          type: Boolean,
          default: true,
        },
      },
    },
    deviceToken: String,
    statistics: {
      totalDeliveries: {
        type: Number,
        default: 0,
      },
      totalDistance: {
        type: Number,
        default: 0,
      },
      averageDeliveryTime: {
        type: Number,
        default: 0,
      },
      completionRate: {
        type: Number,
        default: 0,
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
riderSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password method
riderSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Add notification method
riderSchema.methods.addNotification = function(type, title, message) {
  this.notifications.unshift({
    type,
    title,
    message,
  });
  return this.save();
};

// Update location method
riderSchema.methods.updateLocation = function(coordinates) {
  this.currentLocation.coordinates = coordinates;
  return this.save();
};

// Add earnings method
riderSchema.methods.addEarnings = function(orderId, amount) {
  this.earnings.history.push({
    orderId,
    amount,
  });
  this.earnings.total += amount;
  this.earnings.pending += amount;
  return this.save();
};

// Update statistics method
riderSchema.methods.updateStatistics = function(deliveryTime, distance) {
  this.statistics.totalDeliveries += 1;
  this.statistics.totalDistance += distance;
  
  // Update average delivery time
  const currentTotal = this.statistics.averageDeliveryTime * (this.statistics.totalDeliveries - 1);
  this.statistics.averageDeliveryTime = (currentTotal + deliveryTime) / this.statistics.totalDeliveries;
  
  // Update completion rate
  this.statistics.completionRate = (this.statistics.totalDeliveries / this.orderHistory.length) * 100;
  
  return this.save();
};

// Check availability method
riderSchema.methods.checkAvailability = function(orderLocation) {
  if (!this.isAvailable || this.activeOrder) return false;

  const [orderLng, orderLat] = orderLocation.coordinates;
  const [riderLng, riderLat] = this.currentLocation.coordinates;

  // Calculate distance using Haversine formula
  const R = 6371; // Earth's radius in km
  const dLat = (orderLat - riderLat) * Math.PI / 180;
  const dLon = (orderLng - riderLng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(riderLat * Math.PI / 180) * Math.cos(orderLat * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;

  return distance <= this.preferences.maxDistance;
};

// Indexes
riderSchema.index({ 'currentLocation': '2dsphere' });
riderSchema.index({ status: 1, isAvailable: 1 });
riderSchema.index({ vehicleType: 1 });

module.exports = mongoose.model('Rider', riderSchema);
