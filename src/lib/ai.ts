import ZAI from "z-ai-web-dev-sdk";
import type { ZAI as ZAIType } from "z-ai-web-dev-sdk";

/**
 * Creates a ZAI SDK instance with fallback config sources.
 *
 * Priority order:
 * 1. .z-ai-config file (local dev / sandbox)
 * 2. Z_AI_CONFIG environment variable (full JSON config as string)
 * 3. Individual env vars: Z_AI_BASE_URL, Z_AI_API_KEY, Z_AI_CHAT_ID, Z_AI_TOKEN, Z_AI_USER_ID
 *
 * On Vercel, set these environment variables:
 *   Z_AI_BASE_URL   = https://your-ai-service.com/v1
 *   Z_AI_API_KEY    = your-api-key
 *   Z_AI_CHAT_ID    = (optional) your-chat-id
 *   Z_AI_TOKEN      = (optional) your-jwt-token
 *   Z_AI_USER_ID    = (optional) your-user-id
 *
 * Or paste the full JSON config as:
 *   Z_AI_CONFIG     = {"baseUrl":"...","apiKey":"...","chatId":"...","token":"...","userId":"..."}
 */

let cachedInstance: ZAIType | null = null;

export async function createZAI(): Promise<ZAIType> {
  if (cachedInstance) return cachedInstance;

  // Try SDK's built-in config file loading first
  try {
    cachedInstance = await ZAI.create();
    return cachedInstance;
  } catch {
    // Config file not found — try environment variables
  }

  // Try full JSON config from env var
  if (process.env.Z_AI_CONFIG) {
    try {
      const config = JSON.parse(process.env.Z_AI_CONFIG);
      if (config.baseUrl && config.apiKey) {
        cachedInstance = new ZAI(config);
        return cachedInstance;
      }
    } catch {
      // Invalid JSON, continue to individual env vars
    }
  }

  // Try individual environment variables
  const baseUrl = process.env.Z_AI_BASE_URL;
  const apiKey = process.env.Z_AI_API_KEY;

  if (baseUrl && apiKey) {
    const config: Record<string, string> = { baseUrl, apiKey };
    if (process.env.Z_AI_CHAT_ID) config.chatId = process.env.Z_AI_CHAT_ID;
    if (process.env.Z_AI_TOKEN) config.token = process.env.Z_AI_TOKEN;
    if (process.env.Z_AI_USER_ID) config.userId = process.env.Z_AI_USER_ID;

    cachedInstance = new ZAI(config);
    return cachedInstance;
  }

  // Nothing worked — throw a clear error
  throw new Error(
    "AI SDK not configured. Create a .z-ai-config file in your project root, or set the Z_AI_BASE_URL and Z_AI_API_KEY environment variables. " +
    "On Vercel: go to Settings → Environment Variables and add Z_AI_BASE_URL and Z_AI_API_KEY."
  );
}
