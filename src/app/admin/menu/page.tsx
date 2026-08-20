import { requireAdmin } from "@/server/auth/guards";
import { getAdminMenuItems } from "@/server/db/queries/admin";
import { UtensilsCrossed, Search, Store, Sparkles, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { PaginationControls } from "@/components/shared/pagination-controls";
import Link from "next/link";

export default async function AdminMenuPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    category?: string;
    page?: string;
  }>;
}) {
  await requireAdmin({ redirectTo: "/login" });
  const { search, category, page = "1" } = await searchParams;

  const pageNumber = parseInt(page, 10) || 1;
  const { items, pagination } = await getAdminMenuItems({
    search,
    category,
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
              Platform Catalog
            </span>
            <Badge variant="secondary">
              {pagination.total} total {pagination.total === 1 ? "dish" : "dishes"}
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Global Menu Items
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit dishes across all partner restaurants, check pricing consistency, and inspect customizations.
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
              placeholder="Search dishes or restaurant name..."
              className="pl-9 h-9 text-xs rounded-xl"
            />
          </div>

          <Button type="submit" size="sm" className="h-9 rounded-xl text-xs font-bold px-4">
            Filter
          </Button>

          {(search || category) && (
            <Link href="/admin/menu">
              <Button type="button" variant="ghost" size="sm" className="h-9 rounded-xl text-xs">
                Clear
              </Button>
            </Link>
          )}
        </form>
      </Card>

      {/* Menu Table */}
      <Card className="border-border/60 bg-card rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border/60 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="p-4 pl-6">Dish Name</th>
                <th className="p-4">Restaurant</th>
                <th className="p-4">Category</th>
                <th className="p-4">Base Price</th>
                <th className="p-4">Customizations</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Preview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No dishes found matching your search.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-10 w-10 rounded-lg object-cover border border-border/60 shrink-0"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground font-bold shrink-0">
                            🍲
                          </div>
                        )}
                        <span className="font-bold text-foreground">{item.name}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <Link
                        href={`/restaurants/${item.restaurant.slug}`}
                        className="font-semibold text-foreground hover:underline"
                      >
                        {item.restaurant.name}
                      </Link>
                    </td>

                    <td className="p-4">
                      <Badge variant="outline" className="text-[10px]">
                        {item.category}
                      </Badge>
                    </td>

                    <td className="p-4 font-black text-foreground">
                      {formatCurrency(item.price)}
                    </td>

                    <td className="p-4 text-muted-foreground">
                      {item.options.length > 0 ? (
                        <span className="flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-amber-500" />
                          {item.options.length} options
                        </span>
                      ) : (
                        "Standard"
                      )}
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          item.isAvailable
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                            : "bg-destructive/15 text-destructive"
                        }`}
                      >
                        {item.isAvailable ? "● Available" : "● Sold Out"}
                      </span>
                    </td>

                    <td className="p-4 pr-6 text-right">
                      <Link href={`/food/${item.id}`} target="_blank">
                        <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
                          View <ExternalLink className="h-3 w-3" />
                        </Button>
                      </Link>
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
