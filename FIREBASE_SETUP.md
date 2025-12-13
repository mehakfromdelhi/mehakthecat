# Firebase Setup Guide for VuGru

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select existing project
3. Follow the setup wizard:
   - Enter project name: `vugru` (or your preferred name)
   - Enable Google Analytics (optional)
   - Create project

## Step 2: Enable Firestore Database

1. In Firebase Console, go to **Build** > **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (we'll add security rules later)
4. Select a location (choose closest to your users)
5. Click **Enable**

## Step 3: Enable Firebase Storage

1. In Firebase Console, go to **Build** > **Storage**
2. Click **Get started**
3. Choose **Start in test mode**
4. Select same location as Firestore
5. Click **Done**

## Step 4: Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click the **Web** icon (`</>`)
4. Register app:
   - App nickname: `VuGru Web App`
   - Don't check "Also set up Firebase Hosting"
   - Click **Register app**
5. Copy the `firebaseConfig` object

## Step 5: Update Configuration File

1. Open `firebase-config.js` in your project
2. Replace the placeholder config with your actual config:

```javascript
const firebaseConfig = {
  apiKey: "AIza...", // Your actual API key
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## Step 6: Add Firebase SDK to HTML

Add these scripts to your HTML files (before your other scripts):

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"></script>

<!-- Your Firebase config and services -->
<script src="firebase-config.js"></script>
<script src="firebase-photo-service.js"></script>
<script src="firebase-comment-service.js"></script>
```

## Step 7: Set Up Firestore Security Rules

1. In Firebase Console, go to **Firestore Database** > **Rules**
2. Replace with the rules from `FIREBASE_STRUCTURE.md`
3. Click **Publish**

## Step 8: Set Up Storage Security Rules

1. In Firebase Console, go to **Storage** > **Rules**
2. Replace with the rules from `FIREBASE_STRUCTURE.md`
3. Click **Publish**

## Step 9: Create Firestore Indexes

1. In Firebase Console, go to **Firestore Database** > **Indexes**
2. Create these composite indexes:

**Index 1:**
- Collection: `photos`
- Fields: `projectId` (Ascending), `uploadedAt` (Descending)

**Index 2:**
- Collection: `comments`
- Fields: `projectId` (Ascending), `timestamp` (Descending)

**Index 3:**
- Collection: `comments`
- Fields: `photoId` (Ascending), `timestamp` (Descending)

## Step 10: Test the Setup

1. Open your app in the browser
2. Open browser console (F12)
3. Check for "Firebase initialized successfully" message
4. Try uploading a photo to test Firebase Storage
5. Try posting a comment to test Firestore

## Troubleshooting

### "Firebase is not available"
- Make sure Firebase SDK scripts are loaded before your config
- Check that `firebase-config.js` has correct configuration
- Verify Firebase scripts are loading (check Network tab)

### "Permission denied" errors
- Check Firestore and Storage security rules
- Make sure rules allow read/write for authenticated users
- Verify user is authenticated

### Upload fails
- Check Storage rules allow uploads
- Verify file size is within limits
- Check browser console for specific error messages

## Next Steps

After setup is complete:
1. ✅ Test photo uploads
2. ✅ Test comments
3. ✅ Implement real-time listeners
4. ✅ Migrate existing localStorage data
5. ✅ Set up Firebase Authentication (if not using custom auth)

