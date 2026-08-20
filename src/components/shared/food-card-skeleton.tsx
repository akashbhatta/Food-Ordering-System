import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function FoodCardSkeleton() {
  return (
    <Card className="overflow-hidden border-border/60 bg-card">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <CardContent className="p-4 space-y-2.5">
        <Skeleton className="h-3 w-1/3 rounded-md" />
        <Skeleton className="h-4 w-3/4 rounded-md" />
        <Skeleton className="h-3 w-full rounded-md" />
      </CardContent>
      <div className="p-4 pt-0">
        <Skeleton className="h-8 w-full rounded-xl" />
      </div>
    </Card>
  );
}

export function FoodGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <FoodCardSkeleton key={i} />
      ))}
    </div>
  );
}
