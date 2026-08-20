import { requireOwner } from "@/server/auth/guards";
import { getOwnerRestaurantOverview } from "@/server/db/queries/dashboard";
import Link from "next/link";
import {
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle2,
  ChefHat,
  TrendingUp,
  ArrowRight,
  Store,
  Sparkles,
  ExternalLink,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/lib/constants";
import { OrderStatusActions } from "@/components/dashboard/order-status-actions";

export default async function DashboardOverviewPage() {
  const user = await requireOwner({ redirectTo: "/dashboard" });
  const data = await getOwnerRestaurantOverview(user.id);

  if (!data) {
    return (
      <div className="p-12 text-center border border-dashed rounded-3xl space-y-4 max-w-lg mx-auto bg-card">
        <Store className="h-12 w-12 text-primary mx-auto" />
        <h2 className="text-xl font-bold">Restaurant Profile Pending Setup</h2>
        <p className="text-xs text-muted-foreground">
          Welcome to FeastHub Partner Network! Please configure your store details to begin receiving customer orders.
        </p>
        <Link href="/dashboard/settings">
          <Button className="rounded-xl text-xs font-bold">Configure Store Settings</Button>
        </Link>
      </div>
    );
  }

  const { restaurant, metrics, recentOrders, popularItems } = data;

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Kitchen Console
            </span>
            <Badge variant="outline" className="text-[10px]">
              {restaurant.city}, {restaurant.state}
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            {restaurant.name}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Here is what&apos;s happening in your kitchen today.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/menu/new">
            <Button size="sm" className="rounded-xl text-xs gap-1.5 font-bold shadow-sm">
              <Plus className="h-4 w-4" />
              Add New Dish
            </Button>
          </Link>
        </div>
      </div>

      {/* ─── 1. METRICS OVERVIEW CARDS ────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card className="border-border/60 bg-card rounded-3xl shadow-sm">
          <CardContent className="p-5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Total Revenue</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-foreground">
              {formatCurrency(metrics.totalRevenue)}
            </div>
            <p className="text-[11px] text-muted-foreground">
              <span className="text-emerald-600 font-bold">+{formatCurrency(metrics.todayRevenue)}</span> today
            </p>
          </CardContent>
        </Card>

        {/* Pending Orders (Action Required) */}
        <Card className={`border rounded-3xl shadow-sm ${
          metrics.pendingOrders > 0
            ? "border-amber-500/50 bg-amber-500/10 ring-1 ring-amber-500/20"
            : "border-border/60 bg-card"
        }`}>
          <CardContent className="p-5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Pending Orders</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-foreground">
              {metrics.pendingOrders}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {metrics.pendingOrders > 0 ? "Requires kitchen confirmation" : "All orders acknowledged"}
            </p>
          </CardContent>
        </Card>

        {/* In Kitchen / Preparing */}
        <Card className="border-border/60 bg-card rounded-3xl shadow-sm">
          <CardContent className="p-5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Active Cooking</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ChefHat className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-foreground">
              {metrics.preparingOrders}
            </div>
            <p className="text-[11px] text-muted-foreground">In progress or en route</p>
          </CardContent>
        </Card>

        {/* Completed Orders */}
        <Card className="border-border/60 bg-card rounded-3xl shadow-sm">
          <CardContent className="p-5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Delivered Orders</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-foreground">
              {metrics.completedOrders}
            </div>
            <p className="text-[11px] text-muted-foreground">
              of {metrics.totalOrders} total orders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ─── 2. RECENT ORDERS & TOP DISHES GRID ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Live Kitchen Orders Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-primary" />
              Recent Incoming Orders
            </h2>
            <Link
              href="/dashboard/orders"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              View Full Order Feed <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <Card className="border-dashed p-8 text-center rounded-3xl">
              <p className="text-xs text-muted-foreground">
                No orders placed yet. As soon as a customer orders from your menu, they will appear here live!
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => {
                const statusConfig = ORDER_STATUS_COLORS[order.status] || {
                  bg: "bg-muted",
                  text: "text-muted-foreground",
                  border: "border-border",
                };

                return (
                  <Card key={order.id} className="border-border/60 bg-card rounded-2xl overflow-hidden">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-foreground">
                            {order.orderNumber}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                          >
                            {ORDER_STATUS_LABELS[order.status]}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs">
                          <span className="font-extrabold text-primary">
                            {formatCurrency(order.total)}
                          </span>
                          <span className="text-muted-foreground text-[11px]">
                            {formatDate(order.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Items & Customer info */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-foreground">
                            Customer: {order.user.name || "Guest Customer"}
                          </p>
                          <p className="text-muted-foreground text-[11px]">
                            {order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                          </p>
                        </div>

                        {/* Interactive Status Transition Action */}
                        <OrderStatusActions
                          orderId={order.id}
                          currentStatus={order.status}
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: Top Performing Menu Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Popular Dishes
            </h2>
            <Link
              href="/dashboard/menu"
              className="text-xs font-bold text-primary hover:underline"
            >
              Manage Menu
            </Link>
          </div>

          <Card className="border-border/60 bg-card rounded-3xl overflow-hidden shadow-sm">
            <CardContent className="p-4 divide-y divide-border/40">
              {popularItems.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No menu items found.
                </p>
              ) : (
                popularItems.map((dish) => (
                  <div key={dish.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-foreground truncate">{dish.name}</h4>
                      <p className="text-[11px] text-muted-foreground">{dish.category}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-foreground">
                        {formatCurrency(dish.price)}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {dish._count.orderItems} orders
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
