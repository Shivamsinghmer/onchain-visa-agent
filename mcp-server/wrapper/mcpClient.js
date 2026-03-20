import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import queue from './queue.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class McpClient {
  constructor() {
    this.mcpProcess = null;
    this.mcpPath = process.env.MCP_PATH || '../dist/index.js';
    this.fullMcpPath = path.resolve(__dirname, this.mcpPath);
    this.pendingRequests = new Map();
    this.requestId = 0;
    this.isReady = false;
  }

  /**
   * Spawns the MCP server as a child process if it's not already running.
   */
  async spawnProcess() {
    if (this.mcpProcess) return;

    console.log(`[MCP Wrapper] Spawning persistent MCP process at: ${this.fullMcpPath}`);
    
    this.mcpProcess = spawn('node', [this.fullMcpPath], {
      stdio: ['pipe', 'pipe', 'inherit'],
      env: { 
        ...process.env,
        // Ensure any needed API keys are passed through
        ONCHAIN_API_KEY: process.env.ONCHAIN_API_KEY,
        ONCHAIN_API_URL: process.env.ONCHAIN_API_URL,
        ZENDIT_API_KEY: process.env.ZENDIT_API_KEY
      }
    });

    const rl = readline.createInterface({
      input: this.mcpProcess.stdout,
      terminal: false
    });

    rl.on('line', (line) => {
      try {
        const response = JSON.parse(line);
        console.log(`[MCP Wrapper] Received response for ID: ${response.id}`);
        
        const handler = this.pendingRequests.get(response.id);
        if (handler) {
          handler.resolve(response);
          this.pendingRequests.delete(response.id);
        }
      } catch (err) {
        console.error('[MCP Wrapper] Failed to parse MCP stdout line:', line, err.message);
      }
    });

    this.mcpProcess.on('exit', (code) => {
      console.warn(`[MCP Wrapper] MCP process exited with code ${code}. Restarting...`);
      this.mcpProcess = null;
      this.isReady = false;
      this.spawnProcess();
    });

    this.mcpProcess.on('error', (err) => {
      console.error('[MCP Wrapper] MCP process error:', err);
    });

    this.isReady = true;
  }

  /**
   * Sends a request to the MCP server and waits for a response.
   * Serialized via the queue.
   */
  async execute(requestData) {
    if (!this.mcpProcess) await this.spawnProcess();

    return queue.add(async () => {
      return new Promise((resolve, reject) => {
        const id = ++this.requestId;
        const request = { ...requestData, jsonrpc: "2.0", id };
        
        console.log(`[MCP Wrapper] Sending request ID: ${id}, Method: ${request.method}`);

        // Set timeout
        const timeout = setTimeout(() => {
          if (this.pendingRequests.has(id)) {
            this.pendingRequests.delete(id);
            reject(new Error('MCP request timeout (10s)'));
          }
        }, 10000);

        this.pendingRequests.set(id, { 
          resolve: (val) => {
            clearTimeout(timeout);
            resolve(val);
          }, 
          reject 
        });

        const success = this.mcpProcess.stdin.write(JSON.stringify(request) + '\n');
        if (!success) {
          clearTimeout(timeout);
          this.pendingRequests.delete(id);
          reject(new Error('Failed to write to MCP stdin'));
        }
      });
    });
  }
}

export default new McpClient();
