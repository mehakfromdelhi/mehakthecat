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

});