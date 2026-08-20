"use client";

import * as React from "react";
import { adminUpdateOrderStatusAction } from "@/server/actions/admin";
import { OrderStatus } from "@prisma/client";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function AdminOrderStatusOverride({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: OrderStatus;
}) {
  const [status, setStatus] = React.useState(currentStatus);
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleChange = async (newStatus: OrderStatus) => {
    if (newStatus === status) return;
    if (!confirm(`Override order status to ${newStatus}?`)) return;

    setIsUpdating(true);
    try {
      const res = await adminUpdateOrderStatusAction(orderId, newStatus);
      if (!res.success) {
        toast.error(res.message || "Failed to update order.");
        return;
      }
      setStatus(newStatus);
      toast.success(res.message);
    } catch (err) {
      console.error(err);
      toast.error("Error updating order.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5 justify-end">
      {isUpdating && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
      <select
        value={status}
        onChange={(e) => handleChange(e.target.value as OrderStatus)}
        disabled={isUpdating}
        className="h-8 rounded-lg border border-input bg-background px-2 text-[11px] font-semibold"
      >
        {Object.values(OrderStatus).map((s) => (
          <option key={s} value={s}>
            {ORDER_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
    </div>
  );
}
