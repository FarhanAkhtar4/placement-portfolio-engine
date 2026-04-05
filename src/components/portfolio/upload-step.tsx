"use client";

import {
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  WifiOff,
  KeyRound,
} from "lucide-react";
import { useCallback, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { usePortfolioStore } from "@/store/portfolio-store";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPE = "application/pdf";

const API_ERROR_ICONS: Record<string, typeof AlertCircle> = {
  AUTH_INVALID: KeyRound,
  CONNECTION_FAILED: WifiOff,
};

const API_ERROR_TITLES: Record<string, string> = {
  AUTH_INVALID: "AI Service Not Configured",
  CONNECTION_FAILED: "AI Service Unreachable",
  RATE_LIMITED: "Rate Limit Hit",
  QUOTA_EXCEEDED: "Quota Exceeded",
};

export function UploadStep() {
  const {
    setCurrentStep,
    setRawText,
    setPortfolioData,
    setProcessingStatus,
  } = usePortfolioStore();
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<{
    message: string;
    code?: string;
  } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);

      if (file.type !== ACCEPTED_TYPE) {
        setError({ message: "Please upload a PDF file only." });
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError({ message: "File is too large. Maximum size is 5MB." });
        return;
      }

      setUploading(true);
      setFileName(file.name);

      try {
        // Step 1: Parse resume
        setProcessingStatus({
          stage: "parsing",
          message: "Reading your resume...",
          progress: 15,
        });
        setCurrentStep("processing");

        const formData = new FormData();
        formData.append("resume", file);

        const parseRes = await fetch("/api/parse-resume", {
          method: "POST",
          body: formData,
        });

        const parseData = await parseRes.json();

        if (!parseData.success) {
          throw new Error(parseData.error || "Failed to parse resume");
        }

        setRawText(parseData.text);

        // Step 2: AI extraction
        setProcessingStatus({
          stage: "extracting",
          message: "Extracting structured data with AI...",
          progress: 40,
        });

        const processRes = await fetch("/api/process-resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: parseData.text }),
        });

        const processData = await processRes.json();

        if (!processData.success) {
          const err = new Error(processData.error || "Failed to process resume");
          (err as Error & { code?: string }).code = processData.code;
          throw err;
        }

        // Step 3: Optimization done
        setProcessingStatus({
          stage: "optimizing",
          message: "Optimizing content for recruiter impact...",
          progress: 75,
        });

        // Brief pause to show optimization step
        await new Promise((r) => setTimeout(r, 800));

        setPortfolioData(processData.data);

        setProcessingStatus({
          stage: "done",
          message: "Portfolio generated successfully!",
          progress: 100,
        });

        // Brief pause before transitioning to edit
        await new Promise((r) => setTimeout(r, 600));

        setCurrentStep("edit");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An unexpected error occurred";
        const code = (err as Error & { code?: string })?.code || "UNKNOWN";
        setError({ message, code });
        setCurrentStep("upload");
        setProcessingStatus({
          stage: "error",
          message,
          progress: 0,
        });
      } finally {
        setUploading(false);
      }
    },
    [setCurrentStep, setRawText, setPortfolioData, setProcessingStatus]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processFile(e.dataTransfer.files[0]);
      }
    },
    [processFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        processFile(e.target.files[0]);
      }
    },
    [processFile]
  );

  const isApiError =
    error?.code === "AUTH_INVALID" ||
    error?.code === "CONNECTION_FAILED" ||
    error?.code === "RATE_LIMITED" ||
    error?.code === "QUOTA_EXCEEDED";

  const ErrorIcon = error?.code
    ? API_ERROR_ICONS[error.code]
    : AlertCircle;

  const errorTitle = error?.code
    ? API_ERROR_TITLES[error.code]
    : undefined;

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold tracking-tight mb-2">
          Upload Your Resume
        </h2>
        <p className="text-muted-foreground">
          Drop your PDF resume and we&apos;ll convert it into a
          recruiter-optimized portfolio website.
        </p>
      </div>

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center w-full min-h-[240px] p-8
          border-2 border-dashed rounded-xl cursor-pointer
          transition-all duration-200 ease-in-out
          ${
            dragActive
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
          }
          ${uploading ? "pointer-events-none opacity-60" : ""}
          ${isApiError ? "pointer-events-none opacity-50 border-destructive/30" : ""}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleChange}
          className="hidden"
          disabled={uploading || isApiError}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="size-10 text-primary animate-spin" />
            <p className="text-sm font-medium text-muted-foreground">
              Uploading {fileName}...
            </p>
          </div>
        ) : isApiError ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="rounded-full bg-destructive/10 p-4">
              <AlertCircle className="size-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-semibold text-destructive">
                Upload Temporarily Unavailable
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                The AI service is not connected. See the error above for details.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="rounded-full bg-muted p-4">
              <Upload className="size-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold">
                Drag & drop your PDF resume here
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                or click to browse — PDF only, max 5MB
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div
          className={`mt-4 flex items-start gap-3 rounded-lg p-4 text-sm ${
            isApiError
              ? "bg-destructive/10 border border-destructive/20"
              : "bg-destructive/10"
          } ${isApiError ? "text-destructive" : ""}`}
        >
          {ErrorIcon && <ErrorIcon className="size-4 mt-0.5 shrink-0" />}
          <div className="flex-1 min-w-0">
            {errorTitle && (
              <p className="font-semibold text-xs uppercase tracking-wider mb-0.5">
                {errorTitle}
              </p>
            )}
            <p className={!isApiError ? "text-destructive" : ""}>
              {error.message}
            </p>
            {isApiError && error.code === "AUTH_INVALID" && (
              <p className="text-xs mt-1.5 text-muted-foreground">
                Set the <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">Z_AI_BASE_URL</code> and <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">Z_AI_API_KEY</code> environment variables in your deployment settings and redeploy.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <FileText className="size-3.5" />
          <span>PDF format</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="size-3.5" />
          <span>AI-optimized output</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Upload className="size-3.5" />
          <span>One-click deploy</span>
        </div>
      </div>
    </div>
  );
}
