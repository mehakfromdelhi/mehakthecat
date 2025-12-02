# Installation Guide - LinkedIn Messaging Agent

Follow these steps to install and set up your LinkedIn messaging agent.

## Step 1: Install Node.js

You need Node.js to run this application. If you don't have it installed:

1. **Download Node.js:**
   - Go to: https://nodejs.org/
   - Download the **LTS (Long Term Support)** version (recommended)
   - Choose the Windows Installer (.msi) for your system (64-bit or 32-bit)

2. **Install Node.js:**
   - Run the downloaded installer
   - Click "Next" through the installation wizard
   - **Important:** Make sure "Add to PATH" is checked (it should be by default)
   - Click "Install" and wait for it to complete
   - Click "Finish"

3. **Verify Installation:**
   - Close and reopen your terminal/PowerShell
   - Run these commands to verify:
     ```bash
     node --version
     npm --version
     ```
   - You should see version numbers (e.g., `v20.10.0` and `10.2.3`)

## Step 2: Navigate to the Project Directory

Open PowerShell or Command Prompt and navigate to the linkedin-agent folder:

```bash
cd "C:\Users\bmeha\OneDrive - Darden Business School\Darden MBA\Academics\SY\Q2\Coding with GPT\Session 9\Cursor\mehakthecat\linkedin-agent"
```

## Step 3: Install Dependencies

Install all required packages:

```bash
npm install
```

This will download and install:
- Express (web server)
- Puppeteer (browser automation)
- OpenAI (AI message generation)
- Other required packages

**Note:** This may take a few minutes. Puppeteer will also download Chromium browser.

## Step 4: Get Your OpenAI API Key

You need an OpenAI API key to generate messages:

1. **Create an OpenAI account** (if you don't have one):
   - Go to: https://platform.openai.com/signup
   - Sign up or log in

2. **Get your API key:**
   - Go to: https://platform.openai.com/api-keys
   - Click "Create new secret key"
   - Give it a name (e.g., "LinkedIn Agent")
   - **Copy the key immediately** (you won't be able to see it again)
   - It will look like: `sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

3. **Add credits to your account** (if needed):
   - Go to: https://platform.openai.com/account/billing
   - Add payment method and credits
   - Note: GPT-4o-mini is very cheap (~$0.15 per 1M tokens)

## Step 5: Configure Environment Variables

1. **Create the .env file:**
   - In the `linkedin-agent` folder, create a file named `.env`
   - You can copy `.env.example` and rename it, or create a new file

2. **Add your API key:**
   - Open `.env` in a text editor
   - Add this line (replace with your actual key):
     ```
     OPENAI_API_KEY=sk-proj-your-actual-key-here
     ```
   - Save the file

## Step 6: Start the Server

Run the application:

```bash
npm start
```

You should see:
```
🚀 LinkedIn Messaging Agent running on http://localhost:3000

⚠️  IMPORTANT WARNINGS:
   - LinkedIn prohibits automation. Use at your own risk.
   ...
```

## Step 7: Open the Web Interface

1. **Open your web browser**
2. **Go to:** http://localhost:3000
3. You should see the LinkedIn Messaging Agent interface

## Step 8: First-Time Setup

1. **Click "Open LinkedIn"** in the web interface
2. A browser window will open
3. **Manually log in to LinkedIn** in that browser window
4. Once logged in, you can use the agent to generate and send messages

## Troubleshooting

### "node is not recognized"
- Node.js is not installed or not in PATH
- Reinstall Node.js and make sure to check "Add to PATH"
- Restart your terminal after installation

### "npm is not recognized"
- Same as above - Node.js installation issue

### "Cannot find module" errors
- Run `npm install` again in the linkedin-agent directory
- Make sure you're in the correct directory

### "OpenAI API key not configured"
- Make sure you created the `.env` file
- Check that the file is named exactly `.env` (not `.env.txt`)
- Verify your API key is correct (starts with `sk-`)

### Browser doesn't open
- Puppeteer should download Chromium automatically
- If it doesn't, try: `npm install puppeteer --force`

### Port 3000 already in use
- Another application is using port 3000
- Close that application or change the port in `server.js` (line 7)

## Next Steps

Once everything is installed:
1. Test message generation (without sending)
2. Review the generated messages
3. When ready, try generating and sending a test message
4. Always review messages before sending!

## Need Help?

- Check the main README.md for more details
- Make sure all prerequisites are installed
- Verify your OpenAI API key is valid and has credits















