/*
 * ===========================================
 * Photo Storage Manager
 * ===========================================
 * Manages photo uploads, versions, and statuses per project
 * Also handles notifications for clients
 */

const PhotoStorageManager = {
    STORAGE_PREFIX: 'vugru-photos-',
    NOTIF_PREFIX: 'vugru-notifications-',
    
    /**
     * Get storage key for photos
     */
    getStorageKey(projectId) {
        return `${this.STORAGE_PREFIX}${projectId}`;
    },
    
    /**
     * Get storage key for notifications
     */
    getNotifKey(projectId) {
        return `${this.NOTIF_PREFIX}${projectId}`;
    },
    
    /**
     * Add a new photo to a project
     */
    addPhoto(projectId, fileName, url) {
        const photos = this.getPhotos(projectId);
        const newVersion = photos.length + 1;
        const newPhoto = {
            id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            fileName,
            url,
            version: newVersion,
            uploadedAt: Date.now(),
            status: 'under-review', // Default status
            approvedBy: null,
            approvedAt: null
        };
        
        photos.push(newPhoto);
        localStorage.setItem(this.getStorageKey(projectId), JSON.stringify(photos));
        
        // Trigger event for photo updates
        window.dispatchEvent(new CustomEvent('photosUpdated', {
            detail: { projectId, photos }
        }));
        
        // Add notification for client
        if (newVersion === 1) {
            this.addNotification(projectId, 'new-photo', `New photo uploaded: ${fileName}`);
        } else {
            this.addNotification(projectId, 'new-version', `New version uploaded: ${fileName}`);
        }
        
        return newPhoto;
    },
    
    /**
     * Get all photos for a project
     */
    getPhotos(projectId) {
        const stored = localStorage.getItem(this.getStorageKey(projectId));
        if (!stored) return [];
        
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Error parsing photos:', e);
            return [];
        }
    },
    
    /**
     * Get the current/latest photo for a project
     */
    getCurrentPhoto(projectId) {
        const photos = this.getPhotos(projectId);
        if (photos.length === 0) return null;
        
        // Return the latest version
        return photos.sort((a, b) => b.version - a.version)[0];
    },
    
    /**
     * Update photo status (approved/not-approved)
     */
    updatePhotoStatus(projectId, photoId, status, approvedBy = null) {
        const photos = this.getPhotos(projectId);
        const photo = photos.find(p => p.id === photoId);
        
        if (!photo) {
            console.error('Photo not found:', photoId);
            return null;
        }
        
        photo.status = status; // 'approved', 'not-approved', 'under-review'
        photo.approvedBy = approvedBy;
        photo.approvedAt = status === 'approved' ? Date.now() : null;
        
        localStorage.setItem(this.getStorageKey(projectId), JSON.stringify(photos));
        
        // Update project status in ProjectDataManager
        if (typeof ProjectDataManager !== 'undefined') {
            if (status === 'approved') {
                ProjectDataManager.updateProject(projectId, { status: 'completed' });
            } else if (status === 'not-approved') {
                ProjectDataManager.updateProject(projectId, { status: 'awaiting-feedback' });
            }
        }
        
        // Trigger event
        window.dispatchEvent(new CustomEvent('photosUpdated', {
            detail: { projectId, photos }
        }));
        
        return photo;
    },
    
    /**
     * Save photo (used by agent upload)
     */
    savePhoto(projectId, photoData) {
        const fileName = photoData.fileName || photoData.notes || 'photo.jpg';
        const url = photoData.url;
        
        return this.addPhoto(projectId, fileName, url);
    },
    
    /**
     * Get notifications for a project
     */
    getNotifications(projectId) {
        const stored = localStorage.getItem(this.getNotifKey(projectId));
        if (!stored) return [];
        
        try {
            const notifications = JSON.parse(stored);
            // Sort by timestamp (newest first)
            return notifications.sort((a, b) => b.timestamp - a.timestamp);
        } catch (e) {
            console.error('Error parsing notifications:', e);
            return [];
        }
    },
    
    /**
     * Add a notification
     */
    addNotification(projectId, type, message, newStatus = null) {
        const notifications = this.getNotifications(projectId);
        const newNotif = {
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type, // 'new-photo', 'new-version', 'comment-awaiting'
            message,
            commentText: message, // For comment-related notifications
            newStatus, // For comment status updates
            timestamp: Date.now(),
            read: false
        };
        
        notifications.unshift(newNotif); // Add to the beginning
        localStorage.setItem(this.getNotifKey(projectId), JSON.stringify(notifications));
        
        // Trigger event
        window.dispatchEvent(new CustomEvent('notificationsUpdated', {
            detail: { projectId, notifications }
        }));
        
        return newNotif;
    },
    
    /**
     * Mark notifications as read
     */
    markNotificationsAsRead(projectId) {
        const notifications = this.getNotifications(projectId);
        notifications.forEach(n => n.read = true);
        localStorage.setItem(this.getNotifKey(projectId), JSON.stringify(notifications));
        
        window.dispatchEvent(new CustomEvent('notificationsUpdated', {
            detail: { projectId, notifications }
        }));
    },
    
    /**
     * Get unread notification count
     */
    getUnreadCount(projectId) {
        const notifications = this.getNotifications(projectId);
        return notifications.filter(n => !n.read).length;
    },
    
    /**
     * Format timestamp to relative time
     */
    formatTimestamp(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (seconds < 60) return 'Just now';
        if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
        if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
        if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
        
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
};

