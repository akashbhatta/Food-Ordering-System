"use client";

import * as React from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency } from "@/lib/utils";

export function CartNavBadge() {
  const { itemCount, subtotal } = useCart();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Link href="/cart">
        <Button variant="outline" size="icon" className="relative rounded-lg h-9 w-9">
          <ShoppingBag className="h-4 w-4 text-foreground" />
          <span className="sr-only">Cart</span>
        </Button>
      </Link>
    );
  }

  return (
    <Link href="/cart">
      <Button
        variant="outline"
        className={`relative rounded-xl h-9 px-3 gap-2 border-border/80 hover:border-primary/40 transition-all ${
          itemCount > 0 ? "bg-primary/10 border-primary/30 text-primary font-bold" : ""
        }`}
      >
        <div className="relative">
          <ShoppingBag className="h-4 w-4" />
          {itemCount > 0 && (
            <span className="absolute -top-2.5 -right-2.5 h-4 min-w-[16px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-extrabold flex items-center justify-center shadow-md">
              {itemCount}
            </span>
          )}
        </div>

        {itemCount > 0 && (
          <span className="hidden sm:inline text-xs font-black">
            {formatCurrency(subtotal)}
          </span>
        )}
      </Button>
    </Link>
  );
}
