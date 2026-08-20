import * as React from "react";
import Link from "next/link";
import { UtensilsCrossed, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onActionClick?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = UtensilsCrossed,
  title,
  description,
  actionLabel,
  actionHref,
  onActionClick,
  className = "",
}: EmptyStateProps) {
  return (
    <Card className={`border-dashed p-12 text-center bg-card/40 ${className}`}>
      <div className="flex flex-col items-center justify-center space-y-3 max-w-sm mx-auto">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground mb-1">
          <Icon className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>

        {actionLabel && (
          <div className="pt-3">
            {actionHref ? (
              <Link href={actionHref}>
                <Button size="sm" className="rounded-xl px-5 font-semibold">
                  {actionLabel}
                </Button>
              </Link>
            ) : onActionClick ? (
              <Button
                size="sm"
                onClick={onActionClick}
                className="rounded-xl px-5 font-semibold"
              >
                {actionLabel}
              </Button>
            ) : null}
          </div>
        )}
      </div>
    </Card>
  );
}
