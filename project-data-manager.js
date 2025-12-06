/*
 * ===========================================
 * Project Data Manager
 * ===========================================
 * Manages projects, clients, and project-related data
 * Uses localStorage for persistence
 */

const ProjectDataManager = {
    STORAGE_KEY: 'vugru-projects',
    
    /**
     * Initialize with default projects if none exist
     */
    initialize() {
        const existing = this.getAllProjects();
        if (existing.length === 0) {
            const defaultProjects = this.getDefaultProjects();
            this.saveAllProjects(defaultProjects);
            return defaultProjects;
        }
        return existing;
    },
    
    /**
     * Get default projects for demo
     */
    getDefaultProjects() {
        const now = Date.now();
        return [
            {
                id: 'sunset-ridge-luxury',
                name: 'Sunset Ridge Luxury Estate',
                client: 'John Smith',
                clientEmail: 'john.smith@example.com',
                deadline: now + (2 * 24 * 60 * 60 * 1000), // 2 days from now
                status: 'in-review',
                progress: 30,
                priority: 'high',
                createdAt: now - (5 * 24 * 60 * 60 * 1000), // 5 days ago
                lastUpdated: now - (1 * 24 * 60 * 60 * 1000) // 1 day ago
            },
            {
                id: 'downtown-loft-condo',
                name: 'Downtown Loft Condo Tour',
                client: 'Sarah Johnson',
                clientEmail: 'sarah.johnson@example.com',
                deadline: now + (1 * 24 * 60 * 60 * 1000), // 1 day from now
                status: 'active',
                progress: 85,
                priority: 'urgent',
                createdAt: now - (7 * 24 * 60 * 60 * 1000), // 7 days ago
                lastUpdated: now - (2 * 60 * 60 * 1000) // 2 hours ago
            },
            {
                id: 'mountain-view-family',
                name: 'Mountain View Family Home',
                client: 'Mike Davis',
                clientEmail: 'mike.davis@example.com',
                deadline: now + (7 * 24 * 60 * 60 * 1000), // 7 days from now
                status: 'awaiting-feedback',
                progress: 10,
                priority: 'normal',
                createdAt: now - (3 * 24 * 60 * 60 * 1000), // 3 days ago
                lastUpdated: now - (12 * 60 * 60 * 1000) // 12 hours ago
            },
            {
                id: 'oceanfront-villa',
                name: 'Oceanfront Villa Premium Listing',
                client: 'Emily Chen',
                clientEmail: 'emily.chen@example.com',
                deadline: now + (5 * 24 * 60 * 60 * 1000), // 5 days from now
                status: 'active',
                progress: 50,
                priority: 'high',
                createdAt: now - (10 * 24 * 60 * 60 * 1000), // 10 days ago
                lastUpdated: now - (6 * 60 * 60 * 1000) // 6 hours ago
            }
        ];
    },
    
    /**
     * Get all projects
     */
    getAllProjects() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (!stored) return [];
        
        try {
            const projects = JSON.parse(stored);
            // Convert deadline strings back to dates
            return projects.map(p => ({
                ...p,
                deadline: new Date(p.deadline),
                createdAt: new Date(p.createdAt),
                lastUpdated: new Date(p.lastUpdated)
            }));
        } catch (e) {
            console.error('Error parsing projects:', e);
            return [];
        }
    },
    
    /**
     * Save all projects
     */
    saveAllProjects(projects) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));
    },
    
    /**
     * Get a single project by ID
     */
    getProject(projectId) {
        const projects = this.getAllProjects();
        return projects.find(p => p.id === projectId);
    },
    
    /**
     * Update a project
     */
    updateProject(projectId, updates) {
        const projects = this.getAllProjects();
        const index = projects.findIndex(p => p.id === projectId);
        
        if (index === -1) {
            console.error('Project not found:', projectId);
            return null;
        }
        
        projects[index] = {
            ...projects[index],
            ...updates,
            lastUpdated: new Date()
        };
        
        this.saveAllProjects(projects);
        return projects[index];
    },
    
    /**
     * Calculate priority based on deadline
     */
    calculatePriority(deadline) {
        const now = Date.now();
        const daysUntilDeadline = Math.ceil((deadline - now) / (24 * 60 * 60 * 1000));
        
        if (daysUntilDeadline <= 1) return 'urgent';
        if (daysUntilDeadline <= 3) return 'high';
        return 'normal';
    },
    
    /**
     * Get projects sorted by priority (deadline)
     */
    getProjectsSortedByPriority() {
        const projects = this.getAllProjects();
        return projects.sort((a, b) => {
            // Update priorities based on current deadlines
            a.priority = this.calculatePriority(a.deadline);
            b.priority = this.calculatePriority(b.deadline);
            
            // Sort: urgent first, then high, then normal
            const priorityOrder = { urgent: 0, high: 1, normal: 2 };
            const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
            
            if (priorityDiff !== 0) return priorityDiff;
            
            // If same priority, sort by deadline (earliest first)
            return a.deadline - b.deadline;
        });
    },
    
    /**
     * Get project status label
     */
    getStatusLabel(status) {
        const labels = {
            'active': 'Active',
            'in-review': 'In Review',
            'awaiting-feedback': 'Awaiting Feedback',
            'completed': 'Completed'
        };
        return labels[status] || status;
    },
    
    /**
     * Get days until deadline
     */
    getDaysUntilDeadline(deadline) {
        const now = Date.now();
        const diff = deadline - now;
        const days = Math.ceil(diff / (24 * 60 * 60 * 1000));
        return days;
    },
    
    /**
     * Format deadline text
     */
    formatDeadline(deadline) {
        const days = this.getDaysUntilDeadline(deadline);
        
        if (days < 0) return 'Overdue';
        if (days === 0) return 'Due today';
        if (days === 1) return 'Due tomorrow';
        return `Due in ${days} days`;
    },
    
    /**
     * Add a new project
     */
    addProject(projectData) {
        const projects = this.getAllProjects();
        const now = Date.now();
        
        const newProject = {
            id: projectData.id || projectData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            name: projectData.name,
            client: projectData.client,
            clientEmail: projectData.clientEmail || '',
            deadline: new Date(projectData.deadline),
            status: projectData.status || 'active',
            progress: projectData.progress || 0,
            priority: this.calculatePriority(new Date(projectData.deadline)),
            createdAt: new Date(now),
            lastUpdated: new Date(now)
        };
        
        projects.push(newProject);
        this.saveAllProjects(projects);
        return newProject;
    }
};

// Initialize on load
if (typeof window !== 'undefined') {
    ProjectDataManager.initialize();
}

