const admin = require('firebase-admin');
const path = require('path');

// Get the absolute path to the service account file
const serviceAccountPath = path.join(__dirname, '..', 'firebase-service-account.json');

// Initialize Firebase Admin
try {
  admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath))
  });
  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
}

const auth = admin.auth();
const db = admin.firestore();

module.exports = { admin, auth, db };
