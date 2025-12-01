# Contributing to VuGru

This repository uses a branch-based workflow to allow different contributors to work on different parts of the application simultaneously.

## Branch Structure

### Main Branch (`main`)
- **Purpose**: Production-ready code
- **Protection**: Should only receive code via pull requests from feature branches
- **Status**: Stable, tested code ready for deployment

### Feature Branches

#### `project-management-dashboard`
- **Purpose**: Development of the Project Management Dashboard
- **Files**: 
  - `project-management.html`
  - `project-management.css`
  - `project-management.js`
- **Use Case**: For contributors working on project management features, real estate video project tracking, calendar, notifications, etc.

#### `video-dashboard`
- **Purpose**: Development of the Video Dashboard
- **Files**:
  - `Vugru HTML.html`
  - `Vugru CSS.css`
  - `Vugru JS.js`
- **Use Case**: For contributors working on video upload, playback, revision management, feedback system, etc.

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

### For Video Dashboard Contributors

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/mehakfromdelhi/mehakthecat.git
   cd mehakthecat
   ```

2. **Switch to the video dashboard branch**:
   ```bash
   git checkout video-dashboard
   ```

3. **Create your feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make your changes** to video dashboard files

5. **Commit and push**:
   ```bash
   git add "Vugru *"
   git commit -m "Description of your changes"
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** from your feature branch to `video-dashboard`

## Workflow Best Practices

### 1. Always Start from the Correct Branch
- Work on project management features? Start from `project-management-dashboard`
- Work on video dashboard features? Start from `video-dashboard`

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

Some files are shared between both dashboards:
- `login.html` / `login.js` - Authentication (coordinate changes)
- `index.html` - Entry point (coordinate changes)
- `README.md` - Documentation
- `.github/workflows/` - CI/CD configuration

**Important**: If you need to modify shared files, communicate with the team first to avoid conflicts.

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

