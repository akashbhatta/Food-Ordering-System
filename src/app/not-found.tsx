import Link from "next/link";
import { Utensils, Home, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl border border-border/80 bg-card shadow-xl">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary mx-auto shadow-md">
          <Utensils className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs font-bold text-primary uppercase tracking-widest">
            404 — Page Not Found
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            Hungry for something else?
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The page, dish, or restaurant you are looking for does not exist, may have moved, or has been temporarily taken offline.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link href="/restaurants">
            <Button className="rounded-xl text-xs font-bold gap-1.5 shadow-md cursor-pointer">
              <Compass className="h-3.5 w-3.5" />
              Explore Restaurants
            </Button>
          </Link>

          <Link href="/">
            <Button
              variant="outline"
              className="rounded-xl text-xs font-bold gap-1.5 cursor-pointer"
            >
              <Home className="h-3.5 w-3.5" />
              Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
