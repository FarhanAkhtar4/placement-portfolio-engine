"use client";

import { useEffect, useState, useCallback } from "react";
import { AlertTriangle, WifiOff, RefreshCw, X, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ApiStatus {
  status: "connected" | "error";
  code: string;
  message: string;
}

const ERROR_CONFIG: Record<
  string,
  {
    icon: typeof AlertTriangle;
    title: string;
    description: string;
    color: string;
  }
> = {
  AUTH_INVALID: {
    icon: KeyRound,
    title: "AI Service Not Configured",
    description:
      "The AI API key is missing or invalid. Set the ZAI_API_KEY environment variable to enable resume processing.",
    color: "text-destructive",
  },
  CONNECTION_FAILED: {
    icon: WifiOff,
    title: "AI Service Unreachable",
    description:
      "Cannot connect to the AI service. Check your network connection or try again later.",
    color: "text-destructive",
  },
  RATE_LIMITED: {
    icon: AlertTriangle,
    title: "AI Rate Limit Hit",
    description:
      "Too many requests to the AI service. Please wait a moment and try again.",
    color: "text-yellow-600 dark:text-yellow-400",
  },
  QUOTA_EXCEEDED: {
    icon: AlertTriangle,
    title: "AI Quota Exceeded",
    description:
      "Your AI API quota has been exceeded. Check your plan and billing.",
    color: "text-yellow-600 dark:text-yellow-400",
  },
  UNKNOWN: {
    icon: AlertTriangle,
    title: "AI Service Error",
    description: "An unexpected error occurred with the AI service.",
    color: "text-destructive",
  },
  EMPTY_RESPONSE: {
    icon: WifiOff,
    title: "AI Service Degraded",
    description:
      "The AI service is connected but returned no data. It may be temporarily overloaded.",
    color: "text-yellow-600 dark:text-yellow-400",
  },
};

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

  const config = ERROR_CONFIG[apiStatus.code] || ERROR_CONFIG.UNKNOWN;
  const Icon = config.icon;

  return (
    <div className="w-full border-b bg-destructive/5">
      <div className="mx-auto flex max-w-5xl items-start gap-3 px-4 py-3 sm:px-6">
        <div
          className={`mt-0.5 rounded-full bg-destructive/10 p-1.5 ${config.color}`}
        >
          <Icon className="size-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">{config.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            {config.description}
          </p>
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
