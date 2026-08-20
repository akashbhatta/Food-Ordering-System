import { requireAdmin } from "@/server/auth/guards";
import { getAdminOverviewMetrics } from "@/server/db/queries/admin";
import Link from "next/link";
import {
  Users,
  Store,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  Shield,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/lib/constants";

export default async function AdminOverviewPage() {
  await requireAdmin({ redirectTo: "/login" });
  const metrics = await getAdminOverviewMetrics();

  if (!metrics) {
    return (
      <div className="p-12 text-center border border-dashed rounded-3xl">
        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
        <h2 className="text-xl font-bold">Unable to load metrics</h2>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-destructive">
              System Administration
            </span>
            <Badge variant="outline" className="text-[10px]">
              Production Cluster
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Platform Overview
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time platform activity, financial summary, and moderation queues.
          </p>
        </div>

        {metrics.pendingApprovalRestaurants > 0 && (
          <Link href="/admin/restaurants?status=PENDING">
            <Button size="sm" variant="destructive" className="rounded-xl text-xs gap-1.5 font-bold shadow-md">
              <AlertTriangle className="h-4 w-4" />
              {metrics.pendingApprovalRestaurants} Pending Restaurant Approvals
            </Button>
          </Link>
        )}
      </div>

      {/* ─── 1. CORE PLATFORM KPIS ────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
            <p className="text-[11px] text-muted-foreground">From delivered orders</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card rounded-3xl shadow-sm">
          <CardContent className="p-5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Total Orders</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShoppingBag className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-foreground">
              {metrics.totalOrders}
            </div>
            <p className="text-[11px] text-muted-foreground">Placed all-time</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card rounded-3xl shadow-sm">
          <CardContent className="p-5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Registered Users</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-foreground">
              {metrics.totalUsers}
            </div>
            <p className="text-[11px] text-muted-foreground">Customers & Owners</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card rounded-3xl shadow-sm">
          <CardContent className="p-5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Partner Kitchens</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
                <Store className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-foreground">
              {metrics.totalRestaurants}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {metrics.restaurantStatusMap.APPROVED || 0} active & approved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ─── 2. RESTAURANT MODERATION STATUS COUNTERS ─────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href="/admin/restaurants?status=APPROVED" className="block">
          <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15 transition-all">
            <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Approved</div>
            <div className="text-xl font-black text-foreground">{metrics.restaurantStatusMap.APPROVED || 0}</div>
          </div>
        </Link>

        <Link href="/admin/restaurants?status=PENDING" className="block">
          <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/15 transition-all">
            <div className="text-xs font-bold text-amber-700 dark:text-amber-400">Pending Review</div>
            <div className="text-xl font-black text-foreground">{metrics.restaurantStatusMap.PENDING || 0}</div>
          </div>
        </Link>

        <Link href="/admin/restaurants?status=SUSPENDED" className="block">
          <div className="p-4 rounded-2xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/15 transition-all">
            <div className="text-xs font-bold text-purple-700 dark:text-purple-400">Suspended</div>
            <div className="text-xl font-black text-foreground">{metrics.restaurantStatusMap.SUSPENDED || 0}</div>
          </div>
        </Link>

        <Link href="/admin/restaurants?status=REJECTED" className="block">
          <div className="p-4 rounded-2xl border border-destructive/30 bg-destructive/10 hover:bg-destructive/15 transition-all">
            <div className="text-xs font-bold text-destructive">Rejected</div>
            <div className="text-xl font-black text-foreground">{metrics.restaurantStatusMap.REJECTED || 0}</div>
          </div>
        </Link>
      </div>

      {/* ─── 3. RECENT PLATFORM ORDERS & USERS ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Recent Platform Orders */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-primary" />
              Recent Platform Orders
            </h2>
            <Link href="/admin/orders" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              View All Orders <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <Card className="border-border/60 bg-card rounded-3xl overflow-hidden shadow-sm">
            <CardContent className="p-0 divide-y divide-border/40">
              {metrics.recentOrders.map((order) => {
                const statusConfig = ORDER_STATUS_COLORS[order.status] || {
                  bg: "bg-muted",
                  text: "text-muted-foreground",
                  border: "border-border",
                };

                return (
                  <div key={order.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="space-y-1">
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
                      <p className="text-xs text-muted-foreground">
                        <strong className="text-foreground">{order.restaurant.name}</strong> • {order.user.name || order.user.email}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-extrabold text-sm text-foreground">
                        {formatCurrency(order.total)}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Recent Registered Accounts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Latest Registrations
            </h2>
            <Link href="/admin/users" className="text-xs font-bold text-primary hover:underline">
              Manage Users
            </Link>
          </div>

          <Card className="border-border/60 bg-card rounded-3xl overflow-hidden shadow-sm">
            <CardContent className="p-4 divide-y divide-border/40">
              {metrics.recentUsers.map((u) => (
                <div key={u.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-foreground truncate">{u.name}</h4>
                      {u.isBanned && (
                        <Badge variant="destructive" className="text-[9px] px-1 py-0 h-3.5">
                          Banned
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">{u.email}</p>
                  </div>

                  <Badge variant="outline" className="text-[10px] capitalize shrink-0">
                    {u.role.toLowerCase().replace(/_/g, " ")}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
