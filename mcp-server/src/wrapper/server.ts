import express from 'express';
import dotenv from 'dotenv';
import mcpClient from './mcpClient.js';

dotenv.config(); // Assuming .env is in the root during deployment

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post('/run', async (req, res) => {
  try {
    console.log(`[MCP Wrapper] Incoming request: ${JSON.stringify(req.body)}`);
    const result = await mcpClient.execute(req.body);
    return res.json(result);
  } catch (err: any) {
    console.error(`[MCP Wrapper] Execution error: ${err.message}`);
    return res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', mcpReady: !!mcpClient });
});

app.listen(PORT, async () => {
  console.log(`[MCP Wrapper] Server listening on port ${PORT}`);
  try {
    mcpClient.startMCP();
    console.log(`[MCP Wrapper] Persistent MCP process initialized.`);
  } catch (err: any) {
    console.error(`[MCP Wrapper] Failed to initialize MCP process: ${err.message}`);
  }
});
