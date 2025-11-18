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

});