# How to Use the Debug Console

## Step-by-Step Guide

### Step 1: Open the Console

1. **Go to:** http://localhost:3000 (your LinkedIn agent interface)

2. **Open Developer Console:**
   - **Windows/Linux:** Press `F12` or `Ctrl + Shift + I`
   - **Mac:** Press `Cmd + Option + I`
   - OR right-click on the page → "Inspect" → Click "Console" tab

3. **You should see:** A panel at the bottom or side of your browser with a console/terminal-like interface

### Step 2: Run the Debug Command

In the console, type or paste this command and press Enter:

```javascript
fetch('http://localhost:3000/api/debug').then(r => r.json()).then(console.log)
```

### Step 3: Read the Results

You'll see output like this:

```json
{
  "browserOpen": true,
  "pageOpen": true,
  "pageInfo": {
    "url": "https://www.linkedin.com/messaging/thread/...",
    "title": "LinkedIn",
    "messageInputs": [
      {
        "tag": "DIV",
        "classes": "msg-form__contenteditable",
        "ariaLabel": "Type a message",
        "visible": true
      }
    ],
    "sendButtons": [
      {
        "ariaLabel": "Send",
        "classes": "msg-form__send-button",
        "disabled": false,
        "visible": true
      }
    ]
  }
}
```

## What the Debug Info Tells You

- **browserOpen:** Whether the browser window is open
- **pageOpen:** Whether there's an active page
- **url:** Current LinkedIn page URL
- **messageInputs:** All message input fields found on the page
- **sendButtons:** All send buttons found on the page
- **visible:** Whether elements are actually visible (not hidden)

## Troubleshooting with Debug Info

### If messageInputs is empty:
- You're not on a message thread
- Navigate to an actual conversation

### If sendButtons is empty:
- The send button isn't found
- You might need to type something first

### If visible is false:
- Elements exist but are hidden
- Try scrolling or interacting with the page

## Alternative: Check Server Console

You can also check the server console (where you ran `npm start`) for detailed logs about what the agent is doing.

## Quick Test Commands

Try these in the console:

```javascript
// Check if server is running
fetch('http://localhost:3000/api/health').then(r => r.json()).then(console.log)

// Get debug info
fetch('http://localhost:3000/api/debug').then(r => r.json()).then(console.log)

// Test message generation
fetch('http://localhost:3000/api/generate-message', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({prompt: 'Test message'})
}).then(r => r.json()).then(console.log)
```















