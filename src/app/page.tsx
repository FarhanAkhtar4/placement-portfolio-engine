"use client";

import { usePortfolioStore } from "@/store/portfolio-store";
import { StepIndicator } from "@/components/portfolio/step-indicator";
import { UploadStep } from "@/components/portfolio/upload-step";
import { ProcessingStep } from "@/components/portfolio/processing-step";
import { PortfolioEditor } from "@/components/portfolio/portfolio-editor";
import { DeployStep } from "@/components/portfolio/deploy-step";
import { ApiStatusBanner } from "@/components/portfolio/api-status-banner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  const currentStep = usePortfolioStore((s) => s.currentStep);
  const setCurrentStep = usePortfolioStore((s) => s.setCurrentStep);
  const portfolioData = usePortfolioStore((s) => s.portfolioData);
  const resetAll = usePortfolioStore((s) => s.resetAll);

  const canGoBack =
    currentStep === "edit" || currentStep === "deploy";
  const canGoForward =
    currentStep === "edit" &&
    portfolioData.name.trim().length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="size-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-none tracking-tight">
                Placement Portfolio Engine
              </h1>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Resume to Portfolio in Minutes
              </p>
            </div>
          </div>

          {currentStep !== "upload" && currentStep !== "processing" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetAll}
              className="text-xs text-muted-foreground"
            >
              Start Over
            </Button>
          )}
        </div>
      </header>

      {/* API Status Banner — domain-level error */}
      <ApiStatusBanner />

      {/* Step indicator */}
      {currentStep !== "processing" && (
        <div className="border-b bg-muted/30 py-3">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <StepIndicator />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-16">
          {currentStep === "upload" && <UploadStep />}
          {currentStep === "processing" && <ProcessingStep />}
          {currentStep === "edit" && <PortfolioEditor />}
          {currentStep === "deploy" && <DeployStep />}
        </div>
      </main>

      {/* Bottom navigation for edit step */}
      {currentStep === "edit" && (
        <div className="sticky bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentStep("upload")}
              className="text-sm"
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <Button
              size="sm"
              onClick={() => setCurrentStep("deploy")}
              disabled={!canGoForward}
              className="text-sm"
            >
              Deploy
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t py-4 mt-auto">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6">
          <p className="text-[11px] text-muted-foreground">
            Placement Portfolio Engine
          </p>
          <p className="text-[11px] text-muted-foreground">
            Powered by AI
          </p>
        </div>
      </footer>
    </div>
  );
}
