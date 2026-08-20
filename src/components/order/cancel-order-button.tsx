"use client";

import * as React from "react";
import { XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cancelOrderAction } from "@/server/actions/order";
import { toast } from "sonner";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const [isCancelling, setIsCancelling] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      const res = await cancelOrderAction(orderId);
      if (!res.success) {
        toast.error(res.message || "Failed to cancel order.");
        return;
      }
      toast.success("Order successfully cancelled.");
      setShowConfirm(false);
    } catch (err) {
      console.error(err);
      toast.error("Error cancelling order.");
    } finally {
      setIsCancelling(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground font-medium">Are you sure?</span>
        <Button
          size="sm"
          variant="destructive"
          onClick={handleCancel}
          disabled={isCancelling}
          className="h-8 rounded-lg text-xs font-bold"
        >
          {isCancelling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Yes, Cancel Order"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowConfirm(false)}
          className="h-8 rounded-lg text-xs"
        >
          No, Keep
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setShowConfirm(true)}
      className="text-xs text-destructive hover:bg-destructive/10 hover:border-destructive/30 rounded-xl gap-1.5"
    >
      <XCircle className="h-3.5 w-3.5" />
      Cancel Order
    </Button>
  );
}
