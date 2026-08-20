"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
}

export function PaginationControls({
  page,
  totalPages,
  total,
  limit,
}: PaginationControlsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const startRecord = (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-border/60 text-xs text-muted-foreground">
      <div>
        Showing <span className="font-bold text-foreground">{startRecord}</span> to{" "}
        <span className="font-bold text-foreground">{endRecord}</span> of{" "}
        <span className="font-bold text-foreground">{total}</span> records
      </div>

      <div className="flex items-center gap-1.5">
        <Link
          href={createPageURL(page - 1)}
          className={page <= 1 ? "pointer-events-none opacity-40" : ""}
          aria-label="Go to previous page"
        >
          <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg" disabled={page <= 1} aria-label="Previous Page">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>

        <span className="px-3 font-semibold text-foreground" aria-current="page">
          Page {page} of {totalPages}
        </span>

        <Link
          href={createPageURL(page + 1)}
          className={page >= totalPages ? "pointer-events-none opacity-40" : ""}
          aria-label="Go to next page"
        >
          <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg" disabled={page >= totalPages} aria-label="Next Page">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
