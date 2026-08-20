"use client";

import * as React from "react";
import Link from "next/link";
import { ShoppingBag, Bike, ShieldCheck, ArrowRight, Trash2, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";

export function CartSummaryCard() {
  const {
    subtotal,
    deliveryFee,
    tax,
    total,
    minOrderAmount,
    isMinOrderMet,
    hasUnavailableItems,
    itemCount,
    restaurantName,
    clearCart,
  } = useCart();

  const minOrderShortfall = Math.max(0, minOrderAmount - subtotal);
  const minOrderProgress = minOrderAmount > 0 ? Math.min(100, (subtotal / minOrderAmount) * 100) : 100;

  return (
    <Card className="border-border/80 bg-card shadow-lg sticky top-20">
      <CardHeader className="pb-4 border-b border-border/60">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">Order Summary</CardTitle>
          <span className="text-xs text-muted-foreground font-semibold">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
        </div>
        {restaurantName && (
          <p className="text-xs text-muted-foreground">
            From: <span className="font-semibold text-foreground">{restaurantName}</span>
          </p>
        )}
      </CardHeader>

      <CardContent className="p-6 space-y-4 text-sm">
        {/* Minimum Order Warning / Meter */}
        {minOrderAmount > 0 && !isMinOrderMet && (
          <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Add {formatCurrency(minOrderShortfall)} more to reach minimum order</span>
            </div>
            <div className="w-full bg-amber-500/20 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full transition-all duration-300"
                style={{ width: `${minOrderProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Unavailable items alert */}
        {hasUnavailableItems && (
          <div className="p-3 rounded-xl border border-destructive/30 bg-destructive/10 text-xs text-destructive font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Some items in your cart are currently out of stock.</span>
          </div>
        )}

        {/* Breakdown Items */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Items Subtotal</span>
            <span className="font-semibold text-foreground">{formatCurrency(subtotal)}</span>
          </div>

          <div className="flex items-center justify-between text-muted-foreground">
            <span className="flex items-center gap-1">
              <Bike className="h-3.5 w-3.5 text-primary" /> Delivery Fee
            </span>
            <span className="font-semibold text-foreground">
              {deliveryFee === 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Free</span>
              ) : (
                formatCurrency(deliveryFee)
              )}
            </span>
          </div>

          <div className="flex items-center justify-between text-muted-foreground">
            <span>VAT (13%)</span>
            <span className="font-semibold text-foreground">{formatCurrency(tax)}</span>
          </div>
        </div>

        {/* Total Cost Line */}
        <div className="pt-3 border-t border-border flex items-center justify-between">
          <span className="text-base font-extrabold text-foreground">Total</span>
          <span className="text-xl font-black text-primary">{formatCurrency(total)}</span>
        </div>

        {/* Price Protection Note */}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/40 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>Prices & discounts are validated directly from the live database.</span>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0 flex flex-col space-y-3">
        <Link href="/checkout" className="w-full">
          <Button
            size="lg"
            className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/20 gap-2 cursor-pointer"
            disabled={!isMinOrderMet || itemCount === 0 || hasUnavailableItems}
          >
            Proceed to Checkout
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={clearCart}
          disabled={itemCount === 0}
          className="w-full text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
