import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import agentRoutes from './routes/agent.js';
import { getMcpClient } from './services/mcpClient.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: [
    'https://onchain-visa-agent.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/agent', agentRoutes);

async function startServer() {
  try {
    const client = await getMcpClient();
    console.log('MCP Client pre-warmed and ready.');
    app.listen(PORT, () => {
      console.log(`Backend server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to pre-warm MCP Client. Exiting...', error);
    process.exit(1);
  }
}

startServer();

