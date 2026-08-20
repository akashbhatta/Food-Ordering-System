"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchInputProps {
  placeholder?: string;
  defaultValue?: string;
  className?: string;
  showLocation?: boolean;
}

export function SearchInput({
  placeholder = "Search restaurants, dishes, or cuisines...",
  defaultValue = "",
  className = "",
  showLocation = true,
}: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get("search") || defaultValue;

  const [query, setQuery] = React.useState(currentQuery);
  const [city, setCity] = React.useState("Springfield, OR");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      router.push("/restaurants");
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set("search", query.trim());
    router.push(`/restaurants?${params.toString()}`);
  };

  const handleClear = () => {
    setQuery("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    router.push(`/restaurants?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className={`relative flex flex-col sm:flex-row items-center gap-2 p-2 rounded-2xl border border-border/80 bg-background/95 shadow-xl backdrop-blur-md ${className}`}
    >
      {/* Location Selector (Optional display) */}
      {showLocation && (
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 border-r border-border/60 text-xs font-semibold text-foreground whitespace-nowrap">
          <MapPin className="h-4 w-4 text-primary shrink-0" />
          <span className="truncate max-w-[120px]">{city}</span>
        </div>
      )}

      {/* Main Search Input */}
      <div className="relative flex-1 w-full flex items-center">
        <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-9 border-none bg-transparent shadow-none focus-visible:ring-0 text-sm placeholder:text-muted-foreground/70 h-10"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        size="sm"
        className="w-full sm:w-auto h-10 px-6 rounded-xl font-semibold shadow-md shadow-primary/20 shrink-0"
      >
        Search Food
      </Button>
    </form>
  );
}
