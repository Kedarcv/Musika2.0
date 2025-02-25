const admin = require('firebase-admin');

// Function to get all orders
exports.getAllOrders = async (req, res) => {
    try {
        const ordersSnapshot = await admin.firestore().collection('orders').get();
        const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error });
    }
};

// Function to create a new order
exports.createOrder = async (req, res) => {
    try {
        const newOrder = req.body;
        const orderRef = await admin.firestore().collection('orders').add(newOrder);
        res.status(201).json({ id: orderRef.id, ...newOrder });
    } catch (error) {
        res.status(500).json({ message: 'Error creating order', error });
    }
};

// Function to get an order by ID
exports.getOrderById = async (req, res) => {
    const orderId = req.params.id;
    try {
        const orderDoc = await admin.firestore().collection('orders').doc(orderId).get();
        if (!orderDoc.exists) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json({ id: orderDoc.id, ...orderDoc.data() });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching order', error });
    }
};

// Function to update order status
exports.updateOrderStatus = async (req, res) => {
    const orderId = req.params.id;
    const { status } = req.body;
    try {
        await admin.firestore().collection('orders').doc(orderId).update({ status });
        res.status(200).json({ message: 'Order status updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating order status', error });
    }
};

// Function to assign a rider to an order
exports.assignRider = async (req, res) => {
    const orderId = req.params.id;
    const { riderId } = req.body;
    try {
        await admin.firestore().collection('orders').doc(orderId).update({ riderId });
        res.status(200).json({ message: 'Rider assigned successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error assigning rider', error });
    }
};

// Function to rate an order
exports.rateOrder = async (req, res) => {
    const orderId = req.params.id;
    const { rating } = req.body;
    try {
        await admin.firestore().collection('orders').doc(orderId).update({ rating });
        res.status(200).json({ message: 'Order rated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error rating order', error });
    }
};

// Function to update order payment
exports.updateOrderPayment = async (req, res) => {
    const orderId = req.params.id;
    const { paymentStatus } = req.body;
    try {
        await admin.firestore().collection('orders').doc(orderId).update({ paymentStatus });
        res.status(200).json({ message: 'Order payment updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating order payment', error });
    }
};

// Additional functions for updating and deleting orders can be added here
