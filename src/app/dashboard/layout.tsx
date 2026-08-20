import { requireOwner } from "@/server/auth/guards";
import { db } from "@/server/db";
import Link from "next/link";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  Settings,
  Store,
  ExternalLink,
  ChefHat,
  Clock,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireOwner({ redirectTo: "/dashboard" });

  const restaurant = await db.restaurant.findUnique({
    where: { ownerId: user.id },
    select: { id: true, name: true, slug: true, status: true, isActive: true },
  });

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row">
      {/* Sidebar (Desktop) */}
      <aside className="w-full md:w-64 lg:w-72 bg-card border-r border-border/80 flex flex-col justify-between shrink-0 p-6 space-y-6">
        <div className="space-y-6">
          {/* Restaurant Profile Badge */}
          <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">
                  <Store className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-xs text-foreground truncate">
                    {restaurant?.name || "My Kitchen"}
                  </h3>
                  <span className="text-[10px] text-muted-foreground">Partner Portal</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 pt-1">
              <Badge
                variant="outline"
                className={`text-[9px] px-1.5 py-0 h-4 border-none font-bold ${
                  restaurant?.isActive
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-500/15 text-amber-600"
                }`}
              >
                {restaurant?.isActive ? "● Live & Accepting Orders" : "● Offline / Paused"}
              </Badge>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-sm font-medium">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-foreground hover:bg-muted/70 hover:text-primary transition-colors"
            >
              <LayoutDashboard className="h-4 w-4 text-primary" />
              Overview
            </Link>

            <Link
              href="/dashboard/orders"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-foreground hover:bg-muted/70 hover:text-primary transition-colors"
            >
              <ShoppingBag className="h-4 w-4 text-primary" />
              Kitchen Orders
            </Link>

            <Link
              href="/dashboard/menu"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-foreground hover:bg-muted/70 hover:text-primary transition-colors"
            >
              <UtensilsCrossed className="h-4 w-4 text-primary" />
              Menu & Dishes
            </Link>

            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-foreground hover:bg-muted/70 hover:text-primary transition-colors"
            >
              <Settings className="h-4 w-4 text-primary" />
              Store Settings
            </Link>
          </nav>
        </div>

        {/* View Public Storefront Link */}
        {restaurant?.slug && (
          <div className="pt-4 border-t border-border/60">
            <Link
              href={`/restaurants/${restaurant.slug}`}
              target="_blank"
              className="flex items-center justify-between p-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold transition-colors"
            >
              <span className="flex items-center gap-2">
                <Store className="h-3.5 w-3.5" />
                View Customer Store
              </span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
