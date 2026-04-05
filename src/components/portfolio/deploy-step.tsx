"use client";

import { usePortfolioStore } from "@/store/portfolio-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Rocket, Download, RotateCcw, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { saveAs } from "file-saver";

export function DeployStep() {
  const portfolioData = usePortfolioStore((s) => s.portfolioData);
  const setCurrentStep = usePortfolioStore((s) => s.setCurrentStep);
  const resetAll = usePortfolioStore((s) => s.resetAll);
  const [generating, setGenerating] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeploy = async () => {
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/generate-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolio: portfolioData }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to generate site");
      }

      // Download the generated HTML file
      const blob = new Blob([data.html], { type: "text/html;charset=utf-8" });
      saveAs(blob, data.filename || "portfolio.html");

      setDeployed(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to generate portfolio";
      setError(message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold tracking-tight mb-2">
          Deploy Your Portfolio
        </h2>
        <p className="text-muted-foreground text-sm">
          Generate a clean, deployable HTML portfolio file. Download it and
          deploy to any static hosting service like Vercel, Netlify, or GitHub
          Pages.
        </p>
      </div>

      {/* Summary card */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <h3 className="font-semibold text-sm mb-3">Portfolio Summary</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Name</span>
              <span className="font-medium text-foreground">
                {portfolioData.name || "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Title</span>
              <span className="font-medium text-foreground">
                {portfolioData.title || "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Skills</span>
              <span className="font-medium text-foreground">
                {portfolioData.skills.length} listed
              </span>
            </div>
            <div className="flex justify-between">
              <span>Projects</span>
              <span className="font-medium text-foreground">
                {portfolioData.projects.length} listed
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deploy section */}
      <Card className="mb-6">
        <CardContent className="p-5">
          {!deployed ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Rocket className="size-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">
                    Generate Portfolio
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Creates a production-ready HTML file with all your content,
                    mobile-responsive styling, and SEO metadata.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground">
                  After download, deploy to:
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg border p-2 text-center">
                    <p className="text-xs font-medium">Vercel</p>
                  </div>
                  <div className="rounded-lg border p-2 text-center">
                    <p className="text-xs font-medium">Netlify</p>
                  </div>
                  <div className="rounded-lg border p-2 text-center">
                    <p className="text-xs font-medium">GitHub Pages</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleDeploy}
                disabled={generating}
                className="w-full"
                size="lg"
              >
                {generating ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Rocket className="size-4" />
                    Generate & Download
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
                  <CheckCircle2 className="size-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-green-600 dark:text-green-400">
                    Portfolio Generated!
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Your portfolio HTML file has been downloaded. Deploy it to
                    any static hosting service.
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-muted p-3 text-xs space-y-1.5 text-muted-foreground">
                <p className="font-medium text-foreground">
                  Quick Deploy Instructions:
                </p>
                <p>
                  <strong>Vercel:</strong> Rename to index.html, put in a
                  project folder, and run vercel deploy
                </p>
                <p>
                  <strong>Netlify:</strong> Drag and drop the HTML file at
                  app.netlify.com/drop
                </p>
                <p>
                  <strong>GitHub Pages:</strong> Push to a repo and enable
                  Pages in Settings
                </p>
              </div>

              <Button
                onClick={handleDeploy}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Download className="size-4" />
                Download Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => setCurrentStep("edit")}
          className="flex-1"
        >
          Back to Edit
        </Button>
        <Button
          variant="ghost"
          onClick={resetAll}
          className="flex-1 text-muted-foreground"
        >
          <RotateCcw className="size-4" />
          Start Over
        </Button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  );
}
