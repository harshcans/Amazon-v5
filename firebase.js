// firebase.js

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBHolhUHjZTYfhOMvqy4Q-yZ1wtuAghcx4",
  authDomain: "nxt-8b4a5.firebaseapp.com",
  projectId: "nxt-8b4a5",
  storageBucket: "nxt-8b4a5.appspot.com",
  messagingSenderId: "391730790043",
  appId: "1:391730790043:web:a26662c36c06b6a6bed03e",
  measurementId: "G-K7V3W17242",
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Get Firestore instance
const db = getFirestore(app);

export default db;
