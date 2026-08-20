import Link from "next/link";
import { UtensilsCrossed, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-card/50 py-12 text-card-foreground">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <UtensilsCrossed className="h-4 w-4" />
              </div>
              <span className="font-bold text-foreground">FeastHub</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Order fresh meals from your favorite local restaurants with real-time tracking and quick delivery.
            </p>
          </div>

          {/* Col 2: Customer */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground tracking-tight">Customer</h4>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li><Link href="/restaurants" className="hover:text-foreground transition-colors">Browse Restaurants</Link></li>
              <li><Link href="/cart" className="hover:text-foreground transition-colors">Your Cart</Link></li>
              <li><Link href="/orders" className="hover:text-foreground transition-colors">Order History</Link></li>
              <li><Link href="/profile" className="hover:text-foreground transition-colors">Saved Addresses</Link></li>
            </ul>
          </div>

          {/* Col 3: Partners */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground tracking-tight">For Partners</h4>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li><Link href="/register?role=OWNER" className="hover:text-foreground transition-colors">List Your Restaurant</Link></li>
              <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Owner Dashboard</Link></li>
              <li><Link href="/dashboard/menu" className="hover:text-foreground transition-colors">Menu Management</Link></li>
              <li><Link href="/dashboard/orders" className="hover:text-foreground transition-colors">Kitchen Order Feed</Link></li>
            </ul>
          </div>

          {/* Col 4: Platform & Admin */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground tracking-tight">Platform</h4>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li><Link href="/admin" className="hover:text-foreground transition-colors">Admin Portal</Link></li>
              <li><span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-mono">Phase 1 Foundation</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>© {new Date().getFullYear()} FeastHub Platform. Built with Next.js & Tailwind CSS.</p>
          <div className="flex items-center gap-1">
            <span>Crafted for high performance & clean architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
