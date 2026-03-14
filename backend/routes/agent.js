import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { runAgentStream } from '../services/agentService.js';
import { clearHistory, getEmail } from '../services/sessionStore.js';

const router = express.Router();

// Always use secure cross-origin cookie settings on Render
const IS_PROD = process.env.NODE_ENV === 'production' 
  || !!process.env.RENDER 
  || !!process.env.FRONTEND_URL;

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: IS_PROD ? 'none' : 'lax',
  path: '/',
  maxAge: 3600000 * 24 // 24 hours
};

router.post('/chat', async (req, res) => {
  let sessionId = req.cookies.sessionId;

  if (!sessionId) {
    sessionId = uuidv4();
    console.log(`[Session] New session created: ${sessionId}`);
  } else {
    console.log(`[Session] Existing session reused: ${sessionId}`);
  }

  // Always re-set the cookie to keep it alive
  res.cookie('sessionId', sessionId, COOKIE_OPTIONS);

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering on Render

  try {
    const stream = runAgentStream(message, sessionId);

    let disconnected = false;
    req.on('close', () => {
      disconnected = true;
    });

    for await (const chunk of stream) {
      if (disconnected) break;
      const payload = `data: ${JSON.stringify(chunk)}\n\n`;
      res.write(payload);
      if (res.flush) res.flush();
    }
  } catch (error) {
    console.error('Error in agent loop:', error);
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ type: 'error', message: error.message || 'Unknown error' })}\n\n`);
    }
  }

  res.end();
});

router.get('/session', (req, res) => {
  const sessionId = req.cookies.sessionId;
  console.log(`[Session] GET /session — sessionId: ${sessionId}`);
  if (!sessionId) {
    return res.json({ email: null, sessionId: null });
  }
  const email = getEmail(sessionId);
  res.json({ email, sessionId });
});

router.post('/clear', (req, res) => {
  const sessionId = req.cookies.sessionId;
  if (sessionId) {
    clearHistory(sessionId);
    console.log(`[Session] Cleared session: ${sessionId}`);
  }
  // Clear the cookie too
  res.clearCookie('sessionId', COOKIE_OPTIONS);
  res.json({ success: true });
});

export default router;