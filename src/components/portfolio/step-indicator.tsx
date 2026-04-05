"use client";

import { usePortfolioStore } from "@/store/portfolio-store";
import {
  Upload,
  Brain,
  PenLine,
  Rocket,
} from "lucide-react";

const STEPS = [
  { key: "upload", label: "Upload", icon: Upload },
  { key: "processing", label: "Process", icon: Brain },
  { key: "edit", label: "Edit", icon: PenLine },
  { key: "deploy", label: "Deploy", icon: Rocket },
] as const;

export function StepIndicator() {
  const currentStep = usePortfolioStore((s) => s.currentStep);

  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <nav className="w-full" aria-label="Progress steps">
      <ol className="flex items-center justify-center gap-1 sm:gap-2">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;

          return (
            <li key={step.key} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`flex size-9 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                    isCompleted
                      ? "bg-primary border-primary text-primary-foreground"
                      : isActive
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-background border-border text-muted-foreground/40"
                  }`}
                >
                  <Icon className="size-3.5" />
                </div>
                <span
                  className={`text-[10px] sm:text-xs font-medium transition-colors ${
                    isActive || isCompleted
                      ? "text-foreground"
                      : "text-muted-foreground/40"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`mx-1 sm:mx-3 h-px w-6 sm:w-12 transition-colors duration-300 ${
                    isCompleted ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
