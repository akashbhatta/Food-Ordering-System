"use client";

import * as React from "react";
import { ownerReplyToReviewAction } from "@/server/actions/review";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface OwnerReplyFormProps {
  reviewId: string;
  existingReply?: string | null;
}

export function OwnerReplyForm({ reviewId, existingReply }: OwnerReplyFormProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [content, setContent] = React.useState(existingReply || "");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await ownerReplyToReviewAction(reviewId, content);
      if (!res.success) {
        toast.error(res.message || "Failed to post response.");
        return;
      }
      toast.success("Your reply has been posted.");
      setIsOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Error posting reply.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen && !existingReply) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="h-7 px-2 text-[11px] text-primary hover:bg-primary/10 gap-1 rounded-lg"
      >
        <MessageSquare className="h-3 w-3" />
        Reply as Restaurant
      </Button>
    );
  }

  if (isOpen) {
    return (
      <form onSubmit={handleSubmit} className="mt-2 space-y-2 p-3 rounded-2xl border border-border bg-card">
        <textarea
          rows={2}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a public response to this customer..."
          className="w-full rounded-xl border border-input bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          required
        />
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-7 text-xs rounded-lg"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting}
            className="h-7 text-xs font-bold gap-1 rounded-lg"
          >
            {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
            Post Reply
          </Button>
        </div>
      </form>
    );
  }

  return null;
}
