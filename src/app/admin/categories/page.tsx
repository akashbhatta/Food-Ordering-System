import { requireAdmin } from "@/server/auth/guards";
import { getAdminCategories } from "@/server/db/queries/admin";
import { Tags, Plus, Store, Edit2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CategoryDialog } from "@/components/admin/category-dialog";

export default async function AdminCategoriesPage() {
  await requireAdmin({ redirectTo: "/login" });
  const categories = await getAdminCategories();

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-destructive">
              Taxonomy & Cuisines
            </span>
            <Badge variant="secondary">
              {categories.length} {categories.length === 1 ? "category" : "categories"}
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Cuisine Categories
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure global cuisine tags and discovery categories used across the customer app.
          </p>
        </div>

        <CategoryDialog />
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <Card
            key={cat.id}
            className="border-border/60 bg-card rounded-3xl overflow-hidden shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Category Cover */}
              <div className="relative aspect-[16/9] w-full bg-muted overflow-hidden">
                {cat.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                    <Tags className="h-8 w-8" />
                  </div>
                )}
                <div className="absolute top-2.5 right-2.5">
                  <Badge variant="secondary" className="bg-background/90 text-[10px] font-bold shadow-sm backdrop-blur-md">
                    {cat._count.restaurants} {cat._count.restaurants === 1 ? "store" : "stores"}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4 space-y-1">
                <h3 className="font-bold text-sm text-foreground">{cat.name}</h3>
                <p className="text-xs text-muted-foreground font-mono">/{cat.slug}</p>
              </CardContent>
            </div>

            <div className="p-4 pt-0 border-t border-border/40 flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Store className="h-3 w-3 text-primary" />
                Linked to {cat._count.restaurants} restaurants
              </span>

              <CategoryDialog
                category={{
                  id: cat.id,
                  name: cat.name,
                  image: cat.image,
                }}
                trigger={
                  <Button variant="outline" size="sm" className="h-8 text-xs rounded-xl gap-1 cursor-pointer">
                    <Edit2 className="h-3 w-3" />
                    Edit
                  </Button>
                }
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
