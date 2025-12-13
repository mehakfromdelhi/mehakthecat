/*
 * ===========================================
 * Firebase Configuration
 * ===========================================
 * Initialize Firebase services (Firestore, Storage, Auth)
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://console.firebase.google.com/
 * 2. Create a new project or select existing one
 * 3. Enable Firestore Database (Start in test mode initially)
 * 4. Enable Firebase Storage
 * 5. Go to Project Settings > General > Your apps
 * 6. Add a web app and copy the config object
 * 7. Replace the placeholder config below with your actual config
 */

// TODO: Replace with your Firebase project configuration
// Get this from Firebase Console > Project Settings > General > Your apps > Web app
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
let firebaseApp;
let db; // Firestore database
let storage; // Firebase Storage
let auth; // Firebase Authentication

try {
  // Check if Firebase is already initialized
  if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
    firebaseApp = firebase.app();
    db = firebase.firestore();
    storage = firebase.storage();
    auth = firebase.auth();
  } else if (typeof firebase !== 'undefined') {
    // Initialize Firebase
    firebaseApp = firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    storage = firebase.storage();
    auth = firebase.auth();
    
    console.log('Firebase initialized successfully');
  } else {
    console.warn('Firebase SDK not loaded. Make sure to include Firebase scripts in your HTML.');
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

// Export Firebase services
const FirebaseService = {
  // Check if Firebase is available
  isAvailable() {
    return typeof firebase !== 'undefined' && db !== undefined;
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

// Make FirebaseService globally available
if (typeof window !== 'undefined') {
  window.FirebaseService = FirebaseService;
}

