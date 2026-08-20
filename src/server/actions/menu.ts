"use server";

import { db } from "@/server/db";
import { requireOwner } from "@/server/auth/guards";
import { type ActionResponse } from "@/lib/types";
import { revalidatePath } from "next/cache";

export interface MenuItemOptionInput {
  name: string;
  price: number;
}

export interface CreateMenuItemInput {
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  isAvailable?: boolean;
  options?: MenuItemOptionInput[];
}

export interface UpdateMenuItemInput {
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  isAvailable?: boolean;
  options?: MenuItemOptionInput[];
}

/**
 * Creates a new dish for the authenticated owner's restaurant.
 */
export async function createMenuItemAction(
  input: CreateMenuItemInput
): Promise<ActionResponse<{ menuItemId: string }>> {
  try {
    const user = await requireOwner();

    const restaurant = await db.restaurant.findUnique({
      where: { ownerId: user.id },
      select: { id: true, slug: true },
    });

    if (!restaurant) {
      return { success: false, message: "Restaurant profile not found." };
    }

    if (!input.name || input.name.trim().length === 0) {
      return { success: false, message: "Dish name is required." };
    }

    const price = Math.max(0, input.price);
    const category = input.category.trim() || "Main Dishes";

    const newItem = await db.$transaction(async (tx) => {
      return tx.menuItem.create({
        data: {
          restaurantId: restaurant.id,
          name: input.name.trim(),
          description: input.description?.trim() || null,
          price,
          category,
          image: input.image?.trim() || null,
          isAvailable: input.isAvailable ?? true,
          options: {
            create: (input.options || []).map((opt) => ({
              name: opt.name.trim(),
              price: Math.max(0, opt.price),
            })),
          },
        },
      });
    });

    revalidatePath("/dashboard/menu");
    revalidatePath(`/restaurants/${restaurant.slug}`);
    revalidatePath("/food");

    return {
      success: true,
      message: `"${newItem.name}" added to menu successfully.`,
      data: { menuItemId: newItem.id },
    };
  } catch (error) {
    console.error("Create menu item error:", error);
    return { success: false, message: "Failed to create menu item." };
  }
}

/**
 * Updates an existing dish and replaces its options.
 */
export async function updateMenuItemAction(
  menuItemId: string,
  input: UpdateMenuItemInput
): Promise<ActionResponse> {
  try {
    const user = await requireOwner();

    // Verify ownership
    const existing = await db.menuItem.findUnique({
      where: { id: menuItemId },
      include: { restaurant: { select: { ownerId: true, slug: true } } },
    });

    if (!existing || existing.restaurant.ownerId !== user.id) {
      return { success: false, message: "Menu item not found or unauthorized." };
    }

    const price = Math.max(0, input.price);
    const category = input.category.trim() || "Main Dishes";

    await db.$transaction(async (tx) => {
      // 1. Update MenuItem basic fields
      await tx.menuItem.update({
        where: { id: menuItemId },
        data: {
          name: input.name.trim(),
          description: input.description?.trim() || null,
          price,
          category,
          image: input.image?.trim() || null,
          isAvailable: input.isAvailable ?? true,
        },
      });

      // 2. Delete existing options and insert updated ones
      await tx.menuItemOption.deleteMany({
        where: { menuItemId },
      });

      if (Array.isArray(input.options) && input.options.length > 0) {
        await tx.menuItemOption.createMany({
          data: input.options.map((opt) => ({
            menuItemId,
            name: opt.name.trim(),
            price: Math.max(0, opt.price),
          })),
        });
      }
    });

    revalidatePath("/dashboard/menu");
    revalidatePath(`/restaurants/${existing.restaurant.slug}`);
    revalidatePath(`/food/${menuItemId}`);
    revalidatePath("/food");

    return { success: true, message: "Dish updated successfully." };
  } catch (error) {
    console.error("Update menu item error:", error);
    return { success: false, message: "Failed to update menu item." };
  }
}

/**
 * Toggles dish availability (In Stock vs Sold Out) instantly.
 */
export async function toggleMenuItemAvailabilityAction(
  menuItemId: string
): Promise<ActionResponse<{ isAvailable: boolean }>> {
  try {
    const user = await requireOwner();

    const existing = await db.menuItem.findUnique({
      where: { id: menuItemId },
      include: { restaurant: { select: { ownerId: true, slug: true } } },
    });

    if (!existing || existing.restaurant.ownerId !== user.id) {
      return { success: false, message: "Unauthorized or dish not found." };
    }

    const updated = await db.menuItem.update({
      where: { id: menuItemId },
      data: { isAvailable: !existing.isAvailable },
    });

    revalidatePath("/dashboard/menu");
    revalidatePath(`/restaurants/${existing.restaurant.slug}`);
    revalidatePath(`/food/${menuItemId}`);
    revalidatePath("/food");

    return {
      success: true,
      message: `${updated.name} is now ${updated.isAvailable ? "Available" : "Sold Out"}.`,
      data: { isAvailable: updated.isAvailable },
    };
  } catch (error) {
    console.error("Toggle availability error:", error);
    return { success: false, message: "Failed to toggle availability." };
  }
}

/**
 * Deletes a menu item or marks it unavailable if it has historical orders.
 */
export async function deleteMenuItemAction(menuItemId: string): Promise<ActionResponse> {
  try {
    const user = await requireOwner();

    const existing = await db.menuItem.findUnique({
      where: { id: menuItemId },
      include: {
        restaurant: { select: { ownerId: true, slug: true } },
        _count: { select: { orderItems: true } },
      },
    });

    if (!existing || existing.restaurant.ownerId !== user.id) {
      return { success: false, message: "Unauthorized or dish not found." };
    }

    if (existing._count.orderItems > 0) {
      // Dish has historical purchase receipts, soft disable to preserve accounting integrity
      await db.menuItem.update({
        where: { id: menuItemId },
        data: { isAvailable: false },
      });

      revalidatePath("/dashboard/menu");
      revalidatePath(`/restaurants/${existing.restaurant.slug}`);
      return {
        success: true,
        message: `"${existing.name}" is referenced in past orders and was archived (set to Sold Out) to preserve historical receipts.`,
      };
    }

    // No historical orders, safe to hard delete
    await db.menuItem.delete({
      where: { id: menuItemId },
    });

    revalidatePath("/dashboard/menu");
    revalidatePath(`/restaurants/${existing.restaurant.slug}`);
    revalidatePath("/food");

    return { success: true, message: `"${existing.name}" removed from menu.` };
  } catch (error) {
    console.error("Delete menu item error:", error);
    return { success: false, message: "Failed to delete dish." };
  }
}
