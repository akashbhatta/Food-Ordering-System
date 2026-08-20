import { requireAuth } from "@/server/auth/guards";
import { db } from "@/server/db";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { ShoppingBag, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function CheckoutPage() {
  const user = await requireAuth({ redirectTo: "/checkout" });

  const addresses = await db.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 min-h-[calc(100vh-12rem)]">
      {/* Header */}
      <div className="mb-8 space-y-2">
        <div className="flex items-center justify-between">
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Cart
          </Link>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Secure Checkout</Badge>
            <Badge variant="secondary">Step 2 of 2</Badge>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Confirm Your Order
        </h1>
        <p className="text-sm text-muted-foreground">
          Complete your delivery details and choose your preferred payment method.
        </p>
      </div>

      {/* Main Checkout Form */}
      <CheckoutForm initialAddresses={addresses} />
    </div>
  );
}
