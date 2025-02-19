const mongoose = require('mongoose');
const Restaurant = require('../models/restaurantModel');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const defaultRestaurants = [
  {
    name: "Italiano Delights",
    email: "italiano@example.com",
    password: "password123",
    phone: "123-456-7890",
    address: {
      street: "123 Italian Street",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      coordinates: {
        type: "Point",
        coordinates: [-73.9857, 40.7484]
      }
    },
    cuisine: ["Italian", "Pizza", "Pasta"],
    menu: [
      {
        name: "Margherita Pizza",
        description: "Fresh tomatoes, mozzarella, basil",
        price: 14.99,
        category: "Pizza",
        preparationTime: 20,
        available: true,
        nutritionalInfo: {
          calories: 850,
          protein: 35,
          carbohydrates: 98,
          fat: 38
        }
      },
      {
        name: "Spaghetti Carbonara",
        description: "Creamy pasta with pancetta and egg",
        price: 16.99,
        category: "Pasta",
        preparationTime: 15,
        available: true,
        nutritionalInfo: {
          calories: 950,
          protein: 40,
          carbohydrates: 85,
          fat: 45
        }
      }
    ],
    status: "approved",
    isOpen: true,
    deliveryFee: 3.99,
    minimumOrder: 15.00,
    preparationTime: 25,
    businessHours: [
      { day: 0, open: "11:00", close: "22:00", isClosed: false },
      { day: 1, open: "11:00", close: "22:00", isClosed: false },
      { day: 2, open: "11:00", close: "22:00", isClosed: false },
      { day: 3, open: "11:00", close: "22:00", isClosed: false },
      { day: 4, open: "11:00", close: "23:00", isClosed: false },
      { day: 5, open: "11:00", close: "23:00", isClosed: false },
      { day: 6, open: "11:00", close: "22:00", isClosed: false }
    ]
  },
  {
    name: "Sushi Master",
    email: "sushi@example.com",
    password: "password123",
    phone: "123-456-7891",
    address: {
      street: "456 Japanese Ave",
      city: "New York",
      state: "NY",
      zipCode: "10002",
      coordinates: {
        type: "Point",
        coordinates: [-73.9897, 40.7494]
      }
    },
    cuisine: ["Japanese", "Sushi", "Asian"],
    menu: [
      {
        name: "California Roll",
        description: "Crab, avocado, cucumber",
        price: 12.99,
        category: "Sushi Rolls",
        preparationTime: 15,
        available: true,
        nutritionalInfo: {
          calories: 350,
          protein: 15,
          carbohydrates: 45,
          fat: 12
        }
      },
      {
        name: "Salmon Nigiri",
        description: "Fresh salmon on rice",
        price: 8.99,
        category: "Nigiri",
        preparationTime: 10,
        available: true,
        nutritionalInfo: {
          calories: 150,
          protein: 12,
          carbohydrates: 20,
          fat: 5
        }
      }
    ],
    status: "approved",
    isOpen: true,
    deliveryFee: 4.99,
    minimumOrder: 20.00,
    preparationTime: 20,
    businessHours: [
      { day: 0, open: "12:00", close: "22:00", isClosed: false },
      { day: 1, open: "12:00", close: "22:00", isClosed: false },
      { day: 2, open: "12:00", close: "22:00", isClosed: false },
      { day: 3, open: "12:00", close: "22:00", isClosed: false },
      { day: 4, open: "12:00", close: "23:00", isClosed: false },
      { day: 5, open: "12:00", close: "23:00", isClosed: false },
      { day: 6, open: "12:00", close: "22:00", isClosed: false }
    ]
  },
  {
    name: "Burger Haven",
    email: "burger@example.com",
    password: "password123",
    phone: "123-456-7892",
    address: {
      street: "789 Burger Lane",
      city: "New York",
      state: "NY",
      zipCode: "10003",
      coordinates: {
        type: "Point",
        coordinates: [-73.9887, 40.7474]
      }
    },
    cuisine: ["American", "Burgers", "Fast Food"],
    menu: [
      {
        name: "Classic Cheeseburger",
        description: "Beef patty, cheese, lettuce, tomato",
        price: 9.99,
        category: "Burgers",
        preparationTime: 12,
        available: true,
        nutritionalInfo: {
          calories: 750,
          protein: 35,
          carbohydrates: 55,
          fat: 45
        }
      },
      {
        name: "Loaded Fries",
        description: "Cheese, bacon, green onions",
        price: 6.99,
        category: "Sides",
        preparationTime: 8,
        available: true,
        nutritionalInfo: {
          calories: 550,
          protein: 15,
          carbohydrates: 65,
          fat: 30
        }
      }
    ],
    status: "approved",
    isOpen: true,
    deliveryFee: 2.99,
    minimumOrder: 10.00,
    preparationTime: 15,
    businessHours: [
      { day: 0, open: "10:00", close: "23:00", isClosed: false },
      { day: 1, open: "10:00", close: "23:00", isClosed: false },
      { day: 2, open: "10:00", close: "23:00", isClosed: false },
      { day: 3, open: "10:00", close: "23:00", isClosed: false },
      { day: 4, open: "10:00", close: "00:00", isClosed: false },
      { day: 5, open: "10:00", close: "00:00", isClosed: false },
      { day: 6, open: "10:00", close: "23:00", isClosed: false }
    ]
  },
  {
    name: "Spice of India",
    email: "indian@example.com",
    password: "password123",
    phone: "123-456-7893",
    address: {
      street: "321 Curry Road",
      city: "New York",
      state: "NY",
      zipCode: "10004",
      coordinates: {
        type: "Point",
        coordinates: [-73.9867, 40.7464]
      }
    },
    cuisine: ["Indian", "Curry", "Vegetarian"],
    menu: [
      {
        name: "Butter Chicken",
        description: "Creamy tomato curry with tender chicken",
        price: 15.99,
        category: "Curry",
        preparationTime: 25,
        available: true,
        nutritionalInfo: {
          calories: 650,
          protein: 35,
          carbohydrates: 45,
          fat: 38
        }
      },
      {
        name: "Vegetable Biryani",
        description: "Fragrant rice with mixed vegetables",
        price: 13.99,
        category: "Rice",
        preparationTime: 20,
        available: true,
        nutritionalInfo: {
          calories: 550,
          protein: 12,
          carbohydrates: 85,
          fat: 18
        }
      }
    ],
    status: "approved",
    isOpen: true,
    deliveryFee: 3.99,
    minimumOrder: 25.00,
    preparationTime: 30,
    businessHours: [
      { day: 0, open: "11:30", close: "22:30", isClosed: false },
      { day: 1, open: "11:30", close: "22:30", isClosed: false },
      { day: 2, open: "11:30", close: "22:30", isClosed: false },
      { day: 3, open: "11:30", close: "22:30", isClosed: false },
      { day: 4, open: "11:30", close: "23:00", isClosed: false },
      { day: 5, open: "11:30", close: "23:00", isClosed: false },
      { day: 6, open: "11:30", close: "22:30", isClosed: false }
    ]
  },
  {
    name: "Healthy Bites",
    email: "healthy@example.com",
    password: "password123",
    phone: "123-456-7894",
    address: {
      street: "555 Green Street",
      city: "New York",
      state: "NY",
      zipCode: "10005",
      coordinates: {
        type: "Point",
        coordinates: [-73.9877, 40.7454]
      }
    },
    cuisine: ["Healthy", "Salads", "Smoothies"],
    menu: [
      {
        name: "Quinoa Buddha Bowl",
        description: "Mixed vegetables, quinoa, avocado",
        price: 13.99,
        category: "Bowls",
        preparationTime: 15,
        available: true,
        nutritionalInfo: {
          calories: 450,
          protein: 18,
          carbohydrates: 65,
          fat: 15
        }
      },
      {
        name: "Green Goddess Smoothie",
        description: "Spinach, banana, almond milk",
        price: 7.99,
        category: "Smoothies",
        preparationTime: 5,
        available: true,
        nutritionalInfo: {
          calories: 250,
          protein: 8,
          carbohydrates: 45,
          fat: 5
        }
      }
    ],
    status: "approved",
    isOpen: true,
    deliveryFee: 3.99,
    minimumOrder: 15.00,
    preparationTime: 15,
    businessHours: [
      { day: 0, open: "08:00", close: "20:00", isClosed: false },
      { day: 1, open: "08:00", close: "20:00", isClosed: false },
      { day: 2, open: "08:00", close: "20:00", isClosed: false },
      { day: 3, open: "08:00", close: "20:00", isClosed: false },
      { day: 4, open: "08:00", close: "20:00", isClosed: false },
      { day: 5, open: "08:00", close: "20:00", isClosed: false },
      { day: 6, open: "09:00", close: "19:00", isClosed: false }
    ]
  }
];

const createDefaultRestaurants = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not set');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Delete existing restaurants with these emails
    const emails = defaultRestaurants.map(restaurant => restaurant.email);
    await Restaurant.deleteMany({ email: { $in: emails } });

    // Create new restaurants
    for (const restaurantData of defaultRestaurants) {
      const restaurant = new Restaurant(restaurantData);
      await restaurant.save();
      console.log(`Created restaurant: ${restaurant.name}`);
    }

    console.log('Default restaurants created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating default restaurants:', error);
    process.exit(1);
  }
};

createDefaultRestaurants();
