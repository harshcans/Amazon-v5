// firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ✅ Your Firebase client-side config (from Firebase Console → Project Settings → Web App)
const firebaseConfig = {
  apiKey: "AIzaSyCSJwXZnmE9jOY3jQjhHr1uOaIvPDigXnY",
  authDomain: "blogcans-afea5.firebaseapp.com",
  projectId: "blogcans-afea5",
  storageBucket: "blogcans-afea5.appspot.com",
  messagingSenderId: "311959528478",
  appId: "1:311959528478:web:fb5d8f089f07dd6de03a0f",
  measurementId: "G-CVFNQPXJ0J"
};


// ✅ Initialize only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
