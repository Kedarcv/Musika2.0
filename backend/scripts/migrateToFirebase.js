const mongoose = require('mongoose');
const dotenv = require('dotenv');
const admin = require('firebase-admin');
const User = require('../models/userModel');
const Restaurant = require('../models/restaurantModel');
const Rider = require('../models/riderModel');
const Admin = require('../models/adminModel');
const Order = require('../models/orderModel');
const path = require('path');

dotenv.config();

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '..', 'firebase-service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath))
});

const db = admin.firestore();
const auth = admin.auth();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

const migrateUsers = async () => {
  try {
    const users = await User.find({});
    console.log(`Migrating ${users.length} users...`);

    for (const user of users) {
      try {
        // Create user in Firebase Auth
        let userRecord;
        try {
          userRecord = await auth.createUser({
            email: user.email,
            password: 'tempPass123!', // Temporary password
            displayName: user.name,
          });
        } catch (error) {
          if (error.code === 'auth/email-already-exists') {
            userRecord = await auth.getUserByEmail(user.email);
          } else {
            throw error;
          }
        }

        // Store user data in Firestore
        await db.collection('users').doc(userRecord.uid).set({
          name: user.name,
          email: user.email,
          role: 'customer',
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString()
        });

        console.log(`Migrated user: ${user.email}`);
      } catch (error) {
        console.error(`Error migrating user ${user.email}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in migrateUsers:', error);
  }
};

const migrateRestaurants = async () => {
  try {
    const restaurants = await Restaurant.find({});
    console.log(`Migrating ${restaurants.length} restaurants...`);

    for (const restaurant of restaurants) {
      try {
        // Create restaurant user in Firebase Auth
        let userRecord;
        // Store restaurant data in Firestore
        await db.collection('restaurants').doc(userRecord.uid).set({
          name: restaurant.name,
          email: restaurant.email,
          description: restaurant.description,
          address: restaurant.address,
          cuisine: restaurant.cuisine,
          role: 'restaurant',
          menu: restaurant.menu,
          createdAt: restaurant.createdAt.toISOString(),
          updatedAt: restaurant.updatedAt.toISOString()
        });

        console.log(`Migrated restaurant: ${restaurant.name}`);
      } catch (error) {
        if (error.code === 'auth/email-already-exists') {
          console.log(`Restaurant already exists: ${restaurant.email}`);
        } else {
          console.error(`Error migrating restaurant ${restaurant.name}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Error in migrateRestaurants:', error);
  }
};

const migrateRiders = async () => {
  try {
    const riders = await Rider.find({});
    console.log(`Migrating ${riders.length} riders...`);

    for (const rider of riders) {
      try {
        // Create Firebase Auth user for rider
        const userRecord = await admin.auth().createUser({
          email: rider.email,
          password: 'tempPassword123',
          displayName: rider.name,
        });

        // Store rider data in Firestore
        await db.collection('riders').doc(userRecord.uid).set({
          name: rider.name,
          email: rider.email,
          phone: rider.phone,
          role: 'rider',
          createdAt: rider.createdAt.toISOString(),
          updatedAt: rider.updatedAt.toISOString()
        });

        console.log(`Migrated rider: ${rider.name}`);
      } catch (error) {
        if (error.code === 'auth/email-already-exists') {
          console.log(`Rider already exists: ${rider.email}`);
        } else {
          console.error(`Error migrating rider ${rider.name}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Error in migrateRiders:', error);
  }
};

const migrateAdmins = async () => {
  try {
    const admins = await Admin.find({});
    console.log(`Migrating ${admins.length} admins...`);

    for (const admin of admins) {
      try {
        // Create Firebase Auth user for admin
        const userRecord = await admin.auth().createUser({
          email: admin.email,
          password: 'tempPassword123',
          displayName: admin.name,
        });

        // Set custom claims for admin
        await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });

        // Store admin data in Firestore
        await db.collection('admins').doc(userRecord.uid).set({
          name: admin.name,
          email: admin.email,
          role: 'admin',
          createdAt: admin.createdAt.toISOString(),
          updatedAt: admin.updatedAt.toISOString()
        });

        console.log(`Migrated admin: ${admin.name}`);
      } catch (error) {
        if (error.code === 'auth/email-already-exists') {
          console.log(`Admin already exists: ${admin.email}`);
        } else {
          console.error(`Error migrating admin ${admin.name}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Error in migrateAdmins:', error);
  }
};

const migrateOrders = async () => {
  try {
    const orders = await Order.find({});
    console.log(`Migrating ${orders.length} orders...`);

    for (const order of orders) {
      try {
        // Store order data in Firestore
        await db.collection('orders').doc(order._id.toString()).set({
          userId: order.user.toString(),
          restaurantId: order.restaurant.toString(),
          items: order.items,
          status: order.status,
          total: order.total,
          deliveryAddress: order.deliveryAddress,
          riderId: order.rider ? order.rider.toString() : null,
          createdAt: order.createdAt.toISOString(),
          updatedAt: order.updatedAt.toISOString()
        });

        console.log(`Migrated order: ${order._id}`);
      } catch (error) {
        console.error(`Error migrating order ${order._id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in migrateOrders:', error);
  }
};

const migrate = async () => {
  try {
    await migrateUsers();
    await migrateRestaurants();
    await migrateRiders();
    await migrateAdmins();
    await migrateOrders();
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
