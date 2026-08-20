import { requireAdmin } from "@/server/auth/guards";
import { getAdminOrders } from "@/server/db/queries/admin";
import { ShoppingBag, Search, Store, Calendar, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/lib/constants";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { AdminOrderStatusOverride } from "@/components/admin/admin-order-status-override";
import Link from "next/link";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    status?: string;
    page?: string;
  }>;
}) {
  await requireAdmin({ redirectTo: "/login" });
  const { search, status, page = "1" } = await searchParams;

  const pageNumber = parseInt(page, 10) || 1;
  const { orders, pagination } = await getAdminOrders({
    search,
    status,
    page: pageNumber,
    limit: 10,
  });

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-destructive">
              Platform Activity
            </span>
            <Badge variant="secondary">
              {pagination.total} total {pagination.total === 1 ? "order" : "orders"}
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Platform Orders
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit system-wide customer transactions, monitor delivery statuses, and override orders.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="border-border/60 bg-card rounded-2xl p-4">
        <form method="GET" className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              name="search"
              defaultValue={search || ""}
              placeholder="Search by order number, customer name, or restaurant..."
              className="pl-9 h-9 text-xs rounded-xl"
            />
          </div>

          <select
            name="status"
            defaultValue={status || ""}
            className="h-9 rounded-xl border border-input bg-background px-3 text-xs w-full sm:w-48"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PREPARING">Preparing</option>
            <option value="READY">Ready</option>
            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <Button type="submit" size="sm" className="h-9 rounded-xl text-xs font-bold px-4">
            Filter
          </Button>

          {(search || status) && (
            <Link href="/admin/orders">
              <Button type="button" variant="ghost" size="sm" className="h-9 rounded-xl text-xs">
                Clear
              </Button>
            </Link>
          )}
        </form>
      </Card>

      {/* Orders Table */}
      <Card className="border-border/60 bg-card rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border/60 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="p-4 pl-6">Order Number</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Restaurant</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Placed At</th>
                <th className="p-4 pr-6 text-right">Status Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No orders found matching your search criteria.
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const statusConfig = ORDER_STATUS_COLORS[o.status] || {
                    bg: "bg-muted",
                    text: "text-muted-foreground",
                    border: "border-border",
                  };

                  return (
                    <tr key={o.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-4 pl-6">
                        <Link
                          href={`/orders/${o.id}`}
                          target="_blank"
                          className="font-mono font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1"
                        >
                          {o.orderNumber} <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        </Link>
                        <span className="text-[10px] text-muted-foreground">
                          {o.items.length} items
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-foreground block">{o.user.name || "Customer"}</span>
                          <span className="text-[11px] text-muted-foreground block">{o.user.email}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <Link
                          href={`/restaurants/${o.restaurant.slug}`}
                          className="font-semibold text-foreground hover:underline"
                        >
                          {o.restaurant.name}
                        </Link>
                      </td>

                      <td className="p-4 font-black text-foreground">
                        {formatCurrency(o.total)}
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                        >
                          {ORDER_STATUS_LABELS[o.status]}
                        </span>
                      </td>

                      <td className="p-4 text-muted-foreground whitespace-nowrap">
                        {formatDate(o.createdAt)}
                      </td>

                      <td className="p-4 pr-6 text-right">
                        <AdminOrderStatusOverride
                          orderId={o.id}
                          currentStatus={o.status}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 pt-0">
          <PaginationControls
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
          />
        </div>
      </Card>
    </div>
  );
}
