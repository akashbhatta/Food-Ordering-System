import Link from "next/link";
import { Utensils, Pizza, Soup, Flame, Coffee, Beef, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  count?: number;
  isActive?: boolean;
}

// Icon mapper based on category name or slug
function getCategoryIcon(slug: string) {
  if (slug.includes("pizza") || slug.includes("italian")) return Pizza;
  if (slug.includes("ramen") || slug.includes("soup") || slug.includes("japanese")) return Soup;
  if (slug.includes("mexican") || slug.includes("taco") || slug.includes("spicy")) return Flame;
  if (slug.includes("burger") || slug.includes("grill") || slug.includes("beef")) return Beef;
  if (slug.includes("drink") || slug.includes("coffee") || slug.includes("dessert")) return Coffee;
  return Utensils;
}

export function CategoryCard({ name, slug, image, count, isActive }: CategoryCardProps) {
  const Icon = getCategoryIcon(slug);

  return (
    <Link
      href={`/restaurants?category=${slug}`}
      className={cn(
        "group relative flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 text-center select-none overflow-hidden",
        isActive
          ? "border-primary bg-primary/10 shadow-md shadow-primary/10 ring-1 ring-primary"
          : "border-border/60 bg-card hover:border-primary/40 hover:shadow-lg hover:-translate-y-1"
      )}
    >
      {/* Background ambient glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Icon or Image Avatar */}
      <div
        className={cn(
          "relative flex h-14 w-14 items-center justify-center rounded-2xl mb-3 transition-transform duration-300 group-hover:scale-110 shadow-sm",
          isActive
            ? "bg-primary text-primary-foreground shadow-primary/25"
            : "bg-muted/80 text-foreground group-hover:bg-primary/10 group-hover:text-primary"
        )}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover rounded-2xl"
          />
        ) : (
          <Icon className="h-7 w-7 transition-colors" />
        )}
      </div>

      {/* Category Name */}
      <span className="text-sm font-semibold text-foreground tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
        {name}
      </span>

      {/* Count Badge */}
      {count !== undefined && (
        <span className="text-[11px] text-muted-foreground mt-0.5 font-medium">
          {count} {count === 1 ? "place" : "places"}
        </span>
      )}
    </Link>
  );
}
