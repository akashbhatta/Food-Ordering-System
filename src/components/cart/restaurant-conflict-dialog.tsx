"use client";

import * as React from "react";
import { useCart } from "@/hooks/use-cart";
import { AlertTriangle, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RestaurantConflictDialog() {
  const { conflictState, resolveConflict } = useCart();

  if (!conflictState.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={() => resolveConflict(false)}
      />

      {/* Dialog Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="conflict-dialog-title"
        className="relative w-full max-w-md rounded-2xl border border-destructive/30 bg-card p-6 shadow-2xl z-50 text-card-foreground space-y-4"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 id="conflict-dialog-title" className="text-lg font-bold text-foreground">
              Start a new order?
            </h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Your cart currently contains food items from{" "}
              <span className="font-semibold text-foreground">
                {conflictState.existingRestaurantName}
              </span>
              . Each order must be from a single restaurant at a time.
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl border border-border/80 bg-muted/40 text-xs">
          <p className="text-muted-foreground">
            Do you want to discard the items in your current cart and start a new order with{" "}
            <span className="font-bold text-foreground">
              {conflictState.newRestaurantName}
            </span>
            ?
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => resolveConflict(false)}
            className="rounded-xl text-xs"
          >
            Keep Existing Cart
          </Button>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => resolveConflict(true)}
            className="rounded-xl text-xs gap-1.5 font-bold"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear & Start New Order
          </Button>
        </div>
      </div>
    </div>
  );
}
