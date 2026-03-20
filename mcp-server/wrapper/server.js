import express from 'express';
import dotenv from 'dotenv';
import mcpClient from './mcpClient.js';

dotenv.config({ path: '../.env' }); // Load from parent .env

const app = express();
app.use(express.json());

const PORT = process.env.WRAPPER_PORT || 3002;

app.post('/run', async (req, res) => {
  try {
    console.log(`[MCP Wrapper] Incoming request: ${JSON.stringify(req.body)}`);
    const result = await mcpClient.execute(req.body);
    return res.json(result);
  } catch (err) {
    console.error(`[MCP Wrapper] Execution error: ${err.message}`);
    return res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', mcpReady: !!mcpClient.mcpProcess });
});

app.listen(PORT, async () => {
  console.log(`[MCP Wrapper] Server listening on port ${PORT}`);
  try {
    await mcpClient.spawnProcess();
    console.log(`[MCP Wrapper] Persistent MCP process initialized.`);
  } catch (err) {
    console.error(`[MCP Wrapper] Failed to initialize MCP process: ${err.message}`);
  }
});
