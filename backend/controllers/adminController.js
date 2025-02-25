const admin = require('firebase-admin');

// Function to get all admins
exports.getAllAdmins = async (req, res) => {
    try {
        const adminsSnapshot = await admin.firestore().collection('admins').get();
        const admins = adminsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(admins);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching admins', error });
    }
};

// Function to create a new admin
exports.createAdmin = async (req, res) => {
    try {
        const newAdmin = req.body;
        const adminRef = await admin.firestore().collection('admins').add(newAdmin);
        res.status(201).json({ id: adminRef.id, ...newAdmin });
    } catch (error) {
        res.status(500).json({ message: 'Error creating admin', error });
    }
};

// Function to login an admin
exports.loginAdmin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const adminCredential = await admin.auth().signInWithEmailAndPassword(email, password);
        res.status(200).json({ uid: adminCredential.user.uid, email: adminCredential.user.email });
    } catch (error) {
        res.status(400).json({ message: 'Error logging in admin', error });
    }
};

// Function to get admin profile
exports.getAdminProfile = async (req, res) => {
    const adminId = req.user.id; // Assuming admin ID is set in the request
    try {
        const adminDoc = await admin.firestore().collection('admins').doc(adminId).get();
        if (!adminDoc.exists) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.status(200).json({ id: adminDoc.id, ...adminDoc.data() });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching admin profile', error });
    }
};

// Function to get all users
exports.getUsers = async (req, res) => {
    // Implement logic to fetch users
};

// Function to get user by ID
exports.getUserById = async (req, res) => {
    // Implement logic to fetch user by ID
};

// Function to update user status
exports.updateUserStatus = async (req, res) => {
    // Implement logic to update user status
};

// Function to get all restaurants
exports.getRestaurants = async (req, res) => {
    // Implement logic to fetch restaurants
};

// Function to update restaurant status
exports.updateRestaurantStatus = async (req, res) => {
    // Implement logic to update restaurant status
};

// Function to get all riders
exports.getRiders = async (req, res) => {
    // Implement logic to fetch riders
};

// Function to update rider status
exports.updateRiderStatus = async (req, res) => {
    // Implement logic to update rider status
};

// Function to get system analytics
exports.getSystemAnalytics = async (req, res) => {
    // Implement logic to fetch system analytics
};

// Function to update admin permissions
exports.updateAdminPermissions = async (req, res) => {
    // Implement logic to update admin permissions
};

// Additional functions for updating and deleting admins can be added here
