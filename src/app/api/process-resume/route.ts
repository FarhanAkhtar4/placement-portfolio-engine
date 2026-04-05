import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

const SYSTEM_PROMPT = `You are a senior technical recruiter and career strategist who specializes in optimizing student and early-career profiles for maximum recruiter impact.

YOUR TASK:
Analyze the provided resume text and extract structured data, then rewrite and optimize all content for recruiter engagement.

STRICT RULES:
1. Use STRONG ACTION VERBS at the start of bullet points (e.g., "Architected", "Spearheaded", "Engineered", "Delivered")
2. QUANTIFY impact wherever possible (e.g., "Reduced load time by 40%", "Served 10,000+ users")
3. Remove weak, vague, or filler content (e.g., "Responsible for", "Worked on", "Various tasks")
4. Prioritize content relevant to software engineering / technology roles
5. Write a compelling hero headline (1-2 sentences) that captures the candidate's unique value proposition
6. Write a concise about section (3-4 sentences) that tells a professional story
7. For each project: provide an impact-focused description, relevant technologies, and quantified results
8. Rank projects by relevance and impact (best first, max 6 projects)
9. Extract ALL technical skills visible in the resume, categorized and deduplicated
10. Extract contact information carefully

OUTPUT FORMAT:
You MUST return ONLY valid JSON matching this exact schema. NO extra text, NO markdown, NO commentary:

{
  "name": "Full Name",
  "title": "Professional Title (e.g., Full-Stack Developer | CS Student)",
  "hero": "Compelling 1-2 sentence headline about the candidate",
  "about": "3-4 sentence professional summary",
  "skills": ["Skill1", "Skill2", ...],
  "projects": [
    {
      "title": "Project Name",
      "description": "Impact-focused 2-3 sentence description",
      "tech": ["Tech1", "Tech2"],
      "impact": "Quantified result or outcome"
    }
  ],
  "contact": {
    "email": "email@example.com",
    "phone": "+1-XXX-XXX-XXXX",
    "linkedin": "linkedin.com/in/username",
    "github": "github.com/username",
    "website": "https://example.com"
  }
}

CRITICAL: Return ONLY the JSON object. Do not wrap in code blocks. Do not add explanations.`;

function categorizeError(error: unknown): {
  code: string;
  message: string;
  httpStatus: number;
} {
  const err = error instanceof Error ? error : new Error(String(error));
  const msg = err.message.toLowerCase();

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
    return {
      code: "AUTH_INVALID",
      message:
        "AI API key is invalid or not configured. Set the ZAI_API_KEY environment variable to fix this.",
      httpStatus: 503,
    };
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
    return {
      code: "CONNECTION_FAILED",
      message:
        "Could not reach the AI service. Check your network connection or try again later.",
      httpStatus: 502,
    };
  }

  if (
    msg.includes("rate limit") ||
    msg.includes("429") ||
    msg.includes("too many requests") ||
    msg.includes("quota")
  ) {
    return {
      code: "RATE_LIMITED",
      message:
        "AI API rate limit exceeded. Please wait a moment and try again.",
      httpStatus: 429,
    };
  }

  if (
    msg.includes("insufficient") ||
    msg.includes("payment") ||
    msg.includes("billing") ||
    msg.includes("402") ||
    msg.includes("credits")
  ) {
    return {
      code: "QUOTA_EXCEEDED",
      message:
        "AI API quota exceeded or billing issue. Please check your plan and credits.",
      httpStatus: 402,
    };
  }

  return {
    code: "UNKNOWN",
    message: `AI processing failed: ${err.message}`,
    httpStatus: 500,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { success: false, error: "Resume text is required", code: "INVALID_INPUT" },
        { status: 400 }
      );
    }

    if (text.length < 50) {
      return NextResponse.json(
        { success: false, error: "Resume text is too short to process", code: "INVALID_INPUT" },
        { status: 400 }
      );
    }

    let zai;
    try {
      zai = await ZAI.create();
    } catch (initErr) {
      const categorized = categorizeError(initErr);
      return NextResponse.json(
        {
          success: false,
          error: categorized.message,
          code: categorized.code,
        },
        { status: categorized.httpStatus }
      );
    }

    let completion;
    try {
      completion = await zai.chat.completions.create({
        messages: [
          {
            role: "assistant",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: `Here is the resume text to analyze and optimize:\n\n---\n${text}\n---\n\nExtract and optimize all information into the required JSON format. Remember: STRICT JSON ONLY, no extra text.`,
          },
        ],
        thinking: { type: "disabled" },
      });
    } catch (callErr) {
      const categorized = categorizeError(callErr);
      return NextResponse.json(
        {
          success: false,
          error: categorized.message,
          code: categorized.code,
        },
        { status: categorized.httpStatus }
      );
    }

    const rawContent = completion.choices[0]?.message?.content;

    if (!rawContent) {
      return NextResponse.json(
        { success: false, error: "AI returned an empty response", code: "EMPTY_RESPONSE" },
        { status: 500 }
      );
    }

    // Clean and parse JSON from response
    const jsonContent = extractJSON(rawContent);

    if (!jsonContent) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to parse AI response as JSON",
          code: "PARSE_ERROR",
          rawContent,
        },
        { status: 500 }
      );
    }

    // Validate required fields
    const validated = validatePortfolioData(jsonContent);

    return NextResponse.json({
      success: true,
      data: validated,
    });
  } catch (error) {
    console.error("Resume processing error:", error);
    const categorized = categorizeError(error);
    return NextResponse.json(
      {
        success: false,
        error: categorized.message,
        code: categorized.code,
      },
      { status: categorized.httpStatus }
    );
  }
}

