import { Loader2, Utensils } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 space-y-4">
      <div className="relative flex items-center justify-center">
        <div className="h-16 w-16 rounded-3xl bg-primary/10 animate-pulse flex items-center justify-center text-primary">
          <Utensils className="h-8 w-8 animate-bounce" />
        </div>
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-bold text-foreground">Preparing your view...</p>
        <p className="text-xs text-muted-foreground font-mono">FeastHub Kitchen</p>
      </div>
    </div>
  );
}
