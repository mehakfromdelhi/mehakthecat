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
        return true;
    } catch (e) {
        // Invalid auth data, clear and redirect
        localStorage.removeItem('auth');
        sessionStorage.removeItem('auth');
        window.location.href = 'login.html';
        return false;
    }
}

// Projects are now managed by ProjectDataManager

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuthentication()) {
        return;
    }
    
    // Initialize all features
    initializeCalendar();
    initializeComments();
    initializeNavigation();
    initializeLogout();
    
    console.log('Calendar Dashboard initialized');
});

// ===================== Comments System =====================
let selectedProjectForComments = null;

function initializeComments() {
    const commentsList = document.getElementById('calendar-comments-list');
    const commentInput = document.getElementById('calendar-comment-input');
    const commentSend = document.getElementById('calendar-comment-send');
    
    if (!commentsList || !commentInput || !commentSend) {
        // Comments section might not be visible initially
        return;
    }
    
    // Initially hide comments section
    const commentsSection = document.getElementById('calendar-comments');
    if (commentsSection) {
        commentsSection.style.display = 'none';
    }
    
    // Listen for project selection from deadline items
    document.addEventListener('click', (e) => {
        const deadlineItem = e.target.closest('.deadline-item');
        if (deadlineItem) {
            // Extract project info from the deadline item
            const projectName = deadlineItem.querySelector('.deadline-project')?.textContent;
            if (projectName) {
                // Find project in ProjectDataManager
                const projects = ProjectDataManager.getAllProjects();
                const project = projects.find(p => p.name === projectName);
                if (project) {
                    selectProjectForComments(project);
                }
            }
        }
    });
    
    // Comment posting
    if (commentSend) {
        commentSend.addEventListener('click', () => {
            if (!selectedProjectForComments) {
                alert('Please select a project first by clicking on a deadline item.');
                return;
            }
            
            const text = commentInput.value.trim();
            if (!text) return;
            
            // Get author name from auth
            let authorName = 'Vugru (Agent)';
            const auth = localStorage.getItem('auth') || sessionStorage.getItem('auth');
            if (auth) {
                try {
                    const authData = JSON.parse(auth);
                    authorName = authData.email ? `Vugru (${authData.email})` : 'Vugru (Agent)';
                } catch (e) {
                    console.error('Error parsing auth data:', e);
                }
            }
            
            // Save comment
            CommentsManager.saveComment(selectedProjectForComments.id, text, 'agent', authorName);
            
            // Clear input
            commentInput.value = '';
            
            // Re-render comments
            renderComments();
        });
    }
    
    // Allow Enter key to send (Shift+Enter for new line)
    if (commentInput) {
        commentInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (commentSend) {
                    commentSend.click();
                }
            }
        });
    }
    
    // Initialize comment status update handlers
    document.addEventListener('click', (e) => {
        const statusOption = e.target.closest('.popover-list-item-status');
        if (statusOption) {
            e.preventDefault();
            const newStatus = statusOption.getAttribute('data-status');
            const commentId = statusOption.getAttribute('data-comment-id');
            
            if (!selectedProjectForComments || !newStatus || !commentId) return;
            
            // Update comment status
            CommentsManager.updateCommentStatus(selectedProjectForComments.id, commentId, newStatus);
            
            // Close the popover
            const statusMenu = statusOption.closest('.popover-menu');
            if (statusMenu) statusMenu.classList.remove('is-open');
            
            // Re-render comments
            renderComments();
            
            console.log(`Comment ${commentId} status updated to: ${newStatus}`);
        }
    });
}

function selectProjectForComments(project) {
    selectedProjectForComments = project;
    
    // Show comments section
    const commentsSection = document.getElementById('calendar-comments');
    if (commentsSection) {
        commentsSection.style.display = 'block';
        
        // Update section title
        const sectionTitle = commentsSection.querySelector('.panel-title');
        if (sectionTitle) {
            sectionTitle.textContent = `Comments - ${project.name}`;
        }
    }
    
    // Render comments for selected project
    renderComments();
    
    // Scroll to comments section
    if (commentsSection) {
        commentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function renderComments() {
    const commentsList = document.getElementById('calendar-comments-list');
    if (!commentsList || !selectedProjectForComments) return;
    
    // Use CommentsManager to render comments in agent view style
    // The renderCommentsAgent expects a container with a .card class
    const commentsSection = document.getElementById('calendar-comments');
    if (commentsSection) {
        // Find the card wrapper
        const cardWrapper = commentsSection.querySelector('.card');
        if (cardWrapper) {
            CommentsManager.renderCommentsAgent(selectedProjectForComments.id, cardWrapper);
        }
    }
    
    // Initialize sync listener for real-time updates
    CommentsManager.initSyncListener(selectedProjectForComments.id, () => {
        renderComments();
    });
}

// getStatusLabel is now in ProjectDataManager

// ===================== Calendar with Deadlines =====================
let currentCalendarDate = new Date();

function initializeCalendar() {
    renderCalendar();
    
    const prevBtn = document.getElementById('prev-month');
    const nextBtn = document.getElementById('next-month');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
            renderCalendar();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
            renderCalendar();
        });
    }
    
    renderUpcomingDeadlines();
}

