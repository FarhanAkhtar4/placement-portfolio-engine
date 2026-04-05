import { NextResponse } from "next/server";
import { createZAI, checkAIConnection } from "@/lib/ai";

// Cache the status for 60 seconds to avoid hammering the AI service
let cachedResult: { data: unknown; timestamp: number } | null = null;
const CACHE_TTL = 60_000;

export async function GET() {
  // Return cached result if still valid
  if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_TTL) {
    return NextResponse.json(cachedResult.data);
  }

  try {
    // Attempt to create the SDK instance (validates credentials)
    const zai = await createZAI();

    // Quick connectivity check with a 10-second timeout
    await checkAIConnection(10000);

    const result = {
      status: "connected" as const,
      code: "OK",
      message: "AI service is connected and working.",
    };
    cachedResult = { data: result, timestamp: Date.now() };
    return NextResponse.json(result);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    const msg = err.message.toLowerCase();

    // Config file not found or env vars not set
    if (
      msg.includes("not configured") ||
      msg.includes("config file") ||
      msg.includes("z_ai_base_url") ||
      msg.includes("z_ai_api_key") ||
      msg.includes("z-ai-config")
    ) {
      const result = {
        status: "error" as const,
        code: "AUTH_INVALID",
        message:
          "AI service not configured. Set Z_AI_BASE_URL and Z_AI_API_KEY environment variables in Vercel project settings.",
      };
      cachedResult = { data: result, timestamp: Date.now() };
      return NextResponse.json(result);
    }

    // Network / DNS / timeout errors
    if (
      msg.includes("timeout") ||
      msg.includes("timed out") ||
      msg.includes("econnrefused") ||
      msg.includes("econnreset") ||
      msg.includes("enotfound") ||
      msg.includes("fetch failed") ||
      msg.includes("network") ||
      msg.includes("i/o timeout") ||
      msg.includes("proxying request") ||
      msg.includes("dns") ||
      msg.includes("lookup") ||
      msg.includes("dial tcp") ||
      msg.includes("connection_timeout")
    ) {
      const result = {
        status: "error" as const,
        code: "CONNECTION_FAILED",
        message:
          "AI service is unreachable from this deployment environment. The endpoint is likely on an internal/private network. Set Z_AI_BASE_URL to a publicly accessible URL.",
      };
      cachedResult = { data: result, timestamp: Date.now() };
      return NextResponse.json(result);
    }

    // Auth errors
    if (
      msg.includes("unauthorized") ||
      msg.includes("authentication") ||
      msg.includes("invalid api key") ||
      msg.includes("invalid_key") ||
      msg.includes("401") ||
      msg.includes("api_key") ||
      msg.includes("apikey") ||
      msg.includes("credentials")
    ) {
      const result = {
        status: "error" as const,
        code: "AUTH_INVALID",
        message:
          "AI service not configured. Set Z_AI_BASE_URL and Z_AI_API_KEY environment variables.",
      };
      cachedResult = { data: result, timestamp: Date.now() };
      return NextResponse.json(result);
    }

    if (
      msg.includes("rate limit") ||
      msg.includes("429") ||
      msg.includes("too many requests") ||
      msg.includes("quota")
    ) {
      const result = {
        status: "error" as const,
        code: "RATE_LIMITED",
        message:
          "AI API rate limit exceeded. Please wait a moment and try again.",
      };
      cachedResult = { data: result, timestamp: Date.now() };
      return NextResponse.json(result);
    }

    if (
      msg.includes("insufficient") ||
      msg.includes("payment") ||
      msg.includes("billing") ||
      msg.includes("402") ||
      msg.includes("credits")
    ) {
      const result = {
        status: "error" as const,
        code: "QUOTA_EXCEEDED",
        message:
          "AI API quota exceeded or billing issue. Please check your plan.",
      };
      cachedResult = { data: result, timestamp: Date.now() };
      return NextResponse.json(result);
    }

    // Unknown error
    const result = {
      status: "error" as const,
      code: "UNKNOWN",
      message: `AI service error: ${err.message}`,
    };
    cachedResult = { data: result, timestamp: Date.now() };
    return NextResponse.json(result);
  }
}
