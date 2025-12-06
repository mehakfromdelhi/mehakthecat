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

    // --- Comment Posting Logic ---
    const commentInput = document.getElementById('comment-input');
    const commentButton = document.getElementById('post-comment-btn');
    const commentSection = document.getElementById('comments-section');

    if (commentButton && commentInput && commentSection) {
      commentButton.addEventListener('click', () => {
        const text = commentInput.value.trim();
        if (text.length === 0) return;

        // Create new comment element
        const newComment = document.createElement('div');
        newComment.className = 'p-3 bg-gray-50 rounded-lg';
        newComment.innerHTML = `
          <p class="text-sm text-gray-800"><span class="font-medium">You:</span> ${text}</p>
          <p class="text-xs text-gray-400 mt-1">Just now</p>
        `;

        // Append to comment section
        commentSection.appendChild(newComment);

        // Clear input
        commentInput.value = '';
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

