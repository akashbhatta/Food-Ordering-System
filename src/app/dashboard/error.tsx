"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="p-8 max-w-xl mx-auto my-12 rounded-3xl border border-destructive/20 bg-card text-center space-y-6 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/15 text-destructive mx-auto">
        <AlertCircle className="h-6 w-6" />
      </div>

      <div className="space-y-1.5">
        <h2 className="text-xl font-bold text-foreground">Restaurant Portal Error</h2>
        <p className="text-xs text-muted-foreground">
          Could not load your restaurant dashboard or execute the kitchen action.
        </p>
      </div>

      <div className="flex items-center justify-center gap-3">
        <Button size="sm" onClick={() => reset()} className="rounded-xl text-xs gap-1.5 font-bold">
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </Button>
        <Link href="/dashboard">
          <Button size="sm" variant="outline" className="rounded-xl text-xs gap-1.5">
            <LayoutDashboard className="h-3.5 w-3.5" />
            Dashboard Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
