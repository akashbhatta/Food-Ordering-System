import { notFound, redirect } from "next/navigation";
import { requireOwner } from "@/server/auth/guards";
import { db } from "@/server/db";
import { getOwnerMenuItems } from "@/server/db/queries/dashboard";
import { MenuForm } from "@/components/dashboard/menu-form";

export default async function EditMenuItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireOwner({ redirectTo: "/dashboard/menu" });
  const { id } = await params;

  const item = await db.menuItem.findUnique({
    where: { id },
    include: {
      options: true,
      restaurant: { select: { ownerId: true } },
    },
  });

  if (!item) {
    notFound();
  }

  // Security check: verify this dish belongs to the logged-in owner's restaurant
  if (item.restaurant.ownerId !== user.id) {
    redirect("/dashboard/menu");
  }

  const { categories } = await getOwnerMenuItems(user.id);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Edit &quot;{item.name}&quot;
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Update pricing, customizations, dish description, and availability.
        </p>
      </div>

      <MenuForm
        initialData={{
          id: item.id,
          name: item.name,
          description: item.description,
          price: Number(item.price.toString()),
          category: item.category,
          image: item.image,
          isAvailable: item.isAvailable,
          options: item.options.map((opt) => ({
            id: opt.id,
            name: opt.name,
            price: Number(opt.price.toString()),
          })),
        }}
        existingCategories={categories}
      />
    </div>
  );
}
