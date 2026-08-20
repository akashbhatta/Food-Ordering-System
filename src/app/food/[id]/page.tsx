import { notFound } from "next/navigation";
import Link from "next/link";
import { getMenuItemById } from "@/server/db/queries/menu";
import { DishCustomizer } from "@/components/restaurant/dish-customizer";
import {
  ChevronLeft,
  Store,
  Clock,
  Bike,
  UtensilsCrossed,
  MapPin,
  Share2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export default async function FoodDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dish = await getMenuItemById(id);

  if (!dish) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Breadcrumb Navigation */}
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <Link
            href={`/restaurants/${dish.restaurant.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to {dish.restaurant.name} Menu
          </Link>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column: Dish Media */}
          <div className="space-y-4">
            <div className="relative aspect-square sm:aspect-[4/3] md:aspect-square w-full overflow-hidden rounded-3xl border border-border bg-muted shadow-lg">
              {dish.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-amber-500/10 text-muted-foreground">
                  <UtensilsCrossed className="h-16 w-16" />
                </div>
              )}

              {/* Category Pill */}
              <div className="absolute top-4 left-4">
                <Badge variant="secondary" className="bg-background/90 text-foreground font-bold shadow-md backdrop-blur-md">
                  {dish.category}
                </Badge>
              </div>
            </div>

            {/* Parent Restaurant Card Preview */}
            <Card className="border-border/60 bg-card">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <Store className="h-3.5 w-3.5 text-primary" />
                    Kitchen Origin
                  </div>
                  <Link
                    href={`/restaurants/${dish.restaurant.slug}`}
                    className="text-base font-bold text-foreground hover:text-primary transition-colors block"
                  >
                    {dish.restaurant.name}
                  </Link>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-primary" />
                      {dish.restaurant.avgDeliveryMin} mins
                    </span>
                    <span className="flex items-center gap-1">
                      <Bike className="h-3 w-3 text-primary" />
                      {formatCurrency(dish.restaurant.deliveryFee)} delivery
                    </span>
                  </div>
                </div>

                <Link href={`/restaurants/${dish.restaurant.slug}`}>
                  <Button variant="outline" size="sm" className="rounded-xl text-xs font-semibold">
                    View Full Menu
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Dish Info & Customization */}
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-baseline justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {dish.name}
                </h1>
                <span className="text-2xl font-black text-primary shrink-0">
                  {formatCurrency(dish.price)}
                </span>
              </div>

              {dish.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {dish.description}
                </p>
              )}
            </div>

            {/* Customizer Component */}
            <DishCustomizer
              dish={{
                id: dish.id,
                name: dish.name,
                price: Number(dish.price.toString()),
                image: dish.image,
                category: dish.category,
                isAvailable: dish.isAvailable,
                options: dish.options.map((opt) => ({
                  id: opt.id,
                  name: opt.name,
                  price: Number(opt.price.toString()),
                })),
                restaurant: {
                  id: dish.restaurant.id,
                  name: dish.restaurant.name,
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
