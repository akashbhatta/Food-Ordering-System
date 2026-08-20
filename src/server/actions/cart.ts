"use server";

import { db } from "@/server/db";
import { getCurrentUser } from "@/server/auth/session";
import { type ActionResponse } from "@/lib/types";
import { revalidatePath } from "next/cache";

export interface AddToCartInput {
  menuItemId: string;
  quantity: number;
  selectedOptionIds?: string[];
  specialNotes?: string;
}

export interface ValidatedCartItem {
  id: string;
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  image?: string | null;
  category: string;
  restaurantId: string;
  restaurantName: string;
  specialNotes?: string;
  options: {
    id: string;
    name: string;
    price: number;
  }[];
  isAvailable: boolean;
}

export interface ValidatedCartSummary {
  items: ValidatedCartItem[];
  restaurantId: string | null;
  restaurantName: string | null;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  minOrderAmount: number;
  isMinOrderMet: boolean;
  hasUnavailableItems: boolean;
  itemCount: number;
}

/**
 * Server-side authoritative validation of a cart.
 * Never trusts prices, subtotal, or restaurant info sent from the client.
 * Fetches real MenuItems, active prices, options, and restaurant delivery fee directly from PostgreSQL.
 */
export async function validateCartServer(
  clientItems: {
    menuItemId: string;
    quantity: number;
    selectedOptionIds?: string[];
    specialNotes?: string;
  }[]
): Promise<ActionResponse<ValidatedCartSummary>> {
  try {
    if (!clientItems || clientItems.length === 0) {
      return {
        success: true,
        data: {
          items: [],
          restaurantId: null,
          restaurantName: null,
          subtotal: 0,
          deliveryFee: 0,
          tax: 0,
          total: 0,
          minOrderAmount: 0,
          isMinOrderMet: true,
          hasUnavailableItems: false,
          itemCount: 0,
        },
      };
    }

    // 1. Fetch all requested MenuItems with their options & restaurant in a single batch
    const itemIds = clientItems.map((i) => i.menuItemId);
    const dbMenuItems = await db.menuItem.findMany({
      where: { id: { in: itemIds } },
      include: {
        options: true,
        restaurant: {
          select: {
            id: true,
            name: true,
            status: true,
            isActive: true,
            deliveryFee: true,
            minOrderAmount: true,
          },
        },
      },
    });

    const menuMap = new Map(dbMenuItems.map((item) => [item.id, item]));

    // 2. Validate availability & accumulate per-restaurant data
    const restaurantData = new Map<string, { name: string; deliveryFee: number; minOrderAmount: number; subtotal: number }>();
    let hasUnavailableItems = false;

    const validatedItems: ValidatedCartItem[] = [];
    let subtotal = 0;
    let itemCount = 0;

    for (const clientItem of clientItems) {
      const quantity = Math.max(1, Math.floor(clientItem.quantity || 1));
      const dbItem = menuMap.get(clientItem.menuItemId);

      if (!dbItem) {
        hasUnavailableItems = true;
        continue;
      }

      // Check if restaurant is active and approved
      if (dbItem.restaurant.status !== "APPROVED" || !dbItem.restaurant.isActive) {
        hasUnavailableItems = true;
        continue;
      }

      // Track per-restaurant data
      if (!restaurantData.has(dbItem.restaurant.id)) {
        restaurantData.set(dbItem.restaurant.id, {
          name: dbItem.restaurant.name,
          deliveryFee: Number(dbItem.restaurant.deliveryFee.toString()),
          minOrderAmount: Number(dbItem.restaurant.minOrderAmount.toString()),
          subtotal: 0,
        });
      }

      if (!dbItem.isAvailable) {
        hasUnavailableItems = true;
      }

      // Calculate authoritative price from database values
      const basePrice = Number(dbItem.price.toString());
      const selectedOptionIds = clientItem.selectedOptionIds || [];

      const matchedOptions = dbItem.options
        .filter((opt) => selectedOptionIds.includes(opt.id))
        .map((opt) => ({
          id: opt.id,
          name: opt.name,
          price: Number(opt.price.toString()),
        }));

      const optionsPriceTotal = matchedOptions.reduce((acc, o) => acc + o.price, 0);
      const unitPrice = basePrice + optionsPriceTotal;
      const itemTotalPrice = unitPrice * quantity;

      subtotal += itemTotalPrice;
      itemCount += quantity;

      // Track per-restaurant subtotal
      const rd = restaurantData.get(dbItem.restaurant.id)!;
      rd.subtotal += itemTotalPrice;

      validatedItems.push({
        id: `${dbItem.id}-${selectedOptionIds.sort().join("-")}`,
        menuItemId: dbItem.id,
        name: dbItem.name,
        unitPrice,
        quantity,
        totalPrice: itemTotalPrice,
        image: dbItem.image,
        category: dbItem.category,
        restaurantId: dbItem.restaurant.id,
        restaurantName: dbItem.restaurant.name,
        specialNotes: clientItem.specialNotes?.slice(0, 200),
        options: matchedOptions,
        isAvailable: dbItem.isAvailable,
      });
    }

    // Sum delivery fees from all restaurants
    let totalDeliveryFee = 0;
    let isMinOrderMet = true;
    let minOrderAmount = 0;
    const restaurantNames: string[] = [];

    for (const [, rd] of restaurantData) {
      totalDeliveryFee += rd.deliveryFee;
      if (rd.subtotal < rd.minOrderAmount) {
        isMinOrderMet = false;
      }
      minOrderAmount = Math.max(minOrderAmount, rd.minOrderAmount);
      restaurantNames.push(rd.name);
    }

    const primaryRestaurantId = restaurantData.size === 1 ? Array.from(restaurantData.keys())[0] : null;
    const primaryRestaurantName = restaurantNames.length === 1 ? restaurantNames[0] : restaurantNames.join(", ");

    const tax = subtotal * 0.13; // 13% Nepal VAT
    const total = subtotal > 0 ? subtotal + totalDeliveryFee + tax : 0;

    return {
      success: true,
      data: {
        items: validatedItems,
        restaurantId: primaryRestaurantId,
        restaurantName: primaryRestaurantName,
        subtotal: Number(subtotal.toFixed(2)),
        deliveryFee: Number(totalDeliveryFee.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        total: Number(total.toFixed(2)),
        minOrderAmount: Number(minOrderAmount.toFixed(2)),
        isMinOrderMet,
        hasUnavailableItems,
        itemCount,
      },
    };
  } catch (error) {
    console.error("Cart server validation error:", error);
    return {
      success: false,
      message: "An error occurred while validating cart items.",
    };
  }
}

/**
 * Persists an item to the database for logged-in users.
 */
export async function addCartItemToDb(
  input: AddToCartInput
): Promise<ActionResponse<{ cartItemId: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: "User not authenticated" };
    }

    const quantity = Math.max(1, Math.floor(input.quantity || 1));

    // Fetch target menu item
    const menuItem = await db.menuItem.findUnique({
      where: { id: input.menuItemId },
      include: { options: true, restaurant: true },
    });

    if (!menuItem || !menuItem.isAvailable) {
      return { success: false, message: "This dish is currently unavailable." };
    }

    // Upsert into CartItem table
    const cartItem = await db.cartItem.upsert({
      where: {
        userId_menuItemId: {
          userId: user.id,
          menuItemId: menuItem.id,
        },
      },
      update: {
        quantity: { increment: quantity },
        specialNotes: input.specialNotes,
        options: input.selectedOptionIds || [],
      },
      create: {
        userId: user.id,
        menuItemId: menuItem.id,
        quantity,
        specialNotes: input.specialNotes,
        options: input.selectedOptionIds || [],
      },
    });

    revalidatePath("/cart");
    return {
      success: true,
      message: "Item added to cart.",
      data: { cartItemId: cartItem.id },
    };
  } catch (error) {
    console.error("Add to cart DB error:", error);
    return { success: false, message: "Failed to add item to cart." };
  }
}

/**
 * Removes a cart item from the database.
 */
export async function removeCartItemFromDb(cartItemId: string): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Unauthenticated" };

    await db.cartItem.deleteMany({
      where: {
        id: cartItemId,
        userId: user.id, // Enforces user ownership
      },
    });

    revalidatePath("/cart");
    return { success: true, message: "Item removed from cart." };
  } catch (error) {
    console.error("Remove cart item error:", error);
    return { success: false, message: "Failed to remove item." };
  }
}

/**
 * Clears the user's cart in the database.
 */
export async function clearCartInDb(): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Unauthenticated" };

    await db.cartItem.deleteMany({
      where: { userId: user.id },
    });

    revalidatePath("/cart");
    return { success: true, message: "Cart cleared." };
  } catch (error) {
    console.error("Clear cart error:", error);
    return { success: false, message: "Failed to clear cart." };
  }
}
