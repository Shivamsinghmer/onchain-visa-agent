import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

export const API_KEY = process.env.ONCHAIN_API_KEY || "";
export const API_URL = process.env.ONCHAIN_API_URL || "https://staging.onchain.city";

if (!API_KEY) {
  console.error("[MCP] Warning: ONCHAIN_API_KEY is not set.");
}

// ── JWT state ─────────────────────────────────────────────────────────────────
let jwtToken: string | null = process.env.ONCHAIN_USER_TOKEN || null;

export function setJwtToken(token: string) {
  jwtToken = token;
  console.error(`[MCP] JWT set: ${token.substring(0, 20)}...`);
}

export function getJwtToken(): string | null {
  return jwtToken;
}

export function clearJwtToken() {
  jwtToken = null;
  console.error("[MCP] JWT cleared.");
}

/**
 * Returns true when the current JWT is a staging fallback token.
 * Fallback JWTs are rejected by the real API — use mock data instead.
 */
export function isFallbackJwt(): boolean {
  return !!jwtToken && (
    jwtToken.startsWith("staging_fallback_jwt_") ||
    jwtToken === "mock_jwt_token_for_staging_fallback"
  );
}

// ── Core request helper ───────────────────────────────────────────────────────
/**
 * All endpoints MUST use /api/partner/ prefix.
 * Pass endpoint without the base, e.g. "/api/partner/visas/search"
 */
export async function apiRequest(
  endpoint: string,
  method: string = "GET",
  body?: any
) {
  const fullUrl = `${API_URL}${endpoint}`;

  const headers: any = {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
  };

  if (jwtToken) {
    headers["Authorization"] = `Bearer ${jwtToken}`;
  }

  console.error(`[MCP] ${method} ${fullUrl} | JWT: ${jwtToken ? "present" : "none"}`);

  const response = await fetch(fullUrl, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  console.error(`[MCP] Status: ${response.status}`);

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await response.text();
    throw new Error(
      `Non-JSON response (${response.status}): ${text.substring(0, 200)}`
    );
  }

  const data = await response.json() as any;
  if (!response.ok) {
    throw new Error(
      `API Error (${response.status}): ${data.message || data.error || JSON.stringify(data)}`
    );
  }
  return data;
}

// ── Response helpers ──────────────────────────────────────────────────────────
export function ok(data: any) {
  return { content: [{ type: "text", text: JSON.stringify(data) }] };
}

export function err(message: string) {
  return {
    content: [{ type: "text", text: JSON.stringify({ error: message }) }],
    isError: true
  };
}