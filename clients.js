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
// This should match the data structure from project-management.js
let projectsData = [
    {
        id: 1,
        name: "Sunset Ridge Luxury Estate",
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        status: "in-review",
        progress: 30,
        client: "John Smith"
    },
    {
        id: 2,
        name: "Downtown Loft Condo Tour",
        deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        status: "active",
        progress: 85,
        client: "Sarah Johnson"
    },
    {
        id: 3,
        name: "Mountain View Family Home",
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: "awaiting-feedback",
        progress: 10,
        client: "Mike Davis"
    },
    {
        id: 4,
        name: "Oceanfront Villa Premium Listing",
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: "active",
        progress: 50,
        client: "Emily Chen"
    }
];

// Client data with additional information
let clientsData = [
    {
        id: 1,
        name: "John Smith",
        email: "john.smith@example.com",
        phone: "+1 (555) 123-4567",
        company: "Smith Realty Group",
        totalProjects: 1,
        activeProjects: 1,
        completedProjects: 0,
        projectIds: [1]
    },
    {
        id: 2,
        name: "Sarah Johnson",
        email: "sarah.johnson@example.com",
        phone: "+1 (555) 234-5678",
        company: "Johnson Properties",
        totalProjects: 1,
        activeProjects: 1,
        completedProjects: 0,
        projectIds: [2]
    },
    {
        id: 3,
        name: "Mike Davis",
        email: "mike.davis@example.com",
        phone: "+1 (555) 345-6789",
        company: "Davis Homes",
        totalProjects: 1,
        activeProjects: 1,
        completedProjects: 0,
        projectIds: [3]
    },
    {
        id: 4,
        name: "Emily Chen",
        email: "emily.chen@example.com",
        phone: "+1 (555) 456-7890",
        company: "Chen Luxury Estates",
        totalProjects: 1,
        activeProjects: 1,
        completedProjects: 0,
        projectIds: [4]
    }
];

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuthentication()) {
        return;
    }
    
    // Check if logged in user is a client
    const auth = localStorage.getItem('auth') || sessionStorage.getItem('auth');
    let isClientUser = false;
    let clientEmail = null;
    
    if (auth) {
        try {
            const authData = JSON.parse(auth);
            isClientUser = authData.userType === 'client';
            clientEmail = authData.email ? authData.email.toLowerCase().trim() : null;
        } catch (e) {
            console.error('Error parsing auth data:', e);
        }
    }
    
    // Initialize all features
    if (isClientUser && clientEmail) {
        initializeClientView(clientEmail);
    } else {
        initializeClients();
    }
    initializeSearch();
    initializeLogout();
    
    console.log('Clients Dashboard initialized');
});

// ===================== Client Directory =====================
function initializeClients() {
    const clientsList = document.getElementById('clients-list');
    if (!clientsList) return;
    
    // Clear existing clients
    clientsList.innerHTML = '';
    
    // Render each client
    clientsData.forEach(client => {
        const clientCard = createClientCard(client);
        clientsList.appendChild(clientCard);
    });
}

// ===================== Client-Specific View =====================
function initializeClientView(clientEmail) {
    const clientsList = document.getElementById('clients-list');
    const panelTitle = document.querySelector('.panel-title');
    const pageTitle = document.querySelector('.page-title');
    const sidebar = document.querySelector('.sidebar');
    const description = document.querySelector('.muted.small');
    
    if (!clientsList) return;
    
    // Update page title
    if (pageTitle) {
        pageTitle.textContent = 'My Projects';
    }
    
    // Update panel title
    if (panelTitle) {
        panelTitle.innerHTML = '<svg class="ico"><use href="#ico-video"/></svg>My Projects';
    }
    
    // Hide sidebar navigation for clients
    if (sidebar) {
        const nav = sidebar.querySelector('.nav');
        if (nav) {
            nav.innerHTML = `
                <a href="clients.html" class="nav-item active"><svg class="ico"><use href="#ico-video"/></svg>My Projects</a>
            `;
        }
    }
    
    // Update description
    if (description) {
        description.textContent = 'Click on any project to view details and provide feedback.';
    }
    
    // Hide search (not needed for client view)
    const searchInput = document.getElementById('client-search');
    if (searchInput && searchInput.parentElement) {
        searchInput.parentElement.style.display = 'none';
    }
    
    // Find the logged-in client
    const client = clientsData.find(c => c.email.toLowerCase().trim() === clientEmail);
    
    if (!client) {
        clientsList.innerHTML = '<p class="muted">Client information not found.</p>';
        return;
    }
    
    // Clear existing content
    clientsList.innerHTML = '';
    
    // Get client's projects
    const clientProjects = projectsData.filter(p => p.client === client.name);
    
    if (clientProjects.length === 0) {
        clientsList.innerHTML = '<p class="muted">You don\'t have any projects yet.</p>';
        return;
    }
    
    // Render client's projects as cards
    clientProjects.forEach(project => {
        const projectCard = createClientProjectCard(project, client);
        clientsList.appendChild(projectCard);
    });
}

