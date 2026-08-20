"use client";

import * as React from "react";
import Link from "next/link";
import { User, LogOut, Store, Shield, ShoppingBag, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { logoutUser } from "@/server/actions/auth";
import type { UserRole } from "@/lib/constants";

interface UserMenuProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    role: UserRole;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return <Badge variant="destructive" className="text-[10px] uppercase font-bold">Admin</Badge>;
      case "OWNER":
        return <Badge variant="info" className="text-[10px] uppercase font-bold">Partner</Badge>;
      default:
        return <Badge variant="secondary" className="text-[10px] uppercase font-medium">Customer</Badge>;
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl border border-border/60 px-3 py-1.5 hover:bg-accent"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
          {user.name ? user.name[0].toUpperCase() : "U"}
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-semibold leading-tight text-foreground truncate max-w-[110px]">
            {user.name || "User"}
          </span>
          <span className="text-[10px] text-muted-foreground capitalize">
            {user.role.toLowerCase()}
          </span>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card p-2 shadow-xl z-50 text-card-foreground">
          {/* User Details */}
          <div className="px-3 py-2 border-b border-border/60 mb-1">
            <p className="text-sm font-semibold truncate text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            <div className="mt-1.5">{getRoleBadge(user.role)}</div>
          </div>

          {/* Role specific links */}
          <div className="space-y-1">
            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg hover:bg-accent text-foreground transition-colors"
              >
                <Shield className="h-4 w-4 text-purple-500" />
                Admin Dashboard
              </Link>
            )}

            {user.role === "OWNER" && (
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg hover:bg-accent text-foreground transition-colors"
              >
                <Store className="h-4 w-4 text-blue-500" />
                Restaurant Dashboard
              </Link>
            )}

            <Link
              href="/orders"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg hover:bg-accent text-foreground transition-colors"
            >
              <ShoppingBag className="h-4 w-4 text-amber-500" />
              My Orders
            </Link>

            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg hover:bg-accent text-foreground transition-colors"
            >
              <User className="h-4 w-4 text-muted-foreground" />
              Profile & Addresses
            </Link>
          </div>

          {/* Sign Out */}
          <div className="pt-1 mt-1 border-t border-border/60">
            <button
              onClick={() => {
                setIsOpen(false);
                logoutUser();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
