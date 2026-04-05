import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("resume") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { success: false, error: "Only PDF files are accepted" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "File size must be under 5MB" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Use pdf-parse to extract text
    const pdfParse = (await import("pdf-parse")).default;
    const pdfData = await pdfParse(buffer);

    const text = pdfData.text || "";

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Could not extract text from PDF. The file may be image-based or empty." },
        { status: 422 }
      );
    }

    // Clean and normalize the extracted text
    const cleanedText = cleanText(text);

    return NextResponse.json({
      success: true,
      text: cleanedText,
      pages: pdfData.numpages,
    });
  } catch (error) {
    console.error("Resume parsing error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to parse resume";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

function cleanText(rawText: string): string {
  return rawText
    // Normalize line endings
    .replace(/\r\n/g, "\n")
    // Remove excessive whitespace
    .replace(/[ \t]+/g, " ")
    // Remove empty lines but keep paragraph breaks
    .replace(/\n{3,}/g, "\n\n")
    // Trim lines
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");
}
