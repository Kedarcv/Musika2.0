const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: [true, 'Street address is required'],
  },
  city: {
    type: String,
    required: [true, 'City is required'],
  },
  state: {
    type: String,
    required: [true, 'State is required'],
  },
  zipCode: {
    type: String,
    required: [true, 'ZIP code is required'],
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
});

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item name is required'],
  },
  description: {
    type: String,
    required: [true, 'Item description is required'],
  },
  price: {
    type: Number,
    required: [true, 'Item price is required'],
    min: [0, 'Price cannot be negative'],
  },
  image: String,
  category: {
    type: String,
    required: [true, 'Item category is required'],
  },
  available: {
    type: Boolean,
    default: true,
  },
  preparationTime: {
    type: Number,
    required: [true, 'Preparation time is required'],
    min: [0, 'Preparation time cannot be negative'],
  },
  customization: [{
    name: String,
    options: [{
      name: String,
      price: Number,
    }],
    required: Boolean,
    multiple: Boolean,
  }],
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    carbohydrates: Number,
    fat: Number,
    allergens: [String],
  },
});

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Restaurant name is required'],
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
    address: {
      type: addressSchema,
      required: [true, 'Address is required'],
    },
    cuisine: [{
      type: String,
      required: [true, 'Cuisine type is required'],
    }],
    menu: [menuItemSchema],
    images: {
      logo: String,
      cover: String,
      gallery: [String],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'suspended'],
      default: 'pending',
    },
    isOpen: {
      type: Boolean,
      default: false,
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
    deliveryFee: {
      type: Number,
      required: [true, 'Delivery fee is required'],
      min: 0,
    },
    minimumOrder: {
      type: Number,
      required: [true, 'Minimum order amount is required'],
      min: 0,
    },
    preparationTime: {
      type: Number,
      required: [true, 'Average preparation time is required'],
      min: 0,
    },
    businessHours: [{
      day: {
        type: Number,
        required: true,
        min: 0,
        max: 6,
      },
      open: {
        type: String,
        required: true,
      },
      close: {
        type: String,
        required: true,
      },
      isClosed: {
        type: Boolean,
        default: false,
      },
    }],
    activeOrders: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    }],
    orderHistory: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    }],
    bankInfo: {
      accountHolder: String,
      accountNumber: String,
      bankName: String,
      routingNumber: String,
    },
    notifications: [{
      type: {
        type: String,
        enum: ['order', 'system', 'review'],
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
      autoAcceptOrders: {
        type: Boolean,
        default: false,
      },
      maxActiveOrders: {
        type: Number,
        default: 10,
      },
      preparationTimeBuffer: {
        type: Number,
        default: 5,
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field for full address
restaurantSchema.virtual('fullAddress').get(function() {
  return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zipCode}`;
});

// Hash password before saving
restaurantSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password method
restaurantSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if restaurant is currently open
restaurantSchema.methods.isCurrentlyOpen = function() {
  if (!this.isOpen) return false;

  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = now.toLocaleTimeString('en-US', { hour12: false });

  const todayHours = this.businessHours.find(hours => hours.day === currentDay);
  if (!todayHours || todayHours.isClosed) return false;

  return currentTime >= todayHours.open && currentTime <= todayHours.close;
};

// Add notification method
restaurantSchema.methods.addNotification = function(type, title, message) {
  this.notifications.unshift({
    type,
    title,
    message,
  });
  return this.save();
};

// Update menu item
restaurantSchema.methods.updateMenuItem = function(itemId, updates) {
  const item = this.menu.id(itemId);
  if (!item) throw new Error('Menu item not found');
  
  Object.assign(item, updates);
  return this.save();
};

// Calculate estimated delivery time
restaurantSchema.methods.calculateDeliveryTime = function(distance) {
  const preparationTime = this.preparationTime;
  const deliveryTime = Math.ceil(distance * 5); // 5 minutes per km
  const buffer = this.settings.preparationTimeBuffer;

  return preparationTime + deliveryTime + buffer;
};

// Indexes
restaurantSchema.index({ 'address.coordinates': '2dsphere' });
restaurantSchema.index({ status: 1, isOpen: 1 });
restaurantSchema.index({ cuisine: 1 });
restaurantSchema.index({ 'menu.name': 'text', 'menu.description': 'text' });

module.exports = mongoose.model('Restaurant', restaurantSchema);
