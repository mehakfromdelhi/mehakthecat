/*
 * ===========================================
 * Video Storage Manager
 * ===========================================
 * Manages video uploads, versions, and statuses per project
 * Also handles notifications for clients
 */

const VideoStorageManager = {
    STORAGE_PREFIX: 'vugru-videos-',
    NOTIF_PREFIX: 'vugru-notifications-',
    
    /**
     * Get storage key for videos
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
     * Add a new video to a project
     */
    addVideo(projectId, fileName, url) {
        const videos = this.getVideos(projectId);
        const newVersion = videos.length + 1;
        const newVideo = {
            id: `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            fileName,
            url,
            version: newVersion,
            uploadedAt: Date.now(),
            status: 'under-review', // Default status
            approvedBy: null,
            approvedAt: null
        };
        
        videos.push(newVideo);
        localStorage.setItem(this.getStorageKey(projectId), JSON.stringify(videos));
        
        // Trigger event for video updates
        window.dispatchEvent(new CustomEvent('videosUpdated', {
            detail: { projectId, videos }
        }));
        
        // Add notification for client
        if (newVersion === 1) {
            this.addNotification(projectId, 'new-video', `New video uploaded: ${fileName}`);
        } else {
            this.addNotification(projectId, 'new-version', `New version uploaded: ${fileName}`);
        }
        
        return newVideo;
    },
    
    /**
     * Get all videos for a project
     */
    getVideos(projectId) {
        const stored = localStorage.getItem(this.getStorageKey(projectId));
        if (!stored) return [];
        
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Error parsing videos:', e);
            return [];
        }
    },
    
    /**
     * Get the current/latest video for a project
     */
    getCurrentVideo(projectId) {
        const videos = this.getVideos(projectId);
        if (videos.length === 0) return null;
        
        // Return the latest version
        return videos.sort((a, b) => b.version - a.version)[0];
    },
    
    /**
     * Update video status (approved/not-approved)
     */
    updateVideoStatus(projectId, videoId, status, approvedBy = null) {
        const videos = this.getVideos(projectId);
        const video = videos.find(v => v.id === videoId);
        
        if (!video) {
            console.error('Video not found:', videoId);
            return null;
        }
        
        video.status = status; // 'approved', 'not-approved', 'under-review'
        video.approvedBy = approvedBy;
        video.approvedAt = status === 'approved' ? Date.now() : null;
        
        localStorage.setItem(this.getStorageKey(projectId), JSON.stringify(videos));
        
        // Update project status in ProjectDataManager
        if (typeof ProjectDataManager !== 'undefined') {
            if (status === 'approved') {
                ProjectDataManager.updateProject(projectId, { status: 'completed' });
            } else if (status === 'not-approved') {
                ProjectDataManager.updateProject(projectId, { status: 'awaiting-feedback' });
            }
        }
        
        // Trigger event
        window.dispatchEvent(new CustomEvent('videosUpdated', {
            detail: { projectId, videos }
        }));
        
        return video;
    },
    
    /**
     * Save video (used by agent upload)
     */
    saveVideo(projectId, videoData) {
        const fileName = videoData.fileName || videoData.notes || 'video.mp4';
        const url = videoData.url;
        
        return this.addVideo(projectId, fileName, url);
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
            type, // 'new-video', 'new-version', 'comment-awaiting'
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
