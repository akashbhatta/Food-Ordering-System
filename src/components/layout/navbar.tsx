import Link from "next/link";
import { UtensilsCrossed, Compass, Shield, Store, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";
import { MobileNav } from "./mobile-nav";
import { CartNavBadge } from "@/components/cart/cart-nav-badge";
import { getCurrentUser } from "@/server/auth/session";

export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 transition-transform hover:scale-[1.02]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
            <UtensilsCrossed className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-foreground">
              Feast<span className="text-primary">Hub</span>
            </span>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest -mt-1">
              Food Delivery
            </span>
          </div>
        </Link>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            href="/restaurants"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Compass className="h-4 w-4" />
            Explore Restaurants
          </Link>
          <Link
            href="/food"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            Menu Items
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Store className="h-4 w-4" />
            Partner Portal
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Shield className="h-4 w-4" />
            Admin
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          {/* Real-time Cart Nav Badge */}
          <CartNavBadge />

          {user ? (
            <UserMenu
              user={{
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
              }}
            />
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="shadow-sm">
                  Get Started
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Nav Hamburger */}
          <MobileNav
            user={
              user
                ? {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                  }
                : null
            }
          />
        </div>
      </div>
    </header>
  );
}
