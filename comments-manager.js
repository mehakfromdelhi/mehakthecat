/*
 * ===========================================
 * Comments Manager - Shared Comment System
 * ===========================================
 * Handles bidirectional comments between agents and clients
 * Uses localStorage for persistence and cross-tab synchronization
 */

const CommentsManager = {
    // Storage key prefix
    STORAGE_PREFIX: 'vugru-comments-',
    
    /**
     * Get storage key for a project
     */
    getStorageKey(projectId) {
        return `${this.STORAGE_PREFIX}${projectId}`;
    },
    
    /**
     * Get current project ID from sessionStorage or default
     */
    getCurrentProjectId() {
        // Try to get from sessionStorage (set when navigating from project dashboard)
        const storedProject = sessionStorage.getItem('selectedProject');
        if (storedProject) {
            try {
                const project = JSON.parse(storedProject);
                return project.id || project.name || 'default-project';
            } catch (e) {
                console.error('Error parsing selected project:', e);
            }
        }
        
        // Try to get from URL or page title
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('projectId');
        if (projectId) return projectId;
        
        // Default project ID based on page
        if (window.location.pathname.includes('Clientview')) {
            return '123-main-st'; // Default client project
        }
        
        // Get from header title if available
        const headerTitle = document.querySelector('.header-title');
        if (headerTitle) {
            return headerTitle.textContent.trim().toLowerCase().replace(/\s+/g, '-');
        }
        
        return 'default-project';
    },
    
    /**
     * Save a new comment
     */
    saveComment(projectId, commentText, userType, authorName = null) {
        if (!commentText || !commentText.trim()) {
            return null;
        }
        
        const comment = {
            id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            text: commentText.trim(),
            author: userType, // 'client' or 'agent'
            authorName: authorName || (userType === 'client' ? 'Client' : 'Vugru (Agent)'),
            timestamp: Date.now(),
            version: this.getCurrentVersion(), // Optional: link to video version
            status: 'new' // Default status: 'new', 'work-in-progress', 'complete'
        };
        
        const comments = this.getComments(projectId);
        comments.push(comment);
        
        // Save to localStorage
        const storageKey = this.getStorageKey(projectId);
        localStorage.setItem(storageKey, JSON.stringify(comments));
        
        // Trigger custom event for same-tab updates (storage events only fire in other tabs)
        window.dispatchEvent(new CustomEvent('commentsUpdated', {
            detail: { projectId, comments }
        }));
        
        return comment;
    },
    
    /**
     * Get all comments for a project
     */
    getComments(projectId) {
        const storageKey = this.getStorageKey(projectId);
        const stored = localStorage.getItem(storageKey);
        
        if (!stored) {
            return [];
        }
        
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Error parsing comments:', e);
            return [];
        }
    },
    
    /**
     * Delete a comment (optional feature)
     */
    deleteComment(projectId, commentId) {
        const comments = this.getComments(projectId);
        const filtered = comments.filter(c => c.id !== commentId);
        
        const storageKey = this.getStorageKey(projectId);
        localStorage.setItem(storageKey, JSON.stringify(filtered));
        
        // Trigger custom event for same-tab updates
        window.dispatchEvent(new CustomEvent('commentsUpdated', {
            detail: { projectId, comments: filtered }
        }));
    },
    
    /**
     * Get current video version (if applicable)
     */
    getCurrentVersion() {
        // Try to get from revision history or video player
        const versionElement = document.querySelector('.revision-list-title-active, .card-title-xl');
        if (versionElement) {
            const versionText = versionElement.textContent;
            const versionMatch = versionText.match(/[Vv]ersion\s+(\d+)/);
            if (versionMatch) {
                return `v${versionMatch[1]}`;
            }
        }
        return null;
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
        
        // For older comments, show date
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    },
    
    /**
     * Render comments in client view style
     */
    renderCommentsClient(projectId, containerElement) {
        if (!containerElement) return;
        
        const comments = this.getComments(projectId);
        containerElement.innerHTML = '';
        
        if (comments.length === 0) {
            containerElement.innerHTML = '<p class="text-sm text-gray-500 italic">No comments yet. Start the conversation!</p>';
            return;
        }
        
        // Sort by timestamp (newest first)
        const sortedComments = [...comments].sort((a, b) => b.timestamp - a.timestamp);
        
        sortedComments.forEach(comment => {
            const commentDiv = document.createElement('div');
            commentDiv.className = 'p-3 bg-gray-50 rounded-lg';
            
            const authorLabel = comment.author === 'client' ? 'You' : comment.authorName;
            const authorClass = comment.author === 'client' ? 'font-medium' : 'font-medium text-indigo-600';
            
            commentDiv.innerHTML = `
                <p class="text-sm text-gray-800">
                    <span class="${authorClass}">${authorLabel}:</span> ${this.escapeHtml(comment.text)}
                </p>
                <p class="text-xs text-gray-400 mt-1">${this.formatTimestamp(comment.timestamp)}</p>
            `;
            
            containerElement.appendChild(commentDiv);
        });
    },
    
    /**
     * Render comments in agent view style (video dashboard)
     */
    renderCommentsAgent(projectId, containerElement) {
        if (!containerElement) return;
        
        const comments = this.getComments(projectId);
        
        // Get existing feedback list or create structure
        let feedbackList = containerElement.querySelector('.feedback-list');
        if (!feedbackList) {
            // If container is the section, find or create the list
            feedbackList = containerElement.closest('.card')?.querySelector('.feedback-list');
        }
        
        if (!feedbackList) {
            console.warn('Feedback list container not found');
            return;
        }
        
        // Clear existing dynamic comments (keep static ones if any)
        const dynamicComments = feedbackList.querySelectorAll('[data-comment-id]');
        dynamicComments.forEach(el => el.remove());
        
        // Sort by timestamp (oldest first for conversation flow)
        const sortedComments = [...comments].sort((a, b) => a.timestamp - b.timestamp);
        
        sortedComments.forEach(comment => {
            const isAgent = comment.author === 'agent';
            const listItem = document.createElement('li');
            listItem.className = 'feedback-list-item';
            listItem.setAttribute('data-comment-id', comment.id);
            
            if (isAgent) {
                // Agent comment style (right-aligned, purple gradient)
                listItem.innerHTML = `
                    <div class="feedback-item-comment-vugru">
                        <div class="feedback-avatar-vugru">
                            <span class="avatar-initials">V</span>
                        </div>
                        <div class="feedback-comment-bubble-container-vugru">
                            <h4 class="feedback-author-vugru">${this.escapeHtml(comment.authorName)}</h4>
                            <p class="feedback-timestamp-vugru">${this.formatTimestamp(comment.timestamp)}</p>
                            <p class="feedback-comment-bubble-vugru">"${this.escapeHtml(comment.text)}"</p>
                        </div>
                    </div>
                `;
            } else {
                // Client comment style (left-aligned, gray background)
                const commentStatus = comment.status || 'new';
                const statusId = `status-${comment.id}`;
                
                // Get client name from project data if available
                let clientName = comment.authorName || 'Client';
                if (typeof ProjectDataManager !== 'undefined') {
                    const project = ProjectDataManager.getProject(projectId);
                    if (project && project.client) {
                        clientName = project.client;
                    }
                }
                
                listItem.innerHTML = `
                    <div class="feedback-item-comment">
                        <img class="feedback-avatar" src="https://i.pravatar.cc/40?u=${encodeURIComponent(clientName)}" alt="${this.escapeHtml(clientName)}">
                        <div class="feedback-comment-bubble-container">
                            <h4 class="feedback-author">${this.escapeHtml(clientName)}</h4>
                            <p class="feedback-timestamp">${this.formatTimestamp(comment.timestamp)}</p>
                            <p class="feedback-comment-bubble-client">"${this.escapeHtml(comment.text)}"</p>
                        </div>
                        <div class="popover-wrapper feedback-status-wrapper">
                            <button id="${statusId}" data-toggle="popover" data-target="#status-menu-${comment.id}" type="button" class="feedback-status-button" data-comment-id="${comment.id}">
                                Status: ${this.getStatusLabel(commentStatus)}
                                <svg class="icon-chevron-sm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
                                </svg>
                            </button>
                            <div id="status-menu-${comment.id}" class="popover-menu popover-menu-status">
                                <div class="popover-list">
                                    <a href="#" class="popover-list-item-status" data-status="new" data-comment-id="${comment.id}">
                                        <span class="status-dot-blue"></span>
                                        New
                                    </a>
                                    <a href="#" class="popover-list-item-status" data-status="work-in-progress" data-comment-id="${comment.id}">
                                        <span class="status-dot-yellow"></span>
                                        Work in Progress
                                    </a>
                                    <a href="#" class="popover-list-item-status" data-status="complete" data-comment-id="${comment.id}">
                                        <span class="status-dot-green"></span>
                                        Complete
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            feedbackList.appendChild(listItem);
        });
    },
    
    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    /**
     * Initialize comment sync listener
     */
    initSyncListener(projectId, renderCallback) {
        const storageKey = this.getStorageKey(projectId);
        
        // Listen for storage events (cross-tab sync - only fires in other tabs)
        window.addEventListener('storage', (e) => {
            if (e.key === storageKey && e.newValue) {
                renderCallback();
            }
        });
        
        // Listen for custom events (same-tab updates)
        window.addEventListener('commentsUpdated', (e) => {
            if (e.detail && e.detail.projectId === projectId) {
                renderCallback();
            }
        });
        
        // Also poll for changes (fallback and to catch external changes)
        setInterval(() => {
            renderCallback();
        }, 3000); // Check every 3 seconds
    },
    
    /**
     * Get comment count for a project
     */
    getCommentCount(projectId) {
        return this.getComments(projectId).length;
    },
    
    /**
     * Get unread comment count (comments newer than last view)
     */
    getUnreadCount(projectId, lastViewTime) {
        const comments = this.getComments(projectId);
        return comments.filter(c => c.timestamp > lastViewTime).length;
    },
    
    /**
     * Update comment status
     */
    updateCommentStatus(projectId, commentId, newStatus) {
        const comments = this.getComments(projectId);
        const comment = comments.find(c => c.id === commentId);
        
        if (!comment) {
            console.error('Comment not found:', commentId);
            return null;
        }
        
        comment.status = newStatus; // 'new', 'work-in-progress', 'complete'
        
        const storageKey = this.getStorageKey(projectId);
        localStorage.setItem(storageKey, JSON.stringify(comments));
        
        // Trigger custom event for same-tab updates
        window.dispatchEvent(new CustomEvent('commentsUpdated', {
            detail: { projectId, comments }
        }));
        
        return comment;
    },
    
    /**
     * Get status label
     */
    getStatusLabel(status) {
        const labels = {
            'new': 'New',
            'work-in-progress': 'Work in Progress',
            'complete': 'Complete'
        };
        return labels[status] || status;
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CommentsManager;
}

