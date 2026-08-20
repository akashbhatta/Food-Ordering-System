"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log sanitized error in client console
    console.error("Application error boundary triggered:", error.message);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl border border-destructive/20 bg-card shadow-xl">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/15 text-destructive mx-auto shadow-md">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-foreground">
            Something went wrong
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            We encountered an unexpected issue while processing your request. Please try reloading the page or return to the homepage.
          </p>
        </div>

        {error.digest && (
          <div className="p-2.5 rounded-xl bg-muted text-[11px] font-mono text-muted-foreground select-all">
            Reference ID: {error.digest}
          </div>
        )}

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="rounded-xl text-xs font-bold gap-1.5 shadow-md cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try Again
          </Button>

          <Link href="/">
            <Button
              variant="outline"
              className="rounded-xl text-xs font-bold gap-1.5 cursor-pointer"
            >
              <Home className="h-3.5 w-3.5" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
