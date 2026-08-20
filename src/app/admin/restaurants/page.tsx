import { requireAdmin } from "@/server/auth/guards";
import { getAdminRestaurants } from "@/server/db/queries/admin";
import { Store, Search, MapPin, Phone, Mail, ExternalLink, UtensilsCrossed } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { RestaurantStatusActions } from "@/components/admin/restaurant-status-actions";
import Link from "next/link";

export default async function AdminRestaurantsPage({
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
  const { restaurants, pagination } = await getAdminRestaurants({
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
              Partner Network
            </span>
            <Badge variant="secondary">
              {pagination.total} total {pagination.total === 1 ? "restaurant" : "restaurants"}
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Restaurants & Store Approvals
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Review new partner applications, manage approval statuses, and verify kitchen compliance.
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
              placeholder="Search by restaurant name, city, or email..."
              className="pl-9 h-9 text-xs rounded-xl"
            />
          </div>

          <select
            name="status"
            defaultValue={status || ""}
            className="h-9 rounded-xl border border-input bg-background px-3 text-xs w-full sm:w-44"
          >
            <option value="">All Statuses</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending Review</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <Button type="submit" size="sm" className="h-9 rounded-xl text-xs font-bold px-4">
            Filter
          </Button>

          {(search || status) && (
            <Link href="/admin/restaurants">
              <Button type="button" variant="ghost" size="sm" className="h-9 rounded-xl text-xs">
                Clear
              </Button>
            </Link>
          )}
        </form>
      </Card>

      {/* Restaurants Table */}
      <Card className="border-border/60 bg-card rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border/60 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="p-4 pl-6">Restaurant Name</th>
                <th className="p-4">Owner / Contact</th>
                <th className="p-4">Approval Status</th>
                <th className="p-4">Menu & Orders</th>
                <th className="p-4">Delivery Fee</th>
                <th className="p-4 pr-6 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {restaurants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No restaurants found matching your criteria.
                  </td>
                </tr>
              ) : (
                restaurants.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/restaurants/${r.slug}`}
                            target="_blank"
                            className="font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1"
                          >
                            {r.name} <ExternalLink className="h-3 w-3 text-muted-foreground" />
                          </Link>
                        </div>
                        <p className="text-muted-foreground text-[11px]">
                          {r.city}, {r.state}
                        </p>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-foreground block">{r.owner.name}</span>
                        <span className="text-[11px] text-muted-foreground block">{r.email}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold ${
                          r.status === "APPROVED"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-none"
                            : r.status === "PENDING"
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-none"
                            : r.status === "SUSPENDED"
                            ? "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-none"
                            : "bg-destructive/15 text-destructive border-none"
                        }`}
                      >
                        {r.status}
                      </Badge>
                    </td>

                    <td className="p-4 text-muted-foreground">
                      <span>{r._count.menuItems} dishes • {r._count.orders} orders</span>
                    </td>

                    <td className="p-4 font-semibold text-foreground">
                      {Number(r.deliveryFee.toString()) === 0 ? "Free" : formatCurrency(r.deliveryFee)}
                    </td>

                    <td className="p-4 pr-6 text-right">
                      <RestaurantStatusActions
                        restaurantId={r.id}
                        restaurantName={r.name}
                        currentStatus={r.status}
                        isActive={r.isActive}
                      />
                    </td>
                  </tr>
                ))
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
