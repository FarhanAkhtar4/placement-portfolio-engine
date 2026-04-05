"use client";

import { usePortfolioStore } from "@/store/portfolio-store";
import { Loader2, FileText, Brain, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

export function ProcessingStep() {
  const processingStatus = usePortfolioStore((s) => s.processingStatus);

  const stages = [
    {
      key: "parsing" as const,
      label: "Parsing Resume",
      description: "Extracting text from PDF",
      icon: FileText,
    },
    {
      key: "extracting" as const,
      label: "AI Extraction",
      description: "Structuring your data with AI",
      icon: Brain,
    },
    {
      key: "optimizing" as const,
      label: "Optimizing Content",
      description: "Rewriting for recruiter impact",
      icon: Sparkles,
    },
    {
      key: "done" as const,
      label: "Complete",
      description: "Portfolio ready for editing",
      icon: CheckCircle2,
    },
  ];

  const currentIndex = stages.findIndex(
    (s) => s.key === processingStatus.stage
  );
  const isError = processingStatus.stage === "error";

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold tracking-tight mb-2">
          Building Your Portfolio
        </h2>
        <p className="text-muted-foreground text-sm">
          {isError
            ? "Something went wrong"
            : processingStatus.message || "Processing..."}
        </p>
      </div>

      <div className="space-y-0">
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          const isPending = index > currentIndex;

          return (
            <div key={stage.key} className="relative flex gap-4 pb-8 last:pb-0">
              {/* Timeline line */}
              {index < stages.length - 1 && (
                <div
                  className={`absolute left-[19px] top-10 h-full w-px transition-colors duration-500 ${
                    isCompleted || isActive ? "bg-primary/30" : "bg-border"
                  }`}
                />
              )}

              {/* Icon circle */}
              <div
                className={`relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  isCompleted
                    ? "bg-primary border-primary text-primary-foreground"
                    : isActive
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-background border-border text-muted-foreground/40"
                }`}
              >
                {isActive && !isCompleted ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Icon className="size-4" />
                )}
              </div>

              {/* Content */}
              <div className="pt-1.5">
                <p
                  className={`font-semibold text-sm transition-colors duration-300 ${
                    isPending ? "text-muted-foreground/50" : "text-foreground"
                  }`}
                >
                  {stage.label}
                </p>
                <p
                  className={`text-xs transition-colors duration-300 ${
                    isPending
                      ? "text-muted-foreground/40"
                      : "text-muted-foreground"
                  }`}
                >
                  {stage.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Error state */}
      {isError && (
        <div className="mt-6 flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="size-4 mt-0.5 shrink-0" />
          <p>{processingStatus.message}</p>
        </div>
      )}
    </div>
  );
}
