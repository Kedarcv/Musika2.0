const mongoose = require('mongoose');
const Restaurant = require('../models/restaurantModel');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const checkRestaurants = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check existing restaurants
    const restaurants = await Restaurant.find();
    console.log(`Found ${restaurants.length} restaurants:`);
    restaurants.forEach(restaurant => {
      console.log(`- ${restaurant.name} (${restaurant.status})`);
    });

    if (restaurants.length === 0) {
      console.log('No restaurants found. Please run createDefaultRestaurants.js to create some restaurants.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkRestaurants();
