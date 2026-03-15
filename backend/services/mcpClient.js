import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mcpClient = null;
let mcpToolsCache = null;

export async function getMcpClient() {
  if (mcpClient) return mcpClient;

  const mcpServerPath = process.env.MCP_SERVER_PATH || '../../mcp-server/dist/index.js';
  const serverPath = path.resolve(__dirname, '..', mcpServerPath);

  console.log(`[MCP Client] Spawning MCP server at: ${serverPath}`);

  const transport = new StdioClientTransport({
    command: 'node',
    args: [serverPath],
    env: {
      ...process.env,
      ONCHAIN_API_KEY: process.env.ONCHAIN_API_KEY,
      ONCHAIN_API_URL: process.env.ONCHAIN_API_URL
    }
  });

  const client = new Client(
    { name: 'mcp-client', version: '1.0.0' },
    { capabilities: {} }
  );

  // Connection with timeout
  const connectPromise = client.connect(transport);
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('MCP connection timeout')), 10000)
  );

  try {
    await Promise.race([connectPromise, timeoutPromise]);
    console.log('MCP Client connected successfully.');
  } catch (error) {
    console.error('Failed to connect to MCP server:', error);
    throw error;
  }

  mcpClient = client;

  transport.onclose = () => {
    console.warn('MCP transport closed. Reconnecting on next request...');
    mcpClient = null;
    // We keep mcpToolsCache to avoid failing completely if MCP is down
  };

  transport.onerror = (error) => {
    console.error('MCP transport error:', error);
  };

  try {
    const toolsList = await mcpClient.listTools();
    console.log(`MCP Client discovered ${toolsList.tools.length} tools.`);
  } catch (err) {
    console.error('Failed to list tools during connection:', err);
  }

  return mcpClient;
}

export async function getMcpToolsForGroq() {
  if (mcpToolsCache) return mcpToolsCache;

  try {
    const client = await getMcpClient();
    
    // listTools with timeout
    const listToolsPromise = client.listTools();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('MCP listTools timeout')), 5000)
    );

    const listToolsResult = await Promise.race([listToolsPromise, timeoutPromise]);

    mcpToolsCache = listToolsResult.tools.map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema || { type: 'object', properties: {} }
      }
    }));
  } catch (err) {
    console.error('Failed to get tools from MCP. Continuing without tools.', err);
    return []; // Return empty tools instead of hanging
  }

  return mcpToolsCache;
}

export async function callMcpTool(toolName, toolArgs) {
  const client = await getMcpClient();
  try {
    const result = await client.callTool({
      name: toolName,
      arguments: toolArgs || {}
    });
    
    console.log(`[MCP Client] Data received from MCP server for tool "${toolName}":`, JSON.stringify(result, null, 2));
    
    // Extract text content from result
    if (result && result.content && Array.isArray(result.content)) {
      const textContents = result.content
        .filter(c => c.type === 'text')
        .map(c => c.text)
        .join('\n');
      return textContents;
    }
    return JSON.stringify(result);
  } catch (err) {
    console.error(`Error calling MCP tool ${toolName}:`, err);
    return JSON.stringify({ error: err.message || 'Unknown tool execution error' });
  }
}
