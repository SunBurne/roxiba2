// src/config/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDIzMzSP8Ni4u6k59KhkO-iArEHLN80EZY",
  authDomain: "snillmafia-9403a.firebaseapp.com",
  projectId: "snillmafia-9403a",
  storageBucket: "snillmafia-9403a.firebasestorage.app",
  messagingSenderId: "414442673404",
  appId: "1:414442673404:web:d21fb37ccf9b890043b379",
  measurementId: "G-TRJXCX6KK3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { db };
export default app;