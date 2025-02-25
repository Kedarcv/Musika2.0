const admin = require('firebase-admin');

// Function to get all riders
exports.getAllRiders = async (req, res) => {
    try {
        const ridersSnapshot = await admin.firestore().collection('riders').get();
        const riders = ridersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(riders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching riders', error });
    }
};

// Function to create a new rider
exports.createRider = async (req, res) => {
    try {
        const newRider = req.body;
        const riderRef = await admin.firestore().collection('riders').add(newRider);
        res.status(201).json({ id: riderRef.id, ...newRider });
    } catch (error) {
        res.status(500).json({ message: 'Error creating rider', error });
    }
};

// Function to register a new rider
exports.registerRider = async (req, res) => {
    const { email, password } = req.body;
    try {
        const riderCredential = await admin.auth().createUser({
            email,
            password,
        });
        res.status(201).json({ uid: riderCredential.uid, email: riderCredential.email });
    } catch (error) {
        res.status(400).json({ message: 'Error registering rider', error });
    }
};

// Function to login a rider
exports.loginRider = async (req, res) => {
    const { email, password } = req.body;
    try {
        const riderCredential = await admin.auth().signInWithEmailAndPassword(email, password);
        res.status(200).json({ uid: riderCredential.user.uid, email: riderCredential.user.email });
    } catch (error) {
        res.status(400).json({ message: 'Error logging in rider', error });
    }
};

// Function to get rider profile
exports.getRiderProfile = async (req, res) => {
    const riderId = req.user.id; // Assuming rider ID is set in the request
    try {
        const riderDoc = await admin.firestore().collection('riders').doc(riderId).get();
        if (!riderDoc.exists) {
            return res.status(404).json({ message: 'Rider not found' });
        }
        res.status(200).json({ id: riderDoc.id, ...riderDoc.data() });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching rider profile', error });
    }
};

// Function to update rider profile
exports.updateRiderProfile = async (req, res) => {
    const riderId = req.user.id; // Assuming rider ID is set in the request
    const updatedData = req.body;
    try {
        await admin.firestore().collection('riders').doc(riderId).update(updatedData);
        res.status(200).json({ message: 'Rider profile updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating rider profile', error });
    }
};

// Function to update rider location
exports.updateLocation = async (req, res) => {
    const riderId = req.user.id; // Assuming rider ID is set in the request
    const { currentLocation } = req.body;
    try {
        await admin.firestore().collection('riders').doc(riderId).update({ currentLocation });
        res.status(200).json({ message: 'Rider location updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating rider location', error });
    }
};

// Function to update rider availability
exports.updateAvailability = async (req, res) => {
    const riderId = req.user.id; // Assuming rider ID is set in the request
    const { isAvailable } = req.body;
    try {
        await admin.firestore().collection('riders').doc(riderId).update({ isAvailable });
        res.status(200).json({ message: 'Rider availability updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating rider availability', error });
    }
};

// Function to get active order
exports.getActiveOrder = async (req, res) => {
    const riderId = req.user.id; // Assuming rider ID is set in the request
    try {
        const orderSnapshot = await admin.firestore().collection('orders').where('riderId', '==', riderId).where('status', '==', 'active').get();
        const orders = orderSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching active order', error });
    }
};

// Function to get rider earnings
exports.getRiderEarnings = async (req, res) => {
    const riderId = req.user.id; // Assuming rider ID is set in the request
    // Implement earnings logic here
    res.status(200).json({ message: 'Earnings data for rider', riderId });
};

// Function to get rider statistics
exports.getRiderStatistics = async (req, res) => {
    const riderId = req.user.id; // Assuming rider ID is set in the request
    // Implement statistics logic here
    res.status(200).json({ message: 'Statistics data for rider', riderId });
};

// Function to update device token
exports.updateDeviceToken = async (req, res) => {
    const riderId = req.user.id; // Assuming rider ID is set in the request
    const { deviceToken } = req.body;
    try {
        await admin.firestore().collection('riders').doc(riderId).update({ deviceToken });
        res.status(200).json({ message: 'Device token updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating device token', error });
    }
};

// Additional functions for updating and deleting riders can be added here