function createClientProjectCard(project, client) {
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

function createClientCard(client) {
    const card = document.createElement('div');
    card.className = 'project-card';
    
    // Get client's projects
    const clientProjects = projectsData.filter(p => p.client === client.name);
    const activeProjects = clientProjects.filter(p => p.status !== 'completed');
    const urgentProjects = clientProjects.filter(p => {
        const daysUntilDeadline = Math.ceil((p.deadline - Date.now()) / (24 * 60 * 60 * 1000));
        return daysUntilDeadline <= 3 && p.status !== 'completed';
    });
    
    card.innerHTML = `
        <div class="project-card-header">
            <div>
                <h3 class="project-card-title">${client.name}</h3>
                <p class="muted small" style="margin-top: 4px;">${client.company || 'Independent'}</p>
            </div>
        </div>
        <div style="margin: var(--s-3) 0;">
            <div style="display: flex; align-items: center; gap: var(--s-3); margin-bottom: var(--s-2);">
                <svg class="ico" style="width: 16px; height: 16px; color: var(--muted);"><use href="#ico-mail"/></svg>
                <span class="hint" style="font-size: var(--fs-sm);">${client.email}</span>
            </div>
            <div style="display: flex; align-items: center; gap: var(--s-3);">
                <svg class="ico" style="width: 16px; height: 16px; color: var(--muted);"><use href="#ico-phone"/></svg>
                <span class="hint" style="font-size: var(--fs-sm);">${client.phone}</span>
            </div>
        </div>
        <div style="margin: var(--s-3) 0;">
            <span class="hint">Total Projects:</span> <b>${clientProjects.length}</b>
            ${activeProjects.length > 0 ? `<span class="hint" style="margin-left: var(--s-3);">Active:</span> <b>${activeProjects.length}</b>` : ''}
            ${urgentProjects.length > 0 ? `<span class="badge red-soft small" style="margin-left: var(--s-2);">${urgentProjects.length} Urgent</span>` : ''}
        </div>
        <div style="margin-top: var(--s-3);">
            ${clientProjects.length > 0 ? clientProjects.map(p => `
                <div style="font-size: var(--fs-sm); margin-bottom: var(--s-1);">
                    <span class="hint">•</span> <span>${p.name}</span>
                    <span class="project-card-status status-badge-large ${p.status}" style="margin-left: var(--s-2);">${getStatusLabel(p.status)}</span>
                </div>
            `).join('') : '<span class="hint small">No projects yet</span>'}
        </div>
    `;
    
    // Make card clickable to view client details or filter projects
    card.addEventListener('click', function() {
        // Store selected client in sessionStorage
        sessionStorage.setItem('selectedClient', JSON.stringify({
            id: client.id,
            name: client.name,
            email: client.email
        }));
        // Navigate to project overview filtered by client
        window.location.href = 'project-management.html';
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

// ===================== Search Functionality =====================
function initializeSearch() {
    const searchInput = document.getElementById('client-search');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase().trim();
        filterClients(searchTerm);
    });
}

function filterClients(searchTerm) {
    const clientsList = document.getElementById('clients-list');
    if (!clientsList) return;
    
    const cards = clientsList.querySelectorAll('.project-card');
    
    if (!searchTerm) {
        // Show all clients
        cards.forEach(card => {
            card.style.display = '';
        });
        return;
    }
    
    // Filter clients based on search term
    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
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

