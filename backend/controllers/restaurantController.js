const admin = require('firebase-admin');

// Function to get all restaurants
exports.getAllRestaurants = async (req, res) => {
    try {
        const restaurantsSnapshot = await admin.firestore().collection('restaurants').get();
        const restaurants = restaurantsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(restaurants);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching restaurants', error });
    }
};

// Function to create a new restaurant
exports.createRestaurant = async (req, res) => {
    try {
        const newRestaurant = req.body;
        const restaurantRef = await admin.firestore().collection('restaurants').add(newRestaurant);
        res.status(201).json({ id: restaurantRef.id, ...newRestaurant });
    } catch (error) {
        res.status(500).json({ message: 'Error creating restaurant', error });
    }
};

// Function to register a new restaurant
exports.registerRestaurant = async (req, res) => {
    const { email, password } = req.body;
    try {
        const restaurantCredential = await admin.auth().createUser({
            email,
            password,
        });
        res.status(201).json({ uid: restaurantCredential.uid, email: restaurantCredential.email });
    } catch (error) {
        res.status(400).json({ message: 'Error registering restaurant', error });
    }
};

// Function to login a restaurant
exports.loginRestaurant = async (req, res) => {
    const { email, password } = req.body;
    try {
        const restaurantCredential = await admin.auth().signInWithEmailAndPassword(email, password);
        res.status(200).json({ uid: restaurantCredential.user.uid, email: restaurantCredential.user.email });
    } catch (error) {
        res.status(400).json({ message: 'Error logging in restaurant', error });
    }
};

// Function to get restaurant profile
exports.getRestaurantProfile = async (req, res) => {
    const restaurantId = req.user.id; // Assuming restaurant ID is set in the request
    try {
        const restaurantDoc = await admin.firestore().collection('restaurants').doc(restaurantId).get();
        if (!restaurantDoc.exists) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }
        res.status(200).json({ id: restaurantDoc.id, ...restaurantDoc.data() });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching restaurant profile', error });
    }
};

// Function to update restaurant profile
exports.updateRestaurantProfile = async (req, res) => {
    const restaurantId = req.user.id; // Assuming restaurant ID is set in the request
    const updatedData = req.body;
    try {
        await admin.firestore().collection('restaurants').doc(restaurantId).update(updatedData);
        res.status(200).json({ message: 'Restaurant profile updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating restaurant profile', error });
    }
};

// Function to get restaurant menu
exports.getRestaurantMenu = async (req, res) => {
    const restaurantId = req.params.id;
    try {
        const menuSnapshot = await admin.firestore().collection('restaurants').doc(restaurantId).collection('menu').get();
        const menu = menuSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(menu);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching restaurant menu', error });
    }
};

// Function to update menu
exports.updateMenu = async (req, res) => {
    const restaurantId = req.user.id; // Assuming restaurant ID is set in the request
    const menuData = req.body;
    try {
        await admin.firestore().collection('restaurants').doc(restaurantId).collection('menu').doc(menuData.id).update(menuData);
        res.status(200).json({ message: 'Menu updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating menu', error });
    }
};

// Function to update menu item
exports.updateMenuItem = async (req, res) => {
    const restaurantId = req.user.id; // Assuming restaurant ID is set in the request
    const { itemId } = req.params;
    const updatedData = req.body;
    try {
        await admin.firestore().collection('restaurants').doc(restaurantId).collection('menu').doc(itemId).update(updatedData);
        res.status(200).json({ message: 'Menu item updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating menu item', error });
    }
};

// Function to get restaurant orders
exports.getRestaurantOrders = async (req, res) => {
    const restaurantId = req.user.id; // Assuming restaurant ID is set in the request
    try {
        const ordersSnapshot = await admin.firestore().collection('restaurants').doc(restaurantId).collection('orders').get();
        const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching restaurant orders', error });
    }
};

// Function to get restaurant analytics
exports.getRestaurantAnalytics = async (req, res) => {
    const restaurantId = req.user.id; // Assuming restaurant ID is set in the request
    // Implement analytics logic here
    res.status(200).json({ message: 'Analytics data for restaurant', restaurantId });
};

// Function to update restaurant status
exports.updateRestaurantStatus = async (req, res) => {
    const restaurantId = req.user.id; // Assuming restaurant ID is set in the request
    const { status } = req.body;
    try {
        await admin.firestore().collection('restaurants').doc(restaurantId).update({ status });
        res.status(200).json({ message: 'Restaurant status updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating restaurant status', error });
    }
};
