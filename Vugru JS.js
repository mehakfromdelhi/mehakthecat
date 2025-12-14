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
        const currentProjectId = CommentsManager.getCurrentProjectId();
        // Show progress
        if (uploadProgress) {
            uploadProgress.style.display = 'block';
        }
        if (uploadSuccess) {
            uploadSuccess.style.display = 'none';
        }

        // Convert file to data URL for persistence
        const reader = new FileReader();
        reader.onload = async (e) => {
            const photoDataUrl = e.target.result;
            
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
                    setTimeout(async () => {
                        if (uploadProgress) {
                            uploadProgress.style.display = 'none';
                        }
                        if (uploadSuccess) {
                            uploadSuccess.style.display = 'flex';
                        }

                        // Save photo using StorageAdapter (Firebase or localStorage)
                        if (currentProjectId) {
                            try {
                                // Use StorageAdapter which handles Firebase/localStorage automatically
                                if (typeof StorageAdapter !== 'undefined') {
                                    const savedPhoto = await StorageAdapter.uploadPhoto(currentProjectId, file, {
                                        notes: `Uploaded: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`
                                    });
                                    
                                    console.log('Photo saved successfully:', savedPhoto);
                                    console.log('Current project ID:', currentProjectId);
                                    
                                    // Use the download URL from Firebase or data URL from localStorage
                                    const photoUrl = savedPhoto.downloadURL || savedPhoto.url || photoDataUrl;
                                    
                                    // Refresh photo viewer and revision history immediately
                                    loadCurrentPhoto();
                                    loadRevisionHistory();
                                } else if (typeof PhotoStorageManager !== 'undefined') {
                                    // Fallback to direct PhotoStorageManager
                                    const savedPhoto = PhotoStorageManager.savePhoto(currentProjectId, {
                                        fileName: file.name,
                                        url: photoDataUrl,
                                        notes: `Uploaded: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`
                                    });
                                    
                                    console.log('Photo saved successfully:', savedPhoto);
                                    loadCurrentPhoto();
                                    loadRevisionHistory();
                                } else {
                                    // Last resort: just update viewer
                                    updatePhotoViewer(photoDataUrl, file);
                                }
                            } catch (error) {
                                console.error('Error saving photo:', error);
                                // Fallback: Update photo viewer directly
                                updatePhotoViewer(photoDataUrl, file);
                            }
                        } else {
                            console.warn('No project ID. Current project ID:', currentProjectId);
                            // Fallback: Update photo viewer directly
                            updatePhotoViewer(photoDataUrl, file);
                        }
                        
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
        reader.onerror = (error) => {
            console.error('Error reading file:', error);
            alert('Error reading file. Please try again.');
        };
        reader.readAsDataURL(file);
    };

    // Function to update photo viewer with uploaded photo
    const updatePhotoViewer = (photoUrl, file) => {
        const videoPlayerWrapper = document.querySelector('.video-player-wrapper');
        const videoPlayerPlaceholder = document.querySelector('.video-player-placeholder');
        
        if (videoPlayerWrapper) {
            // Hide placeholder if it exists
            if (videoPlayerPlaceholder) {
                videoPlayerPlaceholder.style.display = 'none';
            }
            
            // Remove any existing image/video elements
            const existingMedia = videoPlayerWrapper.querySelector('img, video');
            if (existingMedia) {
                existingMedia.remove();
            }
            
            // Create and append image element
            const imageElement = document.createElement('img');
            imageElement.src = photoUrl;
            imageElement.alt = file.name;
            // Position absolutely to match placeholder positioning
            imageElement.style.position = 'absolute';
            imageElement.style.top = '0';
            imageElement.style.left = '0';
            imageElement.style.width = '100%';
            imageElement.style.height = '100%';
            imageElement.style.objectFit = 'contain';
            imageElement.style.borderRadius = '0.5rem';
            imageElement.style.display = 'block';
            imageElement.style.backgroundColor = '#000000'; // Match placeholder background
            videoPlayerWrapper.appendChild(imageElement);
            
            // Update card footer with file info
            const cardTitle = document.querySelector('.card-footer .card-title-xl');
            const cardSubtitle = document.querySelector('.card-footer .card-subtitle');
            
            if (cardTitle) {
                // Get the latest photo to show version number
                const currentProjectId = CommentsManager.getCurrentProjectId();
                if (typeof PhotoStorageManager !== 'undefined' && currentProjectId) {
                    const currentPhoto = PhotoStorageManager.getCurrentPhoto(currentProjectId);
                    if (currentPhoto) {
                        cardTitle.textContent = `Version ${currentPhoto.version} (New Upload)`;
                    } else {
                        cardTitle.textContent = 'New Upload';
                    }
                } else {
                    cardTitle.textContent = 'New Upload';
                }
            }
            
            if (cardSubtitle) {
                const now = new Date();
                const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                cardSubtitle.textContent = `Uploaded by Vugru on ${dateStr} at ${timeStr}`;
            }
        }
    };

    // Revision history is now loaded dynamically from PhotoStorageManager via loadRevisionHistory()

    // Handle local file upload
    if (localFileInput) {
        localFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    alert('Please select a valid image file.');
                    localFileInput.value = '';
                    return;
                }

                // Validate file size (e.g., max 50MB)
                const maxSize = 50 * 1024 * 1024; // 50MB in bytes
                if (file.size > maxSize) {
                    alert('File size exceeds 50MB. Please select a smaller file.');
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

    // Share button and publish functionality removed - no longer needed

    // Comment status update functionality is now handled via event delegation in the comment system section

    /*
     * -------------------------------------------
     * Load Project Data and Update UI
     * -------------------------------------------
     */
    function loadProjectData() {
        // Wait for ProjectDataManager to be available
        if (typeof ProjectDataManager === 'undefined') {
            setTimeout(loadProjectData, 100);
            return null;
        }
        
        // Ensure ProjectDataManager is initialized
        ProjectDataManager.initialize();
        
        // Get project ID from URL - THIS IS THE SOURCE OF TRUTH
        const urlParams = new URLSearchParams(window.location.search);
        let projectId = urlParams.get('projectId');
        
        // Decode if needed
        if (projectId) {
            projectId = decodeURIComponent(projectId);
        }
        
        // If no project ID in URL, try sessionStorage
        if (!projectId) {
            const selectedProject = sessionStorage.getItem('selectedProject');
            if (selectedProject) {
                try {
                    const parsed = JSON.parse(selectedProject);
                    projectId = parsed.id || parsed.projectId;
                } catch (e) {
                    console.error('Error parsing selected project:', e);
                }
            }
        }
        
        if (!projectId) {
            // No project selected - show error
            const headerTitle = document.querySelector('.header-title');
            if (headerTitle) headerTitle.textContent = 'No Project Selected';
            const clientName = document.getElementById('project-client-name');
            if (clientName) clientName.textContent = 'N/A';
            const statusText = document.getElementById('project-status-text');
            if (statusText) statusText.textContent = 'No Project';
            return null;
        }
        
        // Fetch project from ProjectDataManager - THIS IS THE SOURCE OF TRUTH FOR PROJECT DATA
        const currentProject = ProjectDataManager.getProject(projectId);
        
        if (!currentProject) {
            // Project not found - show error
            const headerTitle = document.querySelector('.header-title');
            if (headerTitle) headerTitle.textContent = 'Project Not Found';
            const clientName = document.getElementById('project-client-name');
            if (clientName) clientName.textContent = 'N/A';
            const statusText = document.getElementById('project-status-text');
            if (statusText) statusText.textContent = 'Not Found';
            return null;
        }
        
        // Update sessionStorage with complete project data
        sessionStorage.setItem('selectedProject', JSON.stringify({
            id: currentProject.id,
            name: currentProject.name,
            client: currentProject.client,
            clientEmail: currentProject.clientEmail,
            projectId: currentProject.id,
            status: currentProject.status,
            progress: currentProject.progress,
            deadline: currentProject.deadline,
            priority: currentProject.priority
        }));
        
        // Update UI with project data - FORCE UPDATE IMMEDIATELY
        const headerTitle = document.querySelector('.header-title');
        if (headerTitle) {
            headerTitle.textContent = currentProject.name;
            // Force browser to update
            headerTitle.style.visibility = 'hidden';
            headerTitle.offsetHeight; // Trigger reflow
            headerTitle.style.visibility = 'visible';
        }
        
        const clientName = document.getElementById('project-client-name');
        if (clientName) {
            clientName.textContent = currentProject.client || 'N/A';
            // Force browser to update
            clientName.style.visibility = 'hidden';
            clientName.offsetHeight; // Trigger reflow
            clientName.style.visibility = 'visible';
        }
        
        // Update project status - show actual project status, not just photo status
        const statusText = document.getElementById('project-status-text');
        const statusBar = document.getElementById('project-status-bar');
        
        // Get project status from project data
        const projectStatus = currentProject.status || 'active';
        
        if (statusText) {
            // Show project status (active, in-review, awaiting-feedback, completed)
            const statusLabels = {
                'active': 'Active',
                'in-review': 'In Review',
                'awaiting-feedback': 'Awaiting Feedback',
                'completed': 'Completed'
            };
            
            const statusLabel = statusLabels[projectStatus] || projectStatus;
            statusText.textContent = statusLabel;
            
            // Set status bar color based on project status
            if (statusBar) {
                if (projectStatus === 'completed') {
                    statusText.className = 'status-bar-text-green';
                    statusBar.className = 'status-bar-fill-green';
                    statusBar.style.width = '100%';
                } else if (projectStatus === 'in-review') {
                    statusText.className = 'status-bar-text-yellow';
                    statusBar.className = 'status-bar-fill-yellow';
                    statusBar.style.width = '75%';
                } else if (projectStatus === 'awaiting-feedback') {
                    statusText.className = 'status-bar-text-yellow';
                    statusBar.className = 'status-bar-fill-yellow';
                    statusBar.style.width = '50%';
                } else {
                    // active
                    statusText.className = 'status-bar-text-yellow';
                    statusBar.className = 'status-bar-fill-yellow';
                    statusBar.style.width = currentProject.progress ? `${currentProject.progress}%` : '30%';
                }
            }
        }
        
        // Ensure projectId is available - use the extracted projectId variable if currentProject.id is missing
        const finalProjectId = currentProject.id || currentProject.projectId || projectId;
        
        // Trigger comments reload after project is loaded
        if (typeof window !== 'undefined' && finalProjectId) {
            window.dispatchEvent(new CustomEvent('projectDataLoaded', {
                detail: { project: currentProject, projectId: finalProjectId }
            }));
        }
        
        // Return project for use in other functions
        return currentProject;
    }
    
    // Load project data on page load - simple retry if ProjectDataManager not ready
    let currentProject = null;
    let retryCount = 0;
    const maxRetries = 5;
    
    function tryLoadProjectData() {
        currentProject = loadProjectData();
        if (!currentProject && retryCount < maxRetries) {
            retryCount++;
            setTimeout(tryLoadProjectData, 200);
        }
    }
    
    // Start loading project data immediately
    tryLoadProjectData();

    /*
     * -------------------------------------------
     * Load Current Photo into Photo Viewer
     * -------------------------------------------
     */
    function loadCurrentPhoto() {
        const currentProjectId = CommentsManager.getCurrentProjectId();
        
        console.log('loadCurrentPhoto called with project ID:', currentProjectId);
        
        if (!currentProjectId) {
            console.warn('No project ID available');
            return;
        }
        
        if (typeof PhotoStorageManager === 'undefined') {
            console.warn('PhotoStorageManager not available');
            return;
        }
        
        const videoPlayerWrapper = document.querySelector('.video-player-wrapper');
        const videoPlayerPlaceholder = document.querySelector('.video-player-placeholder');
        
        if (!videoPlayerWrapper) {
            console.warn('Video player wrapper not found');
            return;
        }
        
        const currentPhoto = PhotoStorageManager.getCurrentPhoto(currentProjectId);
        
        console.log('Current photo retrieved:', currentPhoto);
        
        if (currentPhoto && currentPhoto.url) {
            // Hide placeholder
            if (videoPlayerPlaceholder) {
                videoPlayerPlaceholder.style.display = 'none';
            }
            
            // Remove any existing image/video elements
            const existingMedia = videoPlayerWrapper.querySelector('img, video');
            if (existingMedia) {
                existingMedia.remove();
            }
            
            // Create and append new image element
            const imageElement = document.createElement('img');
            imageElement.src = currentPhoto.url;
            imageElement.alt = currentPhoto.fileName || 'Property Photo';
            // Position absolutely to match placeholder positioning
            imageElement.style.position = 'absolute';
            imageElement.style.top = '0';
            imageElement.style.left = '0';
            imageElement.style.width = '100%';
            imageElement.style.height = '100%';
            imageElement.style.objectFit = 'contain';
            imageElement.style.borderRadius = '0.5rem';
            imageElement.style.display = 'block';
            imageElement.style.backgroundColor = '#000000'; // Match placeholder background
            
            // Add error handler in case image fails to load
            imageElement.onerror = function() {
                console.error('Failed to load image:', currentPhoto.url.substring(0, 50) + '...');
                if (videoPlayerPlaceholder) {
                    videoPlayerPlaceholder.style.display = 'flex';
                }
            };
            
            // Add load handler to ensure image is displayed
            imageElement.onload = function() {
                console.log('Image loaded successfully');
                if (videoPlayerPlaceholder) {
                    videoPlayerPlaceholder.style.display = 'none';
                }
            };
            
            videoPlayerWrapper.appendChild(imageElement);
            
            // Update card footer
            const cardTitle = document.querySelector('.card-footer .card-title-xl');
            const cardSubtitle = document.querySelector('.card-footer .card-subtitle');
            
            if (cardTitle) {
                const statusText = currentPhoto.status === 'approved' ? 'Approved' : 
                                  currentPhoto.status === 'not-approved' ? 'Not Approved' : 
                                  'Under Review';
                cardTitle.textContent = `Version ${currentPhoto.version} (${statusText})`;
            }
            
            if (cardSubtitle && currentPhoto.uploadedAt) {
                const date = new Date(currentPhoto.uploadedAt);
                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                cardSubtitle.textContent = `Uploaded by Vugru on ${dateStr} at ${timeStr}`;
            }
        } else {
            // No photo, show placeholder and remove any existing media
            const existingMedia = videoPlayerWrapper.querySelector('img, video');
            if (existingMedia) {
                existingMedia.remove();
            }
            
            // Recreate placeholder if it was removed
            let placeholder = videoPlayerWrapper.querySelector('.video-player-placeholder');
            if (!placeholder) {
                placeholder = document.createElement('div');
                placeholder.className = 'video-player-placeholder';
                const span = document.createElement('span');
                span.textContent = 'Photo Viewer Placeholder';
                placeholder.appendChild(span);
                videoPlayerWrapper.appendChild(placeholder);
            }
            placeholder.style.display = 'flex';
            
            // Update card footer
            const cardTitle = document.querySelector('.card-footer .card-title-xl');
            const cardSubtitle = document.querySelector('.card-footer .card-subtitle');
            if (cardTitle) {
                cardTitle.textContent = 'No photo uploaded yet';
            }
            if (cardSubtitle) {
                cardSubtitle.textContent = '';
            }
        }
    }

    /*
     * -------------------------------------------
     * Load Revision History from PhotoStorageManager
     * -------------------------------------------
     */
    function loadRevisionHistory() {
        const revisionList = document.querySelector('.revision-list');
        const currentProjectId = CommentsManager.getCurrentProjectId();
        if (!revisionList || !currentProjectId) return;
        
        if (typeof PhotoStorageManager === 'undefined') {
            revisionList.innerHTML = '<li class="revision-list-item"><div><p class="revision-list-subtitle">Loading...</p></div></li>';
            return;
        }
        
        const photos = PhotoStorageManager.getPhotos(currentProjectId);
        const currentPhoto = PhotoStorageManager.getCurrentPhoto(currentProjectId);
        
        if (photos.length === 0) {
            revisionList.innerHTML = '<li class="revision-list-item"><div><p class="revision-list-subtitle">No photos uploaded yet</p></div></li>';
            return;
        }
        
        // Sort by version (newest first)
        const sortedPhotos = [...photos].sort((a, b) => b.version - a.version);
        
        revisionList.innerHTML = '';
        sortedPhotos.forEach(photo => {
            const isCurrent = currentPhoto && photo.id === currentPhoto.id;
            const li = document.createElement('li');
            li.className = 'revision-list-item';
            li.style.cursor = 'pointer';
            
            const date = new Date(photo.uploadedAt);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            
            let statusBadge = '';
            if (photo.status === 'approved') {
                statusBadge = '<span class="status-badge status-badge-green">Approved</span>';
            } else if (photo.status === 'not-approved') {
                statusBadge = '<span class="status-badge status-badge-red">Not Approved</span>';
            } else {
                statusBadge = '<span class="status-badge status-badge-yellow">Under Review</span>';
            }
            
            if (isCurrent) {
                li.innerHTML = `
                    <div>
                        <h3 class="revision-list-title-active">Version ${photo.version}</h3>
                        <p class="revision-list-subtitle">Uploaded ${dateStr}</p>
                    </div>
                    ${statusBadge}
                `;
            } else {
                li.innerHTML = `
                    <div>
                        <h3 class="revision-list-title">Version ${photo.version}</h3>
                        <p class="revision-list-subtitle">Uploaded ${dateStr}</p>
                    </div>
                    <span class="revision-list-status-old">Superseded</span>
                `;
            }
            
            // Add click handler
            li.addEventListener('click', () => {
                // Load this photo version
                const videoPlayerWrapper = document.querySelector('.video-player-wrapper');
                const videoPlayerPlaceholder = document.querySelector('.video-player-placeholder');
                
                if (videoPlayerWrapper && photo.url) {
                    // Remove existing image/video
                    const existingMedia = videoPlayerWrapper.querySelector('img, video');
                    if (existingMedia) {
                        existingMedia.remove();
                    }
                    
                    // Create and show image
                    const imageElement = document.createElement('img');
                    imageElement.src = photo.url;
                    imageElement.alt = photo.fileName;
                    imageElement.style.width = '100%';
                    imageElement.style.height = '100%';
                    imageElement.style.objectFit = 'contain';
                    imageElement.style.borderRadius = '0.5rem';
                    
                    if (videoPlayerPlaceholder) {
                        videoPlayerPlaceholder.style.display = 'none';
                    }
                    videoPlayerWrapper.appendChild(imageElement);
                    
                    // Update card footer
                    const cardFooter = document.querySelector('.card-footer .card-title-xl');
                    if (cardFooter) {
                        cardFooter.textContent = `Version ${photo.version} (${photo.status === 'approved' ? 'Approved' : photo.status === 'not-approved' ? 'Not Approved' : 'Under Review'})`;
                    }
                    
                    // Highlight selected revision
                    document.querySelectorAll('.revision-list-item').forEach(rev => rev.classList.remove('revision-selected'));
                    li.classList.add('revision-selected');
                }
            });
            
            revisionList.appendChild(li);
        });
    }
    
    // Load current photo and revision history on page load
    loadCurrentPhoto();
    loadRevisionHistory();
    
    // Listen for photo updates to refresh photo viewer, revision history, and status
    window.addEventListener('photosUpdated', (e) => {
        const currentProjectId = CommentsManager.getCurrentProjectId();
        console.log('photosUpdated event received:', e.detail, 'Current project ID:', currentProjectId);
        
        // Update if project ID matches, or if no project ID specified (update all)
        if (e.detail && (e.detail.projectId === currentProjectId || !e.detail.projectId)) {
            console.log('Refreshing photo viewer for project:', currentProjectId);
            loadCurrentPhoto();
            loadRevisionHistory();
            updateProjectUI(); // Update status based on photo approval
        } else {
            console.log('Event project ID does not match current project ID');
        }
    });

    /*
     * -------------------------------------------
     * Comment System Integration (Bidirectional)
     * -------------------------------------------
     */
    const feedbackReplyInput = document.getElementById('feedback-reply-input');
    const feedbackReplySend = document.getElementById('feedback-reply-send');
    const feedbackList = document.querySelector('.feedback-list');
    
    // Function to get project ID and initialize comments
    function initializeComments() {
        // Get project ID - ensure we have it from the loaded project
        let projectId = null;
        
        // First try to get from currentProject (if loaded)
        if (currentProject) {
            projectId = currentProject.id || currentProject.projectId;
        }
        
        // Fallback to sessionStorage
        if (!projectId) {
            const selectedProject = sessionStorage.getItem('selectedProject');
            if (selectedProject) {
                try {
                    const parsed = JSON.parse(selectedProject);
                    projectId = parsed.id || parsed.projectId;
                } catch (e) {
                    console.error('Error parsing selected project for comments:', e);
                }
            }
        }
        
        // Fallback to CommentsManager
        if (!projectId && typeof CommentsManager !== 'undefined') {
            projectId = CommentsManager.getCurrentProjectId();
        }
        
        if (!projectId) {
            console.warn('No project ID available for comments');
            return;
        }
        
        console.log('Initializing comments for project ID:', projectId);
        
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
        
        // Load and render existing comments
        renderComments();
        
        // Initialize sync listener for real-time updates
        CommentsManager.initSyncListener(projectId, renderComments);
        
        // Listen for project data loaded event to reload comments
        window.addEventListener('projectDataLoaded', (e) => {
            if (e.detail && e.detail.projectId) {
                projectId = e.detail.projectId;
                renderComments();
            }
        });
    }
    
    // Initialize comments after a short delay to ensure project data is loaded
    setTimeout(() => {
        initializeComments();
    }, 300);
    
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
            if (typeof PhotoStorageManager !== 'undefined') {
                PhotoStorageManager.addNotification(projectId, 'comment-awaiting', `Agent commented: "${replyText}"`);
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