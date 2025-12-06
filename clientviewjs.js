// Authentication check
function checkAuthentication() {
    const auth = localStorage.getItem('auth') || sessionStorage.getItem('auth');
    
    if (!auth) {
        window.location.href = 'login.html';
        return false;
    }
    
    try {
        const authData = JSON.parse(auth);
        // Check if session is still valid (24 hours)
        const oneDay = 24 * 60 * 60 * 1000;
        if (!authData.loggedIn || (Date.now() - authData.timestamp) > oneDay) {
            // Session expired or invalid, clear and redirect
            localStorage.removeItem('auth');
            sessionStorage.removeItem('auth');
            window.location.href = 'login.html';
            return false;
        }
        // Verify user is a client
        if (authData.userType !== 'client') {
            // User is an agent, redirect to agent dashboard
            window.location.href = 'project-management.html';
            return false;
        }
        return true;
    } catch (e) {
        // Invalid auth data, clear and redirect
        localStorage.removeItem('auth');
        sessionStorage.removeItem('auth');
        window.location.href = 'login.html';
        return false;
    }
}

// Get client's project based on email
function getClientProject() {
    const auth = localStorage.getItem('auth') || sessionStorage.getItem('auth');
    if (!auth) return null;
    
    try {
        const authData = JSON.parse(auth);
        const clientEmail = authData.email;
        
        if (!clientEmail) return null;
        
        // Find project matching client email
        const projects = ProjectDataManager.getAllProjects();
        const clientProject = projects.find(p => p.clientEmail === clientEmail);
        
        return clientProject || null;
    } catch (e) {
        console.error('Error getting client project:', e);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuthentication()) {
        return;
    }

    const currentProject = getClientProject();
    if (!currentProject) {
        alert('No project found for your account. Please contact support.');
        return;
    }
    
    const projectId = currentProject.id;
    
    // Store project in sessionStorage for consistency
    sessionStorage.setItem('selectedProject', JSON.stringify({
        id: projectId,
        name: currentProject.name,
        client: currentProject.client,
        clientEmail: currentProject.clientEmail
    }));

    // Update project title
    const projectTitle = document.getElementById('project-title');
    if (projectTitle) {
        projectTitle.textContent = currentProject.name;
    }

    // Update client name
    const clientNameDisplay = document.getElementById('client-name-display');
    if (clientNameDisplay) {
        clientNameDisplay.textContent = currentProject.client;
    }

    // --- Load Photo ---
    function loadPhoto() {
        const photoViewer = document.getElementById('photo-viewer');
        const photoPlaceholder = document.getElementById('photo-placeholder');
        const currentPhoto = PhotoStorageManager.getCurrentPhoto(projectId);
        
        if (currentPhoto && currentPhoto.url) {
            if (photoViewer) {
                photoViewer.src = currentPhoto.url;
                photoViewer.classList.remove('hidden');
            }
            if (photoPlaceholder) {
                photoPlaceholder.classList.add('hidden');
            }
            updatePhotoStatus(currentPhoto);
        } else {
            if (photoViewer) {
                photoViewer.classList.add('hidden');
            }
            if (photoPlaceholder) {
                photoPlaceholder.classList.remove('hidden');
            }
            updatePhotoStatus(null);
        }
    }

    function updatePhotoStatus(photo) {
        const statusBadge = document.getElementById('video-status-badge');
        if (!statusBadge) return;
        
        if (!photo) {
            statusBadge.textContent = 'Status: No photo uploaded';
            statusBadge.className = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800';
            return;
        }
        
        let statusText = 'Status: Under Review';
        let statusClass = 'bg-blue-100 text-blue-800';
        
        if (photo.status === 'approved') {
            statusText = 'Status: Approved';
            statusClass = 'bg-green-100 text-green-800';
        } else if (photo.status === 'not-approved') {
            statusText = 'Status: Not Approved';
            statusClass = 'bg-red-100 text-red-800';
        }
        
        statusBadge.textContent = statusText;
        statusBadge.className = `inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusClass}`;
    }

    // --- Approval/Rejection Buttons ---
    const approveBtn = document.getElementById('approve-btn');
    const rejectBtn = document.getElementById('reject-btn');
    
    if (approveBtn) {
        approveBtn.addEventListener('click', () => {
            const currentPhoto = PhotoStorageManager.getCurrentPhoto(projectId);
            if (!currentPhoto) {
                alert('No photo to approve.');
                return;
            }
            
            const auth = localStorage.getItem('auth') || sessionStorage.getItem('auth');
            let approvedBy = 'Client';
            if (auth) {
                try {
                    const authData = JSON.parse(auth);
                    approvedBy = authData.email || currentProject.client;
                } catch (e) {
                    console.error('Error parsing auth data:', e);
                }
            }
            
            PhotoStorageManager.updatePhotoStatus(projectId, currentPhoto.id, 'approved', approvedBy);
            loadPhoto();
            alert('Photo approved!');
        });
    }
    
    if (rejectBtn) {
        rejectBtn.addEventListener('click', () => {
            const currentPhoto = PhotoStorageManager.getCurrentPhoto(projectId);
            if (!currentPhoto) {
                alert('No photo to reject.');
                return;
            }
            
            const auth = localStorage.getItem('auth') || sessionStorage.getItem('auth');
            let approvedBy = 'Client';
            if (auth) {
                try {
                    const authData = JSON.parse(auth);
                    approvedBy = authData.email || currentProject.client;
                } catch (e) {
                    console.error('Error parsing auth data:', e);
                }
            }
            
            PhotoStorageManager.updatePhotoStatus(projectId, currentPhoto.id, 'not-approved', approvedBy);
            loadPhoto();
            alert('Photo marked as not approved. Please leave a comment with feedback.');
        });
    }

    // --- Load Version History ---
    function loadVersionHistory() {
        const versionHistory = document.getElementById('version-history');
        if (!versionHistory) return;
        
        const photos = PhotoStorageManager.getPhotos(projectId);
        if (photos.length === 0) {
            versionHistory.innerHTML = '<li class="text-sm text-gray-500 italic">No versions uploaded yet.</li>';
            return;
        }
        
        // Sort by version (newest first)
        const sortedPhotos = [...photos].sort((a, b) => b.version - a.version);
        const currentPhoto = PhotoStorageManager.getCurrentPhoto(projectId);
        
        versionHistory.innerHTML = '';
        sortedPhotos.forEach(photo => {
            const isCurrent = currentPhoto && photo.id === currentPhoto.id;
            const li = document.createElement('li');
            
            if (isCurrent) {
                li.innerHTML = `
                    <div class="p-3 bg-indigo-50 rounded-lg border border-indigo-200 text-sm font-medium text-indigo-800">
                        v${photo.version} – "${photo.fileName}" (Current)
                    </div>
                `;
            } else {
                li.innerHTML = `
                    <div class="p-3 bg-white rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                        v${photo.version} – "${photo.fileName}"
                    </div>
                `;
            }
            
            versionHistory.appendChild(li);
        });
    }

    // --- Notification System ---
    function loadNotifications() {
        const notificationsList = document.getElementById('notifications-list');
        const notifDot = document.getElementById('notif-dot');
        
        if (!notificationsList) return;
        
        const notifications = PhotoStorageManager.getNotifications(projectId);
        const unreadCount = PhotoStorageManager.getUnreadCount(projectId);
        
        // Show/hide notification dot
        if (notifDot) {
            if (unreadCount > 0) {
                notifDot.classList.remove('hidden');
            } else {
                notifDot.classList.add('hidden');
            }
        }
        
        if (notifications.length === 0) {
            notificationsList.innerHTML = '<li class="px-4 py-3 text-sm text-gray-500 italic">No notifications</li>';
            return;
        }
        
        notificationsList.innerHTML = '';
        notifications.forEach(notif => {
            const li = document.createElement('li');
            li.className = `px-4 py-3 hover:bg-gray-50 ${notif.read ? '' : 'bg-blue-50'}`;
            
            let message = notif.message;
            if (notif.type === 'new-photo') {
                message = `<span class="font-medium">New photo uploaded:</span> ${notif.message}`;
            } else if (notif.type === 'new-version') {
                message = `<span class="font-medium">New version uploaded:</span> ${notif.message}`;
            } else if (notif.type === 'comment-awaiting') {
                message = `<span class="font-medium">New comment:</span> ${notif.message}`;
            }
            
            li.innerHTML = `
                <p class="text-sm text-gray-800">${message}</p>
                <p class="text-xs text-gray-400 mt-1">${PhotoStorageManager.formatTimestamp(notif.timestamp)}</p>
            `;
            
            notificationsList.appendChild(li);
        });
    }

    // --- Notification Bell Logic ---
    const notifBtn = document.getElementById('notif-btn');
    const notifDropdown = document.getElementById('notif-dropdown');
    
    if (notifBtn) {
        notifBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (notifDropdown) {
                notifDropdown.classList.toggle('hidden');
            }
        });
    }
    
    window.addEventListener('click', () => {
        if (notifDropdown && !notifDropdown.classList.contains('hidden')) {
            notifDropdown.classList.add('hidden');
        }
    });

    // Mark all as read
    const markAllReadBtn = document.getElementById('mark-all-read-btn');
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', () => {
            PhotoStorageManager.markNotificationsAsRead(projectId);
            loadNotifications();
        });
    }

    // --- Comment System Integration ---
    const commentInput = document.getElementById('comment-input');
    const commentButton = document.getElementById('post-comment-btn');
    const commentSection = document.getElementById('comments-section');
    
    const renderComments = () => {
        if (commentSection) {
            CommentsManager.renderCommentsClient(projectId, commentSection);
        }
    };
    
    renderComments();
    CommentsManager.initSyncListener(projectId, renderComments);
    
    if (commentButton && commentInput && commentSection) {
        commentButton.addEventListener('click', () => {
            const text = commentInput.value.trim();
            if (text.length === 0) return;

            // Get user info from auth
            const auth = localStorage.getItem('auth') || sessionStorage.getItem('auth');
            let authorName = currentProject.client;
            if (auth) {
                try {
                    const authData = JSON.parse(auth);
                    authorName = authData.email || currentProject.client;
                } catch (e) {
                    console.error('Error parsing auth data:', e);
                }
            }

            // Save comment using comment manager
            CommentsManager.saveComment(projectId, text, 'client', authorName);
            
            // Add notification for agent
            PhotoStorageManager.addNotification(projectId, 'comment-awaiting', `Client commented: "${text}"`);

            // Re-render comments to show the new one
            renderComments();

            // Clear input
            commentInput.value = '';
        });
        
        // Allow Enter key to submit (Shift+Enter for new line)
        commentInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                commentButton.click();
            }
        });
    }

    // --- Initial Load ---
    loadPhoto();
    loadVersionHistory();
    loadNotifications();
    
    // Listen for photo updates (real-time)
    window.addEventListener('photosUpdated', (e) => {
        if (e.detail && e.detail.projectId === projectId) {
            loadPhoto();
            loadVersionHistory();
            loadNotifications();
        }
    });
    
    // Also poll for updates every 3 seconds as fallback
    setInterval(() => {
        loadVersionHistory();
    }, 3000);
    
    // Listen for comment updates (which trigger notifications)
    window.addEventListener('commentsUpdated', (e) => {
        if (e.detail.projectId === projectId) {
            loadNotifications();
        }
    });
    
    // Listen for notification updates
    window.addEventListener('notificationsUpdated', (e) => {
        if (e.detail.projectId === projectId) {
            loadNotifications();
        }
    });
    
    // Poll for updates every 5 seconds
    setInterval(() => {
        loadNotifications();
    }, 5000);

    // --- Logout Functionality ---
    const logoutBtn = document.getElementById('client-logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // Clear authentication data
            localStorage.removeItem('auth');
            sessionStorage.removeItem('auth');
            // Redirect to login page
            window.location.href = 'login.html';
        });
    }
});
