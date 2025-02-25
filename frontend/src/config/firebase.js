import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { isSupported, getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAARvi6shnDr1tTkYKxQJzNxbvbHQFrwi4",
  authDomain: "musika-ec60d.firebaseapp.com",
  projectId: "musika-ec60d",
  storageBucket: "musika-ec60d.firebasestorage.app",
  messagingSenderId: "533804958864",
  appId: "1:533804958864:web:ac8ccdb5beaf274fff8415",
  measurementId: "G-QWFKHLPLFH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize Analytics only if supported
let analytics;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

export { auth, db, analytics };
export default app;
