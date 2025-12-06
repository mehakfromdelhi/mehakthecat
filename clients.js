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

// ===================== Data Management Functions =====================
// Data storage keys
const STORAGE_KEYS = {
    PROJECTS: 'vugru_projects',
    CLIENTS: 'vugru_clients'
};

// Initialize default data if not exists
function initializeDefaultData() {
    // Default projects data
    const defaultProjects = [
        {
            id: 1,
            name: "Sunset Ridge Luxury Estate",
            deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: "in-review",
            progress: 30,
            client: "John Smith"
        },
        {
            id: 2,
            name: "Downtown Loft Condo Tour",
            deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
            status: "active",
            progress: 85,
            client: "Sarah Johnson"
        },
        {
            id: 3,
            name: "Mountain View Family Home",
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: "awaiting-feedback",
            progress: 10,
            client: "Mike Davis"
        },
        {
            id: 4,
            name: "Oceanfront Villa Premium Listing",
            deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            status: "active",
            progress: 50,
            client: "Emily Chen"
        }
    ];

    // Default clients data
    const defaultClients = [
        {
            id: 1,
            name: "John Smith",
            email: "john.smith@example.com",
            phone: "+1 (555) 123-4567",
            company: "Smith Realty Group",
            projectIds: [1],
            createdAt: new Date().toISOString()
        },
        {
            id: 2,
            name: "Sarah Johnson",
            email: "sarah.johnson@example.com",
            phone: "+1 (555) 234-5678",
            company: "Johnson Properties",
            projectIds: [2],
            createdAt: new Date().toISOString()
        },
        {
            id: 3,
            name: "Mike Davis",
            email: "mike.davis@example.com",
            phone: "+1 (555) 345-6789",
            company: "Davis Homes",
            projectIds: [3],
            createdAt: new Date().toISOString()
        },
        {
            id: 4,
            name: "Emily Chen",
            email: "emily.chen@example.com",
            phone: "+1 (555) 456-7890",
            company: "Chen Luxury Estates",
            projectIds: [4],
            createdAt: new Date().toISOString()
        }
    ];

    // Initialize projects if not exists
    if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(defaultProjects));
    }

    // Initialize clients if not exists
    if (!localStorage.getItem(STORAGE_KEYS.CLIENTS)) {
        localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(defaultClients));
    }
}

// Get projects data from localStorage
function getProjectsData() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
        if (!data) {
            initializeDefaultData();
            return getProjectsData();
        }
        const projects = JSON.parse(data);
        // Convert deadline strings back to Date objects
        return projects.map(p => ({
            ...p,
            deadline: new Date(p.deadline)
        }));
    } catch (e) {
        console.error('Error loading projects:', e);
        initializeDefaultData();
        return getProjectsData();
    }
}

// Save projects data to localStorage
function saveProjectsData(projects) {
    try {
        // Convert Date objects to ISO strings for storage
        const projectsToSave = projects.map(p => ({
            ...p,
            deadline: p.deadline instanceof Date ? p.deadline.toISOString() : p.deadline
        }));
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projectsToSave));
        // Trigger custom event for data sync
        window.dispatchEvent(new CustomEvent('projectsUpdated'));
        return true;
    } catch (e) {
        console.error('Error saving projects:', e);
        return false;
    }
}

// Get clients data from localStorage
function getClientsData() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.CLIENTS);
        if (!data) {
            initializeDefaultData();
            return getClientsData();
        }
        return JSON.parse(data);
    } catch (e) {
        console.error('Error loading clients:', e);
        initializeDefaultData();
        return getClientsData();
    }
}

// Save clients data to localStorage
function saveClientsData(clients) {
    try {
        localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
        // Trigger custom event for data sync
        window.dispatchEvent(new CustomEvent('clientsUpdated'));
        return true;
    } catch (e) {
        console.error('Error saving clients:', e);
        return false;
    }
}

