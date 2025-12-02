const express = require('express');
const puppeteer = require('puppeteer');
const OpenAI = require('openai');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

let browser = null;
let page = null;

// Initialize browser
async function initBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: false, // Set to true to run in background
      defaultViewport: null,
      args: ['--start-maximized']
    });
  }
  return browser;
}

// Generate message using OpenAI
async function generateMessage(prompt, recipientInfo = '') {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY in .env file');
  }

  const systemPrompt = `You are a professional LinkedIn messaging assistant. Generate concise, professional, and personalized LinkedIn messages. 
Keep messages brief (2-3 sentences), friendly but professional, and relevant to the context provided.`;

  const userPrompt = recipientInfo 
    ? `Write a LinkedIn message based on this prompt: "${prompt}". 
    
    Context about recipient: ${recipientInfo}
    
    Make it professional, concise, and personalized.`
    : `Write a LinkedIn message based on this prompt: "${prompt}". Make it professional and concise.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 150,
      temperature: 0.7
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to generate message. Check your API key and try again.');
  }
}

// Navigate to LinkedIn message
async function navigateToMessage(recipientUrl) {
  try {
    if (!browser) {
      await initBrowser();
    }

    if (!page) {
      page = await browser.newPage();
    } else {
      try {
        if (page.isClosed()) {
          page = await browser.newPage();
        }
      } catch (e) {
        page = await browser.newPage();
      }
    }

    // Navigate to LinkedIn login or messages
    if (recipientUrl) {
      // If URL provided, go directly to it
      await page.goto(recipientUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      
      // Try to find and click "Message" button if on a profile
      try {
        await page.waitForSelector('button[aria-label*="Message"], button[aria-label*="message"], button[aria-label*="Send message"]', { timeout: 3000 });
        await page.click('button[aria-label*="Message"], button[aria-label*="message"], button[aria-label*="Send message"]');
        await page.waitForTimeout(2000);
      } catch (e) {
        // If message button not found, might already be on message thread or different page
        console.log('Message button not found, assuming already on message page');
      }
    } else {
      // Go to messages page directly
      await page.goto('https://www.linkedin.com/messaging/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    }

    return { success: true, message: 'Navigated to LinkedIn. Please log in if needed.' };
  } catch (error) {
    console.error('Navigation error:', error);
    // Still return success if browser opened, user can navigate manually
    if (browser && page) {
      return { success: true, message: 'Browser opened. Please navigate to LinkedIn manually and log in.' };
    }
    throw new Error(`Failed to navigate: ${error.message}`);
  }
}

// Send message on LinkedIn
async function sendLinkedInMessage(messageText) {
  try {
    if (!page) {
      throw new Error('LinkedIn page not initialized. Please navigate to messages first.');
    }
    
    try {
      if (page.isClosed()) {
        throw new Error('LinkedIn page was closed. Please navigate to messages again.');
      }
    } catch (e) {
      if (e.message.includes('closed')) {
        throw e;
      }
      // If isClosed() throws for another reason, assume page is invalid
      throw new Error('LinkedIn page not initialized. Please navigate to messages first.');
    }

    // Wait a bit for page to be ready
    await page.waitForTimeout(2000);

    // Check current URL to help debug
    const currentUrl = page.url();
    console.log('Current page URL:', currentUrl);

    // Wait for message input field with more comprehensive selectors
    const messageSelectors = [
      'div[contenteditable="true"][aria-label*="message" i]',
      'div[contenteditable="true"][aria-label*="Type a message" i]',
      'div[contenteditable="true"][data-placeholder*="message" i]',
      'div.msg-form__contenteditable',
      'div.msg-send-form__contenteditable',
      'div[contenteditable="true"][role="textbox"]',
      'div[role="textbox"][contenteditable="true"]',
      'div[contenteditable="true"]',
      'textarea[placeholder*="message" i]',
      'textarea[aria-label*="message" i]'
    ];

    let messageInput = null;
    let foundSelector = null;
    
    for (const selector of messageSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 3000 });
        messageInput = await page.$(selector);
        if (messageInput) {
          // Check if element is visible
          const isVisible = await page.evaluate(el => {
            const style = window.getComputedStyle(el);
            return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null;
          }, messageInput);
          
          if (isVisible) {
            foundSelector = selector;
            break;
          }
        }
      } catch (e) {
        continue;
      }
    }

    if (!messageInput) {
      // Try to get page content for debugging
      const pageContent = await page.evaluate(() => {
        return {
          url: window.location.href,
          title: document.title,
          hasMessageForm: !!document.querySelector('[class*="msg-form"], [class*="message-form"]'),
          contentEditableElements: Array.from(document.querySelectorAll('[contenteditable="true"]')).map(el => ({
            tag: el.tagName,
            classes: el.className,
            ariaLabel: el.getAttribute('aria-label'),
            placeholder: el.getAttribute('data-placeholder')
          }))
        };
      });
      
      throw new Error(`Could not find message input field. Current URL: ${currentUrl}. Please make sure you are on a message thread/conversation page. Debug info: ${JSON.stringify(pageContent)}`);
    }

    console.log('Found message input with selector:', foundSelector);

    // Click and focus on the input
    await messageInput.click({ clickCount: 3 }); // Triple click to select all
    await page.waitForTimeout(500);
    
    // Clear any existing text
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await page.waitForTimeout(300);

    // Type the message character by character for better reliability
    await page.keyboard.type(messageText, { delay: 30 });
    await page.waitForTimeout(1500);

    // Verify text was entered
    const enteredText = await page.evaluate((selector) => {
      const el = document.querySelector(selector);
      return el ? el.textContent || el.innerText : '';
    }, foundSelector);
    
    console.log('Entered text preview:', enteredText.substring(0, 50));

    // Find and click send button with more selectors
    const sendSelectors = [
      'button[aria-label*="Send" i]',
      'button[aria-label*="send message" i]',
      'button.msg-form__send-button',
      'button.msg-send-form__send-button',
      'button[data-control-name="send_message"]',
      'button[type="submit"]',
      'button[class*="send"]',
      'button:has(svg[class*="send"])',
      'button:has(svg[aria-label*="Send" i])'
    ];

    let sendButton = null;
    let foundSendSelector = null;
    
    for (const selector of sendSelectors) {
      try {
        sendButton = await page.$(selector);
        if (sendButton) {
          const buttonInfo = await page.evaluate(el => {
            return {
              disabled: el.disabled,
              visible: el.offsetParent !== null,
              ariaLabel: el.getAttribute('aria-label'),
              classes: el.className
            };
          }, sendButton);
          
          if (!buttonInfo.disabled && buttonInfo.visible) {
            foundSendSelector = selector;
            break;
          }
        }
      } catch (e) {
        continue;
      }
    }

    // If no button found, try finding by SVG icon
    if (!sendButton) {
      try {
        const sendIcon = await page.$('svg[aria-label*="Send" i], svg[class*="send" i]');
        if (sendIcon) {
          sendButton = await page.evaluateHandle(el => el.closest('button'), sendIcon);
          if (sendButton) {
            foundSendSelector = 'found via SVG icon';
          }
        }
      } catch (e) {
        // Continue to error
      }
    }

    if (!sendButton) {
      throw new Error('Could not find send button. Please try clicking send manually in the browser window.');
    }

    console.log('Found send button with selector:', foundSendSelector);

    // Click the send button
    await sendButton.click();
    await page.waitForTimeout(3000);

    // Verify message was sent (check if input is cleared or message appears in chat)
    await page.waitForTimeout(1000);

    return { success: true, message: 'Message sent successfully!' };
  } catch (error) {
    console.error('Send message error:', error);
    throw new Error(`Failed to send message: ${error.message}`);
  }
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'LinkedIn Agent is running' });
});

// Debug endpoint - get current page info
app.get('/api/debug', async (req, res) => {
  try {
    if (!page) {
      return res.json({ 
        browserOpen: !!browser, 
        pageOpen: false,
        message: 'No active page. Please navigate to LinkedIn first.' 
      });
    }
    
    let pageClosed = false;
    try {
      pageClosed = page.isClosed();
    } catch (e) {
      pageClosed = true;
    }
    
    if (pageClosed) {
      return res.json({ 
        browserOpen: !!browser, 
        pageOpen: false,
        message: 'Page was closed. Please navigate to LinkedIn again.' 
      });
    }

    const pageInfo = await page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        messageInputs: Array.from(document.querySelectorAll('[contenteditable="true"], textarea[placeholder*="message" i]')).map(el => ({
          tag: el.tagName,
          classes: el.className,
          ariaLabel: el.getAttribute('aria-label'),
          placeholder: el.getAttribute('data-placeholder') || el.getAttribute('placeholder'),
          visible: el.offsetParent !== null
        })),
        sendButtons: Array.from(document.querySelectorAll('button[aria-label*="send" i], button[class*="send"]')).map(el => ({
          ariaLabel: el.getAttribute('aria-label'),
          classes: el.className,
          disabled: el.disabled,
          visible: el.offsetParent !== null
        }))
      };
    });

    res.json({ 
      browserOpen: !!browser, 
      pageOpen: true,
      pageInfo 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate message
app.post('/api/generate-message', async (req, res) => {
  try {
    const { prompt, recipientInfo } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const message = await generateMessage(prompt, recipientInfo);
    res.json({ success: true, message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Navigate to LinkedIn
app.post('/api/navigate', async (req, res) => {
  try {
    const { recipientUrl } = req.body;
    const result = await navigateToMessage(recipientUrl);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send message
app.post('/api/send-message', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const result = await sendLinkedInMessage(message);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate and send in one go
app.post('/api/generate-and-send', async (req, res) => {
  try {
    const { prompt, recipientInfo, recipientUrl } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Generate message first
    let message;
    try {
      message = await generateMessage(prompt, recipientInfo);
    } catch (error) {
      console.error('Message generation error:', error);
      return res.status(500).json({ 
        error: `Failed to generate message: ${error.message}`,
        suggestion: 'Check your OpenAI API key and try again.'
      });
    }

    // Check if browser/page is initialized before trying to send
    let pageClosed = false;
    try {
      if (page) {
        pageClosed = page.isClosed();
      }
    } catch (e) {
      pageClosed = true;
    }
    
    if (!browser || !page || pageClosed) {
      // If URL provided, try to navigate
      if (recipientUrl) {
        try {
          await navigateToMessage(recipientUrl);
          await new Promise(resolve => setTimeout(resolve, 3000));
        } catch (navError) {
          return res.status(500).json({ 
            error: `Failed to navigate to LinkedIn: ${navError.message}`,
            generatedMessage: message,
            suggestion: 'Please click "Open LinkedIn" first, then try again. Or copy the generated message and send it manually.'
          });
        }
      } else {
        return res.status(400).json({ 
          error: 'Browser not initialized. Please click "Open LinkedIn" first, then navigate to a message thread.',
          generatedMessage: message,
          suggestion: 'After opening LinkedIn, navigate to a message thread, then try again. Or copy the generated message above and send it manually.'
        });
      }
    }

    // Try to send message
    let sendResult;
    try {
      sendResult = await sendLinkedInMessage(message);
    } catch (sendError) {
      console.error('Send message error:', sendError);
      return res.status(500).json({ 
        error: `Failed to send message: ${sendError.message}`,
        generatedMessage: message,
        suggestion: 'Please make sure you are on a message thread in the LinkedIn browser window. You can copy the generated message above and send it manually.'
      });
    }
    
    res.json({ 
      success: true, 
      generatedMessage: message,
      sendResult 
    });
  } catch (error) {
    console.error('Generate and send error:', error);
    res.status(500).json({ 
      error: error.message,
      suggestion: 'Please try generating the message first, then sending it manually if needed.'
    });
  }
});

// Close browser
app.post('/api/close-browser', async (req, res) => {
  try {
    if (browser) {
      await browser.close();
      browser = null;
      page = null;
    }
    res.json({ success: true, message: 'Browser closed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 LinkedIn Messaging Agent running on http://localhost:${PORT}`);
  console.log(`\n⚠️  IMPORTANT WARNINGS:`);
  console.log(`   - LinkedIn prohibits automation. Use at your own risk.`);
  console.log(`   - This tool is for personal use only.`);
  console.log(`   - Always review messages before sending.`);
  console.log(`   - Set OPENAI_API_KEY in .env file for AI message generation.\n`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  if (browser) {
    await browser.close();
  }
  process.exit(0);
});

