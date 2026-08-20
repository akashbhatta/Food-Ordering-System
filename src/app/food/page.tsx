import { getFoodCatalog } from "@/server/db/queries/menu";
import { getCategories } from "@/server/db/queries/restaurant";
import { FoodCard } from "@/components/restaurant/food-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { Utensils, Flame, Search, X, ChevronLeft, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default async function FoodCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    category?: string;
    cuisine?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: "price_asc" | "price_desc" | "name_asc" | "popular_desc" | "newest";
    available?: string;
    page?: string;
  }>;
}) {
  const { search, category, cuisine, minPrice, maxPrice, sort, available, page = "1" } = await searchParams;
  const pageNumber = parseInt(page, 10) || 1;

  const [{ dishes, pagination }, categories] = await Promise.all([
    getFoodCatalog({
      searchQuery: search,
      category,
      cuisineSlug: cuisine,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      sortBy: sort,
      isAvailable: available === "true" ? true : undefined,
      page: pageNumber,
      limit: 12,
    }),
    getCategories(),
  ]);

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Back Link */}
      <div className="mb-4">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8 space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Flame className="h-3.5 w-3.5 text-primary" />
            Menu Discovery
          </Badge>
          {category && <Badge variant="secondary">{category}</Badge>}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          {search ? `Dishes matching "${search}"` : category ? `${category} Specialties` : "All Dishes & Menu Items"}
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Showing {pagination.total} chef-prepared dishes available across partner restaurants in Springfield, OR.
        </p>

        {/* Search, Filter & Sort Toolbar */}
        <div className="p-4 rounded-2xl border border-border/80 bg-card space-y-3 shadow-sm">
          <form method="GET" className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="search"
                defaultValue={search || ""}
                placeholder="Search food titles, ingredients, or descriptions..."
                className="pl-10 h-10 rounded-xl text-xs bg-background"
              />
            </div>

            <select
              name="sort"
              defaultValue={sort || ""}
              className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-semibold w-full sm:w-48"
            >
              <option value="">Sort: Featured</option>
              <option value="popular_desc">Most Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
            </select>

            <Button type="submit" size="sm" className="h-10 rounded-xl text-xs font-bold px-4">
              Search Food
            </Button>

            {(search || sort || category || cuisine) && (
              <Link href="/food">
                <Button type="button" variant="ghost" size="sm" className="h-10 rounded-xl text-xs">
                  Reset
                </Button>
              </Link>
            )}
          </form>

          {/* Cuisine Pill Quick Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-border/40 pb-1 no-scrollbar">
            <Link
              href="/food"
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                !cuisine && !category
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-border bg-background hover:bg-muted text-muted-foreground"
              }`}
            >
              All Specialties
            </Link>

            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/food?cuisine=${c.slug}`}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  cuisine === c.slug
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border bg-background hover:bg-muted text-muted-foreground"
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Food Grid */}
      {dishes.length === 0 ? (
        <EmptyState
          icon={Utensils}
          title="No food items found"
          description="We couldn't find any dishes matching your query. Try clearing your filters or exploring our restaurant menus."
          actionLabel="View All Dishes"
          actionHref="/food"
        />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {dishes.map((dish) => (
              <div key={dish.id} className="relative">
                <FoodCard
                  id={dish.id}
                  name={dish.name}
                  description={dish.description}
                  price={Number(dish.price.toString())}
                  image={dish.image}
                  category={dish.category}
                  restaurant={dish.restaurant}
                  options={dish.options.map((o) => ({
                    id: o.id,
                    name: o.name,
                    price: Number(o.price.toString()),
                  }))}
                />
                <div className="mt-1 flex justify-end">
                  <Link
                    href={`/food/${dish.id}`}
                    className="text-[11px] font-semibold text-primary hover:underline"
                  >
                    View Details & Customization →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <PaginationControls
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
          />
        </div>
      )}
    </div>
  );
}
