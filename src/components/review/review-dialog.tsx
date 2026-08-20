"use client";

import * as React from "react";
import { createReviewAction, updateReviewAction, deleteCustomerReviewAction } from "@/server/actions/review";
import { StarRatingInput } from "./star-rating-input";
import { Star, MessageSquare, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface ReviewDialogProps {
  orderId: string;
  restaurantName: string;
  existingReview?: {
    id: string;
    rating: number;
    comment: string | null;
  } | null;
  trigger?: React.ReactNode;
}

export function ReviewDialog({
  orderId,
  restaurantName,
  existingReview,
  trigger,
}: ReviewDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [rating, setRating] = React.useState(existingReview?.rating || 5);
  const [comment, setComment] = React.useState(existingReview?.comment || "");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const isEditing = Boolean(existingReview?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating < 1 || rating > 5) {
      toast.error("Please select a rating between 1 and 5 stars.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && existingReview?.id) {
        const res = await updateReviewAction(existingReview.id, {
          rating,
          comment: comment.trim() || undefined,
        });

        if (!res.success) {
          toast.error(res.message || "Failed to update review.");
          return;
        }

        toast.success("Review updated successfully!");
      } else {
        const res = await createReviewAction({
          orderId,
          rating,
          comment: comment.trim() || undefined,
        });

        if (!res.success) {
          toast.error(res.message || "Failed to submit review.");
          return;
        }

        toast.success("Thank you for reviewing your meal!");
      }

      setIsOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Error submitting review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!existingReview?.id) return;
    if (!confirm("Are you sure you want to delete your review?")) return;

    setIsSubmitting(true);
    try {
      const res = await deleteCustomerReviewAction(existingReview.id);
      if (!res.success) {
        toast.error(res.message || "Failed to delete review.");
        return;
      }
      toast.success("Review deleted.");
      setIsOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Error deleting review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {trigger ? (
        <div onClick={() => setIsOpen(true)}>{trigger}</div>
      ) : (
        <Button
          size="sm"
          onClick={() => setIsOpen(true)}
          className="rounded-xl text-xs font-bold gap-1.5 bg-amber-500 hover:bg-amber-600 text-white cursor-pointer shadow-md"
        >
          <Star className="h-3.5 w-3.5 fill-white" />
          {isEditing ? "Edit Your Review" : "Rate & Review Meal"}
        </Button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Container */}
          <Card className="relative w-full max-w-md rounded-3xl border border-border/80 bg-card p-6 shadow-2xl z-50 space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500">
                  <Star className="h-4 w-4 fill-amber-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {isEditing ? "Edit Your Review" : `Review ${restaurantName}`}
                  </h3>
                  <span className="text-[11px] text-muted-foreground">Verified Delivered Order</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Star Rating Selector */}
              <div className="space-y-1.5 text-center sm:text-left">
                <Label className="text-xs font-bold text-foreground">Your Rating</Label>
                <StarRatingInput value={rating} onChange={setRating} disabled={isSubmitting} />
              </div>

              {/* Written Comment */}
              <div className="space-y-1.5">
                <Label htmlFor="rev-comment" className="text-xs font-bold text-foreground">
                  Your Feedback (Optional)
                </Label>
                <textarea
                  id="rev-comment"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How was the food flavor, delivery speed, and portion size? Share your experience with other foodies..."
                  className="w-full rounded-2xl border border-input bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  maxLength={1000}
                />
                <span className="text-[10px] text-muted-foreground text-right block">
                  {comment.length}/1000 characters
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-border/60">
                {isEditing ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                    className="text-xs text-destructive hover:bg-destructive/10 gap-1 rounded-xl"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="text-xs rounded-xl"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmitting}
                    className="text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white gap-1.5 shadow-md"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                    {isEditing ? "Update Review" : "Post Review"}
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}
