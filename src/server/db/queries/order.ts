import { db } from "../index";
import { OrderStatus } from "@prisma/client";

export async function getCustomerOrders(userId: string) {
  try {
    return await db.order.findMany({
      where: { userId },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
            phone: true,
          },
        },
        items: true,
        review: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export async function getOrderById(orderId: string) {
  try {
    return await db.order.findUnique({
      where: { id: orderId },
      include: {
        restaurant: {
        select: {
          id: true,
          name: true,
          slug: true,
          image: true,
          phone: true,
          street: true,
          city: true,
          state: true,
          zipCode: true,
        },
      },
        address: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        items: true,
        review: {
          include: {
            reply: true,
          },
        },
      },
    });
  } catch {
    return null;
  }
}

export async function getRestaurantOrders(restaurantId: string, status?: OrderStatus) {
  try {
    return await db.order.findMany({
      where: {
        restaurantId,
        ...(status && { status }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        address: true,
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}
