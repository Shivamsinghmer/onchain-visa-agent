import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import readline from 'readline';
import queue from './queue.js';
import { Writable, Readable } from 'stream';

class McpClient {
  private child: ChildProcess | null = null;
  private MCP_PATH: string;
  private pendingRequests: Map<number, { resolve: (val: any) => void; reject: (err: Error) => void }> = new Map();
  private requestId: number = 0;

  constructor() {
    this.MCP_PATH = process.env.MCP_PATH || "dist/index.js";
  }

  /**
   * Spawns the persistent MCP process ONLY ONCE.
   */
  public startMCP(): void {
    if (this.child) return;

    console.log(`[MCP Wrapper] Spawning persistent MCP process at: ${this.MCP_PATH}`);
    
    this.child = spawn("node", [this.MCP_PATH], {
      stdio: ['pipe', 'pipe', 'inherit'],
      env: { ...process.env }
    });

    const stdout = this.child.stdout as Readable;
    const rl = readline.createInterface({
      input: stdout,
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
      } catch (err: any) {
         // Silently ignore if it's not JSON (to handle logs/stdout from the black-box server if any)
         if (!line.includes('[dotenv')) {
            console.log(`[MCP Stdout] ${line}`);
         }
      }
    });

    this.child.on('exit', (code) => {
      console.warn(`[MCP Wrapper] MCP process exited with code ${code}. Restarting...`);
      this.child = null;
      this.startMCP();
    });

    this.child.on('error', (err) => {
      console.error('[MCP Wrapper] MCP process error:', err);
    });
  }

  /**
   * Executes a request via the persistent child process.
   * Serialized via the shared queue.
   */
  async execute(requestData: any): Promise<any> {
    if (!this.child) this.startMCP();

    return queue.add(async () => {
      return new Promise((resolve, reject) => {
        const id = ++this.requestId;
        const request = { ...requestData, jsonrpc: "2.0", id };
        
        console.log(`[MCP Wrapper] Sending request ID: ${id}, Method: ${request.method}`);

        const timeout = setTimeout(() => {
          if (this.pendingRequests.has(id)) {
            this.pendingRequests.delete(id);
            reject(new Error('MCP request timeout (10s)'));
          }
        }, 10000);

        this.pendingRequests.set(id, { 
          resolve: (val: any) => {
            clearTimeout(timeout);
            resolve(val);
          }, 
          reject 
        });

        const stdin = this.child!.stdin as Writable;
        const success = stdin.write(JSON.stringify(request) + '\n');
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
