import Link from "next/link";
import { Star, Clock, Bike, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export interface RestaurantCardProps {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string | null;
  deliveryFee: number | string | { toString(): string };
  avgDeliveryMin: number;
  minOrderAmount?: number | string | { toString(): string };
  categories?: { id: string; name: string; slug: string }[];
  reviews?: { rating: number }[];
  _count?: {
    reviews?: number;
    menuItems?: number;
  };
}

export function RestaurantCard({
  name,
  slug,
  description,
  image,
  deliveryFee,
  avgDeliveryMin,
  minOrderAmount,
  categories = [],
  reviews = [],
  _count,
}: RestaurantCardProps) {
  // Calculate average rating
  const reviewCount = _count?.reviews ?? reviews.length;
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : "4.8"; // Default curated rating if fresh

  const feeNumeric = typeof deliveryFee === "number" ? deliveryFee : Number(deliveryFee.toString());

  return (
    <Link href={`/restaurants/${slug}`} className="group block select-none">
      <Card className="overflow-hidden border-border/60 bg-card transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:-translate-y-1">
        {/* Cover Image Container */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-amber-500/10 text-muted-foreground">
              <span className="text-sm font-semibold">{name}</span>
            </div>
          )}

          {/* Top-Right: Rating Badge */}
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-xs font-bold text-foreground shadow-md backdrop-blur-md">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>{avgRating}</span>
            {reviewCount > 0 && (
              <span className="text-[10px] text-muted-foreground font-normal">
                ({reviewCount})
              </span>
            )}
          </div>

          {/* Bottom-Left: Delivery Time */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-lg bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground shadow-md backdrop-blur-md">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>{avgDeliveryMin}-{avgDeliveryMin + 10} min</span>
          </div>
        </div>

        {/* Card Content */}
        <CardContent className="p-4 space-y-2.5">
          {/* Restaurant Title & Categories */}
          <div>
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold text-base text-foreground tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                {name}
              </h3>
            </div>

            {/* Category Tags */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {categories.slice(0, 2).map((cat) => (
                  <span
                    key={cat.id}
                    className="inline-block text-[11px] font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {description}
          </p>

          {/* Footer Metrics (Delivery Fee & Minimum Order) */}
          <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1 font-medium text-foreground">
              <Bike className="h-3.5 w-3.5 text-primary" />
              <span>
                {feeNumeric === 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Free Delivery</span>
                ) : (
                  `${formatCurrency(feeNumeric)} Delivery`
                )}
              </span>
            </div>

            {minOrderAmount !== undefined && (
              <div className="text-[11px]">
                Min. {formatCurrency(minOrderAmount)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
