import { requireOwner } from "@/server/auth/guards";
import { getOwnerMenuItems } from "@/server/db/queries/dashboard";
import Link from "next/link";
import { UtensilsCrossed, Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MenuItemRow } from "@/components/dashboard/menu-item-row";

export default async function DashboardMenuPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const user = await requireOwner({ redirectTo: "/dashboard/menu" });
  const { category } = await searchParams;

  const { restaurant, items, categories } = await getOwnerMenuItems(user.id);

  const filteredItems = category
    ? items.filter((i) => i.category === category)
    : items;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Menu Management
            </span>
            <Badge variant="secondary">
              {items.length} {items.length === 1 ? "dish" : "dishes"}
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Dishes & Customizations
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Add new food items, update pricing, customize options, and toggle stock availability.
          </p>
        </div>

        <Link href="/dashboard/menu/new">
          <Button className="rounded-xl text-xs font-bold gap-1.5 shadow-sm">
            <Plus className="h-4 w-4" />
            Add New Dish
          </Button>
        </Link>
      </div>

      {/* Category Pills Filter */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 border-b border-border/60 pb-3 overflow-x-auto">
          <Link href="/dashboard/menu">
            <Button
              size="sm"
              variant={!category ? "default" : "outline"}
              className="rounded-xl text-xs font-bold"
            >
              All Categories ({items.length})
            </Button>
          </Link>

          {categories.map((cat) => {
            const count = items.filter((i) => i.category === cat).length;
            const isSelected = category === cat;

            return (
              <Link key={cat} href={`/dashboard/menu?category=${encodeURIComponent(cat)}`}>
                <Button
                  size="sm"
                  variant={isSelected ? "default" : "outline"}
                  className="rounded-xl text-xs font-bold whitespace-nowrap"
                >
                  {cat} ({count})
                </Button>
              </Link>
            );
          })}
        </div>
      )}

      {/* Dishes List */}
      {filteredItems.length === 0 ? (
        <Card className="border-dashed p-12 text-center rounded-3xl">
          <UtensilsCrossed className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-base font-bold text-foreground">No dishes found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {category
              ? `No dishes found under category "${category}".`
              : "Your menu is currently empty. Add your first delicious dish to get started!"}
          </p>
          <Link href="/dashboard/menu/new">
            <Button className="mt-4 rounded-xl text-xs font-bold gap-1.5">
              <Plus className="h-4 w-4" />
              Add Dish
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <MenuItemRow
              key={item.id}
              item={{
                ...item,
                price: Number(item.price.toString()),
                options: item.options.map((opt) => ({
                  ...opt,
                  price: Number(opt.price.toString()),
                })),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
