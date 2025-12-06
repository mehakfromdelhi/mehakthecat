/*
 * ===========================================
 * Video Storage Manager
 * ===========================================
 * Manages video uploads, versions, and video-related data per project
 * Uses localStorage for persistence
 */

const VideoStorageManager = {
    STORAGE_KEY_PREFIX: 'vugru-videos-',
    
    /**
     * Get storage key for a project
     */
    getStorageKey(projectId) {
        return `${this.STORAGE_KEY_PREFIX}${projectId}`;
    },
    
    /**
     * Get all videos for a project
     */
    getVideos(projectId) {
        const key = this.getStorageKey(projectId);
        const videosJson = localStorage.getItem(key);
        return videosJson ? JSON.parse(videosJson) : [];
    },
    
    /**
     * Save a new video version
     */
    saveVideo(projectId, videoData) {
        const videos = this.getVideos(projectId);
        const newVideo = {
            id: `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            url: videoData.url, // Blob URL or file path
            version: videos.length + 1,
            uploadedAt: Date.now(),
            uploadedBy: videoData.uploadedBy || 'agent',
            status: 'pending', // 'pending', 'approved', 'not-approved'
            approvedBy: null,
            approvedAt: null,
            notes: videoData.notes || ''
        };
        
        videos.push(newVideo);
        const key = this.getStorageKey(projectId);
        localStorage.setItem(key, JSON.stringify(videos));
        
        // Dispatch event for real-time updates
        window.dispatchEvent(new CustomEvent('videosUpdated', {
            detail: { projectId, videos }
        }));
        
        return newVideo;
    },
    
    /**
     * Get current/latest video for a project
     */
    getCurrentVideo(projectId) {
        const videos = this.getVideos(projectId);
        if (videos.length === 0) return null;
        
        // Return the most recent video
        return videos[videos.length - 1];
    },
    
    /**
     * Get all video versions for a project (sorted by version number)
     */
    getVideoVersions(projectId) {
        const videos = this.getVideos(projectId);
        return videos.sort((a, b) => a.version - b.version);
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
        
        video.status = status; // 'approved' or 'not-approved'
        video.approvedBy = approvedBy;
        video.approvedAt = status === 'approved' ? Date.now() : null;
        
        const key = this.getStorageKey(projectId);
        localStorage.setItem(key, JSON.stringify(videos));
        
        // Dispatch event for real-time updates
        window.dispatchEvent(new CustomEvent('videosUpdated', {
            detail: { projectId, videos }
        }));
        
        // Also update project status in ProjectDataManager
        if (typeof ProjectDataManager !== 'undefined') {
            const project = ProjectDataManager.getProject(projectId);
            if (project) {
                if (status === 'approved') {
                    ProjectDataManager.updateProject(projectId, { 
                        status: 'completed',
                        progress: 100
                    });
                } else if (status === 'not-approved') {
                    ProjectDataManager.updateProject(projectId, { 
                        status: 'awaiting-feedback',
                        progress: Math.max(project.progress || 0, 50) // Keep progress but mark as awaiting feedback
                    });
                }
            }
        }
        
        return video;
    },
    
    /**
     * Get notification data for a project (for clients)
     */
    getNotifications(projectId) {
        const videos = this.getVideos(projectId);
        const comments = typeof CommentsManager !== 'undefined' 
            ? CommentsManager.getComments(projectId) 
            : [];
        
        const notifications = [];
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        
        // Check for new videos (uploaded in last 7 days)
        videos.forEach(video => {
            if (now - video.uploadedAt < 7 * oneDay) {
                if (video.version === 1) {
                    notifications.push({
                        type: 'new-video',
                        message: 'New video uploaded',
                        timestamp: video.uploadedAt,
                        videoId: video.id
                    });
                } else {
                    notifications.push({
                        type: 'new-version',
                        message: `New version ${video.version} uploaded`,
                        timestamp: video.uploadedAt,
                        videoId: video.id
                    });
                }
            }
        });
        
        // Check for comments awaiting response (agent comments from last 7 days)
        comments.forEach(comment => {
            if (comment.author === 'agent' && now - comment.timestamp < 7 * oneDay) {
                notifications.push({
                    type: 'comment-awaiting',
                    message: 'New comment from agent',
                    timestamp: comment.timestamp,
                    commentId: comment.id
                });
            }
        });
        
        // Sort by timestamp (newest first)
        return notifications.sort((a, b) => b.timestamp - a.timestamp);
    },
    
    /**
     * Format timestamp for display
     */
    formatTimestamp(timestamp) {
        const now = Date.now();
        const seconds = Math.floor((now - timestamp) / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (seconds < 60) return 'Just now';
        if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
        return new Date(timestamp).toLocaleDateString();
    }
};

