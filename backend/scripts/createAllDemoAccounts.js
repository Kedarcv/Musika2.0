const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('../models/adminModel');
const User = require('../models/userModel');
const Rider = require('../models/riderModel');
const Restaurant = require('../models/restaurantModel');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const createAllDemoAccounts = async () => {
  try {
    // Create demo user
    const demoUser = await User.create({
      name: 'Demo User',
      email: 'user@example.com',
      password: 'password123',
      status: 'active',
      isVerified: true,
    });

    // Create demo rider
    const demoRider = await Rider.create({
      name: 'Demo Rider',
      email: 'rider@example.com',
      password: 'password123',
      licenseNumber: 'D123456789',
      vehicleNumber: 'V123456789',
      vehicleType: 'bicycle',
      currentLocation: {
        type: 'Point',
        coordinates: [-73.935242, 40.730610], // Example coordinates
      },
      phone: '9876543210',
      status: 'approved',
      isVerified: true,
      rating: 4.5,
      totalRatings: 50,
      earnings: {
        total: 1000,
        pending: 0
      }
    });

    // Create demo restaurant
    const demoRestaurant = await Restaurant.create({
      name: 'Demo Restaurant',
      email: 'restaurant@example.com',
      password: 'password123',
      address: {
        street: '456 Demo Ave',
        city: 'Demo City',
        state: 'Demo State',
        zipCode: '54321',
        coordinates: {
          type: 'Point',
          coordinates: [-73.935242, 40.730610], // Example coordinates
        },
      },
      phone: '0987654321',
      preparationTime: 30,
      minimumOrder: 10,
      deliveryFee: 2,
      status: 'approved',
      isVerified: true,
      rating: 4.2,
      totalRatings: 100,
      cuisine: ['Italian', 'Pizza', 'Pasta'],
      menu: [
        {
          name: 'Margherita Pizza',
          description: 'Classic tomato and mozzarella pizza',
          price: 12.99,
          category: 'Pizza',
          isAvailable: true
        },
        {
          name: 'Spaghetti Carbonara',
          description: 'Creamy pasta with bacon and egg',
          price: 14.99,
          category: 'Pasta',
          isAvailable: true
        }
      ]
    });

    // Check if admin exists, if not create one
    let demoAdmin = await Admin.findOne({ email: 'admin@example.com' });
    if (!demoAdmin) {
      demoAdmin = await Admin.create({
        name: 'Demo Admin',
        email: 'admin@example.com',
        password: 'password123',
        role: 'super_admin',
        status: 'active',
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
    }

    console.log('Demo accounts created successfully:', {
      demoUser,
      demoRider,
      demoRestaurant,
      demoAdmin,
    });

    process.exit(0);
  } catch (error) {
    console.error('Error creating demo accounts:', error.message);
    process.exit(1);
  }
};

createAllDemoAccounts();
