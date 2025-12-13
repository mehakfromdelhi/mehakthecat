/*
 * ===========================================
 * Firebase Configuration
 * ===========================================
 * Initialize Firebase services (Firestore, Storage, Auth)
 * Uses Firebase JS SDK v12.6.0 with ES6 modules
 */

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBYT-__KNgIr1WU-0kXjxD-m9C8TnNPq-4",
  authDomain: "vugru-96d27.firebaseapp.com",
  projectId: "vugru-96d27",
  storageBucket: "vugru-96d27.firebasestorage.app",
  messagingSenderId: "1001802559480",
  appId: "1:1001802559480:web:00517e22a119979a9e700d",
  measurementId: "G-1L3143VXTM"
};

// Initialize Firebase
let firebaseApp;
let db; // Firestore database
let storage; // Firebase Storage
let auth; // Firebase Authentication

try {
  // Initialize Firebase
  firebaseApp = initializeApp(firebaseConfig);
  db = getFirestore(firebaseApp);
  storage = getStorage(firebaseApp);
  auth = getAuth(firebaseApp);
  
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

// Export Firebase services
const FirebaseService = {
  // Check if Firebase is available
  isAvailable() {
    return firebaseApp !== undefined && db !== undefined;
  },
  
  // Get Firestore database instance
  getDb() {
    if (!this.isAvailable()) {
      console.warn('Firebase is not available');
      return null;
    }
    return db;
  },
  
  // Get Storage instance
  getStorage() {
    if (!this.isAvailable()) {
      console.warn('Firebase is not available');
      return null;
    }
    return storage;
  },
  
  // Get Auth instance
  getAuth() {
    if (!this.isAvailable()) {
      console.warn('Firebase is not available');
      return null;
    }
    return auth;
  },
  
  // Get current user
  getCurrentUser() {
    if (!this.isAvailable()) return null;
    return auth.currentUser;
  },
  
  // Get current user email
  getCurrentUserEmail() {
    const user = this.getCurrentUser();
    return user ? user.email : null;
  },
  
  // Get current user display name
  getCurrentUserDisplayName() {
    const user = this.getCurrentUser();
    return user ? (user.displayName || user.email) : null;
  }
};

// Export for use in other modules
export { FirebaseService, db, storage, auth, firebaseApp };

