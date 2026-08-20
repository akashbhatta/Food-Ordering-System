"use client";

import * as React from "react";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { CartItemRow } from "@/components/cart/cart-item-row";
import { CartSummaryCard } from "@/components/cart/cart-summary-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ShoppingBag, Store, ArrowLeft, ArrowRight, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CartPage() {
  const { items, restaurantName, restaurantId, itemCount, isLoading } = useCart();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded-xl w-48 mx-auto" />
          <div className="h-4 bg-muted rounded-xl w-64 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 min-h-[calc(100vh-12rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="gap-1">
              <ShoppingBag className="h-3.5 w-3.5 text-primary" />
              Your Order
            </Badge>
            {itemCount > 0 && (
              <Badge variant="secondary">
                {itemCount} {itemCount === 1 ? "dish" : "dishes"}
              </Badge>
            )}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Shopping Cart
          </h1>
          {restaurantName && (
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
              <Store className="h-4 w-4 text-primary" />
              Ordering from:{" "}
              <Link
                href={`/restaurants/${restaurantId}`}
                className="font-semibold text-foreground hover:underline"
              >
                {restaurantName}
              </Link>
            </p>
          )}
        </div>

        <Link href="/restaurants">
          <Button variant="outline" size="sm" className="gap-1.5 rounded-xl">
            <ArrowLeft className="h-4 w-4" />
            Continue Browsing
          </Button>
        </Link>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Looks like you haven't added any delicious food to your cart yet. Explore our top-rated restaurants to get started!"
          actionLabel="Explore Restaurants"
          actionHref="/restaurants"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column (2 Cols): Cart Line Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-3">
              {items.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </div>

            {/* Restaurant single origin reminder */}
            <div className="p-4 rounded-2xl border border-border/80 bg-muted/30 text-xs text-muted-foreground flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-primary shrink-0" />
                <span>
                  All items in this order are prepared fresh by{" "}
                  <strong className="text-foreground">{restaurantName}</strong>.
                </span>
              </div>

              <Link
                href="/restaurants"
                className="font-semibold text-primary hover:underline shrink-0 ml-2"
              >
                Change Restaurant
              </Link>
            </div>
          </div>

          {/* Right Column (1 Col): Order Summary Card */}
          <div className="lg:col-span-1">
            <CartSummaryCard />
          </div>
        </div>
      )}
    </div>
  );
}
