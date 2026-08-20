"use client";

import Link from "next/link";
import { Plus, Sparkles, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";

export interface FoodCardProps {
  id: string;
  name: string;
  description?: string | null;
  price: number | string;
  image?: string | null;
  category?: string;
  restaurant?: {
    id: string;
    name: string;
    slug?: string;
  };
  options?: { id: string; name: string; price: number | string }[];
}

export function FoodCard({
  id,
  name,
  description,
  price,
  image,
  category,
  restaurant,
  options = [],
}: FoodCardProps) {
  const { addItem } = useCart();
  const numericPrice = typeof price === "number" ? price : Number(price.toString());

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      menuItemId: id,
      name,
      price: numericPrice,
      quantity: 1,
      image,
      category,
      restaurantId: restaurant?.id || "r1",
      restaurantName: restaurant?.name || "Partner Restaurant",
    });
  };

  return (
    <Card className="group flex flex-col justify-between overflow-hidden border-border/60 bg-card transition-all duration-300 hover:border-primary/40 hover:shadow-lg">
      <div>
        {/* Image Container */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-amber-500/10 text-muted-foreground text-xs font-semibold p-4 text-center">
              {name}
            </div>
          )}

          {/* Category Tag */}
          {category && (
            <div className="absolute top-2.5 left-2.5">
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-foreground bg-background/90 px-2 py-0.5 rounded-md shadow-sm backdrop-blur-md">
                {category}
              </span>
            </div>
          )}

          {/* Price Badge */}
          <div className="absolute bottom-2.5 right-2.5">
            <span className="inline-block text-xs font-extrabold text-white bg-primary/95 px-2.5 py-1 rounded-lg shadow-md backdrop-blur-md">
              {formatCurrency(numericPrice)}
            </span>
          </div>
        </div>

        {/* Content Details */}
        <CardContent className="p-4 space-y-2">
          {restaurant && (
            <Link
              href={`/restaurants/${restaurant.slug || restaurant.id}`}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
            >
              <Store className="h-3 w-3" />
              {restaurant.name}
            </Link>
          )}

          <h4 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {name}
          </h4>

          {description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}

          {options.length > 0 && (
            <div className="pt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span>Customizable ({options.length} options)</span>
            </div>
          )}
        </CardContent>
      </div>

      {/* Action Footer */}
      <div className="p-4 pt-0">
        <Button
          size="sm"
          variant="outline"
          className="w-full justify-center gap-1.5 rounded-xl border-border/80 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all text-xs font-semibold cursor-pointer"
          onClick={handleAdd}
          aria-label={`Add ${name} to cart for ${formatCurrency(numericPrice)}`}
        >
          <Plus className="h-3.5 w-3.5" />
          Add to Cart
        </Button>
      </div>
    </Card>
  );
}