// Calculate client statistics from projects
function calculateClientStats(client, projects) {
    const clientProjects = projects.filter(p => p.client === client.name);
    const activeProjects = clientProjects.filter(p => p.status !== 'completed');
    const completedProjects = clientProjects.filter(p => p.status === 'completed');
    const urgentProjects = clientProjects.filter(p => {
        const daysUntilDeadline = Math.ceil((p.deadline - Date.now()) / (24 * 60 * 60 * 1000));
        return daysUntilDeadline <= 3 && p.status !== 'completed';
    });

    return {
        totalProjects: clientProjects.length,
        activeProjects: activeProjects.length,
        completedProjects: completedProjects.length,
        urgentProjects: urgentProjects.length,
        clientProjects: clientProjects
    };
}

// Update client's project IDs based on current projects
function updateClientProjectIds(client, projects) {
    const clientProjects = projects.filter(p => p.client === client.name);
    return {
        ...client,
        projectIds: clientProjects.map(p => p.id)
    };
}

// Get next available client ID
function getNextClientId() {
    const clients = getClientsData();
    if (clients.length === 0) return 1;
    return Math.max(...clients.map(c => c.id)) + 1;
}

// Add new client
function addClient(clientData) {
    const clients = getClientsData();
    const newClient = {
        id: getNextClientId(),
        ...clientData,
        projectIds: [],
        createdAt: new Date().toISOString()
    };
    clients.push(newClient);
    saveClientsData(clients);
    return newClient;
}

// Update existing client
function updateClient(clientId, updates) {
    const clients = getClientsData();
    const index = clients.findIndex(c => c.id === clientId);
    if (index === -1) return null;
    
    clients[index] = { ...clients[index], ...updates, updatedAt: new Date().toISOString() };
    saveClientsData(clients);
    return clients[index];
}

// Delete client
function deleteClient(clientId) {
    const clients = getClientsData();
    const filtered = clients.filter(c => c.id !== clientId);
    saveClientsData(filtered);
    return filtered.length < clients.length;
}

// Get client by email
function getClientByEmail(email) {
    const clients = getClientsData();
    return clients.find(c => c.email.toLowerCase().trim() === email.toLowerCase().trim());
}

// Global data variables (will be populated dynamically)
let projectsData = [];
let clientsData = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuthentication()) {
        return;
    }
    
    // Initialize data storage
    initializeDefaultData();
    
    // Load data dynamically
    projectsData = getProjectsData();
    clientsData = getClientsData();
    
    // Update clients with calculated stats
    clientsData = clientsData.map(client => {
        const stats = calculateClientStats(client, projectsData);
        return {
            ...client,
            ...stats
        };
    });
    
    // Check if logged in user is a client
    const auth = localStorage.getItem('auth') || sessionStorage.getItem('auth');
    let isClientUser = false;
    let clientEmail = null;
    
    if (auth) {
        try {
            const authData = JSON.parse(auth);
            isClientUser = authData.userType === 'client';
            clientEmail = authData.email ? authData.email.toLowerCase().trim() : null;
            
            // Double-check: if userType is client but email is set, verify it's actually a client email
            if (isClientUser && clientEmail) {
                const clientExists = getClientByEmail(clientEmail);
                if (!clientExists) {
                    // User marked as client but not in client list - treat as regular user
                    console.warn('User marked as client but not found in client database:', clientEmail);
                    isClientUser = false;
                }
            }
        } catch (e) {
            console.error('Error parsing auth data:', e);
        }
    }
    
    // Initialize all features
    // If client is logged in, show their personalized client site with only their projects
    if (isClientUser && clientEmail) {
        initializeClientView(clientEmail);
        console.log('Client view initialized for:', clientEmail);
    } else {
        // Regular users (admin/staff) see the full client directory
        initializeClients();
        console.log('Admin/Staff view - full client directory');
    }
    initializeSearch();
    initializeLogout();
    
    // Listen for data updates
    window.addEventListener('projectsUpdated', handleDataUpdate);
    window.addEventListener('clientsUpdated', handleDataUpdate);
    
    console.log('Clients Dashboard initialized with dynamic data');
});

