import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { runAgentStream } from '../services/agentService.js';
import { clearHistory, getEmail } from '../services/sessionStore.js';

const router = express.Router();

router.post('/chat', async (req, res) => {
  let sessionId = req.cookies.sessionId;
  if (!sessionId) {
    sessionId = uuidv4();
    res.cookie('sessionId', sessionId, { httpOnly: true });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const stream = runAgentStream(message, sessionId);
    
    // Flag to stop if client disconnects
    let disconnected = false;
    res.on('close', () => { 
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
  if (!sessionId) {
    return res.json({ email: null });
  }
  const email = getEmail(sessionId);
  res.json({ email });
});

router.post('/clear', (req, res) => {
  const sessionId = req.cookies.sessionId;
  if (sessionId) {
    clearHistory(sessionId);
  }
  res.json({ success: true });
});

export default router;
