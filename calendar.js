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

// Sample project data (shared with project-management.js - in production, this would come from an API)
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
    initializeCalendar();
    initializeNavigation();
    initializeLogout();
    
    console.log('Calendar Dashboard initialized');
});

function getStatusLabel(status) {
    const labels = {
        'active': 'Active',
        'in-review': 'In Review',
        'awaiting-feedback': 'Awaiting Feedback',
        'completed': 'Completed'
    };
    return labels[status] || status;
}

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
        
        // Make deadline item clickable to jump to video dashboard
        item.style.cursor = 'pointer';
        item.addEventListener('click', function() {
            sessionStorage.setItem('selectedProject', JSON.stringify({
                id: project.id,
                name: project.name,
                client: project.client
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

