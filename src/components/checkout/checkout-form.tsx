"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { AddressSelector, type AddressData } from "./address-selector";
import { PaymentSelector } from "./payment-selector";
import { placeOrderAction } from "@/server/actions/order";
import { PaymentMethod } from "@prisma/client";
import {
  ShoppingBag,
  Store,
  Bike,
  ShieldCheck,
  ArrowRight,
  Loader2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

interface CheckoutFormProps {
  initialAddresses: AddressData[];
}

export function CheckoutForm({ initialAddresses }: CheckoutFormProps) {
  const router = useRouter();
  const {
    items,
    restaurantName,
    subtotal,
    deliveryFee,
    tax,
    total,
    minOrderAmount,
    isMinOrderMet,
    hasUnavailableItems,
    itemCount,
    clearCart,
  } = useCart();

  const [addresses, setAddresses] = React.useState<AddressData[]>(initialAddresses);
  const [selectedAddressId, setSelectedAddressId] = React.useState<string | null>(
    initialAddresses.find((a) => a.isDefault)?.id || initialAddresses[0]?.id || null
  );
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>(
    PaymentMethod.CASH_ON_DELIVERY
  );
  const [specialNotes, setSpecialNotes] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleAddressAdded = (newAddr: AddressData) => {
    setAddresses((prev) => [newAddr, ...prev]);
    setSelectedAddressId(newAddr.id);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAddressId) {
      toast.error("Please choose a delivery address.");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    if (!isMinOrderMet) {
      toast.error(`Minimum order amount of ${formatCurrency(minOrderAmount)} not met.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await placeOrderAction({
        addressId: selectedAddressId,
        paymentMethod,
        specialNotes,
        items: items.map((i) => ({
          menuItemId: i.menuItemId,
          quantity: i.quantity,
          selectedOptionIds: i.selectedOptionIds,
          specialNotes: i.specialNotes,
        })),
      });

      if (!result.success || !result.data) {
        toast.error(result.message || "Failed to place order. Please try again.");
        return;
      }

      toast.success("Order confirmed! Your meal is being prepared.", {
        description: `Order Ref: ${result.data.orderNumber}`,
      });

      // Clear local cart
      clearCart();

      // Redirect to Order Detail / Tracking Page
      router.push(`/orders/${result.data.orderId}?confirmed=true`);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred while placing your order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="p-12 text-center border border-dashed rounded-3xl space-y-4 max-w-md mx-auto">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted mx-auto text-muted-foreground">
          <ShoppingBag className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-foreground">Your cart is empty</h3>
        <p className="text-xs text-muted-foreground">
          Please add items to your cart before proceeding to checkout.
        </p>
        <Link href="/restaurants">
          <Button className="rounded-xl text-xs">Browse Restaurants</Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Left Column (2 Cols): Address, Payment & Notes */}
      <div className="lg:col-span-2 space-y-8">
        {/* 1. Address Selector */}
        <div className="p-6 rounded-3xl border border-border/80 bg-card shadow-sm">
          <AddressSelector
            addresses={addresses}
            selectedAddressId={selectedAddressId}
            onSelectAddress={setSelectedAddressId}
            onAddressAdded={handleAddressAdded}
          />
        </div>

        {/* 2. Payment Method Selector */}
        <div className="p-6 rounded-3xl border border-border/80 bg-card shadow-sm">
          <PaymentSelector
            selectedMethod={paymentMethod}
            onSelectMethod={setPaymentMethod}
          />
        </div>

        {/* 3. Delivery Instructions for Courier */}
        <div className="p-6 rounded-3xl border border-border/80 bg-card shadow-sm space-y-3">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            3. Delivery & Kitchen Notes
          </h3>
          <textarea
            rows={2}
            value={specialNotes}
            onChange={(e) => setSpecialNotes(e.target.value)}
            placeholder="e.g. Please leave on the front porch, call upon arrival, gate code is #4321..."
            className="w-full rounded-2xl border border-input bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Right Column (1 Col): Authoritative Summary & Place Order */}
      <div className="lg:col-span-1">
        <Card className="border-border/80 bg-card shadow-xl sticky top-20 rounded-3xl overflow-hidden">
          <CardHeader className="pb-4 border-b border-border/60">
            <CardTitle className="text-lg font-bold">Review & Pay</CardTitle>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <Store className="h-3.5 w-3.5 text-primary" />
              Kitchen: <strong className="text-foreground">{restaurantName}</strong>
            </p>
          </CardHeader>

          <CardContent className="p-6 space-y-4 text-sm">
            {/* Item Mini List */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {items.map((i) => (
                <div key={i.id} className="flex items-center justify-between text-xs">
                  <div className="truncate max-w-[170px]">
                    <span className="font-semibold text-foreground">{i.quantity}x</span>{" "}
                    <span>{i.name}</span>
                  </div>
                  <span className="font-bold text-foreground">
                    {formatCurrency(i.price * i.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-3 border-t border-border space-y-2 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-semibold text-foreground">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Bike className="h-3 w-3 text-primary" /> Delivery Fee
                </span>
                <span className="font-semibold text-foreground">
                  {deliveryFee === 0 ? "Free" : formatCurrency(deliveryFee)}
                </span>
              </div>

              <div className="flex items-center justify-between text-muted-foreground">
              <span>VAT (13%)</span>
                <span className="font-semibold text-foreground">{formatCurrency(tax)}</span>
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between text-base">
                <span className="font-extrabold text-foreground">Total to Pay</span>
                <span className="font-black text-xl text-primary">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Price Guarantee Badge */}
            <div className="p-3 rounded-xl bg-muted/40 text-[11px] text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Prices verified against live database. Purchase price is snapshot in your receipt.</span>
            </div>
          </CardContent>

          <CardFooter className="p-6 pt-0">
            <Button
              type="submit"
              size="lg"
              className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/25 gap-2 cursor-pointer"
              disabled={isSubmitting || !selectedAddressId || !isMinOrderMet || hasUnavailableItems}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating Order...
                </>
              ) : (
                <>
                  Place Order • {formatCurrency(total)}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </form>
  );
}
