const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Drop existing indexes before creating new ones
    const collections = ['restaurants', 'riders', 'orders'];
    for (const collection of collections) {
      if (mongoose.connection.collections[collection]) {
        await mongoose.connection.collections[collection].dropIndexes();
      }
    }

    // Create indexes for geospatial queries
    await Promise.all([
      // Restaurant location index
      mongoose.connection.collection('restaurants').createIndex({ location: '2dsphere' }),
      
      // Rider location index
      mongoose.connection.collection('riders').createIndex({ 'currentLocation.coordinates': '2dsphere' }),
      
      // Order delivery location index
      mongoose.connection.collection('orders').createIndex({ 'deliveryLocation.coordinates': '2dsphere' }),
    ]);

    // Create text indexes for search functionality
    await Promise.all([
      // Restaurant search index
      mongoose.connection.collection('restaurants').createIndex({
        name: 'text',
        'cuisine': 'text',
        'address.city': 'text',
      }),
    ]);

    // Create compound indexes for queries
    await Promise.all([
      // Order status and date index
      mongoose.connection.collection('orders').createIndex({
        orderStatus: 1,
        createdAt: -1,
      }),

      // Restaurant rating and status index
      mongoose.connection.collection('restaurants').createIndex({
        status: 1,
        rating: -1,
      }),

      // Rider availability and location index
      mongoose.connection.collection('riders').createIndex({
        isAvailable: 1,
        'currentLocation.coordinates': '2dsphere',
      }),
    ]);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Handle MongoDB connection errors
mongoose.connection.on('error', (err) => {
  console.error(`MongoDB connection error: ${err}`);
});

// Handle MongoDB disconnection
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Handle application termination
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
    process.exit(1);
  }
});

module.exports = connectDB;
