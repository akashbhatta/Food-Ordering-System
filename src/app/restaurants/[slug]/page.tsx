import { notFound } from "next/navigation";
import Link from "next/link";
import { getRestaurantBySlug } from "@/server/db/queries/restaurant";
import { getCurrentUser } from "@/server/auth/session";
import { FoodCard } from "@/components/restaurant/food-card";
import { OwnerReplyForm } from "@/components/review/owner-reply-form";
import {
  Star,
  Clock,
  Bike,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  ChevronLeft,
  MessageSquare,
  Calendar,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";

// Day of week name helper
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getCurrentUser();
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant) {
    notFound();
  }

  // Calculate average rating
  const avgRating =
    restaurant.reviews.length > 0
      ? (
          restaurant.reviews.reduce((acc, r) => acc + r.rating, 0) /
          restaurant.reviews.length
        ).toFixed(1)
      : "5.0";

  // Group menu items by category
  const menuByCategory = restaurant.menuItems.reduce((acc, item) => {
    const cat = item.category || "General Menu";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, typeof restaurant.menuItems>);

  const categories = Object.keys(menuByCategory);
  const currentDayIndex = new Date().getDay();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Back Navigation Bar */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <Link href="/restaurants" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Back to all restaurants
        </Link>
      </div>

      {/* ─── 1. RESTAURANT HERO COVER ───────────────────── */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden rounded-3xl border border-border bg-muted shadow-lg">
          {restaurant.coverImage || restaurant.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={restaurant.coverImage || restaurant.image || ""}
              alt={restaurant.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-r from-primary/20 via-amber-500/20 to-orange-500/20">
              <UtensilsCrossed className="h-16 w-16 text-muted-foreground" />
            </div>
          )}

          {/* Dark Gradient Overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Info Overlaid on Hero */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                {restaurant.categories.map((cat) => (
                  <Badge key={cat.id} variant="secondary" className="bg-white/20 text-white border-none font-medium backdrop-blur-md">
                    {cat.name}
                  </Badge>
                ))}
                <span className="flex items-center gap-1 bg-amber-500 text-black font-extrabold text-xs px-2.5 py-0.5 rounded-full shadow-md">
                  <Star className="h-3 w-3 fill-black" />
                  {avgRating} ({restaurant._count.reviews} reviews)
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight drop-shadow-sm">
                {restaurant.name}
              </h1>

              <p className="text-xs sm:text-sm text-white/80 line-clamp-2">
                {restaurant.description}
              </p>
            </div>

            {/* Quick Metrics Badge Container */}
            <div className="flex items-center gap-2 shrink-0 bg-background/90 text-foreground p-3 rounded-2xl shadow-xl backdrop-blur-md border border-border">
              <div className="text-center px-2 border-r border-border">
                <div className="flex items-center justify-center gap-1 text-xs font-bold">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  {restaurant.avgDeliveryMin} min
                </div>
                <div className="text-[10px] text-muted-foreground">Delivery</div>
              </div>

              <div className="text-center px-2">
                <div className="flex items-center justify-center gap-1 text-xs font-bold">
                  <Bike className="h-3.5 w-3.5 text-primary" />
                  {formatCurrency(restaurant.deliveryFee)}
                </div>
                <div className="text-[10px] text-muted-foreground">Fee</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. MAIN LAYOUT: MENU & INFO SIDEBAR ──────────── */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* LEFT 3 COLS: MENU CATEGORIES & ITEMS */}
          <div className="lg:col-span-3 space-y-10">
            {/* Sticky Category Jump Navigation */}
            {categories.length > 1 && (
              <div className="sticky top-16 z-30 flex items-center gap-2 overflow-x-auto py-3 bg-background/95 backdrop-blur-md border-b border-border/60 no-scrollbar">
                {categories.map((category) => (
                  <a
                    key={category}
                    href={`#cat-${category.toLowerCase().replace(/\s+/g, "-")}`}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted bg-card border border-border/60 whitespace-nowrap transition-colors"
                  >
                    {category} ({menuByCategory[category].length})
                  </a>
                ))}
              </div>
            )}

            {/* Categorized Menu Lists */}
            {categories.length === 0 ? (
              <div className="p-12 text-center border border-dashed rounded-2xl text-muted-foreground">
                This restaurant is currently preparing its menu. Please check back shortly!
              </div>
            ) : (
              categories.map((category) => (
                <div
                  key={category}
                  id={`cat-${category.toLowerCase().replace(/\s+/g, "-")}`}
                  className="space-y-4 scroll-mt-28"
                >
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                      {category}
                    </h2>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {menuByCategory[category].length} items
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {menuByCategory[category].map((dish) => (
                      <div key={dish.id} className="relative">
                        <FoodCard
                          id={dish.id}
                          name={dish.name}
                          description={dish.description}
                          price={Number(dish.price.toString())}
                          image={dish.image}
                          category={dish.category}
                          options={dish.options.map((opt) => ({
                            id: opt.id,
                            name: opt.name,
                            price: Number(opt.price.toString()),
                          }))}
                          restaurant={{
                            id: restaurant.id,
                            name: restaurant.name,
                            slug: restaurant.slug,
                          }}
                        />
                        {/* Food Detail link overlay */}
                        <div className="mt-1 flex justify-end">
                          <Link
                            href={`/food/${dish.id}`}
                            className="text-[11px] font-semibold text-primary hover:underline"
                          >
                            View Dish Details →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}

            {/* ─── CUSTOMER REVIEWS SECTION ─────────────── */}
            <div className="pt-8 border-t border-border space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">Customer Reviews</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Verified ratings from customers who ordered from {restaurant.name}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-xl font-bold text-sm">
                  <Star className="h-4 w-4 fill-amber-400" />
                  {avgRating} Average Rating
                </div>
              </div>

              {restaurant.reviews.length === 0 ? (
                <div className="p-8 text-center border border-dashed rounded-2xl text-muted-foreground text-sm">
                  No reviews yet. Be the first to order and leave a review!
                </div>
              ) : (
                <div className="space-y-4">
                  {restaurant.reviews.map((rev) => (
                    <Card key={rev.id} className="border-border/60 bg-card">
                      <CardContent className="p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                              {rev.user.name ? rev.user.name[0].toUpperCase() : "U"}
                            </div>
                            <div>
                              <span className="font-semibold text-sm text-foreground">{rev.user.name}</span>
                              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {formatDate(rev.createdAt)}
                              </div>
                            </div>
                          </div>

                          {/* Stars */}
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${
                                  i < rev.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-muted-foreground/30"
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {rev.comment && (
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            {rev.comment}
                          </p>
                        )}

                        {/* Owner Reply */}
                        {rev.reply ? (
                          <div className="p-3 rounded-xl border border-border/80 bg-muted/40 space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                              <MessageSquare className="h-3.5 w-3.5 text-primary" />
                              <span>Response from {restaurant.name}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {rev.reply.content}
                            </p>
                          </div>
                        ) : (
                          user && user.id === restaurant.ownerId && (
                            <OwnerReplyForm reviewId={rev.id} />
                          )
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT 1 COL: RESTAURANT DETAILS & HOURS */}
          <div className="space-y-6">
            {/* Location & Contact Card */}
            <Card className="border-border/60 bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Restaurant Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3.5 text-xs text-muted-foreground">
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground">Address</span>
                    <p>{restaurant.street}, {restaurant.city}, {restaurant.state} {restaurant.zipCode}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Phone className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground">Phone</span>
                    <p>{restaurant.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Mail className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground">Email</span>
                    <p>{restaurant.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <DollarSign className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground">Minimum Order</span>
                    <p>{formatCurrency(restaurant.minOrderAmount)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Operating Hours Card */}
            <Card className="border-border/60 bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Operating Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                {restaurant.operatingHours.length === 0 ? (
                  <p className="text-muted-foreground">Open Daily: 11:00 AM - 10:00 PM</p>
                ) : (
                  restaurant.operatingHours.map((h) => {
                    const isToday = h.dayOfWeek === currentDayIndex;
                    return (
                      <div
                        key={h.id}
                        className={`flex items-center justify-between p-1.5 rounded-lg ${
                          isToday ? "bg-primary/10 font-bold text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          {DAYS[h.dayOfWeek]}
                          {isToday && (
                            <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 bg-primary text-primary-foreground border-none">
                              Today
                            </Badge>
                          )}
                        </span>
                        <span>
                          {h.isClosed ? "Closed" : `${h.openTime} - ${h.closeTime}`}
                        </span>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
