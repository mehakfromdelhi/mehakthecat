/*
 * ===========================================
 * Firebase Comment Service
 * ===========================================
 * Handles comments storage in Firestore with metadata
 */

const FirebaseCommentService = {
  /**
   * Save a new comment
   * @param {string} projectId - The project ID
   * @param {string} commentText - The comment text
   * @param {string} userType - 'client' or 'agent'
   * @param {string} photoId - Optional photo ID this comment refers to
   * @param {string} authorName - Optional author display name
   * @returns {Promise<Object>} The saved comment
   */
  async saveComment(projectId, commentText, userType, photoId = null, authorName = null) {
    if (!commentText || !commentText.trim()) {
      throw new Error('Comment text is required');
    }
    
    if (!FirebaseService.isAvailable()) {
      throw new Error('Firebase is not available');
    }
    
    const db = FirebaseService.getDb();
    const currentUser = FirebaseService.getCurrentUser();
    
    if (!currentUser) {
      throw new Error('User must be authenticated to post comments');
    }
    
    try {
      // Generate unique comment ID
      const commentId = `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Get current user info
      const authorEmail = currentUser.email;
      const authorDisplayName = authorName || FirebaseService.getCurrentUserDisplayName() || 
        (userType === 'client' ? 'Client' : 'Vugru Agent');
      
      // Get photo version if photoId is provided
      let version = null;
      if (photoId) {
        const photo = await FirebasePhotoService.getCurrentPhoto(projectId);
        version = photo ? photo.version : null;
      }
      
      // Create comment document
      const commentData = {
        commentId: commentId,
        projectId: projectId,
        photoId: photoId,
        text: commentText.trim(),
        author: userType,
        authorEmail: authorEmail,
        authorDisplayName: authorDisplayName,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        status: 'new',
        version: version,
        replies: []
      };
      
      // Save to Firestore
      await db.collection('comments').doc(commentId).set(commentData);
      
      console.log('Comment saved successfully:', commentData);
      return {
        id: commentId,
        ...commentData,
        timestamp: new Date()
      };
      
    } catch (error) {
      console.error('Error saving comment:', error);
      throw error;
    }
  },
  
  /**
   * Get all comments for a project
   * @param {string} projectId - The project ID
   * @param {string} photoId - Optional photo ID to filter comments
   * @returns {Promise<Array>} Array of comment objects
   */
  async getComments(projectId, photoId = null) {
    if (!FirebaseService.isAvailable()) {
      return [];
    }
    
    const db = FirebaseService.getDb();
    
    try {
      let query = db.collection('comments')
        .where('projectId', '==', projectId);
      
      if (photoId) {
        query = query.where('photoId', '==', photoId);
      }
      
      const snapshot = await query
        .orderBy('timestamp', 'desc')
        .get();
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date()
        };
      });
    } catch (error) {
      console.error('Error getting comments:', error);
      return [];
    }
  },
  
  /**
   * Update comment status
   * @param {string} commentId - The comment ID
   * @param {string} status - 'new', 'in-progress', or 'completed'
   * @returns {Promise<Object>} Updated comment
   */
  async updateCommentStatus(commentId, status) {
    if (!FirebaseService.isAvailable()) {
      throw new Error('Firebase is not available');
    }
    
    const db = FirebaseService.getDb();
    
    try {
      await db.collection('comments').doc(commentId).update({
        status: status,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      const commentDoc = await db.collection('comments').doc(commentId).get();
      return {
        id: commentDoc.id,
        ...commentDoc.data(),
        timestamp: commentDoc.data().timestamp?.toDate() || new Date()
      };
    } catch (error) {
      console.error('Error updating comment status:', error);
      throw error;
    }
  },
  
  /**
   * Add a reply to a comment
   * @param {string} commentId - The comment ID
   * @param {string} replyText - The reply text
   * @param {string} userType - 'client' or 'agent'
   * @param {string} authorName - Optional author display name
   * @returns {Promise<Object>} The reply object
   */
  async addReply(commentId, replyText, userType, authorName = null) {
    if (!replyText || !replyText.trim()) {
      throw new Error('Reply text is required');
    }
    
    if (!FirebaseService.isAvailable()) {
      throw new Error('Firebase is not available');
    }
    
    const db = FirebaseService.getDb();
    const currentUser = FirebaseService.getCurrentUser();
    
    if (!currentUser) {
      throw new Error('User must be authenticated to reply');
    }
    
    try {
      const replyId = `reply-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const authorEmail = currentUser.email;
      const authorDisplayName = authorName || FirebaseService.getCurrentUserDisplayName() || 
        (userType === 'client' ? 'Client' : 'Vugru Agent');
      
      const reply = {
        replyId: replyId,
        text: replyText.trim(),
        author: userType,
        authorEmail: authorEmail,
        authorDisplayName: authorDisplayName,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      // Add reply to comment's replies array
      await db.collection('comments').doc(commentId).update({
        replies: firebase.firestore.FieldValue.arrayUnion(reply),
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      return {
        ...reply,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error adding reply:', error);
      throw error;
    }
  },
  
  /**
   * Get comment count for a project
   * @param {string} projectId - The project ID
   * @returns {Promise<number>} Comment count
   */
  async getCommentCount(projectId) {
    const comments = await this.getComments(projectId);
    return comments.length;
  },
  
  /**
   * Set up real-time listener for comments
   * @param {string} projectId - The project ID
   * @param {Function} callback - Callback function when comments change
   * @returns {Function} Unsubscribe function
   */
  onCommentsChange(projectId, callback) {
    if (!FirebaseService.isAvailable()) {
      return () => {};
    }
    
    const db = FirebaseService.getDb();
    
    return db.collection('comments')
      .where('projectId', '==', projectId)
      .orderBy('timestamp', 'desc')
      .onSnapshot((snapshot) => {
        const comments = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate() || new Date()
          };
        });
        callback(comments);
      }, (error) => {
        console.error('Error in comments listener:', error);
      });
  }
};

// Make globally available
if (typeof window !== 'undefined') {
  window.FirebaseCommentService = FirebaseCommentService;
}

