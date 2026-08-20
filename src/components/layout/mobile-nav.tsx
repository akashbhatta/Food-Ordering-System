"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X, Compass, Store, Shield, ShoppingBag, User, LogIn, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/lib/constants";

interface MobileNavProps {
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    role: UserRole;
  } | null;
}

export function MobileNav({ user }: MobileNavProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Prevent scroll when drawer is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <div className="md:hidden">
      {/* Trigger Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="h-9 w-9 rounded-lg"
        aria-label="Open mobile menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Slide-out Backdrop & Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative ml-auto flex h-full w-4/5 max-w-sm flex-col border-l border-border bg-card p-6 shadow-2xl z-50">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <UtensilsCrossed className="h-4 w-4" />
                </div>
                <span className="font-bold text-foreground">FeastHub</span>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-lg"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Nav Links */}
            <nav className="flex flex-col space-y-2 flex-1">
              <Link
                href="/restaurants"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-foreground hover:bg-accent transition-colors"
              >
                <Compass className="h-4 w-4 text-primary" />
                Explore Restaurants
              </Link>

              <Link
                href="/cart"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-foreground hover:bg-accent transition-colors"
              >
                <ShoppingBag className="h-4 w-4 text-amber-500" />
                My Cart
              </Link>

              {user ? (
                <>
                  <Link
                    href="/orders"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-foreground hover:bg-accent transition-colors"
                  >
                    <ShoppingBag className="h-4 w-4 text-emerald-500" />
                    My Orders
                  </Link>

                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-foreground hover:bg-accent transition-colors"
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    Profile & Addresses
                  </Link>

                  {user.role === "OWNER" && (
                    <Link
                      href="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/15 transition-colors"
                    >
                      <Store className="h-4 w-4" />
                      Owner Dashboard
                    </Link>
                  )}

                  {user.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-purple-600 dark:text-purple-400 bg-purple-500/10 hover:bg-purple-500/15 transition-colors"
                    >
                      <Shield className="h-4 w-4" />
                      Admin Portal
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-foreground hover:bg-accent transition-colors"
                  >
                    <Store className="h-4 w-4 text-blue-500" />
                    Restaurant Partner
                  </Link>
                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-foreground hover:bg-accent transition-colors"
                  >
                    <Shield className="h-4 w-4 text-purple-500" />
                    Admin Portal
                  </Link>
                </>
              )}
            </nav>

            {/* Bottom Auth CTA */}
            <div className="pt-4 border-t border-border/60">
              {!user && (
                <div className="flex flex-col gap-2">
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full justify-center gap-2">
                      <LogIn className="h-4 w-4" />
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsOpen(false)}>
                    <Button className="w-full justify-center">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
