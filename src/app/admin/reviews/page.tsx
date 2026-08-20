import { requireAdmin } from "@/server/auth/guards";
import { getAdminReviews } from "@/server/db/queries/admin";
import { Star, Search, Store, MessageSquare, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { ReviewActions } from "@/components/admin/review-actions";
import Link from "next/link";

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    rating?: string;
    page?: string;
  }>;
}) {
  await requireAdmin({ redirectTo: "/login" });
  const { search, rating, page = "1" } = await searchParams;

  const pageNumber = parseInt(page, 10) || 1;
  const ratingNumber = rating ? parseInt(rating, 10) : undefined;

  const { reviews, pagination } = await getAdminReviews({
    search,
    rating: ratingNumber,
    page: pageNumber,
    limit: 10,
  });

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-destructive">
              Reputation & Moderation
            </span>
            <Badge variant="secondary">
              {pagination.total} total {pagination.total === 1 ? "review" : "reviews"}
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Customer Reviews & Ratings
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit customer feedback, inspect owner responses, and remove inappropriate content.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="border-border/60 bg-card rounded-2xl p-4">
        <form method="GET" className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              name="search"
              defaultValue={search || ""}
              placeholder="Search comments, customer, or restaurant..."
              className="pl-9 h-9 text-xs rounded-xl"
            />
          </div>

          <select
            name="rating"
            defaultValue={rating || ""}
            className="h-9 rounded-xl border border-input bg-background px-3 text-xs w-full sm:w-44"
          >
            <option value="">All Ratings (1 - 5)</option>
            <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
            <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
            <option value="3">⭐⭐⭐ (3 Stars)</option>
            <option value="2">⭐⭐ (2 Stars)</option>
            <option value="1">⭐ (1 Star)</option>
          </select>

          <Button type="submit" size="sm" className="h-9 rounded-xl text-xs font-bold px-4">
            Filter
          </Button>

          {(search || rating) && (
            <Link href="/admin/reviews">
              <Button type="button" variant="ghost" size="sm" className="h-9 rounded-xl text-xs">
                Clear
              </Button>
            </Link>
          )}
        </form>
      </Card>

      {/* Reviews Table */}
      <Card className="border-border/60 bg-card rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border/60 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="p-4 pl-6">Rating & Feedback</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Restaurant</th>
                <th className="p-4">Order Ref</th>
                <th className="p-4">Date</th>
                <th className="p-4 pr-6 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No customer reviews found matching your search.
                  </td>
                </tr>
              ) : (
                reviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4 pl-6 max-w-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < rev.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-foreground text-xs leading-relaxed line-clamp-2">
                          {rev.comment || <span className="italic text-muted-foreground">No written comment</span>}
                        </p>
                        {rev.reply && (
                          <p className="text-[10px] text-muted-foreground italic line-clamp-1">
                            ↪ Owner Reply: &quot;{rev.reply.content}&quot;
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="font-semibold text-foreground block">{rev.user.name}</span>
                      <span className="text-[11px] text-muted-foreground block">{rev.user.email}</span>
                    </td>

                    <td className="p-4">
                      <Link
                        href={`/restaurants/${rev.restaurant.slug}`}
                        className="font-semibold text-foreground hover:underline"
                      >
                        {rev.restaurant.name}
                      </Link>
                    </td>

                    <td className="p-4 font-mono text-[11px] text-muted-foreground">
                      {rev.order.orderNumber}
                    </td>

                    <td className="p-4 text-muted-foreground whitespace-nowrap">
                      {formatDate(rev.createdAt)}
                    </td>

                    <td className="p-4 pr-6 text-right">
                      <ReviewActions reviewId={rev.id} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 pt-0">
          <PaginationControls
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
          />
        </div>
      </Card>
    </div>
  );
}
