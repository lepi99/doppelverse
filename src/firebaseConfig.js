// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase web configuration is public client configuration, not authorization.
// Keep values in local/deployment environment settings instead of source code.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "doppelverse.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "doppelverse.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "659130239989",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:659130239989:web:2a73ff0ec11cb126472ebc",
};

const missingConfig = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingConfig.length) {
  throw new Error(`Missing Firebase configuration: ${missingConfig.join(', ')}`);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get references to the services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
