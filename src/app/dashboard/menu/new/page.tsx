import { requireOwner } from "@/server/auth/guards";
import { getOwnerMenuItems } from "@/server/db/queries/dashboard";
import { MenuForm } from "@/components/dashboard/menu-form";

export default async function AddMenuItemPage() {
  const user = await requireOwner({ redirectTo: "/dashboard/menu/new" });
  const { categories } = await getOwnerMenuItems(user.id);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Add New Dish
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Introduce a new item to your online customer menu.
        </p>
      </div>

      <MenuForm existingCategories={categories} />
    </div>
  );
}
