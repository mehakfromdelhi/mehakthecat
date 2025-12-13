/*
 * ===========================================
 * Firebase Integration Layer
 * ===========================================
 * Provides a unified interface that uses Firebase when available,
 * falls back to localStorage otherwise
 */

import { FirebaseService } from './firebase-config.js';
import { FirebasePhotoService } from './firebase-photo-service.js';
import { FirebaseCommentService } from './firebase-comment-service.js';

const StorageAdapter = {
  /**
   * Check if Firebase is available and configured
   */
  isFirebaseAvailable() {
    return FirebaseService && 
           FirebaseService.isAvailable() &&
           FirebasePhotoService &&
           FirebaseCommentService;
  },
  
  /**
   * Upload a photo (uses Firebase if available, localStorage otherwise)
   */
  async uploadPhoto(projectId, file, metadata = {}) {
    if (this.isFirebaseAvailable()) {
      try {
        console.log('Using Firebase for photo upload');
        return await FirebasePhotoService.uploadPhoto(projectId, file, metadata);
      } catch (error) {
        console.error('Firebase upload failed, falling back to localStorage:', error);
        // Fall through to localStorage
      }
    }
    
    // Fallback to localStorage
    console.log('Using localStorage for photo upload');
    if (typeof PhotoStorageManager === 'undefined') {
      throw new Error('PhotoStorageManager not available');
    }
    
    // Convert file to data URL for localStorage
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const photoData = PhotoStorageManager.savePhoto(projectId, {
          fileName: file.name,
          url: e.target.result,
          notes: metadata.notes || `Uploaded: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`
        });
        resolve(photoData);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },
  
  /**
   * Get photos for a project
   */
  async getPhotos(projectId) {
    if (this.isFirebaseAvailable()) {
      try {
        const photos = await FirebasePhotoService.getPhotos(projectId);
        // Convert Firebase format to localStorage format for compatibility
        return photos.map(photo => ({
          id: photo.photoId || photo.id,
          fileName: photo.fileName,
          url: photo.downloadURL || photo.url,
          version: photo.version,
          uploadedAt: photo.uploadedAt,
          status: photo.status,
          approvedBy: photo.approvedBy,
          approvedAt: photo.approvedAt,
          notes: photo.notes
        }));
      } catch (error) {
        console.error('Firebase getPhotos failed, falling back to localStorage:', error);
      }
    }
    
    // Fallback to localStorage
    if (typeof PhotoStorageManager === 'undefined') {
      return [];
    }
    return PhotoStorageManager.getPhotos(projectId);
  },
  
  /**
   * Get current photo for a project
   */
  async getCurrentPhoto(projectId) {
    if (this.isFirebaseAvailable()) {
      try {
        const photo = await FirebasePhotoService.getCurrentPhoto(projectId);
        if (photo) {
          return {
            id: photo.photoId || photo.id,
            fileName: photo.fileName,
            url: photo.downloadURL || photo.url,
            version: photo.version,
            uploadedAt: photo.uploadedAt,
            status: photo.status
          };
        }
        return null;
      } catch (error) {
        console.error('Firebase getCurrentPhoto failed, falling back to localStorage:', error);
      }
    }
    
    // Fallback to localStorage
    if (typeof PhotoStorageManager === 'undefined') {
      return null;
    }
    return PhotoStorageManager.getCurrentPhoto(projectId);
  },
  
  /**
   * Update photo status
   */
  async updatePhotoStatus(projectId, photoId, status, approvedBy = null) {
    if (this.isFirebaseAvailable()) {
      try {
        return await FirebasePhotoService.updatePhotoStatus(projectId, photoId, status, approvedBy);
      } catch (error) {
        console.error('Firebase updatePhotoStatus failed, falling back to localStorage:', error);
      }
    }
    
    // Fallback to localStorage
    if (typeof PhotoStorageManager === 'undefined') {
      throw new Error('PhotoStorageManager not available');
    }
    return PhotoStorageManager.updatePhotoStatus(projectId, photoId, status, approvedBy);
  },
  
  /**
   * Save a comment
   */
  async saveComment(projectId, commentText, userType, photoId = null, authorName = null) {
    if (this.isFirebaseAvailable()) {
      try {
        return await FirebaseCommentService.saveComment(projectId, commentText, userType, photoId, authorName);
      } catch (error) {
        console.error('Firebase saveComment failed, falling back to localStorage:', error);
      }
    }
    
    // Fallback to localStorage
    if (typeof CommentsManager === 'undefined') {
      throw new Error('CommentsManager not available');
    }
    return CommentsManager.saveComment(projectId, commentText, userType, authorName);
  },
  
  /**
   * Get comments for a project
   */
  async getComments(projectId, photoId = null) {
    if (this.isFirebaseAvailable()) {
      try {
        return await FirebaseCommentService.getComments(projectId, photoId);
      } catch (error) {
        console.error('Firebase getComments failed, falling back to localStorage:', error);
      }
    }
    
    // Fallback to localStorage
    if (typeof CommentsManager === 'undefined') {
      return [];
    }
    return CommentsManager.getComments(projectId);
  },
  
  /**
   * Get comment count
   */
  async getCommentCount(projectId) {
    if (this.isFirebaseAvailable()) {
      try {
        return await FirebaseCommentService.getCommentCount(projectId);
      } catch (error) {
        console.error('Firebase getCommentCount failed, falling back to localStorage:', error);
      }
    }
    
    // Fallback to localStorage
    if (typeof CommentsManager === 'undefined') {
      return 0;
    }
    return CommentsManager.getCommentCount(projectId);
  },
  
  /**
   * Set up real-time listener for photos
   */
  onPhotosChange(projectId, callback) {
    if (this.isFirebaseAvailable()) {
      try {
        return FirebasePhotoService.onPhotosChange(projectId, callback);
      } catch (error) {
        console.error('Firebase onPhotosChange failed:', error);
      }
    }
    
    // Fallback: use storage events for localStorage
    const storageKey = PhotoStorageManager ? PhotoStorageManager.getStorageKey(projectId) : null;
    if (storageKey) {
      const handler = (e) => {
        if (e.key === storageKey) {
          const photos = PhotoStorageManager ? PhotoStorageManager.getPhotos(projectId) : [];
          callback(photos);
        }
      };
      window.addEventListener('storage', handler);
      return () => window.removeEventListener('storage', handler);
    }
    
    return () => {};
  },
  
  /**
   * Set up real-time listener for comments
   */
  onCommentsChange(projectId, callback) {
    if (this.isFirebaseAvailable()) {
      try {
        return FirebaseCommentService.onCommentsChange(projectId, callback);
      } catch (error) {
        console.error('Firebase onCommentsChange failed:', error);
      }
    }
    
    // Fallback: use storage events for localStorage
    const storageKey = CommentsManager ? CommentsManager.getStorageKey(projectId) : null;
    if (storageKey) {
      const handler = (e) => {
        if (e.key === storageKey) {
          const comments = CommentsManager ? CommentsManager.getComments(projectId) : [];
          callback(comments);
        }
      };
      window.addEventListener('storage', handler);
      return () => window.removeEventListener('storage', handler);
    }
    
    return () => {};
  }
};

// Make globally available
if (typeof window !== 'undefined') {
  window.StorageAdapter = StorageAdapter;
}