function extractJSON(raw: string): Record<string, unknown> | null {
  // Try direct parse first
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
    // Continue to extraction methods
  }

  // Try extracting from markdown code blocks
  const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      const parsed = JSON.parse(codeBlockMatch[1].trim());
      if (parsed && typeof parsed === "object") return parsed;
    } catch {
      // Continue
    }
  }

  // Try finding first { and last }
  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      const jsonStr = raw.substring(firstBrace, lastBrace + 1);
      const parsed = JSON.parse(jsonStr);
      if (parsed && typeof parsed === "object") return parsed;
    } catch {
      // Failed
    }
  }

  return null;
}

function validatePortfolioData(data: Record<string, unknown>) {
  return {
    name: typeof data.name === "string" ? data.name.trim() : "Your Name",
    title:
      typeof data.title === "string"
        ? data.title.trim()
        : "Software Engineer",
    hero:
      typeof data.hero === "string"
        ? data.hero.trim()
        : "Passionate developer building impactful solutions.",
    about:
      typeof data.about === "string"
        ? data.about.trim()
        : "A dedicated software engineering student with a passion for building innovative applications.",
    skills: Array.isArray(data.skills)
      ? data.skills.filter((s: unknown) => typeof s === "string").slice(0, 30)
      : [],
    projects: Array.isArray(data.projects)
      ? data.projects
          .filter(
            (p: unknown) =>
              p &&
              typeof p === "object" &&
              typeof (p as Record<string, unknown>).title === "string"
          )
          .slice(0, 6)
          .map((p: unknown) => {
            const proj = p as Record<string, unknown>;
            return {
              title: String(proj.title || "").trim(),
              description: String(proj.description || "").trim(),
              tech: Array.isArray(proj.tech)
                ? proj.tech
                    .filter((t: unknown) => typeof t === "string")
                    .map(String)
                : [],
              impact: String(proj.impact || "").trim(),
            };
          })
      : [],
    contact: {
      email: String(
        (data.contact as Record<string, unknown>)?.email || ""
      ).trim(),
      phone: String(
        (data.contact as Record<string, unknown>)?.phone || ""
      ).trim(),
      linkedin: String(
        (data.contact as Record<string, unknown>)?.linkedin || ""
      ).trim(),
      github: String(
        (data.contact as Record<string, unknown>)?.github || ""
      ).trim(),
      website: String(
        (data.contact as Record<string, unknown>)?.website || ""
      ).trim(),
    },
  };
}
