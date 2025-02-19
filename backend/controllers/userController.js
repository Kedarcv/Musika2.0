const asyncHandler = require('express-async-handler');
const { auth, db } = require('../config/firebase-admin');

// @desc    Register new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Create user in Firebase Auth
  const userRecord = await auth.createUser({
    email,
    password,
    displayName: name,
  });

  // Store additional user data in Firestore
  await db.collection('users').doc(userRecord.uid).set({
    name,
    email,
    role: 'customer',
    createdAt: new Date().toISOString(),
  });

  // Get ID token
  const token = await auth.createCustomToken(userRecord.uid);

  res.status(201).json({
    id: userRecord.uid,
    name: userRecord.displayName,
    email: userRecord.email,
    role: 'customer',
    token,
  });
});

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Find user by email in Firebase Auth
  const userRecord = await auth.getUserByEmail(email);

  // Get user data from Firestore
  const userDoc = await db.collection('users').doc(userRecord.uid).get();
  const userData = userDoc.data();

  // Create custom token
  const token = await auth.createCustomToken(userRecord.uid);

  res.json({
    id: userRecord.uid,
    name: userRecord.displayName,
    email: userRecord.email,
    role: userData.role,
    token,
  });
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const userDoc = await db.collection('users').doc(req.user.id).get();
  const userData = userDoc.data();

  res.json({
    id: req.user.id,
    name: userData.name,
    email: userData.email,
    role: userData.role,
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  // Update in Firebase Auth
  await auth.updateUser(req.user.id, {
    displayName: name,
    email,
  });

  // Update in Firestore
  await db.collection('users').doc(req.user.id).update({
    name,
    email,
    updatedAt: new Date().toISOString(),
  });

  const userDoc = await db.collection('users').doc(req.user.id).get();
  const userData = userDoc.data();

  res.json({
    id: req.user.id,
    name: userData.name,
    email: userData.email,
    role: userData.role,
  });
});

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
};
