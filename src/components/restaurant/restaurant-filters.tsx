"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X, ArrowUpDown, Bike, Star, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface RestaurantFiltersProps {
  categories: CategoryOption[];
}

export function RestaurantFilters({ categories }: RestaurantFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("search") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentSort = searchParams.get("sort") || "";
  const currentMaxFee = searchParams.get("maxFee") || "";
  const currentRating = searchParams.get("rating") || "";
  const currentOpenNow = searchParams.get("openNow") === "true";

  const [search, setSearch] = React.useState(currentSearch);

  React.useEffect(() => {
    setSearch(currentSearch);
  }, [currentSearch]);

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    // Reset page to 1 whenever filters change
    params.delete("page");

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    router.push(`/restaurants?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: search.trim() || null });
  };

  const handleReset = () => {
    setSearch("");
    router.push("/restaurants");
  };

  const hasActiveFilters = !!(
    currentSearch ||
    currentCategory ||
    currentSort ||
    currentMaxFee ||
    currentRating ||
    currentOpenNow
  );

  return (
    <div className="space-y-4 rounded-2xl border border-border/80 bg-card p-4 sm:p-6 shadow-sm">
      {/* Top Search & Sort Row */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search restaurants, signature dishes, or cuisines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-9 h-11 rounded-xl bg-background"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                updateFilters({ search: null });
              }}
              className="absolute right-3 top-3.5 p-0.5 rounded-full text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </form>

        {/* Sort Select */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <select
              value={currentSort}
              onChange={(e) => updateFilters({ sort: e.target.value || null })}
              className="w-full h-11 px-3 py-2 text-xs font-semibold rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
            >
              <option value="">Sort: Recommended</option>
              <option value="rating_desc">Highest Rated (5.0★)</option>
              <option value="delivery_asc">Lowest Delivery Fee</option>
              <option value="min_order_asc">Lowest Minimum Order</option>
              <option value="name_asc">Alphabetical (A-Z)</option>
            </select>
          </div>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-11 px-3 text-xs gap-1 text-muted-foreground hover:text-destructive shrink-0"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="pt-2 border-t border-border/40">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
          <span className="text-muted-foreground uppercase tracking-wider text-[10px] mr-2 shrink-0 flex items-center gap-1">
            <SlidersHorizontal className="h-3 w-3" /> Cuisines:
          </span>

          <button
            type="button"
            onClick={() => updateFilters({ category: null })}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
              !currentCategory
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border border-border bg-background hover:bg-muted text-muted-foreground"
            }`}
          >
            All Cuisines
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() =>
                updateFilters({ category: currentCategory === cat.slug ? null : cat.slug })
              }
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                currentCategory === cat.slug
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-border bg-background hover:bg-muted text-muted-foreground"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Delivery Fee, Rating & Open Status Filter Row */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
        {/* Delivery fee */}
        <span className="text-muted-foreground uppercase tracking-wider text-[10px] flex items-center gap-1 mr-1">
          <Bike className="h-3 w-3 text-primary" /> Delivery:
        </span>

        <button
          type="button"
          onClick={() => updateFilters({ maxFee: currentMaxFee === "0" ? null : "0" })}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            currentMaxFee === "0"
              ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 font-semibold"
              : "bg-muted/50 hover:bg-muted text-muted-foreground"
          }`}
        >
          Free Delivery
        </button>

        <button
          type="button"
          onClick={() => updateFilters({ maxFee: currentMaxFee === "3.00" ? null : "3.00" })}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            currentMaxFee === "3.00"
              ? "bg-primary/20 text-primary border border-primary/40 font-semibold"
              : "bg-muted/50 hover:bg-muted text-muted-foreground"
          }`}
        >
          Under $3
        </button>

        {/* Rating filters */}
        <span className="text-muted-foreground uppercase tracking-wider text-[10px] flex items-center gap-1 ml-2 mr-1">
          <Star className="h-3 w-3 text-amber-500" /> Rating:
        </span>

        <button
          type="button"
          onClick={() => updateFilters({ rating: currentRating === "4.5" ? null : "4.5" })}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            currentRating === "4.5"
              ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40 font-semibold"
              : "bg-muted/50 hover:bg-muted text-muted-foreground"
          }`}
        >
          4.5+ ★
        </button>

        <button
          type="button"
          onClick={() => updateFilters({ rating: currentRating === "4.0" ? null : "4.0" })}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            currentRating === "4.0"
              ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40 font-semibold"
              : "bg-muted/50 hover:bg-muted text-muted-foreground"
          }`}
        >
          4.0+ ★
        </button>

        {/* Open Now filter */}
        <button
          type="button"
          onClick={() => updateFilters({ openNow: currentOpenNow ? null : "true" })}
          className={`ml-auto px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
            currentOpenNow
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-muted/50 hover:bg-muted text-muted-foreground"
          }`}
        >
          <Clock className="h-3 w-3" />
          Open Now
        </button>
      </div>
    </div>
  );
}
