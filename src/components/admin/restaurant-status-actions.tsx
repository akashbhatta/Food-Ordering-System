"use client";

import * as React from "react";
import { updateRestaurantStatusAction } from "@/server/actions/admin";
import { RestaurantStatus } from "@prisma/client";
import { Check, X, ShieldAlert, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface RestaurantStatusActionsProps {
  restaurantId: string;
  restaurantName: string;
  currentStatus: RestaurantStatus;
  isActive: boolean;
}

export function RestaurantStatusActions({
  restaurantId,
  restaurantName,
  currentStatus,
  isActive,
}: RestaurantStatusActionsProps) {
  const [status, setStatus] = React.useState(currentStatus);
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleUpdateStatus = async (newStatus: RestaurantStatus, newActive?: boolean) => {
    const actionMap: Record<RestaurantStatus, string> = {
      APPROVED: "approve",
      PENDING: "move to pending",
      REJECTED: "reject application for",
      SUSPENDED: "suspend store access for",
    };

    if (!confirm(`Are you sure you want to ${actionMap[newStatus]} "${restaurantName}"?`)) return;

    setIsUpdating(true);
    try {
      const res = await updateRestaurantStatusAction(restaurantId, newStatus, newActive);
      if (!res.success) {
        toast.error(res.message || "Failed to update restaurant status.");
        return;
      }
      setStatus(newStatus);
      toast.success(res.message);
    } catch (err) {
      console.error(err);
      toast.error("Error updating restaurant status.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-1.5 flex-wrap">
      {status === RestaurantStatus.PENDING && (
        <>
          <Button
            size="sm"
            className="h-8 rounded-lg text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
            onClick={() => handleUpdateStatus(RestaurantStatus.APPROVED, true)}
            disabled={isUpdating}
          >
            {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            Approve Store
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="h-8 rounded-lg text-xs text-destructive hover:bg-destructive/10 hover:border-destructive/30 cursor-pointer"
            onClick={() => handleUpdateStatus(RestaurantStatus.REJECTED, false)}
            disabled={isUpdating}
          >
            <X className="h-3.5 w-3.5" />
            Reject
          </Button>
        </>
      )}

      {status === RestaurantStatus.APPROVED && (
        <Button
          size="sm"
          variant="outline"
          className="h-8 rounded-lg text-xs text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/30 gap-1 cursor-pointer"
          onClick={() => handleUpdateStatus(RestaurantStatus.SUSPENDED, false)}
          disabled={isUpdating}
        >
          {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldAlert className="h-3.5 w-3.5" />}
          Suspend Store
        </Button>
      )}

      {(status === RestaurantStatus.SUSPENDED || status === RestaurantStatus.REJECTED) && (
        <Button
          size="sm"
          variant="default"
          className="h-8 rounded-lg text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
          onClick={() => handleUpdateStatus(RestaurantStatus.APPROVED, true)}
          disabled={isUpdating}
        >
          {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
          Reactivate
        </Button>
      )}
    </div>
  );
}
