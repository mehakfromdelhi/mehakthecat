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
- **Project Status Tracking**: See project approval status and overall project state (Active, In Review, Awaiting Feedback, Completed) from the photo dashboard

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
- **Firebase Integration (Optional)**: When configured, photos, comments, and notifications are stored in **Firebase Firestore & Storage**, with real-time listeners; when not configured, the app transparently falls back to browser `localStorage` via a unified adapter

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
- `project-management.js` - Project management logic with priority controls and navigation into the photo dashboard
- `Vugru HTML.html` - Agent's photo dashboard (sidebar, photo viewer, revision history, client feedback, reply box)
- `Vugru JS.js` - Agent dashboard logic: authentication, sidebar toggle, upload modal, photo viewer, revision history, project status UI, and agent-side comments
- `Clientview.html` - Client's photo viewing and approval dashboard
- `clientviewjs.js` - Client-side photo viewing and approval logic
- `calendar.html` - Calendar view with project deadlines
- `calendar.js` - Calendar rendering and comment integration
- `project-data-manager.js` - Centralized project data management
- `comments-manager.js` - Bidirectional comment system
- `photo-storage-manager.js` - Photo version and status management
- `Vugru CSS.css` - Main stylesheet
- `clientview.css` - Client dashboard styles

### Firebase Integration Files (Optional)
- `firebase-config.js` - Initializes Firebase App, Firestore, Storage, and Auth; exposes `FirebaseService`
- `firebase-photo-service.js` - Uploads photos to Firebase Storage and stores photo metadata in Firestore (versions, status, etc.)
- `firebase-comment-service.js` - Stores comments and comment metadata in Firestore, with status and replies
- `firebase-integration-layer.js` - Defines `StorageAdapter`, which uses Firebase when available and falls back to `PhotoStorageManager` / `CommentsManager` otherwise
- `QUICK_START.md` - 5-minute guide to creating a Firebase project and wiring in your config
- `FIREBASE_SETUP.md` / `FIREBASE_STRUCTURE.md` - Detailed setup, recommended Firestore/Storage structure, and security rules

## Usage

### For Agents
1. Login with agent credentials
2. View projects in the Project Management Dashboard
3. Click on a project card to open the Photo Dashboard (passes `projectId` and selected project into the photo view)
4. Upload photos, view client comments, and manage project status from the photo dashboard
5. Use Calendar view to see deadlines and access projects

### For Clients
1. Login with client credentials
2. View uploaded photos for your property
3. Approve or reject photos
4. Post comments for the agent
5. Receive notifications for updates

### End-to-End Flow Walkthroughs

#### Agent Flow
1. **Sign in** on `login.html` using an agent account (for example, `demo@vugru.com` / `demo123`).  
2. **Review projects** on `project-management.html`:
   - See each project's deadline, progress, priority, status, and comment count.
   - Adjust priority (Urgent / High / Normal) directly on the project card if needed.
3. **Open a project** by clicking its card:
   - You are taken to `Vugru HTML.html?projectId=...` with the project stored in `sessionStorage` as `selectedProject`.
4. **Work in the Photo Dashboard** (`Vugru HTML.html`):
   - The header and Project Status card update with the project name, client name, and project status (Active / In Review / Awaiting Feedback / Completed).
   - The large viewer shows the current photo (latest version) or a placeholder if none exist.
   - The Revision History list shows all versions and their approval status.
5. **Upload a new photo**:
   - Click **Upload New Photo** → the upload modal appears.
   - Choose a local image; progress is shown, and on completion:
     - A new version is created (via `StorageAdapter` → Firebase or `PhotoStorageManager`).
     - The viewer switches to the new image and Revision History updates.
6. **Review client feedback**:
   - The **Client Feedback** section shows all comments (from `CommentsManager` or `FirebaseCommentService` behind `StorageAdapter`).
   - Use the reply box to respond; replies appear in the thread and trigger a notification for the client.
7. **Monitor status**:
   - When clients approve or reject photos, project and photo status update; the Project Status bar and version badges reflect the current state.

#### Client Flow
1. **Sign in** on `login.html` using a client account (for example, `john.smith@example.com` / `client123`).  
2. **Auto-routing to your project**:
   - `clientviewjs.js` looks up the project by your email via `ProjectDataManager.getAllProjects()` and stores it as `selectedProject`.
3. **View the latest photo** in `Clientview.html`:
   - The main viewer shows the current version for your project (via `PhotoStorageManager` or Firebase through `StorageAdapter`).
   - The status badge indicates Approved / Not Approved / Under Review.
4. **Approve or reject**:
   - Use the **Approve** / **Not Approved** buttons to update photo status.
   - These actions trigger status changes for the project and notify the agent.
5. **Leave comments**:
   - Type feedback in the Comments box and post it.
   - Comments are saved for the project, visible to agents, and kept in sync across sessions.
6. **Stay informed**:
   - The notification bell shows new uploads, new versions, and agent replies (backed by local notifications or Firebase `notifications` documents).

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

The application supports **two storage modes**:

1. **Firebase-backed mode (recommended in production)**  
   - Project data: still managed by `ProjectDataManager` (in-memory + local persisted seed data)  
   - Photos + versions: `firebase-photo-service.js` (Firestore + Storage)  
   - Comments: `firebase-comment-service.js` (Firestore)  
   - Notifications: Firestore `notifications` collection  
   - Accessed through the unified `StorageAdapter` in `firebase-integration-layer.js`

2. **Local mode (no Firebase configured)**  
   - Project data: `ProjectDataManager`
   - Photo versions and status: `PhotoStorageManager`
   - Comments: `CommentsManager`
   - Authentication state and notifications: `localStorage` / `sessionStorage`
   - Real-time-ish sync via browser `storage` events

The `StorageAdapter` automatically chooses Firebase when available and falls back to local storage when Firebase is not configured or fails, so the rest of the UI code does not need to know which backend is in use.

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