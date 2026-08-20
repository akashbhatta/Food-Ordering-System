import Image from "next/image";
import Link from "next/link";
import {
  Utensils,
  Store,
  Sparkles,
  ArrowRight,
  Flame,
  Clock,
  ShieldCheck,
  Award,
  ChevronRight,
  Truck,
  HeartHandshake,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CategoryCard } from "@/components/restaurant/category-card";
import { RestaurantCard } from "@/components/restaurant/restaurant-card";
import { FoodCard } from "@/components/restaurant/food-card";
import { SearchInput } from "@/components/shared/search-input";
import { getCategories, getFeaturedRestaurants } from "@/server/db/queries/restaurant";
import { getPopularDishes } from "@/server/db/queries/menu";

// Curated fallbacks for fresh initial states before seeding
const fallbackCategories = [
  { id: "1", name: "Nepalese & Himalayan", slug: "nepalese-himalayan", image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400", count: 12 },
  { id: "2", name: "Momo Specialties", slug: "momo-dumplings", image: "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=400", count: 8 },
  { id: "3", name: "Thakali Thali Sets", slug: "thakali-thali", image: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=400", count: 6 },
  { id: "4", name: "Italian & Pizza", slug: "italian-pizza", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400", count: 8 },
  { id: "5", name: "Japanese & Ramen", slug: "japanese-ramen", image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400", count: 6 },
  { id: "6", name: "Mexican & Tacos", slug: "mexican-tacos", image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400", count: 5 },
];

const fallbackRestaurants = [
  {
    id: "r-nep1",
    name: "Himalayan Momo & Sekuwa Corner",
    slug: "himalayan-momo-sekuwa-corner",
    description: "Authentic Himalayan handcrafted Momos with spicy Timur tomato achar, charcoal-grilled Sekuwa, and fiery Newari Choila.",
    image: "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=800",
    deliveryFee: 100,
    avgDeliveryMin: 25,
    minOrderAmount: 300,
    categories: [{ id: "c-nep", name: "Nepalese & Himalayan", slug: "nepalese-himalayan" }],
    reviews: [{ rating: 5 }, { rating: 5 }, { rating: 5 }],
  },
  {
    id: "r-nep2",
    name: "Mustang Thakali Kitchen & Khaja Ghar",
    slug: "mustang-thakali-kitchen",
    description: "Authentic Mustang Thakali Thali sets with Jimbu black lentils, Himalayan goat curry, and fermented Gundruk achar.",
    image: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800",
    deliveryFee: 120,
    avgDeliveryMin: 30,
    minOrderAmount: 400,
    categories: [{ id: "c-tha", name: "Thakali Thali Sets", slug: "thakali-thali" }],
    reviews: [{ rating: 5 }, { rating: 5 }, { rating: 4 }],
  },
  {
    id: "r1",
    name: "Luigi's Artisanal Pizza",
    slug: "luigis-artisanal-pizza",
    description: "Authentic Neapolitan wood-fired pizzas handcrafted with imported San Marzano tomatoes and buffalo mozzarella.",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
    deliveryFee: 150,
    avgDeliveryMin: 25,
    minOrderAmount: 500,
    categories: [{ id: "c1", name: "Italian & Pizza", slug: "italian-pizza" }],
    reviews: [{ rating: 5 }, { rating: 5 }, { rating: 4 }],
  },
];

const fallbackDishes = [
  {
    id: "d-momo1",
    name: "Authentic Steamed Buff Momo (10 pcs)",
    description: "Handcrafted dumplings filled with minced buffalo meat, wild Timur pepper, ginger, garlic, and hot tomato achar.",
    price: 350,
    image: "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=600",
    category: "Momo Specialties",
    restaurant: { id: "r-nep1", name: "Himalayan Momo Corner", slug: "himalayan-momo-sekuwa-corner" },
    options: [{ id: "o-ach", name: "Extra Timur Dalle Achar", price: 50 }],
  },
  {
    id: "d-tha1",
    name: "Royal Khasi (Goat) Thakali Thali Set",
    description: "Traditional Thakali platter with slow-simmered goat curry, Jimbu Kalo Daal, Rayo ko Saag, Gundruk, and ghee rice.",
    price: 550,
    image: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600",
    category: "Thakali Sets",
    restaurant: { id: "r-nep2", name: "Mustang Thakali Kitchen", slug: "mustang-thakali-kitchen" },
    options: [{ id: "o-ghee", name: "Extra Ghee Bowl", price: 60 }],
  },
  {
    id: "d-momo2",
    name: "Signature Jhol Chicken Momo (10 pcs)",
    description: "Steamed chicken dumplings submerged in warm, tangy roasted soybean, peanut, and sesame broth (Jhol).",
    price: 380,
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600",
    category: "Momo Specialties",
    restaurant: { id: "r-nep1", name: "Himalayan Momo Corner", slug: "himalayan-momo-sekuwa-corner" },
    options: [],
  },
  {
    id: "d1",
    name: "Margherita D.O.P. Pizza",
    description: "San Marzano tomatoes, buffalo mozzarella, fresh basil, extra virgin olive oil.",
    price: 850,
    image: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600",
    category: "Classic Pizzas",
    restaurant: { id: "r1", name: "Luigi's Pizza", slug: "luigis-artisanal-pizza" },
    options: [{ id: "o1", name: "Extra Mozzarella", price: 120 }],
  },
];

export default async function HomePage() {
  // Fetch real data with fallback
  const [dbCategories, dbRestaurants, dbDishes] = await Promise.all([
    getCategories(),
    getFeaturedRestaurants(6),
    getPopularDishes(6),
  ]);

  const categories = dbCategories.length > 0
    ? dbCategories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        image: c.image,
        count: c._count.restaurants,
      }))
    : fallbackCategories;

  const restaurants = dbRestaurants.length > 0 ? dbRestaurants : fallbackRestaurants;
  const popularDishes = dbDishes.length > 0
    ? dbDishes.map((d) => ({
        id: d.id,
        name: d.name,
        description: d.description,
        price: Number(d.price.toString()),
        image: d.image,
        category: d.category,
        restaurant: {
          id: d.restaurant.id,
          name: d.restaurant.name,
          slug: d.restaurant.slug,
        },
        options: d.options.map((o) => ({
          id: o.id,
          name: o.name,
          price: Number(o.price.toString()),
        })),
      }))
    : fallbackDishes;

  return (
    <div className="flex flex-col min-h-screen">
      {/* ─── 1. HERO SECTION ────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-24 md:pb-32 border-b border-border/40">
        {/* Backdrop Image & Ambient Overlays */}
        <div className="absolute inset-0 -z-10 select-none pointer-events-none overflow-hidden">
          <Image
            src="/food.png"
            alt="Food backdrop"
            fill
            priority
            quality={90}
            className="object-cover object-center opacity-85 dark:opacity-75 scale-100 transform"
          />
          {/* Subtle gradient vignette to blend edges smoothly into surrounding sections while keeping the food image prominently visible */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />
          <div className="absolute inset-0 bg-radial from-transparent via-background/10 to-background/70" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
            {/* Live Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/85 px-4 py-1.5 text-xs font-semibold text-foreground shadow-sm backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
              <span>Over 50+ Local Partner Kitchens Active Today</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1] drop-shadow-sm">
              Craving Delicious Food? <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-primary via-amber-500 to-orange-600 bg-clip-text text-transparent">
                Delivered in Minutes.
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-xl text-muted-foreground max-w-2xl leading-relaxed bg-background/60 backdrop-blur-xs rounded-xl px-3 py-1">
              Discover chef-prepared specialties, artisanal wood-fired pizzas, authentic ramen,
              and local street eats brought straight to your door.
            </p>

            {/* Search Interface */}
            <div className="w-full max-w-2xl pt-2">
              <SearchInput placeholder="Search restaurants, cuisines (e.g. Pizza, Ramen, Tacos)..." />

              {/* Popular search pills */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-border/60">
                  <Flame className="h-3.5 w-3.5 text-primary" /> Popular:
                </span>
                {["Buff Momo", "Jhol Momo", "Thakali Thali", "Sekuwa", "Pizza", "Ramen", "Street Tacos"].map((tag) => (
                  <Link
                    key={tag}
                    href={`/restaurants?search=${encodeURIComponent(tag)}`}
                    className="px-2.5 py-1 rounded-full border border-border/80 bg-background/80 hover:bg-primary/10 hover:text-primary hover:border-primary/40 backdrop-blur-sm transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="pt-8 grid grid-cols-3 gap-4 sm:gap-8 w-full max-w-2xl">
              <div className="rounded-2xl py-3 px-4 bg-background/80 backdrop-blur-md border border-border/60 shadow-sm">
                <div className="text-2xl sm:text-3xl font-extrabold text-foreground">25 min</div>
                <div className="text-xs text-muted-foreground mt-0.5 font-medium">Avg. Delivery Speed</div>
              </div>
              <div className="rounded-2xl py-3 px-4 bg-background/80 backdrop-blur-md border border-border/60 shadow-sm">
                <div className="text-2xl sm:text-3xl font-extrabold text-foreground">500+</div>
                <div className="text-xs text-muted-foreground mt-0.5 font-medium">Signature Dishes</div>
              </div>
              <div className="rounded-2xl py-3 px-4 bg-background/80 backdrop-blur-md border border-border/60 shadow-sm">
                <div className="text-2xl sm:text-3xl font-extrabold text-foreground">4.9 ★</div>
                <div className="text-xs text-muted-foreground mt-0.5 font-medium">Verified Reviews</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. CUISINE CATEGORIES ──────────────────────── */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1.5">
                <Utensils className="h-4 w-4" />
                <span>Explore by Flavor</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Popular Cuisines
              </h2>
            </div>
            <Link
              href="/restaurants"
              className="group hidden sm:flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              View All Cuisines
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                id={category.id}
                name={category.name}
                slug={category.slug}
                image={category.image}
                count={category.count}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3. FEATURED RESTAURANTS ─────────────────────── */}
      <section className="py-16 sm:py-20 bg-card/30 border-y border-border/60">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1.5">
                <Award className="h-4 w-4" />
                <span>Handpicked Partners</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Featured Restaurants
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Top-rated partner kitchens with highest customer satisfaction
              </p>
            </div>
            <Link href="/restaurants">
              <Button variant="outline" className="gap-2 rounded-xl">
                Browse All Restaurants
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Restaurant Grid */}
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
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. TRENDING DISHES ──────────────────────────── */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1.5">
                <Flame className="h-4 w-4" />
                <span>Trending Menu Items</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Most Popular Dishes
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Customer favorites ordered most frequently this week
              </p>
            </div>
            <Link
              href="/restaurants"
              className="group hidden sm:flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              Explore Full Menu
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Food Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularDishes.map((dish) => (
              <FoodCard
                key={dish.id}
                id={dish.id}
                name={dish.name}
                description={dish.description}
                price={Number(dish.price.toString())}
                image={dish.image}
                category={dish.category}
                restaurant={dish.restaurant}
                options={dish.options.map((opt) => ({
                  id: opt.id,
                  name: opt.name,
                  price: Number(opt.price.toString()),
                }))}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. HOW IT WORKS ─────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-card/40 border-t border-border/60">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <Badge variant="outline" className="px-3 py-1 text-xs">Simple & Seamless</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              How FeastHub Works
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Get your favorite meals from kitchen to dining table in three easy steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative p-8 rounded-2xl border border-border/60 bg-card hover:border-primary/40 transition-all text-center space-y-4">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-primary text-primary-foreground font-extrabold text-sm flex items-center justify-center shadow-md">
                1
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 mx-auto mt-2">
                <Store className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Choose Your Restaurant</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Browse hundreds of local restaurants, filtered by cuisine, rating, delivery speed, and dietary preferences.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative p-8 rounded-2xl border border-border/60 bg-card hover:border-primary/40 transition-all text-center space-y-4">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-primary text-primary-foreground font-extrabold text-sm flex items-center justify-center shadow-md">
                2
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary mx-auto mt-2">
                <Utensils className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Customize Your Order</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Select your favorite dishes, customize options, add extra toppings, and leave special notes for the kitchen.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative p-8 rounded-2xl border border-border/60 bg-card hover:border-primary/40 transition-all text-center space-y-4">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-primary text-primary-foreground font-extrabold text-sm flex items-center justify-center shadow-md">
                3
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mx-auto mt-2">
                <Truck className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Fast, Tracked Delivery</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Track your order lifecycle from kitchen preparation to your doorstep with live status timeline updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. CALL TO ACTION DUAL BANNER ───────────────── */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Customer CTA */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-amber-500 to-orange-600 p-8 sm:p-12 text-white shadow-xl flex flex-col justify-between">
              <div className="space-y-4 max-w-md">
                <Badge variant="secondary" className="bg-white/20 text-white border-none font-semibold">
                  New Customer Offer
                </Badge>
                <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                  Get Free Delivery on Your First 3 Orders!
                </h3>
                <p className="text-white/90 text-sm sm:text-base leading-relaxed">
                  Sign up today and experience the freshest flavors from Springfield&apos;s best local restaurants.
                </p>
              </div>

              <div className="pt-8">
                <Link href="/register">
                  <Button size="lg" variant="secondary" className="rounded-xl font-bold gap-2 text-foreground shadow-lg">
                    Sign Up & Order
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Restaurant Partner CTA */}
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 sm:p-12 text-card-foreground shadow-xl flex flex-col justify-between">
              <div className="space-y-4 max-w-md">
                <Badge variant="outline" className="text-xs font-semibold">
                  Partner with FeastHub
                </Badge>
                <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                  Grow Your Restaurant Sales with Us
                </h3>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  List your kitchen, reach thousands of hungry local customers, and manage incoming orders seamlessly.
                </p>
              </div>

              <div className="pt-8 flex items-center gap-4">
                <Link href="/register?role=OWNER">
                  <Button size="lg" className="rounded-xl font-bold gap-2 shadow-lg shadow-primary/25">
                    <Store className="h-4 w-4" />
                    Register Your Kitchen
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
