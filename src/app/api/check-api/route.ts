import { NextResponse } from "next/server";

// Cache the status for 60 seconds to avoid hammering the AI service
let cachedResult: { data: unknown; timestamp: number } | null = null;
const CACHE_TTL = 60_000;

export async function GET() {
  // Return cached result if still valid
  if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_TTL) {
    return NextResponse.json(cachedResult.data);
  }

  try {
    const ZAI = (await import("z-ai-web-dev-sdk")).default;

    // Attempt to create the SDK instance (validates credentials)
    const zai = await ZAI.create();

    // Make a minimal test call with a short timeout
    const testResult = await Promise.race([
      zai.chat.completions.create({
        messages: [
          { role: "assistant", content: "You are a test bot." },
          { role: "user", content: "Reply with exactly: ok" },
        ],
        thinking: { type: "disabled" },
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("AI service request timed out")), 8000)
      ),
    ]);

    const reply = testResult.choices[0]?.message?.content;

    if (!reply) {
      const result = {
        status: "error" as const,
        code: "EMPTY_RESPONSE",
        message:
          "AI service is connected but returned an empty response. The service may be temporarily degraded.",
      };
      cachedResult = { data: result, timestamp: Date.now() };
      return NextResponse.json(result);
    }

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

    // Categorize the error
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
          "AI API key is invalid or not configured. Please set the ZAI_API_KEY environment variable.",
      };
      cachedResult = { data: result, timestamp: Date.now() };
      return NextResponse.json(result);
    }

    if (
      msg.includes("timeout") ||
      msg.includes("timed out") ||
      msg.includes("econnrefused") ||
      msg.includes("econnreset") ||
      msg.includes("enotfound") ||
      msg.includes("fetch failed") ||
      msg.includes("network")
    ) {
      const result = {
        status: "error" as const,
        code: "CONNECTION_FAILED",
        message:
          "Could not reach the AI service. Please check your network connection or try again later.",
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
