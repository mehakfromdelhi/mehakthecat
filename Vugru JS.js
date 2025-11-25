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
        const auth = localStorage.getItem('auth') || sessionStorage.getItem('auth');
        
        if (!auth) {
            // Not authenticated, redirect to login
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
            return true;
        } catch (e) {
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
    const googleDriveButton = document.getElementById('google-drive-button');
    const onedriveButton = document.getElementById('onedrive-button');
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
            e.stopPropagation();
            openUploadModal();
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

    // Function to simulate file upload (replace with actual upload logic)
    const uploadFile = (file) => {
        // Show progress
        if (uploadProgress) {
            uploadProgress.style.display = 'block';
        }
        if (uploadSuccess) {
            uploadSuccess.style.display = 'none';
        }

        // Simulate upload progress
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

                    // In a real application, you would:
                    // 1. Send the file to your server
                    // 2. Update the video player with the new video
                    // 3. Refresh the revision history
                    
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

    // Handle Google Drive button click
    if (googleDriveButton) {
        googleDriveButton.addEventListener('click', () => {
            // TODO: Integrate Google Picker API
            // For now, show a message
            alert('Google Drive integration requires Google Picker API setup.\n\nTo implement:\n1. Get a Google API key\n2. Enable Google Picker API\n3. Load the Google Picker API script\n4. Implement picker initialization');
            
            // Example implementation structure:
            // loadGooglePickerAPI().then(() => {
            //     const picker = new google.picker.PickerBuilder()
            //         .addView(google.picker.ViewId.VIDEOS)
            //         .setOAuthToken(oauthToken)
            //         .setCallback(pickerCallback)
            //         .build();
            //     picker.setVisible(true);
            // });
        });
    }

    // Handle OneDrive button click
    if (onedriveButton) {
        onedriveButton.addEventListener('click', () => {
            // TODO: Integrate Microsoft Graph API / OneDrive File Picker
            // For now, show a message
            alert('OneDrive integration requires Microsoft Graph API setup.\n\nTo implement:\n1. Register your app in Azure AD\n2. Get Microsoft Graph API credentials\n3. Load Microsoft Graph SDK\n4. Implement file picker using OneDrive API');
            
            // Example implementation structure:
            // MicrosoftGraphClient.init({
            //     authProvider: authProvider
            // }).then((client) => {
            //     // Use OneDrive file picker
            //     OneDrive.open({
            //         clientId: 'your-client-id',
            //         action: 'query',
            //         multiSelect: false,
            //         advanced: {
            //             filter: 'video',
            //         },
            //         success: (files) => {
            //             // Handle selected file
            //         }
            //     });
            // });
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
            e.preventDefault();
            const linkText = link.querySelector('span')?.textContent || '';
            
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

    /*
     * -------------------------------------------
     * Share with Client Functionality
     * -------------------------------------------
     */
    const shareOptions = document.querySelectorAll('#share-menu .popover-list-item-icon');
    shareOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault();
            const shareMethod = option.querySelector('span')?.textContent || 'Unknown';
            
            // Close the popover
            const shareMenu = document.getElementById('share-menu');
            if (shareMenu) shareMenu.classList.remove('is-open');
            
            // Handle share action
            if (shareMethod.includes('Email')) {
                const email = prompt('Enter email address to share with:');
                if (email) {
                    console.log(`Sharing via email to: ${email}`);
                    alert(`Sharing video with ${email}...\n\nIn production, this would send an email with the video link.`);
                }
            } else if (shareMethod.includes('Whatsapp')) {
                const phone = prompt('Enter phone number (with country code):');
                if (phone) {
                    console.log(`Sharing via WhatsApp to: ${phone}`);
                    // Create WhatsApp share link
                    const videoUrl = window.location.href;
                    const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Check out this video: ${videoUrl}`)}`;
                    window.open(whatsappUrl, '_blank');
                }
            } else if (shareMethod.includes('Copy URL')) {
                const videoUrl = window.location.href;
                navigator.clipboard.writeText(videoUrl).then(() => {
                    alert('Video URL copied to clipboard!');
                    console.log('URL copied:', videoUrl);
                }).catch(() => {
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = videoUrl;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    alert('Video URL copied to clipboard!');
                });
                
                // Close the popover
                if (shareMenu) shareMenu.classList.remove('is-open');
            }
        });
    });

    /*
     * -------------------------------------------
     * Status Update Functionality
     * -------------------------------------------
     */
    const statusOptions = document.querySelectorAll('.popover-list-item-status');
    statusOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault();
            const status = option.textContent.trim() || 'Unknown';
            const statusButton = option.closest('.popover-wrapper')?.querySelector('.feedback-status-button');
            
            // Close the popover
            const statusMenu = option.closest('.popover-menu');
            if (statusMenu) statusMenu.classList.remove('is-open');
            
            // Update status button text
            if (statusButton) {
                statusButton.innerHTML = `Status: ${status} <svg class="icon-chevron-sm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clip-rule="evenodd" /></svg>`;
            }
            
            console.log(`Status updated to: ${status}`);
            // In production, this would send an API request to update the status
        });
    });

    /*
     * -------------------------------------------
     * Notification Items Functionality
     * -------------------------------------------
     */
    const notificationItems = document.querySelectorAll('#notifications-popover .popover-list-item');
    notificationItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const notificationText = item.querySelector('.notification-title')?.textContent || '';
            
            // Close the popover
            const notificationsMenu = document.getElementById('notifications-popover');
            if (notificationsMenu) notificationsMenu.classList.remove('is-open');
            
            console.log(`Notification clicked: ${notificationText}`);
            // In production, this would navigate to the specific notification/comment
            // For now, just scroll to feedback section
            const feedbackSection = document.querySelector('.card:has(.feedback-list)');
            if (feedbackSection) {
                feedbackSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

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

});