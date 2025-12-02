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

// Sample project data (in production, this would come from an API)
let projectsData = [
    {
        id: 1,
        name: "Sunset Ridge Luxury Estate",
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        status: "in-review",
        progress: 30,
        client: "John Smith"
    },
    {
        id: 2,
        name: "Downtown Loft Condo Tour",
        deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        status: "active",
        progress: 85,
        client: "Sarah Johnson"
    },
    {
        id: 3,
        name: "Mountain View Family Home",
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        status: "awaiting-feedback",
        progress: 10,
        client: "Mike Davis"
    },
    {
        id: 4,
        name: "Oceanfront Villa Premium Listing",
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        status: "active",
        progress: 50,
        client: "Emily Chen"
    }
];

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
    
    // Sort projects by deadline (most urgent first)
    const sortedProjects = [...projectsData].sort((a, b) => {
        return a.deadline - b.deadline;
    });
    
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
    
    // Determine priority based on deadline
    const daysUntilDeadline = Math.ceil((project.deadline - Date.now()) / (24 * 60 * 60 * 1000));
    let priorityClass = 'priority-normal';
    let deadlineClass = '';
    let deadlineText = '';
    
    if (daysUntilDeadline <= 1) {
        priorityClass = 'priority-urgent';
        deadlineClass = 'urgent';
        deadlineText = 'Due today';
    } else if (daysUntilDeadline <= 3) {
        priorityClass = 'priority-high';
        deadlineClass = 'due-soon';
        deadlineText = `Due in ${daysUntilDeadline} days`;
    } else {
        deadlineText = `Due in ${daysUntilDeadline} days`;
    }
    
    card.classList.add(priorityClass);
    
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
        <div>
            <span class="project-card-status status-badge-large ${project.status}">${getStatusLabel(project.status)}</span>
        </div>
    `;
    
    // Make card clickable to jump to video dashboard
    card.addEventListener('click', function() {
        // Store selected project in sessionStorage for video dashboard
        sessionStorage.setItem('selectedProject', JSON.stringify({
            id: project.id,
            name: project.name,
            client: project.client
        }));
        // Navigate to video dashboard
        window.location.href = 'Vugru HTML.html';
    });
    
    return card;
}

function getStatusLabel(status) {
    const labels = {
        'active': 'Active',
        'in-review': 'In Review',
        'awaiting-feedback': 'Awaiting Feedback',
        'completed': 'Completed'
    };
    return labels[status] || status;
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
