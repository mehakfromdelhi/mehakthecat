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
        name: "Sunset Ridge — Luxury Estate",
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        status: "in-review",
        progress: 30,
        client: "John Smith",
        comments: [
            {
                id: 1,
                author: "John Smith",
                text: "The exterior drone shots need color correction. The sky looks too saturated.",
                timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
                type: "client",
                read: false
            },
            {
                id: 2,
                author: "You",
                text: "I'll adjust the color grading on the exterior shots. Should I make the sky more natural?",
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                type: "photographer",
                read: true
            }
        ]
    },
    {
        id: 2,
        name: "Downtown Loft — Condo Tour",
        deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        status: "active",
        progress: 85,
        client: "Sarah Johnson",
        comments: [
            {
                id: 3,
                author: "Sarah Johnson",
                text: "The final video looks great! Ready to upload to MLS.",
                timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
                type: "client",
                read: true
            }
        ]
    },
    {
        id: 3,
        name: "Mountain View — Family Home",
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        status: "awaiting-feedback",
        progress: 10,
        client: "Mike Davis",
        comments: [
            {
                id: 4,
                author: "Mike Davis",
                text: "Can you prioritize the living room and kitchen in the shoot?",
                timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                type: "client",
                read: false
            }
        ]
    },
    {
        id: 4,
        name: "Oceanfront Villa — Premium Listing",
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        status: "active",
        progress: 50,
        client: "Emily Chen",
        comments: []
    }
];

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuthentication()) {
        return;
    }
    
    // Initialize all features
    initializeProjects();
    initializeComments();
    initializeUpload();
    initializeCalendar();
    initializeStatus();
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
    
    // Refresh button
    const refreshBtn = document.getElementById('refresh-projects');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            initializeProjects();
            initializeCalendar();
            initializeStatus();
        });
    }
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
    
    const unreadComments = project.comments.filter(c => c.type === 'client' && !c.read).length;
    
    card.innerHTML = `
        <div class="project-card-header">
            <h3 class="project-card-title">${project.name}</h3>
            ${unreadComments > 0 ? `<span class="badge red-soft">${unreadComments} new</span>` : ''}
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
    
    // Make card clickable to view details
    card.addEventListener('click', function() {
        // Scroll to comments section and select this project
        document.getElementById('comments').scrollIntoView({ behavior: 'smooth' });
        selectProjectForComments(project.id);
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

// ===================== Comments & Interaction =====================
let selectedProjectId = null;

function initializeComments() {
    // Populate project selector
    populateProjectsSelector();
    
    // Filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const filter = this.getAttribute('data-filter');
            filterProjects(filter);
        });
    });
    
    // Send comment button
    const sendBtn = document.getElementById('send-comment');
    if (sendBtn) {
        sendBtn.addEventListener('click', function() {
            sendComment();
        });
    }
    
    // Update unread count
    updateUnreadCount();
}

function populateProjectsSelector() {
    const selector = document.getElementById('projects-selector');
    if (!selector) return;
    
    selector.innerHTML = '';
    
    projectsData.forEach(project => {
        const unreadCount = project.comments.filter(c => c.type === 'client' && !c.read).length;
        const item = document.createElement('div');
        item.className = 'project-selector-item';
        if (unreadCount > 0) {
            item.classList.add('unread');
        }
        
        const lastComment = project.comments.length > 0 
            ? project.comments[project.comments.length - 1]
            : null;
        const lastCommentTime = lastComment 
            ? formatTimeAgo(lastComment.timestamp)
            : 'No comments';
        
        item.innerHTML = `
            <div class="project-selector-name">${project.name}</div>
            <div class="project-selector-meta">
                <span>${lastCommentTime}</span>
                ${unreadCount > 0 ? `<span class="badge red-soft small">${unreadCount}</span>` : ''}
            </div>
        `;
        
        item.addEventListener('click', function() {
            selectProjectForComments(project.id);
        });
        
        selector.appendChild(item);
    });
}

function selectProjectForComments(projectId) {
    selectedProjectId = projectId;
    const project = projectsData.find(p => p.id === projectId);
    if (!project) return;
    
    // Update active project in selector
    document.querySelectorAll('.project-selector-item').forEach(item => {
        item.classList.remove('active');
    });
    const selectorItems = document.querySelectorAll('.project-selector-item');
    const projectIndex = projectsData.findIndex(p => p.id === projectId);
    if (selectorItems[projectIndex]) {
        selectorItems[projectIndex].classList.add('active');
    }
    
    // Update header
    const header = document.getElementById('selected-project-header');
    if (header) {
        header.innerHTML = `
            <h3>${project.name}</h3>
            <p class="muted small">Client: ${project.client}</p>
        `;
    }
    
    // Display comments
    displayComments(project);
    
    // Show input area
    const inputArea = document.getElementById('comment-input-area');
    if (inputArea) {
        inputArea.style.display = 'block';
    }
    
    // Mark comments as read
    project.comments.forEach(comment => {
        if (comment.type === 'client') {
            comment.read = true;
        }
    });
    
    updateUnreadCount();
    populateProjectsSelector();
}

function displayComments(project) {
    const thread = document.getElementById('comments-thread');
    if (!thread) return;
    
    thread.innerHTML = '';
    
    if (project.comments.length === 0) {
        thread.innerHTML = '<p class="muted">No comments yet. Start the conversation!</p>';
        return;
    }
    
    // Sort comments by timestamp
    const sortedComments = [...project.comments].sort((a, b) => a.timestamp - b.timestamp);
    
    sortedComments.forEach(comment => {
        const commentItem = document.createElement('div');
        commentItem.className = `comment-item ${comment.type}`;
        
        const authorInitial = comment.author.charAt(0).toUpperCase();
        const timeAgo = formatTimeAgo(comment.timestamp);
        
        commentItem.innerHTML = `
            <div class="comment-avatar">${authorInitial}</div>
            <div class="comment-content">
                <div class="comment-author">${comment.author}</div>
                <div class="comment-text">${comment.text}</div>
                <div class="comment-meta">
                    <span>${timeAgo}</span>
                </div>
            </div>
        `;
        
        thread.appendChild(commentItem);
    });
    
    // Scroll to bottom
    thread.scrollTop = thread.scrollHeight;
}

function sendComment() {
    if (!selectedProjectId) {
        alert('Please select a project first');
        return;
    }
    
    const input = document.getElementById('comment-input');
    if (!input || !input.value.trim()) {
        return;
    }
    
    const project = projectsData.find(p => p.id === selectedProjectId);
    if (!project) return;
    
    // Add new comment
    const newComment = {
        id: Date.now(),
        author: 'You',
        text: input.value.trim(),
        timestamp: new Date(),
        type: 'photographer',
        read: true
    };
    
    project.comments.push(newComment);
    
    // Clear input
    input.value = '';
    
    // Refresh display
    displayComments(project);
    populateProjectsSelector();
    
    console.log('Comment sent:', newComment);
}

function filterProjects(filter) {
    // This would filter the projects in the selector
    // For now, we'll just update the display
    console.log('Filter:', filter);
}

function formatTimeAgo(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}

function updateUnreadCount() {
    const count = projectsData.reduce((total, project) => {
        return total + project.comments.filter(c => c.type === 'client' && !c.read).length;
    }, 0);
    
    const badge = document.getElementById('unread-count');
    if (badge) {
        if (count > 0) {
            badge.textContent = `${count} unread`;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
}

// ===================== Upload Edits =====================
let selectedFiles = [];

function initializeUpload() {
    const dropzone = document.getElementById('upload-dropzone');
    const fileInput = document.getElementById('file-input');
    const projectSelect = document.getElementById('upload-project-select');
    const submitBtn = document.getElementById('upload-submit');
    const clearBtn = document.getElementById('upload-clear');
    
    // Populate project select
    if (projectSelect) {
        projectsData.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            projectSelect.appendChild(option);
        });
        
        // Update submit button when project changes
        projectSelect.addEventListener('change', function() {
            updateSubmitButton();
        });
    }
    
    // Click to browse
    if (dropzone && fileInput) {
        dropzone.addEventListener('click', function() {
            fileInput.click();
        });
    }
    
    // File input change
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            handleFiles(Array.from(e.target.files));
        });
    }
    
    // Drag and drop
    if (dropzone) {
        dropzone.addEventListener('dragover', function(e) {
            e.preventDefault();
            dropzone.classList.add('dragover');
        });
        
        dropzone.addEventListener('dragleave', function() {
            dropzone.classList.remove('dragover');
        });
        
        dropzone.addEventListener('drop', function(e) {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            const files = Array.from(e.dataTransfer.files);
            handleFiles(files);
        });
    }
    
    // Submit
    if (submitBtn) {
        submitBtn.addEventListener('click', function() {
            uploadFiles();
        });
    }
    
    // Clear
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            clearUpload();
        });
    }
    
    // Initial button state
    updateSubmitButton();
}

function handleFiles(files) {
    files.forEach(file => {
        // Validate file type
        if (!file.type.startsWith('video/') && !file.type.startsWith('image/')) {
            alert(`${file.name} is not a valid video or image file.`);
            return;
        }
        
        // Check if already added
        if (selectedFiles.find(f => f.name === file.name && f.size === file.size)) {
            return;
        }
        
        selectedFiles.push(file);
    });
    
    updateFilesList();
    updateSubmitButton();
}

function updateFilesList() {
    const list = document.getElementById('upload-files-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    selectedFiles.forEach((file, index) => {
        const item = document.createElement('div');
        item.className = 'upload-file-item';
        
        const size = formatFileSize(file.size);
        
        item.innerHTML = `
            <svg class="ico" style="width:20px;height:20px;"><use href="#ico-video"/></svg>
            <span class="upload-file-name">${file.name}</span>
            <span class="upload-file-size">${size}</span>
            <button class="upload-file-remove" data-index="${index}">
                <svg class="ico" style="width:16px;height:16px;"><use href="#ico-circle"/></svg>
            </button>
        `;
        
        const removeBtn = item.querySelector('.upload-file-remove');
        removeBtn.addEventListener('click', function() {
            selectedFiles.splice(index, 1);
            updateFilesList();
            updateSubmitButton();
        });
        
        list.appendChild(item);
    });
}

function updateSubmitButton() {
    const submitBtn = document.getElementById('upload-submit');
    const projectSelect = document.getElementById('upload-project-select');
    
    if (submitBtn) {
        const hasFiles = selectedFiles.length > 0;
        const hasProject = projectSelect && projectSelect.value;
        submitBtn.disabled = !(hasFiles && hasProject);
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function uploadFiles() {
    const projectSelect = document.getElementById('upload-project-select');
    const notesInput = document.getElementById('upload-notes');
    const progressDiv = document.getElementById('upload-progress');
    const progressFill = document.getElementById('upload-progress-fill');
    const progressText = document.getElementById('upload-progress-text');
    const successDiv = document.getElementById('upload-success');
    
    if (!projectSelect || !projectSelect.value) {
        alert('Please select a project');
        return;
    }
    
    if (selectedFiles.length === 0) {
        alert('Please select files to upload');
        return;
    }
    
    const projectId = parseInt(projectSelect.value);
    const project = projectsData.find(p => p.id === projectId);
    const notes = notesInput ? notesInput.value : '';
    
    // Show progress
    if (progressDiv) progressDiv.style.display = 'block';
    if (successDiv) successDiv.style.display = 'none';
    
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;
        
        if (progressFill) progressFill.style.width = progress + '%';
        if (progressText) {
            progressText.textContent = `Uploading ${selectedFiles.length} file(s)... ${Math.round(progress)}%`;
        }
        
        if (progress >= 100) {
            clearInterval(interval);
            
            // Show success
            setTimeout(() => {
                if (progressDiv) progressDiv.style.display = 'none';
                if (successDiv) successDiv.style.display = 'flex';
                
                console.log('Files uploaded:', selectedFiles.map(f => f.name));
                console.log('Project:', project ? project.name : 'Unknown');
                console.log('Notes:', notes);
                
                // Clear form
                setTimeout(() => {
                    clearUpload();
                    if (successDiv) successDiv.style.display = 'none';
                }, 3000);
            }, 500);
        }
    }, 200);
}

function clearUpload() {
    selectedFiles = [];
    updateFilesList();
    updateSubmitButton();
    
    const fileInput = document.getElementById('file-input');
    if (fileInput) fileInput.value = '';
    
    const notesInput = document.getElementById('upload-notes');
    if (notesInput) notesInput.value = '';
    
    const projectSelect = document.getElementById('upload-project-select');
    if (projectSelect) projectSelect.value = '';
}

// ===================== Calendar =====================
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
                const daysUntil = Math.ceil((project.deadline - Date.now()) / (24 * 60 * 60 * 1000));
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
    
    // Get upcoming deadlines (next 14 days)
    const upcoming = projectsData
        .filter(project => {
            const daysUntil = Math.ceil((project.deadline - Date.now()) / (24 * 60 * 60 * 1000));
            return daysUntil >= 0 && daysUntil <= 14;
        })
        .sort((a, b) => a.deadline - b.deadline);
    
    list.innerHTML = '';
    
    if (upcoming.length === 0) {
        list.innerHTML = '<p class="muted">No upcoming deadlines in the next 14 days.</p>';
        return;
    }
    
    upcoming.forEach(project => {
        const daysUntil = Math.ceil((project.deadline - Date.now()) / (24 * 60 * 60 * 1000));
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
        
        const item = document.createElement('div');
        item.className = itemClass;
        item.innerHTML = `
            <div class="deadline-info">
                <div class="deadline-project">${project.name}</div>
                <div class="deadline-date">
                    <svg class="ico" style="width:14px;height:14px;"><use href="#ico-clock"/></svg>
                    <span>${deadlineDate} (${daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`})</span>
                </div>
            </div>
            <span class="status-badge-large ${project.status}">${getStatusLabel(project.status)}</span>
        `;
        
        list.appendChild(item);
    });
}

