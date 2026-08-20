import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getOrderById } from "@/server/db/queries/order";
import { requireAuth } from "@/server/auth/guards";
import { OrderTimeline } from "@/components/order/order-timeline";
import { CancelOrderButton } from "@/components/order/cancel-order-button";
import { ReviewDialog } from "@/components/review/review-dialog";
import {
  Store,
  MapPin,
  Clock,
  Bike,
  CreditCard,
  Banknote,
  ChevronLeft,
  Phone,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Star,
  Navigation,
  Building2,
  Home,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/lib/constants";

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ confirmed?: string }>;
}) {
  const user = await requireAuth();
  const { id } = await params;
  const { confirmed } = await searchParams;

  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  // Authorization check: Customer can only access their own orders
  if (order.userId !== user.id && user.role !== "ADMIN") {
    redirect("/orders");
  }

  const statusConfig = ORDER_STATUS_COLORS[order.status] || {
    bg: "bg-muted",
    text: "text-muted-foreground",
    border: "border-border",
  };

  // Build address strings for tracking display
  const restaurantAddress = `${order.restaurant.street}, ${order.restaurant.city}`;
  const deliveryAddressStr = order.address
    ? `${order.address.street}, ${order.address.city}, ${order.address.state} ${order.address.zipCode}`
    : undefined;

  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 min-h-[calc(100vh-12rem)]">
      {/* Back Link */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Order History
        </Link>

        {order.status === "PENDING" && (
          <CancelOrderButton orderId={order.id} />
        )}
      </div>

      {/* Confirmed Banner (if just placed) */}
      {confirmed === "true" && (
        <div className="mb-8 p-6 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-md">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">
                Thank you! Your order has been placed.
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                The restaurant kitchen has received your order and is getting ready to cook.
              </p>
            </div>
          </div>

          <Badge variant="outline" className="bg-background text-xs font-mono">
            {order.orderNumber}
          </Badge>
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono font-bold text-sm text-foreground">
              {order.orderNumber}
            </span>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
            >
              {ORDER_STATUS_LABELS[order.status]}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Order Status & Receipt
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Placed on {formatDate(order.createdAt)} • Prepared by{" "}
            <Link
              href={`/restaurants/${order.restaurant.slug}`}
              className="font-semibold text-foreground hover:underline"
            >
              {order.restaurant.name}
            </Link>
          </p>
        </div>

        {order.estimatedDeliveryAt && order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
          <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-center sm:text-right">
            <div className="text-xs text-muted-foreground font-semibold">Estimated Arrival</div>
            <div className="text-sm font-extrabold text-primary">
              {formatDate(order.estimatedDeliveryAt)}
            </div>
          </div>
        )}
      </div>

      {/* ─── LIVE STATUS TIMELINE STEPPER ─────────────────── */}
      <div className="p-6 rounded-3xl border border-border/80 bg-card shadow-sm mb-8">
        <OrderTimeline
          status={order.status}
          restaurantName={order.restaurant.name}
          restaurantAddress={restaurantAddress}
          deliveryAddress={deliveryAddressStr}
        />
      </div>

      {/* ─── RECEIPT & DELIVERY DETAILS ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Order Items & Snapshot Prices */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/80 bg-card rounded-3xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base font-bold">Ordered Items</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="divide-y divide-border/40">
                {order.items.map((item) => {
                  const options = Array.isArray(item.options) ? (item.options as { name: string; price: number }[]) : [];

                  return (
                    <div key={item.id} className="py-3 flex items-start justify-between gap-4 first:pt-0 last:pb-0">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs bg-muted px-2 py-0.5 rounded-md">
                            {item.quantity}x
                          </span>
                          <span className="font-bold text-sm text-foreground">{item.name}</span>
                        </div>

                        {options.length > 0 && (
                          <div className="flex flex-wrap gap-1 text-[11px] text-muted-foreground pl-7">
                            {options.map((opt, idx) => (
                              <span key={idx} className="inline-flex items-center gap-1">
                                <Sparkles className="h-3 w-3 text-amber-500" />
                                {opt.name} (+{formatCurrency(opt.price)})
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-extrabold text-sm text-foreground">
                          {formatCurrency(Number(item.price.toString()) * item.quantity)}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {formatCurrency(Number(item.price.toString()))} each
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Special Instructions Note */}
              {order.specialNotes && (
                <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 text-xs space-y-1">
                  <div className="font-bold text-foreground flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-primary" /> Delivery & Kitchen Notes
                  </div>
                  <p className="text-muted-foreground italic">
                    &quot;{order.specialNotes}&quot;
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ─── CUSTOMER MEAL REVIEW SECTION (DELIVERED ORDERS) ─── */}
          {order.status === "DELIVERED" && (
            <Card className="border-border/80 bg-card rounded-3xl overflow-hidden p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    Meal Rating & Review
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {order.review
                      ? "Thank you for reviewing your meal! You can update your feedback anytime."
                      : `How was your food from ${order.restaurant.name}? Share your review with other customers.`}
                  </p>
                </div>

                <ReviewDialog
                  orderId={order.id}
                  restaurantName={order.restaurant.name}
                  existingReview={order.review}
                />
              </div>

              {order.review && (
                <div className="p-4 rounded-2xl border border-border/60 bg-muted/30 space-y-2">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < order.review!.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-foreground ml-1.5">
                      {order.review.rating} of 5 Stars
                    </span>
                  </div>

                  {order.review.comment && (
                    <p className="text-xs text-muted-foreground leading-relaxed italic">
                      &quot;{order.review.comment}&quot;
                    </p>
                  )}

                  {order.review.reply && (
                    <div className="pt-2 border-t border-border/40 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        Response from {order.restaurant.name}:
                      </span>{" "}
                      {order.review.reply.content}
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Right 1 Col: Financial Summary & Delivery Details */}
        <div className="space-y-6">
          {/* Payment & Price Summary */}
          <Card className="border-border/80 bg-card rounded-3xl overflow-hidden shadow-sm">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base font-bold">Payment Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Items Subtotal</span>
                <span className="font-semibold text-foreground">{formatCurrency(order.subtotal)}</span>
              </div>

              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Bike className="h-3.5 w-3.5 text-primary" /> Delivery Fee
                </span>
                <span className="font-semibold text-foreground">
                  {Number(order.deliveryFee.toString()) === 0
                    ? "Free"
                    : formatCurrency(order.deliveryFee)}
                </span>
              </div>

              <div className="flex items-center justify-between text-muted-foreground">
                <span>VAT (13%)</span>
                <span className="font-semibold text-foreground">{formatCurrency(order.tax)}</span>
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between text-base">
                <span className="font-extrabold text-foreground">Total Paid</span>
                <span className="font-black text-lg text-primary">{formatCurrency(order.total)}</span>
              </div>

              <div className="pt-2 flex items-center justify-between text-muted-foreground border-t border-border/40">
                <span>Payment Method</span>
                <span className="font-semibold text-foreground flex items-center gap-1">
                  {order.paymentMethod === "CARD" ? (
                    <>
                      <CreditCard className="h-3.5 w-3.5 text-primary" /> Card
                    </>
                  ) : (
                    <>
                      <Banknote className="h-3.5 w-3.5 text-emerald-500" /> Cash on Delivery
                    </>
                  )}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Restaurant Pickup Location */}
          <Card className="border-border/80 bg-card rounded-3xl overflow-hidden shadow-sm">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Building2 className="h-4 w-4 text-emerald-500" /> Pickup Point (Restaurant)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-2 text-xs text-muted-foreground">
              <p className="font-bold text-foreground flex items-center gap-1.5">
                <Store className="h-3.5 w-3.5 text-primary" />
                {order.restaurant.name}
              </p>
              <p>{order.restaurant.street}</p>
              <p>{order.restaurant.city}, {order.restaurant.state} {order.restaurant.zipCode}</p>
              {order.restaurant.phone && (
                <p className="flex items-center gap-1.5 pt-1 text-foreground font-medium">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  {order.restaurant.phone}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Delivery Destination */}
          <Card className="border-border/80 bg-card rounded-3xl overflow-hidden shadow-sm">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Delivery Destination
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-2 text-xs text-muted-foreground">
              {order.address ? (
                <>
                  <p className="font-bold text-foreground flex items-center gap-1.5">
                    <Home className="h-3.5 w-3.5 text-primary" />
                    {order.address.label}
                  </p>
                  <p>{order.address.street}</p>
                  <p>{order.address.city}, {order.address.state} {order.address.zipCode}</p>
                </>
              ) : (
                <p>Delivery address not recorded.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
