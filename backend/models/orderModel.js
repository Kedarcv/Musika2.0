const mongoose = require('mongoose');

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

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant.menu',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative'],
  },
  customizations: [{
    name: String,
    option: String,
    price: Number,
  }],
  specialInstructions: String,
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    rider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rider',
    },
    items: [orderItemSchema],
    orderStatus: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'preparing',
        'ready_for_pickup',
        'picked_up',
        'on_the_way',
        'delivered',
        'cancelled',
      ],
      default: 'pending',
    },
    statusHistory: [{
      status: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      note: String,
    }],
    deliveryAddress: {
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      zipCode: {
        type: String,
        required: true,
      },
      coordinates: {
        type: locationSchema,
        required: true,
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative'],
    },
    deliveryFee: {
      type: Number,
      required: true,
      min: [0, 'Delivery fee cannot be negative'],
    },
    tax: {
      type: Number,
      required: true,
      min: [0, 'Tax cannot be negative'],
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'Total cannot be negative'],
    },
    payment: {
      method: {
        type: String,
        enum: ['card', 'cash'],
        required: true,
      },
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending',
      },
      transactionId: String,
    },
    estimatedDeliveryTime: {
      type: Date,
      required: true,
    },
    actualDeliveryTime: Date,
    preparationTime: {
      type: Number,
      required: true,
      min: [0, 'Preparation time cannot be negative'],
    },
    ratings: {
      restaurant: {
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        review: String,
        timestamp: Date,
      },
      rider: {
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        review: String,
        timestamp: Date,
      },
    },
    cancellation: {
      reason: String,
      cancelledBy: {
        type: String,
        enum: ['user', 'restaurant', 'rider', 'system'],
      },
      timestamp: Date,
    },
    riderLocation: {
      type: locationSchema,
    },
    issues: [{
      type: {
        type: String,
        enum: ['delay', 'quality', 'missing_items', 'wrong_items', 'other'],
      },
      description: String,
      status: {
        type: String,
        enum: ['pending', 'resolved'],
        default: 'pending',
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      resolution: {
        action: String,
        timestamp: Date,
      },
    }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Calculate delivery distance
orderSchema.virtual('deliveryDistance').get(function() {
  if (!this.riderLocation || !this.deliveryAddress.coordinates) return null;

  const [riderLng, riderLat] = this.riderLocation.coordinates;
  const [destLng, destLat] = this.deliveryAddress.coordinates.coordinates;

  // Calculate distance using Haversine formula
  const R = 6371; // Earth's radius in km
  const dLat = (destLat - riderLat) * Math.PI / 180;
  const dLon = (destLng - riderLng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(riderLat * Math.PI / 180) * Math.cos(destLat * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
});

// Update status method
orderSchema.methods.updateStatus = function(status, note = '') {
  this.orderStatus = status;
  this.statusHistory.push({
    status,
    note,
    timestamp: new Date(),
  });

  if (status === 'delivered') {
    this.actualDeliveryTime = new Date();
  }

  return this.save();
};

// Add issue method
orderSchema.methods.addIssue = function(type, description) {
  this.issues.push({
    type,
    description,
  });
  return this.save();
};

// Resolve issue method
orderSchema.methods.resolveIssue = function(issueId, action) {
  const issue = this.issues.id(issueId);
  if (!issue) throw new Error('Issue not found');

  issue.status = 'resolved';
  issue.resolution = {
    action,
    timestamp: new Date(),
  };

  return this.save();
};

// Rate order method
orderSchema.methods.rateOrder = function(type, rating, review) {
  if (!['restaurant', 'rider'].includes(type)) {
    throw new Error('Invalid rating type');
  }

  this.ratings[type] = {
    rating,
    review,
    timestamp: new Date(),
  };

  return this.save();
};

// Cancel order method
orderSchema.methods.cancelOrder = function(reason, cancelledBy) {
  if (this.orderStatus === 'delivered') {
    throw new Error('Cannot cancel a delivered order');
  }

  this.orderStatus = 'cancelled';
  this.cancellation = {
    reason,
    cancelledBy,
    timestamp: new Date(),
  };

  return this.save();
};

// Update rider location method
orderSchema.methods.updateRiderLocation = function(coordinates) {
  this.riderLocation = {
    type: 'Point',
    coordinates,
  };
  return this.save();
};

// Indexes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ restaurant: 1, createdAt: -1 });
orderSchema.index({ rider: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ 'deliveryAddress.coordinates': '2dsphere' });
orderSchema.index({ 'riderLocation': '2dsphere' });

module.exports = mongoose.model('Order', orderSchema);
