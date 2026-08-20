"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createMenuItemAction, updateMenuItemAction, type MenuItemOptionInput } from "@/server/actions/menu";
import { Plus, Trash2, ArrowLeft, Loader2, Sparkles, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";

interface MenuFormProps {
  initialData?: {
    id: string;
    name: string;
    description?: string | null;
    price: number | string;
    category: string;
    image?: string | null;
    isAvailable: boolean;
    options: { id?: string; name: string; price: number | string }[];
  };
  existingCategories?: string[];
}

export function MenuForm({ initialData, existingCategories = [] }: MenuFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData?.id);

  const [name, setName] = React.useState(initialData?.name || "");
  const [description, setDescription] = React.useState(initialData?.description || "");
  const [price, setPrice] = React.useState(
    initialData?.price ? String(initialData.price) : "12.99"
  );
  const [category, setCategory] = React.useState(
    initialData?.category || existingCategories[0] || "Main Dishes"
  );
  const [customCategory, setCustomCategory] = React.useState("");
  const [image, setImage] = React.useState(initialData?.image || "");
  const [isAvailable, setIsAvailable] = React.useState(initialData?.isAvailable ?? true);

  const [options, setOptions] = React.useState<MenuItemOptionInput[]>(
    initialData?.options?.map((o) => ({
      name: o.name,
      price: typeof o.price === "number" ? o.price : Number(o.price.toString()),
    })) || []
  );

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const addOption = () => {
    setOptions((prev) => [...prev, { name: "", price: 2.0 }]);
  };

  const updateOption = (index: number, field: "name" | "price", val: any) => {
    setOptions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const removeOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Dish name is required.");
      return;
    }

    const finalCategory = category === "NEW" ? customCategory.trim() : category.trim();
    if (!finalCategory) {
      toast.error("Please specify a category.");
      return;
    }

    setIsSubmitting(true);

    try {
      const numericPrice = parseFloat(price) || 0;
      const cleanOptions = options
        .filter((o) => o.name.trim().length > 0)
        .map((o) => ({
          name: o.name.trim(),
          price: Number(o.price) || 0,
        }));

      if (isEditing && initialData?.id) {
        const res = await updateMenuItemAction(initialData.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          price: numericPrice,
          category: finalCategory,
          image: image.trim() || undefined,
          isAvailable,
          options: cleanOptions,
        });

        if (!res.success) {
          toast.error(res.message || "Failed to update dish.");
          return;
        }

        toast.success("Dish updated successfully!");
      } else {
        const res = await createMenuItemAction({
          name: name.trim(),
          description: description.trim() || undefined,
          price: numericPrice,
          category: finalCategory,
          image: image.trim() || undefined,
          isAvailable,
          options: cleanOptions,
        });

        if (!res.success) {
          toast.error(res.message || "Failed to add dish.");
          return;
        }

        toast.success("Dish added to menu!");
      }

      router.push("/dashboard/menu");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while saving the menu item.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/menu"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Menu
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Form Fields */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-border/80 bg-card rounded-3xl p-6 space-y-5">
            <h3 className="text-base font-bold text-foreground">Dish Details</h3>

            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="dish-name" className="text-xs font-bold">
                Dish Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="dish-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Truffle Mushroom Risotto"
                className="rounded-xl h-10 text-sm"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="dish-desc" className="text-xs font-bold">
                Description
              </Label>
              <textarea
                id="dish-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe flavors, ingredients, dietary notes..."
                className="w-full rounded-xl border border-input bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Price & Category */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="dish-price" className="text-xs font-bold">
                  Price ($ USD) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="dish-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="rounded-xl h-10 text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dish-cat" className="text-xs font-bold">
                  Category <span className="text-destructive">*</span>
                </Label>
                <select
                  id="dish-cat"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs"
                >
                  {existingCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="NEW">+ Create New Category...</option>
                </select>
              </div>
            </div>

            {category === "NEW" && (
              <div className="space-y-1.5 pt-2">
                <Label htmlFor="custom-cat" className="text-xs font-bold text-primary">
                  New Category Name
                </Label>
                <Input
                  id="custom-cat"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="e.g. Chef Specials, Artisan Breads"
                  className="rounded-xl h-10 text-sm"
                  required
                />
              </div>
            )}

            {/* Image URL */}
            <div className="space-y-1.5">
              <Label htmlFor="dish-img" className="text-xs font-bold">
                Food Image URL
              </Label>
              <Input
                id="dish-img"
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="rounded-xl h-10 text-sm"
              />
            </div>

            {/* Availability Checkbox */}
            <div className="pt-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="dish-avail"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="h-4 w-4 rounded text-primary focus:ring-primary"
              />
              <Label htmlFor="dish-avail" className="text-xs font-medium cursor-pointer">
                Available for customer ordering immediately
              </Label>
            </div>
          </Card>

          {/* Customization Options Builder */}
          <Card className="border-border/80 bg-card rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  Customization Add-ons & Options
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Allow customers to customize with extra toppings, sizes, or preparations.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                className="rounded-xl text-xs gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Option
              </Button>
            </div>

            {options.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-2">
                No customization options yet. Click &quot;Add Option&quot; to configure add-ons (e.g. Extra Cheese +$2.50).
              </p>
            ) : (
              <div className="space-y-2.5">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      placeholder="Option Name (e.g. Extra Mozzarella)"
                      value={opt.name}
                      onChange={(e) => updateOption(idx, "name", e.target.value)}
                      className="h-9 text-xs rounded-xl flex-1"
                      required
                    />

                    <div className="w-28 relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={opt.price}
                        onChange={(e) => updateOption(idx, "price", parseFloat(e.target.value) || 0)}
                        className="h-9 text-xs pl-6 rounded-xl"
                      />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOption(idx)}
                      className="h-9 w-9 text-muted-foreground hover:text-destructive rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right 1 Col: Live Visual Preview & Submit */}
        <div className="space-y-6">
          <Card className="border-border/80 bg-card rounded-3xl overflow-hidden shadow-sm sticky top-20">
            <div className="p-4 border-b border-border/60">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Live Preview
              </span>
            </div>

            <div className="p-4 space-y-3">
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-muted flex items-center justify-center">
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-muted-foreground flex flex-col items-center gap-1 text-xs">
                    <ImageIcon className="h-6 w-6" />
                    <span>No image preview</span>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-bold text-sm text-foreground">
                  {name || "Untitled Dish"}
                </h4>
                <p className="text-xs font-black text-primary mt-0.5">
                  ${parseFloat(price || "0").toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {description || "Dish description will appear here..."}
                </p>
              </div>

              {options.length > 0 && (
                <div className="pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-amber-500 inline mr-1" />
                  {options.filter((o) => o.name).length} options configured
                </div>
              )}
            </div>

            <div className="p-4 pt-0">
              <Button
                type="submit"
                size="lg"
                className="w-full h-12 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 gap-2 cursor-pointer"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving Dish...
                  </>
                ) : (
                  <>{isEditing ? "Update Dish" : "Publish to Menu"}</>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}
