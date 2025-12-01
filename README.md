# mehakthecat
Mehak is a cat who likes to code.

## Project Description
A video project management dashboard with upload functionality.

## Features
- **User Authentication**: Secure login page with session management
- **Video Upload**: Upload videos from local desktop, Google Drive, or OneDrive
- **Project Management**: View project status, revision history, and client feedback
- **Responsive Design**: Modern UI that works on desktop and mobile devices

## Branch Structure

This repository uses separate branches for different parts of the application to enable parallel development:

- **`main`**: Production-ready code (stable, tested)
- **`project-management-dashboard`**: Development branch for project management features
- **`video-dashboard`**: Development branch for video dashboard features

For detailed contribution guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Upload Functionality
The upload button supports three methods:
1. **Local Desktop**: Select and upload video files directly from your computer
2. **Google Drive**: Upload videos from your Google Drive (requires API setup)
3. **OneDrive**: Upload videos from your OneDrive (requires API setup)

## Files
- `index.html` - Entry point (redirects to login)
- `login.html` - Login/landing page
- `login.js` - Login authentication logic
- `Vugru HTML.html` - Main dashboard HTML structure
- `Vugru CSS.css` - Styling and layout
- `Vugru JS.js` - Interactive functionality and upload logic

## Usage
1. Open `index.html` or `login.html` in a web browser
2. Login with your credentials (see Demo Credentials below)
3. Access the dashboard after successful authentication

## Demo Credentials
For testing purposes, you can use any email and password (minimum 3 characters), or use these predefined credentials:
- Email: `demo@vugru.com` / Password: `demo123`
- Email: `admin@vugru.com` / Password: `admin123`
- Email: `user@example.com` / Password: `password123`
- Email: `test@test.com` / Password: `test123`

**Note:** In production, replace the authentication logic in `login.js` with actual API calls to your backend server.

## Deployment (Cloud Publishing)

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