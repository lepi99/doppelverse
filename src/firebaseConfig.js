// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBXGm30brdtcRA6Gcap-JaAuikwa4InXJc",
  authDomain: "doppelverse.firebaseapp.com",
  projectId: "doppelverse",
  storageBucket: "doppelverse.firebasestorage.app",
  messagingSenderId: "659130239989",
  appId: "1:659130239989:web:2a73ff0ec11cb126472ebc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get references to the services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
