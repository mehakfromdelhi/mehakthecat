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
                deadline: new Date(now + (2 * 24 * 60 * 60 * 1000)), // 2 days from now
                status: 'in-review',
                progress: 30,
                priority: 'high',
                createdAt: new Date(now - (5 * 24 * 60 * 60 * 1000)), // 5 days ago
                lastUpdated: new Date(now - (1 * 24 * 60 * 60 * 1000)) // 1 day ago
            },
            {
                id: 'downtown-loft-condo',
                name: 'Downtown Loft Condo Tour',
                client: 'Sarah Johnson',
                clientEmail: 'sarah.johnson@example.com',
                deadline: new Date(now + (1 * 24 * 60 * 60 * 1000)), // 1 day from now
                status: 'active',
                progress: 85,
                priority: 'urgent',
                createdAt: new Date(now - (7 * 24 * 60 * 60 * 1000)), // 7 days ago
                lastUpdated: new Date(now - (2 * 60 * 60 * 1000)) // 2 hours ago
            },
            {
                id: 'mountain-view-family',
                name: 'Mountain View Family Home',
                client: 'Mike Davis',
                clientEmail: 'mike.davis@example.com',
                deadline: new Date(now + (7 * 24 * 60 * 60 * 1000)), // 7 days from now
                status: 'awaiting-feedback',
                progress: 10,
                priority: 'normal',
                createdAt: new Date(now - (3 * 24 * 60 * 60 * 1000)), // 3 days ago
                lastUpdated: new Date(now - (12 * 60 * 60 * 1000)) // 12 hours ago
            },
            {
                id: 'oceanfront-villa',
                name: 'Oceanfront Villa Premium Listing',
                client: 'Emily Chen',
                clientEmail: 'emily.chen@example.com',
                deadline: new Date(now + (5 * 24 * 60 * 60 * 1000)), // 5 days from now
                status: 'active',
                progress: 50,
                priority: 'high',
                createdAt: new Date(now - (10 * 24 * 60 * 60 * 1000)), // 10 days ago
                lastUpdated: new Date(now - (6 * 60 * 60 * 1000)) // 6 hours ago
            }
        ];
    },
    
    /**
     * Get all projects
     */
    getAllProjects() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (!stored) {
            console.log('No projects in localStorage');
            return [];
        }
        
        try {
            const projects = JSON.parse(stored);
            console.log('Retrieved projects from localStorage:', projects.length);
            // Convert deadline strings back to dates
            return projects.map(p => {
                const deadline = p.deadline ? new Date(p.deadline) : new Date();
                const createdAt = p.createdAt ? new Date(p.createdAt) : new Date();
                const lastUpdated = p.lastUpdated ? new Date(p.lastUpdated) : new Date();
                return {
                    ...p,
                    deadline: deadline,
                    createdAt: createdAt,
                    lastUpdated: lastUpdated
                };
            });
        } catch (e) {
            console.error('Error parsing projects:', e);
            return [];
        }
    },
    
    /**
     * Save all projects
     */
    saveAllProjects(projects) {
        // Convert Date objects to ISO strings for storage
        const projectsToSave = projects.map(p => ({
            ...p,
            deadline: p.deadline instanceof Date ? p.deadline.toISOString() : (typeof p.deadline === 'number' ? new Date(p.deadline).toISOString() : p.deadline),
            createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : (typeof p.createdAt === 'number' ? new Date(p.createdAt).toISOString() : p.createdAt),
            lastUpdated: p.lastUpdated instanceof Date ? p.lastUpdated.toISOString() : (typeof p.lastUpdated === 'number' ? new Date(p.lastUpdated).toISOString() : p.lastUpdated)
        }));
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projectsToSave));
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
    },
    
    /**
     * Delete a project by ID
     */
    deleteProject(projectId) {
        const projects = this.getAllProjects();
        const index = projects.findIndex(p => p.id === projectId);
        
        if (index === -1) {
            console.error('Project not found:', projectId);
            return false;
        }
        
        // Remove project from array
        projects.splice(index, 1);
        this.saveAllProjects(projects);
        
        // Clean up related data
        // Remove photos
        if (typeof PhotoStorageManager !== 'undefined') {
            const photoKey = PhotoStorageManager.getStorageKey(projectId);
            localStorage.removeItem(photoKey);
        }
        
        // Remove comments
        if (typeof CommentsManager !== 'undefined') {
            const commentKey = CommentsManager.getStorageKey(projectId);
            localStorage.removeItem(commentKey);
        }
        
        // Remove notifications
        if (typeof PhotoStorageManager !== 'undefined') {
            const notifKey = PhotoStorageManager.getNotifKey(projectId);
            localStorage.removeItem(notifKey);
        }
        
        return true;
    }
};

// Initialize on load
if (typeof window !== 'undefined') {
    ProjectDataManager.initialize();
}

