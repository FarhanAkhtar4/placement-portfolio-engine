"use client";

import { useEffect, useState, useCallback } from "react";
import {
  AlertTriangle,
  WifiOff,
  RefreshCw,
  X,
  KeyRound,
  ServerCrash,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ApiStatus {
  status: "connected" | "error";
  code: string;
  message: string;
}

type ErrorCode =
  | "AUTH_INVALID"
  | "CONNECTION_FAILED"
  | "RATE_LIMITED"
  | "QUOTA_EXCEEDED"
  | "UNKNOWN"
  | "EMPTY_RESPONSE";

const ERROR_CONFIG: Record<
  ErrorCode,
  {
    icon: typeof AlertTriangle;
    title: string;
    description: string;
    color: string;
    bg: string;
    border: string;
  }
> = {
  AUTH_INVALID: {
    icon: KeyRound,
    title: "AI Service Not Configured",
    description:
      "Environment variables are missing. The app needs Z_AI_BASE_URL and Z_AI_API_KEY to connect to the AI service.",
    color: "text-destructive",
    bg: "bg-destructive/5",
    border: "border-destructive/20",
  },
  CONNECTION_FAILED: {
    icon: WifiOff,
    title: "AI Service Unreachable",
    description:
      "Cannot connect to the AI endpoint. If you're on Vercel, ensure Z_AI_BASE_URL points to a publicly accessible URL.",
    color: "text-destructive",
    bg: "bg-destructive/5",
    border: "border-destructive/20",
  },
  RATE_LIMITED: {
    icon: AlertCircle,
    title: "AI Rate Limit Hit",
    description:
      "Too many requests to the AI service. Please wait a moment and try again.",
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-50 dark:bg-yellow-950/20",
    border: "border-yellow-200 dark:border-yellow-800",
  },
  QUOTA_EXCEEDED: {
    icon: ServerCrash,
    title: "AI Quota Exceeded",
    description:
      "Your AI API quota has been exceeded. Check your plan and billing.",
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-50 dark:bg-yellow-950/20",
    border: "border-yellow-200 dark:border-yellow-800",
  },
  EMPTY_RESPONSE: {
    icon: ServerCrash,
    title: "AI Service Degraded",
    description:
      "The AI service is connected but returned no data. It may be temporarily overloaded.",
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-50 dark:bg-yellow-950/20",
    border: "border-yellow-200 dark:border-yellow-800",
  },
  UNKNOWN: {
    icon: AlertTriangle,
    title: "AI Service Error",
    description: "An unexpected error occurred with the AI service.",
    color: "text-destructive",
    bg: "bg-destructive/5",
    border: "border-destructive/20",
  },
};

function SetupGuide() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <div className="mt-2 rounded-lg border border-border/50 bg-background/50 p-3 text-xs">
      <p className="font-semibold text-foreground mb-2">
        How to fix — Vercel Setup:
      </p>
      <ol className="space-y-1.5 text-muted-foreground list-decimal list-inside">
        <li>
          Go to your Vercel project →{" "}
          <span className="font-medium text-foreground">Settings</span> →{" "}
          <span className="font-medium text-foreground">
            Environment Variables
          </span>
        </li>
        <li>
          Add this variable:
          <div className="mt-1 flex items-center gap-1.5 rounded bg-muted px-2 py-1 font-mono text-[11px]">
            <span className="text-foreground">Z_AI_API_KEY</span>
            <span className="text-muted-foreground">=</span>
            <span className="text-foreground flex-1 truncate">
              your-api-key-here
            </span>
            <button
              onClick={() =>
                copyText("Z_AI_API_KEY", "key")
              }
              className="shrink-0 text-muted-foreground hover:text-foreground"
              aria-label="Copy key name"
            >
              {copied === "key" ? (
                <Check className="size-3 text-green-600" />
              ) : (
                <Copy className="size-3" />
              )}
            </button>
          </div>
        </li>
        <li>
          Add this variable:
          <div className="mt-1 flex items-center gap-1.5 rounded bg-muted px-2 py-1 font-mono text-[11px]">
            <span className="text-foreground">Z_AI_BASE_URL</span>
            <span className="text-muted-foreground">=</span>
            <span className="text-foreground flex-1 truncate">
              http://your-ai-endpoint/v1
            </span>
            <button
              onClick={() => copyText("Z_AI_BASE_URL", "url")}
              className="shrink-0 text-muted-foreground hover:text-foreground"
              aria-label="Copy key name"
            >
              {copied === "url" ? (
                <Check className="size-3 text-green-600" />
              ) : (
                <Copy className="size-3" />
              )}
            </button>
          </div>
        </li>
        <li>
          Select <span className="font-medium text-foreground">Production</span>{" "}
          + <span className="font-medium text-foreground">Preview</span>{" "}
          environments, then save
        </li>
        <li>
          <span className="font-medium text-foreground">Redeploy</span> your
          app for changes to take effect
        </li>
      </ol>
    </div>
  );
}

export function ApiStatusBanner() {
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [checking, setChecking] = useState(false);

  const checkApi = useCallback(async () => {
    setChecking(true);
    try {
      const res = await fetch("/api/check-api");
      const data: ApiStatus = await res.json();
      setApiStatus(data);
      if (data.status === "connected") {
        setDismissed(false);
      }
    } catch {
      setApiStatus({
        status: "error",
        code: "CONNECTION_FAILED",
        message: "Failed to reach the API health check endpoint.",
      });
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    checkApi();
  }, [checkApi]);

  // No error or dismissed
  if (!apiStatus || apiStatus.status === "connected" || dismissed) return null;

  const config =
    ERROR_CONFIG[apiStatus.code as ErrorCode] || ERROR_CONFIG.UNKNOWN;
  const Icon = config.icon;
  const showSetupGuide =
    apiStatus.code === "AUTH_INVALID" || apiStatus.code === "CONNECTION_FAILED";

  return (
    <div className={`w-full border-b ${config.bg} ${config.border}`}>
      <div className="mx-auto flex max-w-5xl items-start gap-3 px-4 py-3 sm:px-6">
        <div
          className={`mt-0.5 rounded-full bg-current/10 p-1.5 ${config.color}`}
        >
          <Icon className="size-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{config.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            {apiStatus.message || config.description}
          </p>
          {showSetupGuide && <SetupGuide />}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={checkApi}
            disabled={checking}
            className="h-7 px-2 text-xs"
          >
            <RefreshCw
              className={`size-3 ${checking ? "animate-spin" : ""}`}
            />
            Retry
          </Button>
          <button
            onClick={() => setDismissed(true)}
            className="rounded-full p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
