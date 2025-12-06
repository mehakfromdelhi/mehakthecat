# mehakthecat
Mehak is a cat who likes to code.

## Project Description
A real estate photo project management platform with bidirectional communication between agents and clients. The platform enables agents to manage projects, upload photos, track client feedback, and manage project priorities. Clients can view photos, approve or reject them, and provide comments that agents can see in real-time.

## Features

### Agent Features
- **Project Management Dashboard**: View all projects with status, priorities, and comment counts
- **Photo Dashboard**: Upload and manage property photos with version history
- **Calendar View**: View project deadlines with comment indicators
- **Priority Management**: Change project priorities (Urgent, High, Normal)
- **Bidirectional Comments**: View and respond to client comments in real-time
- **Comment Status Management**: Track comment status (New, In Progress, Completed)
- **Project Status Tracking**: See project approval status (Approved, Not Approved, Under Review)

### Client Features
- **Photo Viewing**: View uploaded property photos with version history
- **Photo Approval**: Approve or reject photos, which updates project status
- **Comments**: Post comments that agents can see and respond to
- **Notifications**: Receive notifications for new photo uploads, new versions, and comments
- **Real-time Updates**: See updates from agents in real-time

### Core Features
- **User Authentication**: Secure login with role-based access (Agent/Client)
- **Photo Upload**: Upload photos from local computer (stored as data URLs)
- **Real-time Synchronization**: Comments and status updates sync across sessions
- **Responsive Design**: Modern UI that works on desktop and mobile devices
- **Session Management**: Persistent authentication and project state

## User Roles

### Agent Login
- Access: Project Management Dashboard, Photo Dashboard, Calendar View
- Credentials:
  - `demo@vugru.com` / `demo123`
  - `admin@vugru.com` / `admin123`

### Client Login
- Access: Client Photo Dashboard (view-only with approval/comment capabilities)
- Credentials:
  - `john.smith@example.com` / `client123` (123 Main St project)
  - `sarah.johnson@example.com` / `client123` (456 Oak Ave project)
  - `mike.davis@example.com` / `client123` (789 Pine Rd project)
  - `emily.chen@example.com` / `client123` (321 Elm St project)

## Project Structure

### Key Files
- `index.html` - Entry point (redirects to login)
- `login.html` - Login/landing page with role-based authentication
- `login.js` - Authentication logic with client/agent distinction
- `project-management.html` - Agent's project overview dashboard
- `project-management.js` - Project management logic with priority controls
- `Vugru HTML.html` - Agent's photo dashboard
- `Vugru JS.js` - Photo upload and management logic
- `Clientview.html` - Client's photo viewing and approval dashboard
- `clientviewjs.js` - Client-side photo viewing and approval logic
- `calendar.html` - Calendar view with project deadlines
- `calendar.js` - Calendar rendering and comment integration
- `project-data-manager.js` - Centralized project data management
- `comments-manager.js` - Bidirectional comment system
- `photo-storage-manager.js` - Photo version and status management
- `Vugru CSS.css` - Main stylesheet
- `clientview.css` - Client dashboard styles

## Usage

### For Agents
1. Login with agent credentials
2. View projects in the Project Management Dashboard
3. Click on a project to open the Photo Dashboard
4. Upload photos, view client comments, and manage project status
5. Use Calendar view to see deadlines and access projects

### For Clients
1. Login with client credentials
2. View uploaded photos for your property
3. Approve or reject photos
4. Post comments for the agent
5. Receive notifications for updates

## Demo Credentials

### Agent Accounts
- Email: `demo@vugru.com` / Password: `demo123`
- Email: `admin@vugru.com` / Password: `admin123`

### Client Accounts
- Email: `john.smith@example.com` / Password: `client123`
- Email: `sarah.johnson@example.com` / Password: `client123`
- Email: `mike.davis@example.com` / Password: `client123`
- Email: `emily.chen@example.com` / Password: `client123`

**Note:** In production, replace the authentication logic in `login.js` with actual API calls to your backend server.

## Data Storage

The application uses browser localStorage for:
- Project data (`ProjectDataManager`)
- Photo versions and status (`PhotoStorageManager`)
- Comments (`CommentsManager`)
- Authentication state
- Notifications

All data persists across browser sessions and syncs in real-time using storage events.

## Branch Structure

This repository uses separate branches for different parts of the application to enable parallel development:

- **`main`**: Production-ready code (stable, tested)
- **`project-management-dashboard`**: Development branch for project management features
- **`video-dashboard`**: Development branch for photo dashboard features (legacy name)

For detailed contribution guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Deployment

This project is configured to automatically deploy to **GitHub Pages** when changes are pushed to the `main` branch.

### How to Enable GitHub Pages Deployment

1. Go to your repository on GitHub
2. Navigate to **Settings** > **Pages**
3. Under **Source**, select **GitHub Actions**
4. Push your changes to the `main` branch

The site will be automatically deployed and available at:
`https://<your-username>.github.io/<repository-name>/`

### Manual Deployment

You can also trigger a deployment manually:
1. Go to the **Actions** tab in your repository
2. Select the **Deploy to GitHub Pages** workflow
3. Click **Run workflow**

### Alternative Cloud Deployment Options

This static website can also be deployed to other cloud platforms:

- **Netlify**: Drag and drop your project folder or connect your GitHub repository
- **Vercel**: Import your GitHub repository for automatic deployments
- **AWS S3 + CloudFront**: Upload files to S3 and serve via CloudFront
- **Firebase Hosting**: Use Firebase CLI to deploy static files
- **Azure Static Web Apps**: Connect your repository for CI/CD deployments