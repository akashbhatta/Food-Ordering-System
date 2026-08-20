"use client";

import * as React from "react";
import { deleteReviewAction } from "@/server/actions/admin";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ReviewActions({ reviewId }: { reviewId: string }) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this customer review?")) return;

    setIsDeleting(true);
    try {
      const res = await deleteReviewAction(reviewId);
      if (!res.success) {
        toast.error(res.message || "Failed to delete review.");
        return;
      }
      toast.success("Review deleted successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Error deleting review.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={isDeleting}
      className="h-8 rounded-lg text-xs text-destructive hover:bg-destructive/10 gap-1"
    >
      {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
      Delete Review
    </Button>
  );
}