function renderCalendar() {
    const container = document.getElementById('calendar-container');
    if (!container) return;
    
    // Get projects from ProjectDataManager
    const projectsData = ProjectDataManager.getAllProjects();
    
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    // Update month display
    const monthDisplay = document.getElementById('current-month');
    if (monthDisplay) {
        monthDisplay.textContent = currentCalendarDate.toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
        });
    }
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // Add calendar class to container
    container.className = 'calendar';
    
    // Create calendar HTML
    let html = `
        <div class="calendar-head">
            <div class="weekday">SUN</div>
            <div class="weekday">MON</div>
            <div class="weekday">TUE</div>
            <div class="weekday">WED</div>
            <div class="weekday">THU</div>
            <div class="weekday">FRI</div>
            <div class="weekday">SAT</div>
        </div>
        <div class="calendar-grid">
    `;
    
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
        html += '<div class="day"></div>';
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const hasDeadline = projectsData.some(project => {
            const projectDate = new Date(project.deadline);
            return projectDate.getDate() === day && 
                   projectDate.getMonth() === month && 
                   projectDate.getFullYear() === year;
        });
        
        const deadlineProjects = projectsData.filter(project => {
            const projectDate = new Date(project.deadline);
            return projectDate.getDate() === day && 
                   projectDate.getMonth() === month && 
                   projectDate.getFullYear() === year;
        });
        
        html += `<div class="day ${hasDeadline ? 'has-deadline' : ''}">`;
        html += `<div style="font-weight:800;margin-bottom:4px;">${day}</div>`;
        
        if (hasDeadline) {
            deadlineProjects.forEach(project => {
                const daysUntil = ProjectDataManager.getDaysUntilDeadline(project.deadline);
                let tagClass = 'tag red';
                if (daysUntil > 3) tagClass = 'tag amber';
                html += `<div class="${tagClass}" style="font-size:10px;padding:2px 6px;margin-bottom:2px;">${project.name}</div>`;
            });
        }
        
        html += '</div>';
    }
    
    html += '</div>';
    container.innerHTML = html;
}

function renderUpcomingDeadlines() {
    const list = document.getElementById('deadlines-list');
    if (!list) return;
    
    // Get projects from ProjectDataManager
    const projectsData = ProjectDataManager.getAllProjects();
    
    // Get upcoming deadlines (next 14 days)
    const upcoming = projectsData
        .filter(project => {
            const daysUntil = ProjectDataManager.getDaysUntilDeadline(project.deadline);
            return daysUntil >= 0 && daysUntil <= 14;
        })
        .sort((a, b) => a.deadline - b.deadline);
    
    list.innerHTML = '';
    
    if (upcoming.length === 0) {
        list.innerHTML = '<p class="muted">No upcoming deadlines in the next 14 days.</p>';
        return;
    }
    
    upcoming.forEach(project => {
        const daysUntil = ProjectDataManager.getDaysUntilDeadline(project.deadline);
        let itemClass = 'deadline-item';
        if (daysUntil <= 1) {
            itemClass += ' urgent';
        } else if (daysUntil <= 3) {
            itemClass += ' due-soon';
        } else {
            itemClass += ' upcoming';
        }
        
        const deadlineDate = project.deadline.toLocaleDateString('en-US', { 
            weekday: 'short',
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
        
        // Get comment count for this project
        const commentCount = CommentsManager.getCommentCount(project.id);
        const commentBadge = commentCount > 0 ? `
            <div class="deadline-comments" style="display: flex; align-items: center; gap: 0.25rem; margin-top: 0.25rem;">
                <svg style="width:14px;height:14px;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span style="font-size: 0.75rem; color: #6b7280;">${commentCount} ${commentCount === 1 ? 'comment' : 'comments'}</span>
            </div>
        ` : '';
        
        const item = document.createElement('div');
        item.className = itemClass;
        item.innerHTML = `
            <div class="deadline-info">
                <div class="deadline-project">${project.name}</div>
                <div class="deadline-date">
                    <svg class="ico" style="width:14px;height:14px;"><use href="#ico-clock"/></svg>
                    <span>${deadlineDate} (${daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`})</span>
                </div>
                ${commentBadge}
            </div>
            <span class="status-badge-large ${project.status}">${ProjectDataManager.getStatusLabel(project.status)}</span>
        `;
        
        // Make deadline item clickable to jump to video dashboard
        item.style.cursor = 'pointer';
        item.addEventListener('click', function() {
            sessionStorage.setItem('selectedProject', JSON.stringify({
                id: project.id,
                name: project.name,
                client: project.client,
                clientEmail: project.clientEmail,
                projectId: project.id,
                status: project.status,
                progress: project.progress
            }));
            window.location.href = 'Vugru HTML.html';
        });
        
        list.appendChild(item);
    });
}

// ===================== Navigation =====================
function initializeNavigation() {
    // Navigation handled by page links
}

// ===================== Logout =====================
function initializeLogout() {
    const logoutButton = document.getElementById('pm-logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            localStorage.removeItem('auth');
            sessionStorage.removeItem('auth');
            window.location.href = 'login.html';
        });
    }
}

