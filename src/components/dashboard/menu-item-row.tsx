"use client";

import * as React from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { toggleMenuItemAvailabilityAction, deleteMenuItemAction } from "@/server/actions/menu";
import { Edit2, Trash2, Check, X, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface MenuItemRowProps {
  item: {
    id: string;
    name: string;
    description: string | null;
    price: number | string;
    image: string | null;
    category: string;
    isAvailable: boolean;
    options: { id: string; name: string; price: number | string }[];
    _count: { orderItems: number };
  };
}

export function MenuItemRow({ item }: MenuItemRowProps) {
  const [isAvailable, setIsAvailable] = React.useState(item.isAvailable);
  const [isToggling, setIsToggling] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      const res = await toggleMenuItemAvailabilityAction(item.id);
      if (!res.success) {
        toast.error(res.message || "Failed to toggle status.");
        return;
      }
      setIsAvailable(res.data?.isAvailable ?? !isAvailable);
      toast.success(res.message);
    } catch (err) {
      console.error(err);
      toast.error("Error updating dish status.");
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to remove "${item.name}" from your menu?`)) return;

    setIsDeleting(true);
    try {
      const res = await deleteMenuItemAction(item.id);
      if (!res.success) {
        toast.error(res.message || "Failed to delete dish.");
        return;
      }
      toast.success(res.message);
    } catch (err) {
      console.error(err);
      toast.error("Error deleting dish.");
    } finally {
      setIsDeleting(false);
    }
  };

  const numericPrice = typeof item.price === "number" ? item.price : Number(item.price.toString());

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-border/60 bg-card gap-4 hover:border-primary/30 transition-all">
      {/* Left: Thumbnail & Details */}
      <div className="flex items-start gap-3.5">
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image}
            alt={item.name}
            className="h-16 w-16 rounded-xl object-cover shrink-0 border border-border/60"
          />
        ) : (
          <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center text-muted-foreground text-xs font-bold shrink-0">
            Dish
          </div>
        )}

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm text-foreground">{item.name}</h4>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
              {item.category}
            </Badge>
          </div>

          <div className="text-xs font-black text-primary">
            {formatCurrency(numericPrice)}
          </div>

          {item.description && (
            <p className="text-xs text-muted-foreground line-clamp-1 max-w-md">
              {item.description}
            </p>
          )}

          {item.options.length > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span>{item.options.length} customizations</span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Availability Toggle & Action Buttons */}
      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
        {/* Availability Toggle */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={isToggling}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            isAvailable
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25"
              : "bg-destructive/15 text-destructive hover:bg-destructive/25"
          }`}
        >
          {isToggling ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : isAvailable ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <X className="h-3.5 w-3.5" />
          )}
          <span>{isAvailable ? "In Stock" : "Sold Out"}</span>
        </button>

        {/* Edit Button */}
        <Link href={`/dashboard/menu/${item.id}/edit`}>
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground">
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
        </Link>

        {/* Delete Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          disabled={isDeleting}
          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
        </Button>
      </div>
    </div>
  );
}
