"use client";

import * as React from "react";
import { OrderStatus } from "@prisma/client";
import { updateOrderStatusAction } from "@/server/actions/order";
import { Button } from "@/components/ui/button";
import { Check, X, ChefHat, PackageCheck, Bike, Home, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface OrderStatusActionsProps {
  orderId: string;
  currentStatus: OrderStatus;
  size?: "sm" | "default";
}

export function OrderStatusActions({
  orderId,
  currentStatus,
  size = "sm",
}: OrderStatusActionsProps) {
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleStatusChange = async (nextStatus: OrderStatus) => {
    setIsUpdating(true);
    try {
      const res = await updateOrderStatusAction(orderId, nextStatus);
      if (!res.success) {
        toast.error(res.message || "Failed to update order status.");
        return;
      }
      toast.success(`Order moved to ${nextStatus.replace(/_/g, " ")}`);
    } catch (err) {
      console.error(err);
      toast.error("Error updating order status.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (currentStatus === OrderStatus.DELIVERED || currentStatus === OrderStatus.CANCELLED) {
    return null;
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {currentStatus === OrderStatus.PENDING && (
        <>
          <Button
            size={size}
            variant="default"
            className="h-8 rounded-xl text-xs font-bold gap-1 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
            onClick={() => handleStatusChange(OrderStatus.CONFIRMED)}
            disabled={isUpdating}
          >
            {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
            Accept Order
          </Button>

          <Button
            size={size}
            variant="outline"
            className="h-8 rounded-xl text-xs text-destructive hover:bg-destructive/10 hover:border-destructive/30 cursor-pointer"
            onClick={() => handleStatusChange(OrderStatus.CANCELLED)}
            disabled={isUpdating}
          >
            <X className="h-3 w-3" />
            Reject
          </Button>
        </>
      )}

      {currentStatus === OrderStatus.CONFIRMED && (
        <Button
          size={size}
          className="h-8 rounded-xl text-xs font-bold gap-1 bg-primary text-primary-foreground cursor-pointer"
          onClick={() => handleStatusChange(OrderStatus.PREPARING)}
          disabled={isUpdating}
        >
          {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <ChefHat className="h-3 w-3" />}
          Start Cooking
        </Button>
      )}

      {currentStatus === OrderStatus.PREPARING && (
        <Button
          size={size}
          className="h-8 rounded-xl text-xs font-bold gap-1 bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
          onClick={() => handleStatusChange(OrderStatus.READY)}
          disabled={isUpdating}
        >
          {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <PackageCheck className="h-3 w-3" />}
          Mark Ready for Pickup
        </Button>
      )}

      {currentStatus === OrderStatus.READY && (
        <Button
          size={size}
          className="h-8 rounded-xl text-xs font-bold gap-1 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          onClick={() => handleStatusChange(OrderStatus.OUT_FOR_DELIVERY)}
          disabled={isUpdating}
        >
          {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Bike className="h-3 w-3" />}
          Hand to Courier
        </Button>
      )}

      {currentStatus === OrderStatus.OUT_FOR_DELIVERY && (
        <Button
          size={size}
          className="h-8 rounded-xl text-xs font-bold gap-1 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
          onClick={() => handleStatusChange(OrderStatus.DELIVERED)}
          disabled={isUpdating}
        >
          {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Home className="h-3 w-3" />}
          Confirm Delivered
        </Button>
      )}
    </div>
  );
}
