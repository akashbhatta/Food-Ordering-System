"use server";

import { db } from "@/server/db";
import { requireAuth, requireOwnership } from "@/server/auth/guards";
import { type ActionResponse } from "@/lib/types";
import { OrderStatus, PaymentMethod } from "@prisma/client";
import { processPayment } from "@/lib/payment";
import { revalidatePath } from "next/cache";

export interface PlaceOrderInput {
  addressId: string;
  paymentMethod: PaymentMethod;
  specialNotes?: string;
  items: {
    menuItemId: string;
    quantity: number;
    selectedOptionIds?: string[];
    specialNotes?: string;
  }[];
}

// Generate human-friendly unique order reference: ORD-20260816-7A9B
function generateOrderNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${dateStr}-${randomHex}`;
}

/**
 * Creates an order inside an atomic database transaction.
 * Authoritatively recalculates prices from PostgreSQL, creates snapshots, and clears the cart.
 */
export async function placeOrderAction(
  input: PlaceOrderInput
): Promise<ActionResponse<{ orderId: string; orderNumber: string }>> {
  try {
    const user = await requireAuth();

    if (!input.items || input.items.length === 0) {
      return { success: false, message: "Your cart is empty." };
    }

    if (!input.addressId) {
      return { success: false, message: "Please select a delivery address." };
    }

    // 1. Verify delivery address belongs to this customer
    const address = await db.address.findUnique({
      where: { id: input.addressId },
    });

    if (!address || address.userId !== user.id) {
      return { success: false, message: "Selected delivery address is invalid." };
    }

    // 2. Fetch authoritative database data for all items & parent restaurant
    const itemIds = input.items.map((i) => i.menuItemId);
    const dbMenuItems = await db.menuItem.findMany({
      where: { id: { in: itemIds } },
      include: {
        options: true,
        restaurant: true,
      },
    });

    const menuMap = new Map(dbMenuItems.map((item) => [item.id, item]));

    let primaryRestaurantId: string | null = null;
    let deliveryFee = 0;
    let minOrderAmount = 0;
    let avgDeliveryMin = 30;
    const seenRestaurants = new Set<string>();

    let subtotal = 0;
    const orderItemsData: {
      menuItemId: string;
      name: string;
      price: number;
      quantity: number;
      options: { id: string; name: string; price: number }[];
    }[] = [];

    // 3. Process every line item and verify single-restaurant constraint
    for (const item of input.items) {
      const dbItem = menuMap.get(item.menuItemId);
      if (!dbItem) {
        return { success: false, message: "One or more items in your cart no longer exist." };
      }

      if (!dbItem.isAvailable) {
        return { success: false, message: `"${dbItem.name}" is currently sold out.` };
      }

      if (dbItem.restaurant.status !== "APPROVED" || !dbItem.restaurant.isActive) {
        return { success: false, message: `Restaurant "${dbItem.restaurant.name}" is currently not accepting orders.` };
      }

      if (!primaryRestaurantId) {
        primaryRestaurantId = dbItem.restaurant.id;
        deliveryFee += Number(dbItem.restaurant.deliveryFee.toString());
        minOrderAmount = Math.max(minOrderAmount, Number(dbItem.restaurant.minOrderAmount.toString()));
        avgDeliveryMin = Math.max(avgDeliveryMin, dbItem.restaurant.avgDeliveryMin);
      } else if (primaryRestaurantId !== dbItem.restaurant.id) {
        // Multi-restaurant: accumulate delivery fees
        if (!seenRestaurants.has(dbItem.restaurant.id)) {
          deliveryFee += Number(dbItem.restaurant.deliveryFee.toString());
          minOrderAmount = Math.max(minOrderAmount, Number(dbItem.restaurant.minOrderAmount.toString()));
          avgDeliveryMin = Math.max(avgDeliveryMin, dbItem.restaurant.avgDeliveryMin);
        }
      }
      seenRestaurants.add(dbItem.restaurant.id);

      const quantity = Math.max(1, Math.floor(item.quantity || 1));
      const basePrice = Number(dbItem.price.toString());
      const selectedOptionIds = item.selectedOptionIds || [];

      const matchedOptions = dbItem.options
        .filter((opt) => selectedOptionIds.includes(opt.id))
        .map((opt) => ({
          id: opt.id,
          name: opt.name,
          price: Number(opt.price.toString()),
        }));

      const optionsPriceTotal = matchedOptions.reduce((acc, o) => acc + o.price, 0);
      const unitPrice = basePrice + optionsPriceTotal;
      const lineTotal = unitPrice * quantity;

      subtotal += lineTotal;

      orderItemsData.push({
        menuItemId: dbItem.id,
        name: dbItem.name, // Snapshot of item name
        price: unitPrice,  // Snapshot of purchased unit price
        quantity,
        options: matchedOptions,
      });
    }

    if (subtotal < minOrderAmount) {
      return {
        success: false,
        message: `Minimum order amount of Rs. ${minOrderAmount.toFixed(0)} not met.`,
      };
    }

    const tax = subtotal * 0.13; // 13% Nepal VAT
    const total = subtotal + deliveryFee + tax;
    const orderNumber = generateOrderNumber();

    // 4. Process payment through payment provider abstraction
    const paymentResult = await processPayment({
      amount: total,
      paymentMethod: input.paymentMethod,
      orderNumber,
      customerEmail: user.email || "",
    });

    if (!paymentResult.success) {
      return { success: false, message: paymentResult.message || "Payment processing failed." };
    }

    // 5. Execute Order creation & Cart clearance inside an atomic Prisma Transaction
    const estimatedDeliveryAt = new Date(Date.now() + avgDeliveryMin * 60 * 1000);

    const newOrder = await db.$transaction(async (tx) => {
      // Create the Order
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: user.id,
          restaurantId: primaryRestaurantId!,
          addressId: input.addressId,
          status: OrderStatus.PENDING,
          paymentMethod: input.paymentMethod,
          subtotal: Number(subtotal.toFixed(2)),
          deliveryFee: Number(deliveryFee.toFixed(2)),
          tax: Number(tax.toFixed(2)),
          total: Number(total.toFixed(2)),
          specialNotes: input.specialNotes?.trim() || null,
          estimatedDeliveryAt,
          items: {
            create: orderItemsData.map((oi) => ({
              menuItemId: oi.menuItemId,
              name: oi.name,
              price: oi.price,
              quantity: oi.quantity,
              options: oi.options,
            })),
          },
        },
      });

      // Clear user's cart in the database
      await tx.cartItem.deleteMany({
        where: { userId: user.id },
      });

      return createdOrder;
    });

    revalidatePath("/orders");
    revalidatePath("/cart");

    return {
      success: true,
      message: "Order placed successfully!",
      data: {
        orderId: newOrder.id,
        orderNumber: newOrder.orderNumber,
      },
    };
  } catch (error) {
    console.error("Order creation error:", error);
    return {
      success: false,
      message: "An unexpected error occurred while creating your order.",
    };
  }
}

/**
 * Allows a customer to cancel their own order ONLY while status is PENDING.
 */
export async function cancelOrderAction(orderId: string): Promise<ActionResponse> {
  try {
    const user = await requireAuth();

    const order = await db.order.findUnique({
      where: { id: orderId },
      select: { id: true, userId: true, status: true },
    });

    if (!order) {
      return { success: false, message: "Order not found." };
    }

    // Verify ownership
    if (order.userId !== user.id && user.role !== "ADMIN") {
      return { success: false, message: "Unauthorized to cancel this order." };
    }

    // Rule: Customers can only cancel while status === PENDING
    if (order.status !== OrderStatus.PENDING && user.role !== "ADMIN") {
      return {
        success: false,
        message: "Order cannot be cancelled because the kitchen has already started preparing your food.",
      };
    }

    await db.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CANCELLED },
    });

    revalidatePath(`/orders/${orderId}`);
    revalidatePath("/orders");

    return { success: true, message: "Order cancelled successfully." };
  } catch (error) {
    console.error("Cancel order error:", error);
    return { success: false, message: "Failed to cancel order." };
  }
}

/**
 * Validated status transition handler for Restaurant Owners and Admins.
 */
export async function updateOrderStatusAction(
  orderId: string,
  newStatus: OrderStatus
): Promise<ActionResponse> {
  try {
    const user = await requireAuth();

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { restaurant: { select: { ownerId: true } } },
    });

    if (!order) {
      return { success: false, message: "Order not found." };
    }

    // Must be restaurant owner or admin
    if (order.restaurant.ownerId !== user.id && user.role !== "ADMIN") {
      return { success: false, message: "Unauthorized to update this order's status." };
    }

    // Valid state transitions
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      CONFIRMED: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      PREPARING: [OrderStatus.READY],
      READY: [OrderStatus.OUT_FOR_DELIVERY],
      OUT_FOR_DELIVERY: [OrderStatus.DELIVERED],
      DELIVERED: [],
      CANCELLED: [],
    };

    if (user.role !== "ADMIN" && !validTransitions[order.status].includes(newStatus)) {
      return {
        success: false,
        message: `Invalid status transition from ${order.status} to ${newStatus}.`,
      };
    }

    await db.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });

    revalidatePath(`/orders/${orderId}`);
    revalidatePath("/orders");
    revalidatePath("/dashboard/orders");

    return { success: true, message: `Order status updated to ${newStatus}.` };
  } catch (error) {
    console.error("Update order status error:", error);
    return { success: false, message: "Failed to update order status." };
  }
}
