import dotenv from 'dotenv';

dotenv.config();

const WRAPPER_URL = process.env.MCP_WRAPPER_URL || 'http://localhost:3002/run';

let mcpToolsCache = null;

/**
 * Executes an MCP JSON-RPC request via the HTTP wrapper service.
 */
async function executeMcpRequest(method, params = {}) {
  try {
    console.log(`[Backend MCP] Calling wrapper: ${method}`);
    const response = await fetch(WRAPPER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method, params })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Wrapper error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    if (data.error) {
        throw new Error(`MCP Error: ${data.error.message || JSON.stringify(data.error)}`);
    }
    return data.result;
  } catch (err) {
    console.error(`[Backend MCP] Failed to execute ${method}:`, err.message);
    throw err;
  }
}

/**
 * Returns available MCP tools in a format suitable for the AI model (Groq).
 */
export async function getMcpToolsForGroq() {
  if (mcpToolsCache) return mcpToolsCache;

  try {
    const result = await executeMcpRequest('tools/list');
    
    if (!result || !result.tools) {
        console.warn('[Backend MCP] No tools returned from MCP server');
        return [];
    }

    mcpToolsCache = result.tools.map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema || { type: 'object', properties: {} }
      }
    }));
    
    console.log(`[Backend MCP] Discovered ${mcpToolsCache.length} tools`);
    return mcpToolsCache;
  } catch (err) {
    console.error('[Backend MCP] Failed to fetch tools. Using empty list.');
    return [];
  }
}

/**
 * Calls a specific tool on the MCP server via the wrapper.
 */
export async function callMcpTool(toolName, toolArgs) {
  try {
    const result = await executeMcpRequest('tools/call', {
      name: toolName,
      arguments: toolArgs || {}
    });

    console.log(`[Backend MCP] Result for "${toolName}":`, JSON.stringify(result, null, 2));

    // Extract text content from MCP result format
    if (result && result.content && Array.isArray(result.content)) {
      return result.content
        .filter(c => c.type === 'text')
        .map(c => c.text)
        .join('\n');
    }
    return JSON.stringify(result);
  } catch (err) {
    console.error(`[Backend MCP] Tool execution error for "${toolName}":`, err.message);
    return JSON.stringify({ error: err.message });
  }
}

/**
 * Placeholder for compatibility with existing code that might call getMcpClient()
 */
export async function getMcpClient() {
    // We no longer return a direct MCP Client instance, 
    // but we can return an object that mimics basic functionally if needed.
    // However, the new architecture uses getMcpToolsForGroq and callMcpTool directly.
    return {
        listTools: () => executeMcpRequest('tools/list'),
        callTool: (params) => executeMcpRequest('tools/call', params)
    };
}
