"use client";

import * as React from "react";
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from "@/server/actions/admin";
import { Plus, Edit2, Trash2, Loader2, Tags, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface CategoryDialogProps {
  category?: {
    id: string;
    name: string;
    image: string | null;
  };
  trigger?: React.ReactNode;
}

export function CategoryDialog({ category, trigger }: CategoryDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [name, setName] = React.useState(category?.name || "");
  const [image, setImage] = React.useState(category?.image || "");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const isEditing = Boolean(category?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Category name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && category?.id) {
        const res = await updateCategoryAction(category.id, {
          name: name.trim(),
          image: image.trim() || undefined,
        });
        if (!res.success) {
          toast.error(res.message || "Failed to update category.");
          return;
        }
        toast.success("Category updated successfully!");
      } else {
        const res = await createCategoryAction({
          name: name.trim(),
          image: image.trim() || undefined,
        });
        if (!res.success) {
          toast.error(res.message || "Failed to create category.");
          return;
        }
        toast.success("Category created successfully!");
        setName("");
        setImage("");
      }
      setIsOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Error saving category.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!category?.id) return;
    if (!confirm(`Are you sure you want to delete category "${category.name}"?`)) return;

    setIsSubmitting(true);
    try {
      const res = await deleteCategoryAction(category.id);
      if (!res.success) {
        toast.error(res.message || "Failed to delete category.");
        return;
      }
      toast.success("Category deleted.");
      setIsOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Error deleting category.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {trigger ? (
        <div onClick={() => setIsOpen(true)}>{trigger}</div>
      ) : (
        <Button
          size="sm"
          onClick={() => setIsOpen(true)}
          className="rounded-xl text-xs font-bold gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Create Category
        </Button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <Card className="relative w-full max-w-md rounded-3xl border border-border/80 bg-card p-6 shadow-2xl z-50 space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Tags className="h-4 w-4 text-primary" />
                <h3 className="text-base font-bold text-foreground">
                  {isEditing ? `Edit "${category?.name}"` : "Create Cuisine Category"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="cat-name" className="text-xs font-bold">
                  Category Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cat-name"
                  placeholder="e.g. Japanese Ramen, Artisanal Bakery"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl h-10 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cat-img" className="text-xs font-bold">
                  Cover Image URL
                </Label>
                <Input
                  id="cat-img"
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="rounded-xl h-10 text-xs"
                />
              </div>

              {image && (
                <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-muted border border-border/60">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt="Preview" className="h-full w-full object-cover" />
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-border/60">
                {isEditing ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                    className="text-xs text-destructive hover:bg-destructive/10 gap-1 rounded-xl"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="text-xs rounded-xl"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmitting}
                    className="text-xs font-bold rounded-xl"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : isEditing ? (
                      "Save Changes"
                    ) : (
                      "Create Category"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}
