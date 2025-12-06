/*
 * ===========================================
 * Main JavaScript File (FIXED)
 * ===========================================
 * This script waits for the HTML to be loaded, then handles
 * all interactive elements like the sidebar and popovers.
 */

// Wait for the DOM to be fully loaded before running scripts
document.addEventListener('DOMContentLoaded', () => {
    /*
     * -------------------------------------------
     * Authentication Check
     * -------------------------------------------
     * Redirects to login page if user is not authenticated
     */
    function checkAuthentication() {
        try {
            const auth = localStorage.getItem('auth') || sessionStorage.getItem('auth');
            
            if (!auth) {
                // Not authenticated, redirect to login
                window.location.href = 'login.html';
                return false;
            }

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
            return true;
        } catch (e) {
            console.error('Authentication check error:', e);
            // Invalid auth data, clear and redirect
            localStorage.removeItem('auth');
            sessionStorage.removeItem('auth');
            window.location.href = 'login.html';
            return false;
        }
    }

    // Check authentication before loading the page
    if (!checkAuthentication()) {
        return; // Stop execution if not authenticated
    }

    // Wrap all feature code in try-catch to prevent errors from breaking buttons
    try {
        /*
         * -------------------------------------------
         * Feature 1: Sidebar Logic
         * -------------------------------------------
         * This logic is specific to the sidebar because it
         * includes the full-screen backdrop.
         */
    
    // Get the elements needed for the sidebar
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarBackdrop = document.getElementById('sidebar-backdrop');

    // Function to toggle sidebar visibility
    // It adds/removes the .is-open class (defined in style.css)
    const toggleSidebar = () => {
        sidebar.classList.toggle('is-open');
        sidebarBackdrop.classList.toggle('is-open');
    };

    // Event listener for the hamburger button
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', (e) => {
            // Stop the click from bubbling up to the main document listener
            e.stopPropagation(); 
            toggleSidebar();
        });
    }

    // Event listener for the backdrop (to close sidebar when clicked)
    if (sidebarBackdrop) {
        sidebarBackdrop.addEventListener('click', () => {
            toggleSidebar();
        });
    }

            
    /*
     * -------------------------------------------
     * Feature 2: Dynamic Popover Logic (FIXED)
     * -------------------------------------------
     * This single system handles ALL popovers on the page.
     *
     * How it works:
     * 1. A toggle button needs:
     * - data-toggle="popover"
     * - data-target="#popover-id"
     * 2. The popover menu needs:
     * - id="popover-id"
     * - class="popover-menu"
     *
     * The script will add/remove the '.is-open' class to the menu.
     */
    
    // Get all popover menus on the page
    const allPopovers = document.querySelectorAll('.popover-menu');

    // Add one single click listener to the entire document
    document.addEventListener('click', (e) => {
        const clickedElement = e.target;
        
        // Find the closest parent that is a toggle button
        const clickedToggle = clickedElement.closest('[data-toggle="popover"]');
        
        if (clickedToggle) {
            // --- 1. A Toggle Button Was Clicked ---
            
            // Stop this click from bubbling up and being caught by our own listener
            e.stopPropagation(); 
            
            // Get the ID of the menu this toggle controls (from data-target attribute)
            const targetId = clickedToggle.getAttribute('data-target');
            const targetPopover = document.querySelector(targetId);
            
            if (targetPopover) {
                // Check if the menu we clicked is already open
                const isOpen = targetPopover.classList.contains('is-open');
                
                // First, close ALL popovers on the page
                allPopovers.forEach(p => p.classList.remove('is-open'));
                
                // If the menu we clicked was closed, open it.
                // If it was already open, the loop above just closed it.
                if (!isOpen) {
                    targetPopover.classList.add('is-open');
                }
            }
            return; // Stop further execution since we handled the click
        }
        
        // --- 2. A Toggle Button Was NOT Clicked (Handle "Click Outside") ---
        
        // **THIS IS THE FIX:** Check if the click was inside any of the *open popover menus*.
        let clickInsideAnOpenPopover = false;
        allPopovers.forEach(p => {
            // If a popover is open AND the click was inside it
            if (p.classList.contains('is-open') && p.contains(clickedElement)) {
                clickInsideAnOpenPopover = true;
            }
        });
        
        // If the click was NOT on a toggle AND NOT inside an open popover,
        // then it was "outside", so close all popovers.
        if (!clickInsideAnOpenPopover) {
            allPopovers.forEach(p => p.classList.remove('is-open'));
        }
    });

    /*
     * -------------------------------------------
     * Feature 3: Upload Modal & File Upload
     * -------------------------------------------
     * Handles the upload button click, modal display,
     * and file upload functionality for local, Google Drive, and OneDrive.
     */
    
    const uploadButton = document.getElementById('upload-button');
    const uploadModal = document.getElementById('upload-modal');
    const uploadModalClose = document.getElementById('upload-modal-close');
    const uploadModalBackdrop = uploadModal?.querySelector('.upload-modal-backdrop');
    const localFileInput = document.getElementById('local-file-input');
    const uploadProgress = document.getElementById('upload-progress');
    const uploadProgressFill = document.getElementById('upload-progress-fill');
    const uploadProgressText = document.getElementById('upload-progress-text');
    const uploadSuccess = document.getElementById('upload-success');

    // Function to open the upload modal
    const openUploadModal = () => {
        if (uploadModal) {
            uploadModal.classList.add('is-open');
            // Reset modal state
            if (uploadProgress) uploadProgress.style.display = 'none';
            if (uploadSuccess) uploadSuccess.style.display = 'none';
            if (uploadProgressFill) uploadProgressFill.style.width = '0%';
        }
    };

    // Function to close the upload modal
    const closeUploadModal = () => {
        if (uploadModal) {
            uploadModal.classList.remove('is-open');
        }
    };

    // Open modal when upload button is clicked
    if (uploadButton) {
        uploadButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openUploadModal();
        });
    } else {
        console.warn('Upload button not found');
    }
    
    // Make upload option button directly trigger file input when modal is open
    const uploadOptionButton = document.querySelector('label[for="local-file-input"]');
    if (uploadOptionButton) {
        uploadOptionButton.addEventListener('click', (e) => {
            e.stopPropagation();
            // The label will automatically trigger the file input
        });
    }

    // Close modal when close button is clicked
    if (uploadModalClose) {
        uploadModalClose.addEventListener('click', (e) => {
            e.stopPropagation();
            closeUploadModal();
        });
    }

    // Close modal when backdrop is clicked
    if (uploadModalBackdrop) {
        uploadModalBackdrop.addEventListener('click', (e) => {
            if (e.target === uploadModalBackdrop) {
                closeUploadModal();
            }
        });
    }

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && uploadModal?.classList.contains('is-open')) {
            closeUploadModal();
        }
    });

    // Function to handle file upload
    const uploadFile = (file) => {
        const projectId = CommentsManager.getCurrentProjectId();
        // Show progress
        if (uploadProgress) {
            uploadProgress.style.display = 'block';
        }
        if (uploadSuccess) {
            uploadSuccess.style.display = 'none';
        }

        // Create object URL for the video file
        const videoUrl = URL.createObjectURL(file);
        
        // Simulate upload progress (in production, this would be actual upload progress)
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 100) progress = 100;

            if (uploadProgressFill) {
                uploadProgressFill.style.width = progress + '%';
            }
            if (uploadProgressText) {
                uploadProgressText.textContent = `Uploading ${file.name}... ${Math.round(progress)}%`;
            }

            if (progress >= 100) {
                clearInterval(interval);
                
                // Show success message
                setTimeout(() => {
                    if (uploadProgress) {
                        uploadProgress.style.display = 'none';
                    }
                    if (uploadSuccess) {
                        uploadSuccess.style.display = 'flex';
                    }

                    // Save video to VideoStorageManager
                    if (projectId && typeof VideoStorageManager !== 'undefined') {
                        VideoStorageManager.saveVideo(projectId, {
                            fileName: file.name,
                            url: videoUrl,
                            notes: `Uploaded: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`
                        });
                    }
                    
                    // Update video player with uploaded video
                    updateVideoPlayer(videoUrl, file);
                    
                    // Update revision history
                    updateRevisionHistory(file);
                    
                    console.log('File uploaded:', file.name, file.size, 'bytes');
                    
                    // Close modal after 2 seconds
                    setTimeout(() => {
                        closeUploadModal();
                        // Reset file input
                        if (localFileInput) localFileInput.value = '';
                    }, 2000);
                }, 500);
            }
        }, 200);
    };

    // Function to update video player with uploaded video
    const updateVideoPlayer = (videoUrl, file) => {
        const videoPlayerWrapper = document.querySelector('.video-player-wrapper');
        const videoPlayerPlaceholder = document.querySelector('.video-player-placeholder');
        
        if (videoPlayerWrapper && videoPlayerPlaceholder) {
            // Create video element
            const videoElement = document.createElement('video');
            videoElement.src = videoUrl;
            videoElement.controls = true;
            videoElement.style.width = '100%';
            videoElement.style.height = '100%';
            videoElement.style.objectFit = 'contain';
            videoElement.style.borderRadius = '0.5rem';
            
            // Replace placeholder with video element
            videoPlayerPlaceholder.style.display = 'none';
            videoPlayerWrapper.innerHTML = '';
            videoPlayerWrapper.appendChild(videoElement);
            
            // Update card footer with file info
            const cardTitle = document.querySelector('.card-footer .card-title-xl');
            const cardSubtitle = document.querySelector('.card-footer .card-subtitle');
            
            if (cardTitle) {
                const now = new Date();
                const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                cardTitle.textContent = `Version ${getNextVersionNumber()} (New Upload)`;
            }
            
            if (cardSubtitle) {
                const now = new Date();
                const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                cardSubtitle.textContent = `Uploaded by Vugru on ${dateStr} at ${timeStr}`;
            }
        }
    };

    // Function to get next version number
    const getNextVersionNumber = () => {
        const revisionItems = document.querySelectorAll('.revision-list-item');
        return revisionItems.length + 1;
    };

    // Function to update revision history
    const updateRevisionHistory = (file) => {
        const revisionList = document.querySelector('.revision-list');
        if (!revisionList) return;
        
        // Get next version number
        const versionNumber = getNextVersionNumber();
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        // Create new revision item
        const newRevisionItem = document.createElement('li');
        newRevisionItem.className = 'revision-list-item';
        newRevisionItem.innerHTML = `
            <div>
                <h3 class="revision-list-title-active">Version ${versionNumber}</h3>
                <p class="revision-list-subtitle">Uploaded ${dateStr}</p>
            </div>
            <span class="status-badge status-badge-green">New</span>
        `;
        
        // Make previous items inactive
        const previousItems = revisionList.querySelectorAll('.revision-list-item');
        previousItems.forEach(item => {
            const title = item.querySelector('.revision-list-title-active, .revision-list-title');
            if (title) {
                title.className = 'revision-list-title';
            }
            const statusBadge = item.querySelector('.status-badge');
            if (statusBadge) {
                statusBadge.className = 'revision-list-status-old';
                statusBadge.textContent = 'Superseded';
            }
        });
        
        // Insert new item at the top
        revisionList.insertBefore(newRevisionItem, revisionList.firstChild);
        
        // Add click handler to new revision item
        newRevisionItem.style.cursor = 'pointer';
        newRevisionItem.addEventListener('click', () => {
            const videoPlayerWrapper = document.querySelector('.video-player-wrapper');
            const video = videoPlayerWrapper?.querySelector('video');
            if (video) {
                // Store video URL in sessionStorage for this version
                const videoUrl = video.src;
                sessionStorage.setItem(`video-version-${versionNumber}`, videoUrl);
            }
        });
    };

    // Handle local file upload
    if (localFileInput) {
        localFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Validate file type
                if (!file.type.startsWith('video/')) {
                    alert('Please select a valid video file.');
                    localFileInput.value = '';
                    return;
                }

                // Validate file size (e.g., max 500MB)
                const maxSize = 500 * 1024 * 1024; // 500MB in bytes
                if (file.size > maxSize) {
                    alert('File size exceeds 500MB. Please select a smaller file.');
                    localFileInput.value = '';
                    return;
                }

                uploadFile(file);
            }
        });
    }


    /*
     * -------------------------------------------
     * Logout Functionality
     * -------------------------------------------
     */
    const logoutButton = document.getElementById('logout-button');
    
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            // Clear authentication data
            localStorage.removeItem('auth');
            sessionStorage.removeItem('auth');
            
            // Redirect to login page
            window.location.href = 'login.html';
        });
    }

    /*
     * -------------------------------------------
     * Sidebar Navigation Links
     * -------------------------------------------
     */
    const sidebarLinks = document.querySelectorAll('.sidebar-nav-item');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            const linkText = link.querySelector('span')?.textContent || '';
            
            // If it's a real link (not #), allow it to navigate
            if (href && href !== '#' && !href.startsWith('javascript:')) {
                // Close sidebar on mobile after clicking
                if (window.innerWidth < 1024) {
                    toggleSidebar();
                }
                // Allow navigation to proceed
                return true;
            }
            
            // For placeholder links (#), prevent default and show alert
            e.preventDefault();
            
            // Close sidebar on mobile after clicking
            if (window.innerWidth < 1024) {
                toggleSidebar();
            }
            
            // Handle navigation (for demo, just show alert)
            console.log(`Navigating to: ${linkText}`);
            // In production, you would navigate to the appropriate page
            // window.location.href = getPageUrl(linkText);
        });
    });

    /*
     * -------------------------------------------
     * Publish to Channels Functionality
     * -------------------------------------------
     */
    const publishOptions = document.querySelectorAll('#publish-menu .popover-list-item-icon');
    publishOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault();
            const channel = option.querySelector('span')?.textContent || 'Unknown';
            
            // Close the popover
            const publishMenu = document.getElementById('publish-menu');
            if (publishMenu) publishMenu.classList.remove('is-open');
            
            // Handle publish action
            console.log(`Publishing to ${channel}`);
            alert(`Publishing video to ${channel}...\n\nIn production, this would integrate with ${channel}'s API to publish the video.`);
        });
    });

    // Share button removed - no longer needed

    // Comment status update functionality is now handled via event delegation in the comment system section

    /*
     * -------------------------------------------
     * Load Project Data and Update UI
     * -------------------------------------------
     */
    const selectedProject = sessionStorage.getItem('selectedProject');
    let currentProject = null;
    
    if (selectedProject) {
        try {
            currentProject = JSON.parse(selectedProject);
            
            // Update header title with project name
            const headerTitle = document.querySelector('.header-title');
            if (headerTitle && currentProject.name) {
                headerTitle.textContent = currentProject.name;
            }
            
            // Update project status in the status card
            const statusText = document.getElementById('project-status-text');
            const statusBar = document.getElementById('project-status-bar');
            const clientName = document.getElementById('project-client-name');
            
            if (currentProject.status && statusText) {
                statusText.textContent = ProjectDataManager.getStatusLabel(currentProject.status);
                // Update status bar color based on status
                const statusClass = currentProject.status === 'completed' ? 'green' : 
                                   currentProject.status === 'in-review' ? 'amber' : 
                                   currentProject.status === 'awaiting-feedback' ? 'yellow' : 'blue';
                statusText.className = `status-bar-text-${statusClass}`;
                
                // Update status bar fill
                if (statusBar) {
                    statusBar.className = `status-bar-fill-${statusClass}`;
                    statusBar.style.width = `${currentProject.progress || 0}%`;
                }
            }
            
            // Update client name
            if (currentProject.client && clientName) {
                clientName.textContent = currentProject.client;
            }
            
            console.log('Loaded project:', currentProject);
        } catch (e) {
            console.error('Error parsing selected project:', e);
        }
    } else {
        // If no project selected, try to get from ProjectDataManager
        const projectId = CommentsManager.getCurrentProjectId();
        if (projectId && typeof ProjectDataManager !== 'undefined') {
            currentProject = ProjectDataManager.getProject(projectId);
            if (currentProject) {
                // Store in sessionStorage for consistency
                sessionStorage.setItem('selectedProject', JSON.stringify({
                    id: currentProject.id,
                    name: currentProject.name,
                    client: currentProject.client,
                    clientEmail: currentProject.clientEmail,
                    projectId: currentProject.id,
                    status: currentProject.status
                }));
                
                // Update header
                const headerTitle = document.querySelector('.header-title');
                if (headerTitle) {
                    headerTitle.textContent = currentProject.name;
                }
            }
        }
    }

    /*
     * -------------------------------------------
     * Revision History Items Functionality
     * -------------------------------------------
     */
    const revisionItems = document.querySelectorAll('.revision-list-item');
    revisionItems.forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', () => {
            const versionTitle = item.querySelector('.revision-list-title, .revision-list-title-active')?.textContent || 'Unknown';
            const versionStatus = item.querySelector('.status-badge, .revision-list-status-old')?.textContent || '';
            
            console.log(`Viewing ${versionTitle} - ${versionStatus}`);
            
            // Update video player placeholder (in production, this would load the actual video)
            const videoPlaceholder = document.querySelector('.video-player-placeholder');
            if (videoPlaceholder) {
                videoPlaceholder.innerHTML = `<span>Playing ${versionTitle} (${versionStatus})</span>`;
            }
            
            // Update card footer
            const cardFooter = document.querySelector('.card-footer .card-title-xl');
            if (cardFooter) {
                cardFooter.textContent = `${versionTitle} (${versionStatus})`;
            }
            
            // Highlight selected revision
            revisionItems.forEach(rev => rev.classList.remove('revision-selected'));
            item.classList.add('revision-selected');
        });
    });

    /*
     * -------------------------------------------
     * Comment System Integration (Bidirectional)
     * -------------------------------------------
     */
    const feedbackReplyInput = document.getElementById('feedback-reply-input');
    const feedbackReplySend = document.getElementById('feedback-reply-send');
    const feedbackList = document.querySelector('.feedback-list');
    
    // Get project ID
    const projectId = CommentsManager.getCurrentProjectId();
    
    // Function to render comments in agent view style
    const renderComments = () => {
        if (feedbackList) {
            // Get the parent card section
            const feedbackCard = feedbackList.closest('.card');
            if (feedbackCard) {
                CommentsManager.renderCommentsAgent(projectId, feedbackCard);
            }
        }
    };
    
    // Load and render existing comments on page load
    renderComments();
    
    // Initialize sync listener for real-time updates
    CommentsManager.initSyncListener(projectId, renderComments);
    
    /*
     * -------------------------------------------
     * Comment Status Update Functionality (Event Delegation)
     * -------------------------------------------
     * Uses event delegation to handle dynamically added status buttons
     */
    document.addEventListener('click', (e) => {
        const statusOption = e.target.closest('.popover-list-item-status');
        if (statusOption) {
            e.preventDefault();
            const newStatus = statusOption.getAttribute('data-status');
            const commentId = statusOption.getAttribute('data-comment-id');
            const projectId = CommentsManager.getCurrentProjectId();
            
            if (!newStatus || !commentId || !projectId) return;
            
            // Update comment status
            CommentsManager.updateCommentStatus(projectId, commentId, newStatus);
            
            // Close the popover
            const statusMenu = statusOption.closest('.popover-menu');
            if (statusMenu) statusMenu.classList.remove('is-open');
            
            // Re-render comments to show updated status
            renderComments();
            
            console.log(`Comment ${commentId} status updated to: ${newStatus}`);
        }
    });
    
    // Comment posting logic for agent
    if (feedbackReplySend) {
        feedbackReplySend.addEventListener('click', () => {
            if (!feedbackReplyInput || !feedbackReplyInput.value.trim()) {
                return;
            }
            
            const replyText = feedbackReplyInput.value.trim();
            
            // Get user info from auth
            const auth = localStorage.getItem('auth') || sessionStorage.getItem('auth');
            let authorName = 'Vugru (Agent)';
            if (auth) {
                try {
                    const authData = JSON.parse(auth);
                    authorName = authData.email ? `Vugru (${authData.email})` : 'Vugru (Agent)';
                } catch (e) {
                    console.error('Error parsing auth data:', e);
                }
            }
            
            // Save comment using comment manager
            CommentsManager.saveComment(projectId, replyText, 'agent', authorName);
            
            // Add notification for client about new agent comment
            if (typeof VideoStorageManager !== 'undefined') {
                VideoStorageManager.addNotification(projectId, 'comment-awaiting', `Agent commented: "${replyText}"`);
            }
            
            // Re-render comments to show the new one
            renderComments();
            
            // Clear input
            feedbackReplyInput.value = '';
            
            // Scroll to bottom of feedback list
            if (feedbackList) {
                feedbackList.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }
            
            console.log('Comment sent:', replyText);
        });
    }
    
    // Allow Enter key to send (Shift+Enter for new line)
    if (feedbackReplyInput) {
        feedbackReplyInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (feedbackReplySend) {
                    feedbackReplySend.click();
                }
            }
        });
    }
    
    // Project data loading is now handled above in the "Load Project Data" section

    // Log successful initialization with details
    console.log('Vugru Dashboard: All event listeners initialized successfully');
    console.log('Buttons initialized:', {
        uploadButton: !!uploadButton,
        logoutButton: !!logoutButton,
        publishOptions: publishOptions.length,
        shareOptions: shareOptions.length,
        revisionItems: revisionItems.length,
        feedbackReplySend: !!feedbackReplySend,
        currentProject: currentProject ? currentProject.name : 'None'
    });

    } catch (error) {
        console.error('Error initializing Vugru Dashboard:', error);
        console.error('Error stack:', error.stack);
        // Show user-friendly error message
        alert('There was an error loading the dashboard. Please check the console for details and refresh the page.');
    }

});