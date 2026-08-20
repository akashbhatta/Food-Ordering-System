"use client";

import * as React from "react";
import { Star } from "lucide-react";

interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
}

const RATING_DESCRIPTIONS: Record<number, string> = {
  1: "Poor experience",
  2: "Could be better",
  3: "Average meal",
  4: "Delicious food",
  5: "Exceptional experience!",
};

export function StarRatingInput({
  value,
  onChange,
  disabled = false,
}: StarRatingInputProps) {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  const activeRating = hoverRating !== null ? hoverRating : value;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= activeRating;

          return (
            <button
              key={star}
              type="button"
              disabled={disabled}
              onClick={() => onChange(star)}
              onMouseEnter={() => !disabled && setHoverRating(star)}
              onMouseLeave={() => !disabled && setHoverRating(null)}
              className="p-1 text-muted-foreground transition-transform hover:scale-110 focus:outline-none disabled:opacity-50 cursor-pointer"
              aria-label={`${star} Stars`}
            >
              <Star
                className={`h-7 w-7 transition-colors ${
                  isFilled
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted-foreground/30 hover:text-amber-400/50"
                }`}
              />
            </button>
          );
        })}
      </div>

      <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 min-h-[16px]">
        {activeRating > 0 ? RATING_DESCRIPTIONS[activeRating] : "Select your star rating"}
      </p>
    </div>
  );
}
