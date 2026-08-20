"use client";

import * as React from "react";
import { Plus, Minus, Trash2, Sparkles, Store } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useCart, type ClientCartItem } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function CartItemRow({ item }: { item: ClientCartItem }) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-border/60 bg-card gap-4 transition-all">
      {/* Left: Thumbnail & Info */}
      <div className="flex items-start gap-3">
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image}
            alt={item.name}
            className="h-16 w-16 rounded-xl object-cover shrink-0 border border-border/60"
          />
        ) : (
          <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center text-muted-foreground text-xs font-bold shrink-0">
            Dish
          </div>
        )}

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm text-foreground">{item.name}</h4>
          </div>

          <div className="text-xs font-semibold text-primary">
            {formatCurrency(item.price)} each
          </div>

          {item.selectedOptionsText && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Sparkles className="h-3 w-3 text-amber-500 shrink-0" />
              <span>{item.selectedOptionsText}</span>
            </div>
          )}

          {item.specialNotes && (
            <p className="text-[10px] text-muted-foreground italic line-clamp-1">
              &quot;{item.specialNotes}&quot;
            </p>
          )}
        </div>
      </div>

      {/* Right: Quantity controls, Item Total & Remove */}
      <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
        {/* Quantity buttons */}
        <div className="flex items-center gap-2 bg-muted p-1 rounded-xl border border-border">
          <button
            type="button"
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            className="h-7 w-7 flex items-center justify-center rounded-lg bg-background text-foreground hover:bg-card shadow-sm cursor-pointer"
            aria-label="Decrease quantity"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="font-bold text-xs w-4 text-center">{item.quantity}</span>
          <button
            type="button"
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            className="h-7 w-7 flex items-center justify-center rounded-lg bg-background text-foreground hover:bg-card shadow-sm cursor-pointer"
            aria-label="Increase quantity"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>

        {/* Item Total */}
        <div className="text-right min-w-[70px]">
          <div className="font-extrabold text-sm text-foreground">
            {formatCurrency(item.price * item.quantity)}
          </div>
        </div>

        {/* Remove Button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => removeItem(item.id)}
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
          aria-label={`Remove ${item.name} from cart`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
