import { requireAdmin } from "@/server/auth/guards";
import Link from "next/link";
import {
  Shield,
  LayoutDashboard,
  Users,
  Store,
  UtensilsCrossed,
  Tags,
  ShoppingBag,
  Star,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin({ redirectTo: "/login" });

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 lg:w-72 bg-card border-r border-border/80 flex flex-col justify-between shrink-0 p-6 space-y-6">
        <div className="space-y-6">
          {/* Admin Profile Header */}
          <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive text-destructive-foreground font-bold shadow-md">
                <Shield className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-extrabold text-xs text-foreground truncate">
                  Platform Admin
                </h3>
                <span className="text-[10px] text-muted-foreground truncate block">
                  {admin.email}
                </span>
              </div>
            </div>

            <div className="pt-1">
              <Badge variant="destructive" className="text-[9px] px-2 py-0 h-4 font-bold">
                ROOT SUPERUSER ACCESS
              </Badge>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-sm font-medium">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-foreground hover:bg-muted/70 hover:text-primary transition-colors"
            >
              <LayoutDashboard className="h-4 w-4 text-primary" />
              System Overview
            </Link>

            <Link
              href="/admin/users"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-foreground hover:bg-muted/70 hover:text-primary transition-colors"
            >
              <Users className="h-4 w-4 text-primary" />
              Users & Permissions
            </Link>

            <Link
              href="/admin/restaurants"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-foreground hover:bg-muted/70 hover:text-primary transition-colors"
            >
              <Store className="h-4 w-4 text-primary" />
              Restaurants & Approvals
            </Link>

            <Link
              href="/admin/menu"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-foreground hover:bg-muted/70 hover:text-primary transition-colors"
            >
              <UtensilsCrossed className="h-4 w-4 text-primary" />
              Global Menu Catalog
            </Link>

            <Link
              href="/admin/categories"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-foreground hover:bg-muted/70 hover:text-primary transition-colors"
            >
              <Tags className="h-4 w-4 text-primary" />
              Cuisine Categories
            </Link>

            <Link
              href="/admin/orders"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-foreground hover:bg-muted/70 hover:text-primary transition-colors"
            >
              <ShoppingBag className="h-4 w-4 text-primary" />
              Platform Orders
            </Link>

            <Link
              href="/admin/reviews"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-foreground hover:bg-muted/70 hover:text-primary transition-colors"
            >
              <Star className="h-4 w-4 text-amber-500" />
              Customer Reviews
            </Link>
          </nav>
        </div>

        {/* Quick External Links */}
        <div className="pt-4 border-t border-border/60 space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center justify-between p-2.5 rounded-xl bg-muted/50 hover:bg-muted text-xs font-semibold transition-colors"
          >
            <span>Owner Portal</span>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          </Link>

          <Link
            href="/restaurants"
            target="_blank"
            className="flex items-center justify-between p-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold transition-colors"
          >
            <span>Customer App</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </aside>

      {/* Main Admin Area */}
      <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
