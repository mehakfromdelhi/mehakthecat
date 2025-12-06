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
    initializeProjects();
    initializeNavigation();
    initializeLogout();
    
    console.log('Project Management Dashboard initialized');
});

// ===================== Project Overview =====================
function initializeProjects() {
    const projectsList = document.getElementById('projects-list');
    if (!projectsList) return;
    
    // Get projects from ProjectDataManager (sorted by priority)
    const sortedProjects = ProjectDataManager.getProjectsSortedByPriority();
    
    // Clear existing projects
    projectsList.innerHTML = '';
    
    // Render each project
    sortedProjects.forEach(project => {
        const projectCard = createProjectCard(project);
        projectsList.appendChild(projectCard);
    });
}

function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    
    // Use project's priority (already calculated by ProjectDataManager)
    const priorityClass = `priority-${project.priority}`;
    card.classList.add(priorityClass);
    
    // Get deadline info
    const deadlineText = ProjectDataManager.formatDeadline(project.deadline);
    const daysUntilDeadline = ProjectDataManager.getDaysUntilDeadline(project.deadline);
    let deadlineClass = '';
    
    if (daysUntilDeadline <= 1) {
        deadlineClass = 'urgent';
    } else if (daysUntilDeadline <= 3) {
        deadlineClass = 'due-soon';
    }
    
    const deadlineDate = project.deadline.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
    });
    
    card.innerHTML = `
        <div class="project-card-header">
            <h3 class="project-card-title">${project.name}</h3>
        </div>
        <div class="project-card-deadline ${deadlineClass}">
            <svg class="ico" style="width:16px;height:16px;"><use href="#ico-clock"/></svg>
            <span>${deadlineText} • ${deadlineDate}</span>
        </div>
        <div class="project-card-progress">
            <div class="progress">
                <span style="width:${project.progress}%"></span>
            </div>
        </div>
        <div>
            <span class="hint">Client:</span> <b>${project.client}</b>
        </div>
        <div class="project-card-priority-controls" style="margin-top: 0.5rem; display: flex; gap: 0.25rem; flex-wrap: wrap;">
            <span class="hint" style="width: 100%; font-size: 0.75rem;">Priority:</span>
            <button class="priority-btn ${project.priority === 'urgent' ? 'active' : ''}" data-priority="urgent" data-project-id="${project.id}" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; border: 1px solid #dc2626; background: ${project.priority === 'urgent' ? '#dc2626' : 'transparent'}; color: ${project.priority === 'urgent' ? 'white' : '#dc2626'}; border-radius: 0.25rem; cursor: pointer;">Urgent</button>
            <button class="priority-btn ${project.priority === 'high' ? 'active' : ''}" data-priority="high" data-project-id="${project.id}" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; border: 1px solid #f59e0b; background: ${project.priority === 'high' ? '#f59e0b' : 'transparent'}; color: ${project.priority === 'high' ? 'white' : '#f59e0b'}; border-radius: 0.25rem; cursor: pointer;">High</button>
            <button class="priority-btn ${project.priority === 'normal' ? 'active' : ''}" data-priority="normal" data-project-id="${project.id}" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; border: 1px solid #6b7280; background: ${project.priority === 'normal' ? '#6b7280' : 'transparent'}; color: ${project.priority === 'normal' ? 'white' : '#6b7280'}; border-radius: 0.25rem; cursor: pointer;">Normal</button>
        </div>
        <div>
            <span class="project-card-status status-badge-large ${project.status}">${ProjectDataManager.getStatusLabel(project.status)}</span>
        </div>
    `;
    
    // Use project.id (already in consistent format)
    const projectId = project.id;
    
    // Get comment count for this project
    let commentCount = 0;
    if (typeof CommentsManager !== 'undefined') {
        commentCount = CommentsManager.getCommentCount(projectId);
    }
    
    // Add comment indicator if comments exist
    if (commentCount > 0) {
        const commentBadge = document.createElement('div');
        commentBadge.className = 'project-card-comments';
        commentBadge.innerHTML = `
            <svg class="ico" style="width:14px;height:14px;margin-right:4px;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>${commentCount} ${commentCount === 1 ? 'comment' : 'comments'}</span>
        `;
        card.appendChild(commentBadge);
    }
    
    // Make card clickable to jump to photo dashboard (but not when clicking priority buttons)
    card.addEventListener('click', function(e) {
        // Don't navigate if clicking on priority buttons
        if (e.target.classList.contains('priority-btn') || e.target.closest('.priority-btn')) {
            return;
        }
        
        // Store full project data in sessionStorage for photo dashboard
        sessionStorage.setItem('selectedProject', JSON.stringify({
            id: project.id,
            name: project.name,
            client: project.client,
            clientEmail: project.clientEmail,
            projectId: project.id,
            status: project.status,
            progress: project.progress
        }));
        // Navigate to photo dashboard
        window.location.href = 'Vugru HTML.html';
    });
    
    // Add priority button event listeners
    const priorityButtons = card.querySelectorAll('.priority-btn');
    priorityButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent card click
            const newPriority = btn.getAttribute('data-priority');
            const projectId = btn.getAttribute('data-project-id');
            
            if (projectId && newPriority) {
                // Update project priority
                ProjectDataManager.updateProject(projectId, { priority: newPriority });
                
                // Re-render projects to show updated priority
                initializeProjects();
            }
        });
    });
    
    return card;
}

// getStatusLabel is now in ProjectDataManager

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
