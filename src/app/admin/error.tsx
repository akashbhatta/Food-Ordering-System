"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldAlert, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="p-8 max-w-xl mx-auto my-12 rounded-3xl border border-destructive/20 bg-card text-center space-y-6 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/15 text-destructive mx-auto">
        <ShieldAlert className="h-6 w-6" />
      </div>

      <div className="space-y-1.5">
        <h2 className="text-xl font-bold text-foreground">Admin Console Error</h2>
        <p className="text-xs text-muted-foreground">
          An error occurred while executing the administrator query or moderation task.
        </p>
      </div>

      <div className="flex items-center justify-center gap-3">
        <Button size="sm" onClick={() => reset()} className="rounded-xl text-xs gap-1.5 font-bold">
          <RefreshCw className="h-3.5 w-3.5" />
          Retry Operation
        </Button>
        <Link href="/admin">
          <Button size="sm" variant="outline" className="rounded-xl text-xs gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin Overview
          </Button>
        </Link>
      </div>
    </div>
  );
}
