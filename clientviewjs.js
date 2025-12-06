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

// Get current client's project based on email
function getClientProject() {
    const auth = localStorage.getItem('auth') || sessionStorage.getItem('auth');
    if (!auth) return null;
    
    try {
        const authData = JSON.parse(auth);
        const clientEmail = authData.email?.toLowerCase().trim();
        
        if (!clientEmail) return null;
        
        // Find project matching client email
        const projects = ProjectDataManager.getAllProjects();
        const project = projects.find(p => 
            p.clientEmail?.toLowerCase().trim() === clientEmail
        );
        
        return project || null;
    } catch (e) {
        console.error('Error getting client project:', e);
        return null;
    }
}

// --- Tailwind Font Config ---
if (typeof tailwind !== 'undefined' && tailwind.config) {
  tailwind.config = {
    theme: {
      extend: {
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
        },
      },
    },
  };
}

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication first
    if (!checkAuthentication()) {
        return;
    }

    // Get client's project
    const currentProject = getClientProject();
    if (!currentProject) {
        alert('No project found for your account. Please contact support.');
        return;
    }
    
    const projectId = currentProject.id;
    
    // Store project in sessionStorage for comments manager
    sessionStorage.setItem('selectedProject', JSON.stringify({
        id: projectId,
        name: currentProject.name,
        client: currentProject.client,
        clientEmail: currentProject.clientEmail
    }));

    // --- Update Page Title ---
    const projectTitle = document.getElementById('project-title');
    if (projectTitle) {
        projectTitle.textContent = currentProject.name;
    }

    // --- Load Video ---
    function loadVideo() {
        const currentVideo = VideoStorageManager.getCurrentVideo(projectId);
        const videoContainer = document.getElementById('video-container');
        const videoPlayer = document.getElementById('video-player');
        const videoPlaceholder = document.getElementById('video-placeholder');
        
        if (currentVideo && currentVideo.url) {
            // Show video player
            if (videoPlayer) {
                videoPlayer.src = currentVideo.url;
                videoPlayer.style.display = 'block';
                videoPlayer.classList.remove('hidden');
            }
            if (videoPlaceholder) {
                videoPlaceholder.style.display = 'none';
            }
        } else {
            // Show placeholder
            if (videoPlaceholder) {
                videoPlaceholder.style.display = 'block';
            }
            if (videoPlayer) {
                videoPlayer.style.display = 'none';
                videoPlayer.classList.add('hidden');
            }
        }
        
        // Update video status
        updateVideoStatus(currentVideo);
        
        // Load version history
        loadVersionHistory();
    }
    
    // Load video on page load
    loadVideo();
    
    // Listen for video updates
    window.addEventListener('videosUpdated', (e) => {
        if (e.detail && e.detail.projectId === projectId) {
            loadVideo();
            loadNotifications();
        }
    });

    // --- Update Video Status Display ---
    function updateVideoStatus(video) {
        const statusBadge = document.getElementById('status-badge');
        const approveBtn = document.getElementById('approve-btn');
        const rejectBtn = document.getElementById('reject-btn');
        
        if (!video) {
            if (statusBadge) {
                statusBadge.textContent = 'Status: No video uploaded';
                statusBadge.className = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800';
            }
            if (approveBtn) approveBtn.disabled = true;
            if (rejectBtn) rejectBtn.disabled = true;
            return;
        }
        
        const status = video.status || 'pending';
        if (statusBadge) {
            if (status === 'approved') {
                statusBadge.textContent = 'Status: Approved';
                statusBadge.className = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800';
            } else if (status === 'not-approved') {
                statusBadge.textContent = 'Status: Not Approved';
                statusBadge.className = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800';
            } else {
                statusBadge.textContent = 'Status: Pending Review';
                statusBadge.className = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800';
            }
        }
        
        // Enable/disable buttons based on status
        if (approveBtn) {
            approveBtn.disabled = status === 'approved';
            if (status === 'approved') {
                approveBtn.classList.add('opacity-50', 'cursor-not-allowed');
            } else {
                approveBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        }
        if (rejectBtn) {
            rejectBtn.disabled = status === 'not-approved';
            if (status === 'not-approved') {
                rejectBtn.classList.add('opacity-50', 'cursor-not-allowed');
            } else {
                rejectBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        }
    }

    // --- Approval/Rejection Buttons ---
    const approveBtn = document.getElementById('approve-btn');
    const rejectBtn = document.getElementById('reject-btn');
    
    if (approveBtn) {
        approveBtn.addEventListener('click', () => {
            const currentVideo = VideoStorageManager.getCurrentVideo(projectId);
            if (!currentVideo) {
                alert('No video to approve.');
                return;
            }
            
            const auth = localStorage.getItem('auth') || sessionStorage.getItem('auth');
            let clientName = 'Client';
            if (auth) {
                try {
                    const authData = JSON.parse(auth);
                    clientName = currentProject.client || authData.email || 'Client';
                } catch (e) {
                    console.error('Error parsing auth data:', e);
                }
            }
            
            VideoStorageManager.updateVideoStatus(projectId, currentVideo.id, 'approved', clientName);
            loadVideo(); // Reload to update status
            alert('Video approved successfully!');
        });
    }
    
    if (rejectBtn) {
        rejectBtn.addEventListener('click', () => {
            const currentVideo = VideoStorageManager.getCurrentVideo(projectId);
            if (!currentVideo) {
                alert('No video to reject.');
                return;
            }
            
            const auth = localStorage.getItem('auth') || sessionStorage.getItem('auth');
            let clientName = 'Client';
            if (auth) {
                try {
                    const authData = JSON.parse(auth);
                    clientName = currentProject.client || authData.email || 'Client';
                } catch (e) {
                    console.error('Error parsing auth data:', e);
                }
            }
            
            VideoStorageManager.updateVideoStatus(projectId, currentVideo.id, 'not-approved', clientName);
            loadVideo(); // Reload to update status
            alert('Video marked as not approved. Agent will be notified.');
        });
    }

    // --- Load Version History ---
    function loadVersionHistory() {
        const versions = VideoStorageManager.getVideoVersions(projectId);
        const versionHistory = document.getElementById('version-history');
        
        if (!versionHistory) return;
        
        if (versions.length === 0) {
            versionHistory.innerHTML = '<li><p class="text-sm text-gray-500">No versions uploaded yet</p></li>';
            return;
        }
        
        versionHistory.innerHTML = '';
        versions.reverse().forEach((video, index) => {
            const isCurrent = index === 0;
            const date = new Date(video.uploadedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
            
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="p-3 ${isCurrent ? 'bg-indigo-50 border border-indigo-200 text-indigo-800' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'} rounded-lg text-sm ${isCurrent ? 'font-medium' : ''} cursor-pointer">
                    v${video.version} – Uploaded ${date} ${isCurrent ? '(Current)' : ''}
                </div>
            `;
            
            li.addEventListener('click', () => {
                // Load this version
                const videoPlayer = document.getElementById('video-player');
                if (videoPlayer && video.url) {
                    videoPlayer.src = video.url;
                    videoPlayer.load();
                }
            });
            
            versionHistory.appendChild(li);
        });
    }

    // --- Notification System ---
    function loadNotifications() {
        const notifications = VideoStorageManager.getNotifications(projectId);
        const notificationsList = document.getElementById('notifications-list');
        const notifDot = document.getElementById('notif-dot');
        
        if (!notificationsList) return;
        
        if (notifications.length === 0) {
            notificationsList.innerHTML = '<li class="px-4 py-3"><p class="text-sm text-gray-500">No notifications</p></li>';
            if (notifDot) notifDot.classList.add('hidden');
            return;
        }
        
        // Show notification dot
        if (notifDot) notifDot.classList.remove('hidden');
        
        notificationsList.innerHTML = '';
        notifications.slice(0, 10).forEach(notif => {
            const li = document.createElement('li');
            li.className = 'px-4 py-3 hover:bg-gray-50';
            
            let message = '';
            if (notif.type === 'new-video') {
                message = '<span class="font-medium">New video uploaded</span>';
            } else if (notif.type === 'new-version') {
                message = '<span class="font-medium">New version uploaded</span>';
            } else if (notif.type === 'comment-awaiting') {
                message = '<span class="font-medium">New comment from agent</span>';
            }
            
            li.innerHTML = `
                <p class="text-sm text-gray-800">${message}</p>
                <p class="text-xs text-gray-400 mt-1">${VideoStorageManager.formatTimestamp(notif.timestamp)}</p>
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

    // Hide notification dropdown when clicking outside
    window.addEventListener('click', () => {
      if (notifDropdown && !notifDropdown.classList.contains('hidden')) {
        notifDropdown.classList.add('hidden');
      }
    });

    // --- Comment System Integration ---
    const commentInput = document.getElementById('comment-input');
    const commentButton = document.getElementById('post-comment-btn');
    const commentSection = document.getElementById('comments-section');
    
    // Function to render comments
    const renderComments = () => {
        if (commentSection) {
            CommentsManager.renderCommentsClient(projectId, commentSection);
        }
    };
    
    // Load and render existing comments
    renderComments();
    
    // Initialize sync listener for real-time updates
    CommentsManager.initSyncListener(projectId, renderComments);
    
    // Load notifications on page load
    loadNotifications();
    
    // Refresh notifications periodically and on events
    setInterval(loadNotifications, 5000); // Check every 5 seconds
    window.addEventListener('videosUpdated', loadNotifications);
    window.addEventListener('commentsUpdated', loadNotifications);
    
    // Comment posting logic
    if (commentButton && commentInput && commentSection) {
      commentButton.addEventListener('click', () => {
        const text = commentInput.value.trim();
        if (text.length === 0) return;

        // Use actual client name from project
        const authorName = currentProject.client || 'Client';

        // Save comment using comment manager
        CommentsManager.saveComment(projectId, text, 'client', authorName);

        // Re-render comments to show the new one
        renderComments();
        
        // Refresh notifications to show any updates
        loadNotifications();

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
    loadVideo();
    loadVersionHistory();
    loadNotifications(); // Load notifications immediately on page load
    
    // Listen for video updates
    window.addEventListener('videosUpdated', (e) => {
        if (e.detail.projectId === projectId) {
            loadVideo();
            loadVersionHistory();
            loadNotifications();
        }
    });
    
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
});