// ===================== Project Status =====================
function initializeStatus() {
    updateStatusOverview();
    renderStatusDetails();
    
    const projectSelect = document.getElementById('status-project-select');
    if (projectSelect) {
        // Add "All Projects" option
        projectsData.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            projectSelect.appendChild(option);
        });
        
        projectSelect.addEventListener('change', function() {
            renderStatusDetails(this.value);
        });
    }
}

function updateStatusOverview() {
    const active = projectsData.filter(p => p.status === 'active').length;
    const review = projectsData.filter(p => p.status === 'in-review').length;
    const awaiting = projectsData.filter(p => p.status === 'awaiting-feedback').length;
    const completed = projectsData.filter(p => p.status === 'completed').length;
    
    const activeEl = document.getElementById('active-count');
    const reviewEl = document.getElementById('review-count');
    const awaitingEl = document.getElementById('feedback-count');
    const completedEl = document.getElementById('completed-count');
    
    if (activeEl) activeEl.textContent = active;
    if (reviewEl) reviewEl.textContent = review;
    if (awaitingEl) awaitingEl.textContent = awaiting;
    if (completedEl) completedEl.textContent = completed;
}

function renderStatusDetails(filterProjectId = null) {
    const container = document.getElementById('status-details');
    if (!container) return;
    
    let projectsToShow = filterProjectId 
        ? projectsData.filter(p => p.id === parseInt(filterProjectId))
        : projectsData;
    
    // Sort by deadline
    projectsToShow = [...projectsToShow].sort((a, b) => a.deadline - b.deadline);
    
    container.innerHTML = '';
    
    if (projectsToShow.length === 0) {
        container.innerHTML = '<p class="muted">No projects found.</p>';
        return;
    }
    
    projectsToShow.forEach(project => {
        const daysUntil = Math.ceil((project.deadline - Date.now()) / (24 * 60 * 60 * 1000));
        const deadlineDate = project.deadline.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
        
        const item = document.createElement('div');
        item.className = 'status-project-item';
        item.innerHTML = `
            <div class="status-project-info">
                <div class="status-project-name">${project.name}</div>
                <div class="status-project-meta">
                    <span>Client: ${project.client}</span>
                    <span>Deadline: ${deadlineDate}</span>
                    <span>Progress: ${project.progress}%</span>
                </div>
            </div>
            <span class="status-badge-large ${project.status}">${getStatusLabel(project.status)}</span>
        `;
        
        container.appendChild(item);
    });
}

// ===================== Navigation =====================
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item[href^="#"]');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                    // Update active nav item
                    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                    this.classList.add('active');
                }
            }
        });
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
