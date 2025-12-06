# Contributing to VuGru

This repository uses a branch-based workflow to allow different contributors to work on different parts of the application simultaneously.

## Project Overview

VuGru is a real estate photo project management platform with:
- **Agent Dashboard**: Project management, photo upload, and client communication
- **Client Dashboard**: Photo viewing, approval/rejection, and commenting
- **Bidirectional Communication**: Real-time comment synchronization between agents and clients
- **Photo Management**: Version history, approval status, and notifications

## Branch Structure

### Main Branch (`main`)
- **Purpose**: Production-ready code
- **Protection**: Should only receive code via pull requests from feature branches
- **Status**: Stable, tested code ready for deployment

### Feature Branches

#### `project-management-dashboard`
- **Purpose**: Development of the Project Management Dashboard and Calendar View
- **Files**: 
  - `project-management.html`
  - `project-management.js`
  - `calendar.html`
  - `calendar.js`
  - `project-data-manager.js`
- **Use Case**: For contributors working on project management features, calendar views, priority management, project status tracking, etc.

#### `video-dashboard` (Photo Dashboard)
- **Purpose**: Development of the Photo Dashboard (Agent and Client views)
- **Files**:
  - `Vugru HTML.html` (Agent photo dashboard)
  - `Vugru JS.js` (Agent photo management)
  - `Clientview.html` (Client photo dashboard)
  - `clientviewjs.js` (Client photo viewing and approval)
  - `comments-manager.js` (Bidirectional comment system)
  - `photo-storage-manager.js` (Photo version and status management)
  - `Vugru CSS.css` (Main stylesheet)
  - `clientview.css` (Client dashboard styles)
- **Use Case**: For contributors working on photo upload, version management, approval workflows, comment systems, notifications, etc.

## Getting Started

### For Project Management Dashboard Contributors

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/mehakfromdelhi/mehakthecat.git
   cd mehakthecat
   ```

2. **Switch to the project management branch**:
   ```bash
   git checkout project-management-dashboard
   ```

3. **Create your feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make your changes** to project management files

5. **Commit and push**:
   ```bash
   git add project-management.*
   git commit -m "Description of your changes"
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** from your feature branch to `project-management-dashboard`

### For Photo Dashboard Contributors

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/mehakfromdelhi/mehakthecat.git
   cd mehakthecat
   ```

2. **Switch to the video dashboard branch** (legacy name, now handles photos):
   ```bash
   git checkout video-dashboard
   ```

3. **Create your feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make your changes** to photo dashboard files:
   - Agent dashboard: `Vugru HTML.html`, `Vugru JS.js`
   - Client dashboard: `Clientview.html`, `clientviewjs.js`
   - Shared utilities: `comments-manager.js`, `photo-storage-manager.js`

5. **Commit and push**:
   ```bash
   git add "Vugru *" Clientview.* clientviewjs.* comments-manager.js photo-storage-manager.js
   git commit -m "Description of your changes"
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** from your feature branch to `video-dashboard`

## Workflow Best Practices

### 1. Always Start from the Correct Branch
- Work on project management features? Start from `project-management-dashboard`
- Work on photo dashboard features (agent or client)? Start from `video-dashboard`

### 2. Keep Your Branch Updated
Before starting new work, pull the latest changes:
```bash
git checkout project-management-dashboard  # or video-dashboard
git pull origin project-management-dashboard
```

### 3. Use Feature Branches
Don't commit directly to `project-management-dashboard` or `video-dashboard`. Instead:
- Create a feature branch for each new feature/fix
- Name it descriptively: `feature/add-calendar-view`, `bugfix/fix-upload-error`, etc.

### 4. Merging to Main
When features are complete and tested:
1. Merge your feature branch into the appropriate dashboard branch
2. Test thoroughly
3. Create a Pull Request from the dashboard branch to `main`
4. After review and approval, merge to `main`

## Shared Files

Some files are shared across the entire application:
- `login.html` / `login.js` - Authentication with role-based access (coordinate changes)
- `index.html` - Entry point (coordinate changes)
- `project-data-manager.js` - Centralized project data (used by all dashboards)
- `comments-manager.js` - Bidirectional comment system (used by agent and client dashboards)
- `photo-storage-manager.js` - Photo version and status management (used by agent and client dashboards)
- `Vugru CSS.css` - Main stylesheet (shared styles)
- `README.md` - Documentation
- `.github/workflows/` - CI/CD configuration

**Important**: If you need to modify shared files, communicate with the team first to avoid conflicts. Changes to data managers (`project-data-manager.js`, `comments-manager.js`, `photo-storage-manager.js`) affect multiple dashboards.

## Resolving Conflicts

If you encounter merge conflicts:

1. **Pull the latest changes**:
   ```bash
   git pull origin project-management-dashboard  # or video-dashboard
   ```

2. **Resolve conflicts** in your editor

3. **Test your changes** after resolving conflicts

4. **Commit the resolution**:
   ```bash
   git add .
   git commit -m "Resolve merge conflicts"
   ```

## Questions?

If you have questions about the workflow or need help:
1. Check existing issues on GitHub
2. Create a new issue for discussion
3. Reach out to the project maintainers

## Code Style

- Follow existing code style and formatting
- Use meaningful commit messages
- Add comments for complex logic
- Test your changes before submitting PRs

## Key Development Guidelines

### Data Management
- Use `ProjectDataManager` for all project data operations
- Use `CommentsManager` for comment-related operations
- Use `PhotoStorageManager` for photo version and status management
- Never directly modify localStorage - use the manager functions

### Client-Agent Communication
- Comments are bidirectional - test from both agent and client perspectives
- Photo approval status updates project status automatically
- Notifications are triggered by photo uploads and comments
- Use storage events for real-time synchronization

### Testing Checklist
Before submitting a PR, ensure:
- [ ] Agent dashboard functionality works
- [ ] Client dashboard functionality works
- [ ] Comments sync bidirectionally
- [ ] Photo approval updates project status
- [ ] Notifications appear correctly
- [ ] No console errors
- [ ] Responsive design works on mobile

