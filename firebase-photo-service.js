/*
 * ===========================================
 * Firebase Photo Service
 * ===========================================
 * Handles photo uploads to Firebase Storage with metadata
 * Stores photo metadata in Firestore
 */

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
    
    const db = FirebaseService.getDb();
    const storage = FirebaseService.getStorage();
    const currentUser = FirebaseService.getCurrentUser();
    
    if (!currentUser) {
      throw new Error('User must be authenticated to upload photos');
    }
    
    try {
      // Generate unique photo ID
      const photoId = `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create storage path
      const storagePath = `projects/${projectId}/photos/${photoId}`;
      const storageRef = storage.ref().child(storagePath);
      
      // Upload file to Firebase Storage
      const uploadTask = storageRef.put(file);
      
      // Wait for upload to complete
      const snapshot = await uploadTask;
      
      // Get download URL
      const downloadURL = await snapshot.ref.getDownloadURL();
      
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
        uploadedAt: firebase.firestore.FieldValue.serverTimestamp(),
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
      await db.collection('photos').doc(photoId).set(photoData);
      
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
    
    const db = FirebaseService.getDb();
    
    try {
      const snapshot = await db.collection('photos')
        .where('projectId', '==', projectId)
        .orderBy('uploadedAt', 'desc')
        .get();
      
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
    
    const db = FirebaseService.getDb();
    const currentUser = FirebaseService.getCurrentUser();
    
    if (!currentUser) {
      throw new Error('User must be authenticated');
    }
    
    try {
      const updateData = {
        status: status,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      if (status === 'approved' || status === 'not-approved') {
        updateData.approvedBy = approvedBy || currentUser.email;
        updateData.approvedAt = firebase.firestore.FieldValue.serverTimestamp();
      }
      
      await db.collection('photos').doc(photoId).update(updateData);
      
      // Get updated photo
      const photoDoc = await db.collection('photos').doc(photoId).get();
      return { id: photoDoc.id, ...photoDoc.data() };
      
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
    
    const db = FirebaseService.getDb();
    
    try {
      await db.collection('notifications').add({
        projectId: projectId,
        type: type,
        message: message,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
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
    
    const db = FirebaseService.getDb();
    
    return db.collection('photos')
      .where('projectId', '==', projectId)
      .orderBy('uploadedAt', 'desc')
      .onSnapshot((snapshot) => {
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

// Make globally available
if (typeof window !== 'undefined') {
  window.FirebasePhotoService = FirebasePhotoService;
}

