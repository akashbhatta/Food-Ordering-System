import { notFound } from "next/navigation";
import { requireOwner } from "@/server/auth/guards";
import { getOwnerRestaurantSettings } from "@/server/db/queries/dashboard";
import { SettingsForm } from "@/components/dashboard/settings-form";

export default async function DashboardSettingsPage() {
  const user = await requireOwner({ redirectTo: "/dashboard/settings" });
  const restaurant = await getOwnerRestaurantSettings(user.id);

  if (!restaurant) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Store Settings
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure business details, delivery rates, operating hours, and media branding.
        </p>
      </div>

      <SettingsForm
        restaurant={{
          ...restaurant,
          deliveryFee: Number(restaurant.deliveryFee.toString()),
          minOrderAmount: Number(restaurant.minOrderAmount.toString()),
        }}
      />
    </div>
  );
}
