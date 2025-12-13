# Firebase Database Structure for VuGru

## Overview
This document outlines the recommended Firebase structure for storing photos and comments with proper metadata.

## 1. Firestore Collections

### Collection: `projects`
```javascript
{
  projectId: "sunset-ridge-luxury",
  name: "Sunset Ridge Luxury Estate",
  client: "John Smith",
  clientEmail: "john.smith@example.com",
  deadline: Timestamp,
  status: "active" | "in-review" | "awaiting-feedback" | "completed",
  progress: 30,
  priority: "urgent" | "high" | "normal",
  priorityManuallySet: boolean,
  createdAt: Timestamp,
  lastUpdated: Timestamp,
  createdBy: "agent@vugru.com", // Agent who created the project
  assignedAgent: "agent@vugru.com" // Current assigned agent
}
```

### Collection: `photos`
```javascript
{
  photoId: "photo-1234567890-abc",
  projectId: "sunset-ridge-luxury",
  fileName: "living-room-v2.jpg",
  storagePath: "projects/sunset-ridge-luxury/photo-1234567890-abc.jpg", // Firebase Storage path
  downloadURL: "https://firebasestorage.googleapis.com/...", // Public URL
  version: 1,
  uploadedAt: Timestamp,
  uploadedBy: "agent@vugru.com", // Agent who uploaded
  uploadedByDisplayName: "John Agent", // Display name
  status: "under-review" | "approved" | "not-approved",
  approvedBy: "client@example.com" | null,
  approvedAt: Timestamp | null,
  notes: "Uploaded: living-room-v2.jpg (2.5 MB)",
  fileSize: 2621440, // bytes
  mimeType: "image/jpeg",
  dimensions: {
    width: 1920,
    height: 1080
  }
}
```

### Collection: `comments`
```javascript
{
  commentId: "comment-1234567890-xyz",
  projectId: "sunset-ridge-luxury",
  photoId: "photo-1234567890-abc" | null, // null if general project comment
  text: "Can you make the lighting brighter?",
  author: "client" | "agent",
  authorEmail: "client@example.com" | "agent@vugru.com",
  authorDisplayName: "John Smith" | "Vugru Agent",
  timestamp: Timestamp,
  status: "new" | "in-progress" | "completed",
  version: 1, // Photo version this comment refers to (if applicable)
  replies: [
    {
      replyId: "reply-1234567890",
      text: "Sure, I'll adjust the lighting.",
      author: "agent",
      authorEmail: "agent@vugru.com",
      authorDisplayName: "Vugru Agent",
      timestamp: Timestamp
    }
  ]
}
```

### Collection: `users`
```javascript
{
  userId: "user-email-or-uid",
  email: "agent@vugru.com",
  displayName: "John Agent",
  role: "agent" | "client",
  createdAt: Timestamp,
  lastLogin: Timestamp
}
```

## 2. Firebase Storage Structure

```
/projects/
  /{projectId}/
    /photos/
      /{photoId}.jpg
      /{photoId}-v2.jpg
    /thumbnails/
      /{photoId}-thumb.jpg
```

## 3. Security Rules

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Projects: Agents can read/write, clients can read their own
    match /projects/{projectId} {
      allow read: if request.auth != null && 
        (resource.data.assignedAgent == request.auth.token.email || 
         resource.data.clientEmail == request.auth.token.email);
      allow write: if request.auth != null && 
        request.auth.token.email == resource.data.assignedAgent;
    }
    
    // Photos: Agents can write, clients can read
    match /photos/{photoId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
        request.auth.token.email == get(/databases/$(database)/documents/projects/$(resource.data.projectId)).data.assignedAgent;
      allow update: if request.auth != null && 
        (request.auth.token.email == resource.data.uploadedBy || 
         request.auth.token.email == get(/databases/$(database)/documents/projects/$(resource.data.projectId)).data.clientEmail);
    }
    
    // Comments: Both agents and clients can read/write
    match /comments/{commentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /projects/{projectId}/photos/{photoId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.token.email == firestore.get(/databases/(default)/documents/projects/$(projectId)).data.assignedAgent;
    }
  }
}
```

## 4. Indexes Needed

Create composite indexes in Firestore:
- `photos`: `projectId` + `uploadedAt` (descending)
- `comments`: `projectId` + `timestamp` (descending)
- `comments`: `photoId` + `timestamp` (descending)

## 5. Migration Strategy

1. **Phase 1**: Set up Firebase, keep localStorage as fallback
2. **Phase 2**: Implement Firebase sync layer
3. **Phase 3**: Migrate existing data from localStorage
4. **Phase 4**: Remove localStorage dependency

## 6. Cost Considerations

**Free Tier (Spark Plan)**:
- Firestore: 50K reads, 20K writes, 20K deletes per day
- Storage: 5GB storage, 1GB downloads per day
- Authentication: Unlimited

**Paid Tier (Blaze Plan)** - Pay as you go:
- Firestore: $0.06 per 100K reads, $0.18 per 100K writes
- Storage: $0.026 per GB/month, $0.12 per GB downloads
- Very affordable for small-medium scale

## 7. Implementation Priority

1. ✅ Set up Firebase project
2. ✅ Configure Firestore collections
3. ✅ Set up Firebase Storage
4. ✅ Implement authentication
5. ✅ Create Firebase service layer
6. ✅ Migrate photo uploads
7. ✅ Migrate comments
8. ✅ Add real-time listeners
9. ✅ Migrate existing localStorage data

