"use server";

import { db } from "@/server/db";
import { requireOwner } from "@/server/auth/guards";
import { type ActionResponse } from "@/lib/types";
import { revalidatePath } from "next/cache";

export interface UpdateRestaurantSettingsInput {
  name: string;
  description: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  deliveryFee: number;
  minOrderAmount: number;
  avgDeliveryMin: number;
  image?: string;
  coverImage?: string;
  isActive: boolean;
  operatingHours: {
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
  }[];
}

/**
 * Updates the authenticated owner's restaurant profile and operating hours.
 * Enforces ownership strictly via session `user.id`.
 */
export async function updateRestaurantSettingsAction(
  input: UpdateRestaurantSettingsInput
): Promise<ActionResponse> {
  try {
    const user = await requireOwner();

    const restaurant = await db.restaurant.findUnique({
      where: { ownerId: user.id },
    });

    if (!restaurant) {
      return { success: false, message: "Restaurant profile not found." };
    }

    await db.$transaction(async (tx) => {
      // 1. Update restaurant profile
      await tx.restaurant.update({
        where: { id: restaurant.id },
        data: {
          name: input.name.trim(),
          description: input.description.trim(),
          phone: input.phone.trim(),
          email: input.email.toLowerCase().trim(),
          street: input.street.trim(),
          city: input.city.trim(),
          state: input.state.trim(),
          zipCode: input.zipCode.trim(),
          deliveryFee: Math.max(0, input.deliveryFee),
          minOrderAmount: Math.max(0, input.minOrderAmount),
          avgDeliveryMin: Math.max(5, input.avgDeliveryMin),
          image: input.image?.trim() || null,
          coverImage: input.coverImage?.trim() || null,
          isActive: input.isActive,
        },
      });

      // 2. Upsert operating hours for each day of the week
      if (Array.isArray(input.operatingHours)) {
        for (const h of input.operatingHours) {
          await tx.operatingHours.upsert({
            where: {
              restaurantId_dayOfWeek: {
                restaurantId: restaurant.id,
                dayOfWeek: h.dayOfWeek,
              },
            },
            update: {
              openTime: h.openTime,
              closeTime: h.closeTime,
              isClosed: h.isClosed,
            },
            create: {
              restaurantId: restaurant.id,
              dayOfWeek: h.dayOfWeek,
              openTime: h.openTime,
              closeTime: h.closeTime,
              isClosed: h.isClosed,
            },
          });
        }
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");
    revalidatePath(`/restaurants/${restaurant.slug}`);
    revalidatePath("/restaurants");
    revalidatePath("/");

    return { success: true, message: "Restaurant settings updated successfully." };
  } catch (error) {
    console.error("Update restaurant settings error:", error);
    return { success: false, message: "Failed to update restaurant settings." };
  }
}
