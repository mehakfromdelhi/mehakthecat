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

    // --- Notification Bell Logic ---
    const notifBtn = document.getElementById('notif-btn');
    const notifDropdown = document.getElementById('notif-dropdown');
    const notifDot = document.getElementById('notif-dot');

    if (notifBtn) {
      notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (notifDropdown) {
          notifDropdown.classList.toggle('hidden');
        }
        if (notifDot) {
          notifDot.classList.add('hidden'); // Mark notifications as seen
        }
      });
    }

    // Hide notification dropdown when clicking outside
    window.addEventListener('click', () => {
      if (notifDropdown && !notifDropdown.classList.contains('hidden')) {
        notifDropdown.classList.add('hidden');
      }
    });

    // --- Share Button Logic ---
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(window.location.href)
          .then(() => alert('Link copied to clipboard!'))
          .catch(() => alert('Unable to copy link.'));
      });
    }

    // --- Comment System Integration ---
    const commentInput = document.getElementById('comment-input');
    const commentButton = document.getElementById('post-comment-btn');
    const commentSection = document.getElementById('comments-section');
    
    // Get project ID
    const projectId = CommentsManager.getCurrentProjectId();
    
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
    
    // Comment posting logic
    if (commentButton && commentInput && commentSection) {
      commentButton.addEventListener('click', () => {
        const text = commentInput.value.trim();
        if (text.length === 0) return;

        // Get user info from auth
        const auth = localStorage.getItem('auth') || sessionStorage.getItem('auth');
        let authorName = 'Client';
        if (auth) {
            try {
                const authData = JSON.parse(auth);
                authorName = authData.email || 'Client';
            } catch (e) {
                console.error('Error parsing auth data:', e);
            }
        }

        // Save comment using comment manager
        CommentsManager.saveComment(projectId, text, 'client', authorName);

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

    // --- Video Play Button Logic (mock) ---
    const playButton = document.querySelector('button[aria-label="Play Video"]');
    const videoContainer = playButton?.closest('div');

    if (playButton && videoContainer) {
      playButton.addEventListener('click', () => {
        // Replace the play button with a simulated video player
        videoContainer.innerHTML = `
          <video controls autoplay class="w-full h-full rounded-xl">
            <source src="video-placeholder.mp4" type="video/mp4">
            Your browser does not support the video tag.
          </video>
        `;
      });
    }
});

