# LinkedIn Messaging Agent

A personal AI-powered agent that helps you quickly write and send LinkedIn messages. This tool uses OpenAI to generate professional messages and Puppeteer to automate the sending process.

## ⚠️ Important Warnings

**LinkedIn prohibits automation in their Terms of Service.** This tool is:
- For **personal use only**
- Use at **your own risk**
- May result in account restrictions or bans
- Always review messages before sending

## Features

- 🤖 **AI-Powered Message Generation**: Uses OpenAI GPT to generate professional LinkedIn messages
- 🚀 **Quick Sending**: Automates the process of sending messages on LinkedIn
- 🎯 **Personalized**: Can include recipient context for better personalization
- 💻 **Simple Web Interface**: Easy-to-use interface for generating and sending messages

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- LinkedIn account

## Installation

1. **Navigate to the project directory:**
   ```bash
   cd linkedin-agent
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

## Usage

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Open your browser and go to:**
   ```
   http://localhost:3000
   ```

3. **Using the agent:**
   - Enter a prompt describing what you want to say
   - (Optional) Add recipient context for personalization
   - (Optional) Add a LinkedIn profile or message thread URL
   - Click "Generate Message" to see the AI-generated message
   - Click "Generate & Send" to generate and automatically send the message
   - Or click "Open LinkedIn" to manually navigate to LinkedIn first

4. **First-time setup:**
   - When the browser opens, you'll need to manually log in to LinkedIn
   - After logging in, the agent can navigate and send messages

## How It Works

1. **Message Generation**: Uses OpenAI's GPT model to generate professional LinkedIn messages based on your prompt
2. **Browser Automation**: Uses Puppeteer to control a Chrome browser
3. **LinkedIn Interaction**: Navigates to LinkedIn, finds message threads, and sends messages

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/generate-message` - Generate a message from a prompt
- `POST /api/navigate` - Navigate to LinkedIn
- `POST /api/send-message` - Send a message (requires navigation first)
- `POST /api/generate-and-send` - Generate and send in one step
- `POST /api/close-browser` - Close the browser

## Example Usage

### Generate a message:
```javascript
POST /api/generate-message
{
  "prompt": "Follow up on our conversation about the project",
  "recipientInfo": "Software engineer at Google"
}
```

### Generate and send:
```javascript
POST /api/generate-and-send
{
  "prompt": "Thank them for connecting",
  "recipientInfo": "Marketing director",
  "recipientUrl": "https://www.linkedin.com/in/username"
}
```

## Troubleshooting

- **"OpenAI API key not configured"**: Make sure you've set `OPENAI_API_KEY` in your `.env` file
- **"Could not find message input field"**: Make sure you're on a message thread. Navigate to the conversation first
- **Browser doesn't open**: Check that Chrome/Chromium is installed
- **Login issues**: You need to manually log in the first time. The browser window will stay open for you to log in

## Limitations

- Requires manual login to LinkedIn (for security)
- LinkedIn's UI may change, breaking selectors
- Rate limiting: Don't send too many messages too quickly
- May not work if LinkedIn detects automation

## Security Notes

- Never commit your `.env` file with your API key
- Keep your OpenAI API key secure
- Use this tool responsibly and ethically

## License

MIT

## Disclaimer

This tool is provided as-is for educational and personal use. The authors are not responsible for any account restrictions, bans, or other consequences resulting from the use of this tool. Use at your own risk.






