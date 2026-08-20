import { requireAuth } from "@/server/auth/guards";
import { getCustomerOrders } from "@/server/db/queries/order";
import { ShoppingBag, Package, Calendar, ArrowRight, Store, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/lib/constants";
import Link from "next/link";

export default async function OrdersPage() {
  const user = await requireAuth({ redirectTo: "/orders" });
  const orders = await getCustomerOrders(user.id);

  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 min-h-[calc(100vh-12rem)]">
      <div className="mb-8 space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <ShoppingBag className="h-3.5 w-3.5 text-primary" />
            Customer Activity
          </Badge>
          <Badge variant="secondary">
            {orders.length} {orders.length === 1 ? "order" : "orders"}
          </Badge>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          My Order History
        </h1>
        <p className="text-sm text-muted-foreground">
          Track active deliveries, view previous orders, and inspect itemized purchase receipts.
        </p>
      </div>

      {orders.length === 0 ? (
        <Card className="border-dashed p-12 text-center rounded-3xl">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Package className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-foreground">No orders yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              You haven&apos;t placed any orders yet. Discover delicious food from Springfield&apos;s best partner kitchens!
            </p>
            <Link href="/restaurants">
              <Button className="mt-2 rounded-xl text-xs font-bold">Browse Restaurants</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusConfig = ORDER_STATUS_COLORS[order.status] || {
              bg: "bg-muted",
              text: "text-muted-foreground",
              border: "border-border",
            };

            return (
              <Link key={order.id} href={`/orders/${order.id}`} className="block group">
                <Card className="border-border/60 hover:border-primary/40 hover:shadow-md transition-all rounded-3xl overflow-hidden bg-card">
                  <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-foreground">
                          {order.orderNumber}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                        >
                          {ORDER_STATUS_LABELS[order.status]}
                        </span>
                      </div>
                      <CardTitle className="text-base font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                        <Store className="h-4 w-4 text-primary shrink-0" />
                        {order.restaurant.name}
                      </CardTitle>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                      <div className="text-base sm:text-lg font-black text-primary">
                        {formatCurrency(order.total)}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(order.createdAt)}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="border-t border-border/40 pt-3 flex items-center justify-between">
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {order.items.map((item) => `${item.quantity}x ${item.name}`).join(", ")}
                      </p>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary shrink-0 ml-4 group-hover:translate-x-1 transition-transform">
                        Track Order <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