// Handle data updates
function handleDataUpdate() {
    // Reload data
    projectsData = getProjectsData();
    clientsData = getClientsData();
    
    // Update clients with calculated stats
    clientsData = clientsData.map(client => {
        const stats = calculateClientStats(client, projectsData);
        return {
            ...client,
            ...stats
        };
    });
    
    // Re-render the page
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
    
    if (isClientUser && clientEmail) {
        initializeClientView(clientEmail);
    } else {
        initializeClients();
    }
}

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
    
    // Update page title with client name
    if (pageTitle) {
        pageTitle.textContent = client ? `Welcome, ${client.name}` : 'My Projects';
    }
    
    // Update panel title
    if (panelTitle) {
        panelTitle.innerHTML = '<svg class="ico"><use href="#ico-video"/></svg>My Projects';
    }
    
    // Hide sidebar navigation for clients - show simplified client view
    if (sidebar) {
        const nav = sidebar.querySelector('.nav');
        if (nav) {
            nav.innerHTML = `
                <a href="clients.html" class="nav-item active"><svg class="ico"><use href="#ico-video"/></svg>My Projects</a>
            `;
        }
        
        // Update sidebar brand for client
        const brandTitle = sidebar.querySelector('.brand-title');
        if (brandTitle && client) {
            // Keep brand but show it's client view
        }
    }
    
    // Update description with personalized message
    if (description) {
        if (client && client.company) {
            description.textContent = `${client.company} • Click on any project to view details and provide feedback.`;
        } else {
            description.textContent = 'Click on any project to view details and provide feedback.';
        }
    }
    
    // Hide search (not needed for client view)
    const searchInput = document.getElementById('client-search');
    if (searchInput && searchInput.parentElement) {
        searchInput.parentElement.style.display = 'none';
    }
    
    // Find the logged-in client (use getClientByEmail for consistency)
    // First try to get from sessionStorage (set during login)
    let client = null;
    try {
        const currentClientData = sessionStorage.getItem('currentClient');
        if (currentClientData) {
            client = JSON.parse(currentClientData);
        }
    } catch (e) {
        console.error('Error reading currentClient from sessionStorage:', e);
    }
    
    // If not in sessionStorage, look up by email
    if (!client) {
        client = getClientByEmail(clientEmail);
    }
    
    if (!client) {
        clientsList.innerHTML = '<p class="muted">Client information not found. Please contact support.</p>';
        return;
    }
    
    // Update client stats dynamically
    const stats = calculateClientStats(client, projectsData);
    client = { ...client, ...stats };
    
    // Store updated client info in sessionStorage
    try {
        sessionStorage.setItem('currentClient', JSON.stringify(client));
    } catch (e) {
        console.error('Error storing currentClient:', e);
    }
    
    // Clear existing content
    clientsList.innerHTML = '';
    
    // Get client's projects dynamically
    const clientProjects = stats.clientProjects || projectsData.filter(p => p.client === client.name);
    
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
    
    // Get client's projects dynamically
    const clientProjects = projectsData.filter(p => p.client === client.name);
    const activeProjects = clientProjects.filter(p => p.status !== 'completed');
    const urgentProjects = clientProjects.filter(p => {
        const daysUntilDeadline = Math.ceil((p.deadline - Date.now()) / (24 * 60 * 60 * 1000));
        return daysUntilDeadline <= 3 && p.status !== 'completed';
    });
    
    // Use calculated stats if available, otherwise calculate on the fly
    const stats = client.totalProjects !== undefined ? client : calculateClientStats(client, projectsData);
    
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
            <span class="hint">Total Projects:</span> <b>${stats.totalProjects || clientProjects.length}</b>
            ${(stats.activeProjects || activeProjects.length) > 0 ? `<span class="hint" style="margin-left: var(--s-3);">Active:</span> <b>${stats.activeProjects || activeProjects.length}</b>` : ''}
            ${(stats.urgentProjects || urgentProjects.length) > 0 ? `<span class="badge red-soft small" style="margin-left: var(--s-2);">${stats.urgentProjects || urgentProjects.length} Urgent</span>` : ''}
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

// ===================== Export Functions for External Use =====================
// Make these functions available globally for potential future use
window.ClientsDataManager = {
    getProjects: getProjectsData,
    saveProjects: saveProjectsData,
    getClients: getClientsData,
    saveClients: saveClientsData,
    addClient: addClient,
    updateClient: updateClient,
    deleteClient: deleteClient,
    getClientByEmail: getClientByEmail,
    calculateStats: calculateClientStats,
    initializeData: initializeDefaultData
};
