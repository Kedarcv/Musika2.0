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

const createDemoAccounts = async () => {
  try {
    // Check and create demo user
    let demoUser = await User.findOne({ email: 'user@example.com' });
    if (!demoUser) {
      demoUser = await User.create({
        name: 'Demo User',
        email: 'user@example.com',
        password: 'password123',
        phone: '1234567890',
        address: {
          street: '123 Demo St',
          city: 'Demo City',
          state: 'Demo State',
          zipCode: '12345',
        },
      });
    }



    // Check and create demo rider
    let demoRider = await Rider.findOne({ email: 'rider@example.com' });
    if (!demoRider) {
      demoRider = await Rider.create({
        name: 'Demo Rider',
        email: 'rider@example.com',
        password: 'password123',
      });
    }

    // Check and create demo restaurant
    let demoRestaurant = await Restaurant.findOne({ email: 'restaurant@example.com' });
    if (!demoRestaurant) {
      demoRestaurant = await Restaurant.create({
        name: 'Demo Restaurant',
        email: 'restaurant@example.com',
        password: 'password123',
        address: {
          street: '456 Demo Ave',
          city: 'Demo City',
          state: 'Demo State',
          zipCode: '54321',
        },
        phone: '0987654321',
      });
    }

    console.log('Demo accounts created successfully:', {
      demoUser,
      demoAdmin,
      demoRider,
      demoRestaurant,
    });

    process.exit(0);
  } catch (error) {
    console.error('Error creating demo accounts:', error.message);
    process.exit(1);
  }
};

createDemoAccounts();
