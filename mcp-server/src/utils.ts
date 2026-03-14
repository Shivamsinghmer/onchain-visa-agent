import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TOKEN_FILE = path.join(__dirname, '..', '..', '.mcp_token.json');

export const API_KEY = process.env.ONCHAIN_API_KEY || "oc_test_OCb_dtxmUEGfgQ__0vqp2HKVMMKIrwGF";
export const API_URL = process.env.ONCHAIN_API_URL || "https://staging.onchain.city";

function loadToken(): string | null {
  try {
    if (fs.existsSync(TOKEN_FILE)) {
      const data = fs.readFileSync(TOKEN_FILE, 'utf8');
      const json = JSON.parse(data);
      return json.token || null;
    }
  } catch (err) {
    console.error("[MCP] Failed to load token from file:", err);
  }
  return null;
}

export let jwtToken: string | null = process.env.ONCHAIN_USER_TOKEN || loadToken();

export function setJwtToken(token: string | null) {
  jwtToken = token;
  try {
    fs.writeFileSync(TOKEN_FILE, JSON.stringify({ token, updatedAt: new Date().toISOString() }));
  } catch (err) {
    console.error("[MCP] Failed to save token to file:", err);
  }
}

export async function apiRequest(endpoint: string, method: string = "GET", body?: any) {
  const fullUrl = `${API_URL}/api/partner${endpoint}`;

  const headers: any = {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
  };

  if (jwtToken) {
    headers["Authorization"] = `Bearer ${jwtToken}`;
  }

  console.error(`[MCP] Requesting: ${method} ${fullUrl}`);

  const response = await fetch(fullUrl, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  console.error(`[MCP] Response Status: ${response.status}`);

  if (response.status === 401) {
    console.error(`[MCP] 401 Unauthorized received. Clearing token.`);
    setJwtToken(null);
  }

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text();
    console.error(`[MCP] Non-JSON response from ${fullUrl}: ${text.substring(0, 200)}...`);
    throw new Error(`API at ${fullUrl} returned non-JSON response (${response.status})`);
  }

  const data = await response.json() as any;
  if (!response.ok) {
    throw new Error(`API at ${fullUrl} Error (${response.status}): ${data.message || data.error || 'Unknown error'}`);
  }
  return data;
}
