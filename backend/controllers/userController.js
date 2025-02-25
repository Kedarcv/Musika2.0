const admin = require('firebase-admin');
const { auth, db } = require('../config/firebase-admin'); // Updated import

// Function to get all users
exports.getAllUsers = async (req, res) => {
    try {
        const usersSnapshot = await db.collection('users').get();
        const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
};

// Function to create a new user
exports.createUser = async (req, res) => {
    try {
        const newUser = req.body;
        const userRef = await db.collection('users').add(newUser);
        res.status(201).json({ id: userRef.id, ...newUser });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error });
    }
};

// Function to register a new user
exports.registerUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        res.status(201).json({ uid: userCredential.user.uid, email: userCredential.user.email });
    } catch (error) {
        res.status(400).json({ message: 'Error registering user', error });
    }
};

// Function to login a user
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        res.status(200).json({ uid: userCredential.user.uid, email: userCredential.user.email });
    } catch (error) {
        res.status(400).json({ message: 'Error logging in user', error });
    }
};

// Function to get user profile
exports.getUserProfile = async (req, res) => {
    const userId = req.user.id; // Assuming user ID is set in the request
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ id: userDoc.id, ...userDoc.data() });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user profile', error });
    }
};

// Function to update user profile
exports.updateUserProfile = async (req, res) => {
    const userId = req.user.id; // Assuming user ID is set in the request
    const updatedData = req.body;
    try {
        await db.collection('users').doc(userId).update(updatedData);
        res.status(200).json({ message: 'User profile updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user profile', error });
    }
};
