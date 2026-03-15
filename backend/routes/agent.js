import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { runAgentStream } from '../services/agentService.js';
import { clearHistory, getEmail } from '../services/sessionStore.js';

const router = express.Router();

router.post('/chat', async (req, res) => {
  let { message, sessionId } = req.body;

  if (!sessionId) {
    sessionId = uuidv4();
    console.log(`[Session] New session created: ${sessionId}`);
  } else {
    console.log(`[Session] Existing session reused: ${sessionId}`);
  }

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering on Render

  // Send sessionId as the first SSE event
  res.write(`data: ${JSON.stringify({ type: 'session', sessionId })}\n\n`);

  try {
    console.log(`[Route] Creating agent stream for message: "${message}"`);
    const stream = runAgentStream(message, sessionId);
    console.log(`[Route] Agent stream created, starting iteration...`);

    let chunkCount = 0;
    for await (const chunk of stream) {
      chunkCount++;
      console.log(`[Route] Received chunk #${chunkCount}:`, JSON.stringify(chunk).substring(0, 200));
      
      // Stop writing if connection is truly dead
      if (res.socket?.destroyed) {
        console.log(`[Route] Socket destroyed, stopping stream`);
        break;
      }
      
      const payload = `data: ${JSON.stringify(chunk)}\n\n`;
      res.write(payload);
      if (res.flush) res.flush();
    }
    console.log(`[Route] Stream finished. Total chunks: ${chunkCount}`);
  } catch (error) {
    console.error('[Route] Error in agent loop:', error);
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ type: 'error', message: error.message || 'Unknown error' })}\n\n`);
    }
  }

  res.end();
});

router.get('/session', (req, res) => {
  const { sessionId } = req.query;
  console.log(`[Session] GET /session — sessionId: ${sessionId}`);
  
  if (!sessionId) {
    return res.json({ email: null, sessionId: null });
  }
  
  const email = getEmail(sessionId);
  res.json({ email, sessionId });
});

router.post('/clear', (req, res) => {
  const { sessionId } = req.body;
  if (sessionId) {
    clearHistory(sessionId);
    console.log(`[Session] Cleared session: ${sessionId}`);
  }
  res.json({ success: true, sessionId: null });
});

export default router;