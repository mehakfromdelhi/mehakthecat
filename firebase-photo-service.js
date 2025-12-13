/*
 * ===========================================
 * Firebase Photo Service
 * ===========================================
 * Handles photo uploads to Firebase Storage with metadata
 * Stores photo metadata in Firestore
 */

import { FirebaseService } from './firebase-config.js';
import { collection, doc, setDoc, getDocs, query, where, orderBy, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";
import { onSnapshot } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { db, storage } from './firebase-config.js';

const FirebasePhotoService = {
  /**
   * Upload a photo to Firebase Storage and save metadata to Firestore
   * @param {string} projectId - The project ID
   * @param {File} file - The photo file to upload
   * @param {Object} metadata - Additional metadata (notes, etc.)
   * @returns {Promise<Object>} Photo data with download URL
   */
  async uploadPhoto(projectId, file, metadata = {}) {
    if (!FirebaseService.isAvailable()) {
      throw new Error('Firebase is not available');
    }
    
    const currentUser = FirebaseService.getCurrentUser();
    
    if (!currentUser) {
      throw new Error('User must be authenticated to upload photos');
    }
    
    try {
      // Generate unique photo ID
      const photoId = `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create storage path
      const storagePath = `projects/${projectId}/photos/${photoId}`;
      const storageRef = ref(storage, storagePath);
      
      // Upload file to Firebase Storage
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Get file metadata
      const fileSize = file.size;
      const fileName = file.name;
      const mimeType = file.type;
      
      // Get image dimensions (if it's an image)
      let dimensions = null;
      if (file.type.startsWith('image/')) {
        dimensions = await this.getImageDimensions(file);
      }
      
      // Get current user info
      const uploadedBy = currentUser.email;
      const uploadedByDisplayName = FirebaseService.getCurrentUserDisplayName();
      
      // Get current version number for this project
      const version = await this.getNextVersion(projectId);
      
      // Create photo document in Firestore
      const photoData = {
        photoId: photoId,
        projectId: projectId,
        fileName: fileName,
        storagePath: storagePath,
        downloadURL: downloadURL,
        version: version,
        uploadedAt: serverTimestamp(),
        uploadedBy: uploadedBy,
        uploadedByDisplayName: uploadedByDisplayName || uploadedBy,
        status: 'under-review',
        approvedBy: null,
        approvedAt: null,
        notes: metadata.notes || `Uploaded: ${fileName} (${(fileSize / 1024 / 1024).toFixed(2)} MB)`,
        fileSize: fileSize,
        mimeType: mimeType,
        dimensions: dimensions
      };
      
      // Save to Firestore
      await setDoc(doc(db, 'photos', photoId), photoData);
      
      // Add notification for client
      await this.addNotification(projectId, version === 1 ? 'new-photo' : 'new-version', 
        `New ${version === 1 ? 'photo' : 'version'} uploaded: ${fileName}`);
      
      console.log('Photo uploaded successfully:', photoData);
      return photoData;
      
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  },
  
  /**
   * Get all photos for a project
   * @param {string} projectId - The project ID
   * @returns {Promise<Array>} Array of photo objects
   */
  async getPhotos(projectId) {
    if (!FirebaseService.isAvailable()) {
      return [];
    }
    
    try {
      const q = query(
        collection(db, 'photos'),
        where('projectId', '==', projectId),
        orderBy('uploadedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        uploadedAt: doc.data().uploadedAt?.toDate() || new Date()
      }));
    } catch (error) {
      console.error('Error getting photos:', error);
      return [];
    }
  },
  
  /**
   * Get the current/latest photo for a project
   * @param {string} projectId - The project ID
   * @returns {Promise<Object|null>} Latest photo or null
   */
  async getCurrentPhoto(projectId) {
    const photos = await this.getPhotos(projectId);
    if (photos.length === 0) return null;
    
    // Return the latest version
    return photos.sort((a, b) => b.version - a.version)[0];
  },
  
  /**
   * Update photo status (approved/not-approved)
   * @param {string} projectId - The project ID
   * @param {string} photoId - The photo ID
   * @param {string} status - 'approved', 'not-approved', or 'under-review'
   * @param {string} approvedBy - Email of the user approving
   * @returns {Promise<Object>} Updated photo data
   */
  async updatePhotoStatus(projectId, photoId, status, approvedBy = null) {
    if (!FirebaseService.isAvailable()) {
      throw new Error('Firebase is not available');
    }
    
    const currentUser = FirebaseService.getCurrentUser();
    
    if (!currentUser) {
      throw new Error('User must be authenticated');
    }
    
    try {
      const updateData = {
        status: status,
        lastUpdated: serverTimestamp()
      };
      
      if (status === 'approved' || status === 'not-approved') {
        updateData.approvedBy = approvedBy || currentUser.email;
        updateData.approvedAt = serverTimestamp();
      }
      
      // Update the photo document (photoId is the document ID)
      await updateDoc(doc(db, 'photos', photoId), updateData);
      
      // Get updated photo
      const photoDoc = await getDocs(query(collection(db, 'photos'), where('__name__', '==', photoId)));
      if (!photoDoc.empty) {
        const photoData = photoDoc.docs[0].data();
        return { id: photoDoc.docs[0].id, ...photoData };
      }
      // Fallback: try getting by photoId field
      const photoDoc2 = await getDocs(query(collection(db, 'photos'), where('photoId', '==', photoId)));
      if (!photoDoc2.empty) {
        const photoData = photoDoc2.docs[0].data();
        return { id: photoDoc2.docs[0].id, ...photoData };
      }
      return null;
      
    } catch (error) {
      console.error('Error updating photo status:', error);
      throw error;
    }
  },
  
  /**
   * Get next version number for a project
   * @param {string} projectId - The project ID
   * @returns {Promise<number>} Next version number
   */
  async getNextVersion(projectId) {
    const photos = await this.getPhotos(projectId);
    if (photos.length === 0) return 1;
    
    const maxVersion = Math.max(...photos.map(p => p.version || 0));
    return maxVersion + 1;
  },
  
  /**
   * Get image dimensions from file
   * @param {File} file - Image file
   * @returns {Promise<Object>} {width, height}
   */
  getImageDimensions(file) {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({
          width: img.width,
          height: img.height
        });
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      
      img.src = url;
    });
  },
  
  /**
   * Add notification for a project
   * @param {string} projectId - The project ID
   * @param {string} type - Notification type
   * @param {string} message - Notification message
   */
  async addNotification(projectId, type, message) {
    if (!FirebaseService.isAvailable()) return;
    
    try {
      const notificationRef = doc(collection(db, 'notifications'));
      await setDoc(notificationRef, {
        projectId: projectId,
        type: type,
        message: message,
        timestamp: serverTimestamp(),
        read: false
      });
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  },
  
  /**
   * Set up real-time listener for photos
   * @param {string} projectId - The project ID
   * @param {Function} callback - Callback function when photos change
   * @returns {Function} Unsubscribe function
   */
  onPhotosChange(projectId, callback) {
    if (!FirebaseService.isAvailable()) {
      return () => {};
    }
    
    
    const q = query(
      collection(db, 'photos'),
      where('projectId', '==', projectId),
      orderBy('uploadedAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const photos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        uploadedAt: doc.data().uploadedAt?.toDate() || new Date()
      }));
      callback(photos);
    }, (error) => {
      console.error('Error in photos listener:', error);
    });
  }
};

// Export for use in other modules
export { FirebasePhotoService };

