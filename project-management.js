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

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuthentication()) {
        return;
    }
    
    // Logout button
    const logoutButton = document.getElementById('pm-logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            localStorage.removeItem('auth');
            sessionStorage.removeItem('auth');
            window.location.href = 'login.html';
        });
    }
    
    // Review Priority Inbox button
    const reviewInboxBtn = document.getElementById('review-inbox-btn');
    if (reviewInboxBtn) {
        reviewInboxBtn.addEventListener('click', function() {
            alert('Opening Priority Inbox...\n\nThis would show all urgent notifications and tasks requiring immediate attention.');
        });
    }
    
    // Calendar button
    const calendarBtn = document.getElementById('calendar-btn');
    if (calendarBtn) {
        calendarBtn.addEventListener('click', function() {
            document.getElementById('calendar').scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    // Projects button
    const projectsBtn = document.getElementById('projects-btn');
    if (projectsBtn) {
        projectsBtn.addEventListener('click', function() {
            document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    // Work on this today button
    const workTodayBtn = document.getElementById('work-today-btn');
    if (workTodayBtn) {
        workTodayBtn.addEventListener('click', function() {
            alert('Setting Neptune — Fashion Lookbook as today\'s focus project.\n\nAll notifications and tasks for this project will be prioritized.');
        });
    }
    
    // All icon buttons with "Open" functionality
    const openButtons = document.querySelectorAll('.icon-btn[title="Open"]');
    openButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.card');
            const projectTitle = card.querySelector('.card-title, .strong')?.textContent || 'Project';
            alert(`Opening ${projectTitle}...\n\nThis would navigate to the detailed project view.`);
        });
    });
    
    // All icon buttons with "Glance" functionality
    const glanceButtons = document.querySelectorAll('.icon-btn[title="Glance"]');
    glanceButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.card');
            const glanceBox = card.querySelector('.glance');
            if (glanceBox) {
                glanceBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                glanceBox.style.border = '2px solid #2563eb';
                setTimeout(() => {
                    glanceBox.style.border = '1px dashed #d1d5db';
                }, 2000);
            }
        });
    });
    
    // Flag buttons
    const flagButtons = document.querySelectorAll('.icon-btn[title="Flag"]');
    flagButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.card');
            const notificationText = card.querySelector('.muted')?.textContent || 'Notification';
            alert(`Flagged: ${notificationText}\n\nThis notification has been marked for follow-up.`);
        });
    });
    
    // Navigation items - smooth scroll to sections
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
    
    // Project card buttons
    const projectCards = document.querySelectorAll('#projects .card.soft');
    projectCards.forEach(card => {
        const projectTitle = card.querySelector('.card-title')?.textContent || 'Project';
        
        // Make entire card slightly interactive
        card.style.cursor = 'default';
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.transition = 'transform 0.2s ease';
        });
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Task items in Project Detail section
    const taskItems = document.querySelectorAll('.task');
    taskItems.forEach(task => {
        task.addEventListener('click', function() {
            const taskText = this.querySelector('span:not(.badge)')?.textContent || 'Task';
            const status = this.querySelector('.badge')?.textContent || '';
            console.log(`Task clicked: ${taskText} (${status})`);
        });
    });
    
    console.log('Project Management page loaded successfully');
});

