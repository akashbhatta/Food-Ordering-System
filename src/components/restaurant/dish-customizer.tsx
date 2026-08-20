"use client";

import * as React from "react";
import { Plus, Minus, Sparkles, Check, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";

interface MenuItemOption {
  id: string;
  name: string;
  price: number | string;
}

interface DishCustomizerProps {
  dish: {
    id: string;
    name: string;
    price: number | string;
    image?: string | null;
    category?: string;
    isAvailable: boolean;
    options: MenuItemOption[];
    restaurant?: {
      id?: string;
      name: string;
    };
  };
}

export function DishCustomizer({ dish }: DishCustomizerProps) {
  const { addItem } = useCart();
  const basePrice = typeof dish.price === "number" ? dish.price : Number(dish.price.toString());
  const [quantity, setQuantity] = React.useState(1);
  const [selectedOptions, setSelectedOptions] = React.useState<string[]>([]);
  const [specialInstructions, setSpecialInstructions] = React.useState("");

  const toggleOption = (optionId: string) => {
    setSelectedOptions((prev) =>
      prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]
    );
  };

  // Calculate live total
  const optionsAdditionalCost = selectedOptions.reduce((acc, optId) => {
    const opt = dish.options.find((o) => o.id === optId);
    if (!opt) return acc;
    const optPrice = typeof opt.price === "number" ? opt.price : Number(opt.price.toString());
    return acc + optPrice;
  }, 0);

  const unitPrice = basePrice + optionsAdditionalCost;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    const selectedOptionsObjs = dish.options.filter((o) => selectedOptions.includes(o.id));
    const selectedOptionsText = selectedOptionsObjs.map((o) => o.name).join(", ");

    addItem({
      menuItemId: dish.id,
      name: dish.name,
      price: unitPrice,
      quantity,
      image: dish.image,
      category: dish.category,
      restaurantId: dish.restaurant?.id || "r1",
      restaurantName: dish.restaurant?.name || "Partner Restaurant",
      selectedOptionIds: selectedOptions,
      selectedOptionsText: selectedOptionsText || undefined,
      specialNotes: specialInstructions.trim() || undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Availability Status */}
      <div className="flex items-center gap-2">
        {dish.isAvailable ? (
          <Badge variant="success" className="gap-1 text-xs font-semibold">
            <Check className="h-3.5 w-3.5" />
            Available for Order
          </Badge>
        ) : (
          <Badge variant="destructive" className="text-xs font-semibold">
            Currently Sold Out
          </Badge>
        )}
      </div>

      {/* Customization Options */}
      {dish.options.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-border/60">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Customize Your Order
            </span>
            <span className="text-xs text-muted-foreground">Optional</span>
          </div>

          <div className="space-y-2">
            {dish.options.map((opt) => {
              const optPrice =
                typeof opt.price === "number" ? opt.price : Number(opt.price.toString());
              const isSelected = selectedOptions.includes(opt.id);

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleOption(opt.id)}
                  disabled={!dish.isAvailable}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm transition-all cursor-pointer ${
                    isSelected
                      ? "border-primary bg-primary/10 font-semibold text-foreground shadow-sm"
                      : "border-border/80 bg-card hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`h-4 w-4 rounded-md border flex items-center justify-center ${
                        isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <span>{opt.name}</span>
                  </div>

                  <span className="text-xs font-semibold text-primary">
                    +{formatCurrency(optPrice)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Special Instructions */}
      <div className="space-y-2 pt-2 border-t border-border/60">
        <label htmlFor="instructions" className="text-xs font-bold text-foreground">
          Special Instructions for Kitchen
        </label>
        <textarea
          id="instructions"
          rows={2}
          value={specialInstructions}
          onChange={(e) => setSpecialInstructions(e.target.value)}
          placeholder="e.g. Extra napkins, sauce on the side, no cutlery needed..."
          className="w-full rounded-xl border border-input bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          disabled={!dish.isAvailable}
        />
      </div>

      {/* Quantity & Add to Cart Footer */}
      <div className="p-4 rounded-2xl border border-border bg-card/60 backdrop-blur-md shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Quantity</span>

          <div className="flex items-center gap-3 bg-muted p-1 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1 || !dish.isAvailable}
              className="h-8 w-8 flex items-center justify-center rounded-lg bg-background text-foreground hover:bg-card shadow-sm disabled:opacity-40 cursor-pointer"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="font-bold text-sm w-4 text-center">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(Math.min(20, quantity + 1))}
              disabled={quantity >= 20 || !dish.isAvailable}
              className="h-8 w-8 flex items-center justify-center rounded-lg bg-background text-foreground hover:bg-card shadow-sm disabled:opacity-40 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Big Add Button */}
        <Button
          size="lg"
          className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/20 gap-2 cursor-pointer"
          onClick={handleAddToCart}
          disabled={!dish.isAvailable}
        >
          <ShoppingBag className="h-5 w-5" />
          Add to Cart • {formatCurrency(totalPrice)}
        </Button>
      </div>
    </div>
  );
}
