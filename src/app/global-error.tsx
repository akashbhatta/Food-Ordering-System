"use client";

import * as React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalRootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Root application error:", error.message);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center p-4 bg-background font-sans">
        <div className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl border border-destructive/20 bg-card shadow-2xl">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/15 text-destructive mx-auto">
            <AlertTriangle className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-foreground">
              Critical Platform Error
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              A critical layout or rendering exception occurred. We have safely isolated the error.
            </p>
          </div>

          {error.digest && (
            <div className="p-2 rounded-xl bg-muted text-[11px] font-mono text-muted-foreground">
              Digest: {error.digest}
            </div>
          )}

          <Button
            onClick={() => reset()}
            className="rounded-xl text-xs font-bold gap-1.5 shadow-md w-full cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reload FeastHub
          </Button>
        </div>
      </body>
    </html>
  );
}
