<script>
  // --- Tailwind Font Config ---
  tailwind.config = {
    theme: {
      extend: {
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
        },
      },
    },
  };

  document.addEventListener('DOMContentLoaded', () => {
    // --- Notification Bell Logic ---
    const notifBtn = document.getElementById('notif-btn');
    const notifDropdown = document.getElementById('notif-dropdown');
    const notifDot = document.getElementById('notif-dot');

    if (notifBtn) {
      notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notifDropdown.classList.toggle('hidden');
        notifDot.classList.add('hidden'); // Mark notifications as seen
      });
    }

    // Hide notification dropdown when clicking outside
    window.addEventListener('click', () => {
      if (!notifDropdown.classList.contains('hidden')) {
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
    const commentInput = document.querySelector('textarea');
    const commentButton = commentInput?.nextElementSibling;
    const commentSection = commentInput?.closest('div').previousElementSibling;

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
</script>

