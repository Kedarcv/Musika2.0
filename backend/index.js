const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const orderRoutes = require('./routes/orderRoutes');
const riderRoutes = require('./routes/riderRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
app.use(bodyParser.json());

// Initialize Firebase Admin SDK
if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
    });
}

// Commenting out the MongoDB connection
// connectDB(); // This line is no longer needed

// Set up routes
app.use('/api/users', userRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/riders', riderRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
