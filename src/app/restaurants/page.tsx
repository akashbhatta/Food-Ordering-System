import { getApprovedRestaurants, getCategories } from "@/server/db/queries/restaurant";
import { RestaurantCard } from "@/components/restaurant/restaurant-card";
import { RestaurantFilters } from "@/components/restaurant/restaurant-filters";
import { EmptyState } from "@/components/shared/empty-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { Utensils, Compass } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function RestaurantsBrowsePage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    category?: string;
    sort?: "rating_desc" | "delivery_asc" | "min_order_asc" | "name_asc";
    maxFee?: string;
    rating?: string;
    openNow?: string;
    page?: string;
  }>;
}) {
  const { search, category, sort, maxFee, rating, openNow, page = "1" } = await searchParams;
  const pageNumber = parseInt(page, 10) || 1;

  const [{ restaurants, pagination }, categories] = await Promise.all([
    getApprovedRestaurants({
      searchQuery: search,
      categorySlug: category,
      sortBy: sort,
      maxDeliveryFee: maxFee !== undefined ? parseFloat(maxFee) : undefined,
      minRating: rating ? parseFloat(rating) : undefined,
      isOpenOnly: openNow === "true",
      page: pageNumber,
      limit: 9,
    }),
    getCategories(),
  ]);

  const activeCategory = categories.find((c) => c.slug === category);

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Compass className="h-3.5 w-3.5 text-primary" />
            Discovery
          </Badge>
          {activeCategory && (
            <Badge variant="secondary">{activeCategory.name}</Badge>
          )}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          {activeCategory
            ? `${activeCategory.name} Restaurants`
            : search
            ? `Search Results for "${search}"`
            : "Explore Partner Restaurants"}
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Showing {pagination.total} {pagination.total === 1 ? "kitchen" : "kitchens"} delivering to Springfield, OR.
        </p>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="mb-8">
        <RestaurantFilters categories={categories} />
      </div>

      {/* Restaurants Grid */}
      {restaurants.length === 0 ? (
        <EmptyState
          icon={Utensils}
          title="No restaurants found"
          description="We couldn't find any partner restaurants matching your filter criteria. Try searching for a different dish or clearing your filters."
          actionLabel="View All Restaurants"
          actionHref="/restaurants"
        />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                id={restaurant.id}
                name={restaurant.name}
                slug={restaurant.slug}
                description={restaurant.description}
                image={restaurant.image}
                deliveryFee={restaurant.deliveryFee}
                avgDeliveryMin={restaurant.avgDeliveryMin}
                minOrderAmount={restaurant.minOrderAmount}
                categories={restaurant.categories}
                reviews={restaurant.reviews}
                _count={restaurant._count}
              />
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
