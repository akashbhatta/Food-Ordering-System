import { requireOwner } from "@/server/auth/guards";
import { getOwnerOrders } from "@/server/db/queries/dashboard";
import Link from "next/link";
import {
  ShoppingBag,
  Store,
  Clock,
  MapPin,
  Phone,
  Calendar,
  FileText,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/lib/constants";
import { OrderStatusActions } from "@/components/dashboard/order-status-actions";

export default async function DashboardOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await requireOwner({ redirectTo: "/dashboard/orders" });
  const { tab = "active" } = await searchParams;

  const { restaurant, orders } = await getOwnerOrders(user.id, tab);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Kitchen Queue
            </span>
            <Badge variant="secondary">
              {orders.length} {orders.length === 1 ? "order" : "orders"}
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Order Management
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Accept incoming orders, manage kitchen preparation, and track deliveries.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-3 overflow-x-auto">
        <Link href="/dashboard/orders?tab=active">
          <Button
            size="sm"
            variant={tab === "active" ? "default" : "outline"}
            className="rounded-xl text-xs font-bold"
          >
            Active Orders (Cooking & Delivery)
          </Button>
        </Link>

        <Link href="/dashboard/orders?tab=completed">
          <Button
            size="sm"
            variant={tab === "completed" ? "default" : "outline"}
            className="rounded-xl text-xs font-bold"
          >
            Delivered & Cancelled
          </Button>
        </Link>

        <Link href="/dashboard/orders?tab=all">
          <Button
            size="sm"
            variant={tab === "all" ? "default" : "outline"}
            className="rounded-xl text-xs font-bold"
          >
            All Historical Orders
          </Button>
        </Link>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <Card className="border-dashed p-12 text-center rounded-3xl">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-base font-bold text-foreground">No orders in this view</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {tab === "active"
              ? "All caught up! No orders currently waiting for preparation."
              : "No orders match the selected filter."}
          </p>
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
              <Card key={order.id} className="border-border/60 bg-card rounded-3xl overflow-hidden shadow-sm">
                <CardHeader className="p-5 pb-3 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-black text-foreground">
                      {order.orderNumber}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                    >
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </span>
                    <span className="font-black text-base text-primary">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  {/* Items List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Dishes to Cook
                      </span>
                      <div className="space-y-1.5 divide-y divide-border/30">
                        {order.items.map((item) => (
                          <div key={item.id} className="pt-1.5 first:pt-0 flex items-center justify-between text-xs">
                            <span className="font-semibold text-foreground">
                              {item.quantity}x {item.name}
                            </span>
                            <span className="font-medium text-muted-foreground">
                              {formatCurrency(Number(item.price.toString()) * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {order.specialNotes && (
                        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-300 mt-2 flex items-start gap-2">
                          <FileText className="h-4 w-4 shrink-0 mt-0.5" />
                          <span className="italic">&quot;{order.specialNotes}&quot;</span>
                        </div>
                      )}
                    </div>

                    {/* Customer & Delivery destination */}
                    <div className="space-y-2 sm:border-l sm:border-border/40 sm:pl-4">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Customer Info
                      </span>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <p className="font-bold text-foreground">
                          {order.user.name || "Customer"}
                        </p>
                        {order.user.phone && (
                          <p className="flex items-center gap-1.5">
                            <Phone className="h-3 w-3 text-primary" /> {order.user.phone}
                          </p>
                        )}
                        {order.address && (
                          <p className="flex items-start gap-1.5">
                            <MapPin className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                            <span>
                              {order.address.street}, {order.address.city}, {order.address.state}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Progression Controls */}
                  <div className="pt-3 border-t border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                    >
                      View Full Customer Receipt <ChevronRight className="h-3 w-3" />
                    </Link>

                    <OrderStatusActions
                      orderId={order.id}
                      currentStatus={order.status}
                      size="default"
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
