import { db } from "@/server/db";
import { OrderStatus } from "@prisma/client";

export async function getOwnerRestaurantOverview(ownerId: string) {
  try {
    const restaurant = await db.restaurant.findUnique({
      where: { ownerId },
      include: {
        categories: true,
        operatingHours: { orderBy: { dayOfWeek: "asc" } },
      },
    });

    if (!restaurant) {
      return null;
    }

    // Compute metrics
    const [
      totalOrders,
      pendingOrders,
      preparingOrders,
      completedOrders,
      allDeliveredOrders,
      recentOrders,
      menuItems,
    ] = await Promise.all([
      db.order.count({ where: { restaurantId: restaurant.id } }),
      db.order.count({ where: { restaurantId: restaurant.id, status: OrderStatus.PENDING } }),
      db.order.count({
        where: {
          restaurantId: restaurant.id,
          status: { in: [OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.OUT_FOR_DELIVERY] },
        },
      }),
      db.order.count({ where: { restaurantId: restaurant.id, status: OrderStatus.DELIVERED } }),
      db.order.findMany({
        where: { restaurantId: restaurant.id, status: OrderStatus.DELIVERED },
        select: { total: true, createdAt: true },
      }),
      db.order.findMany({
        where: { restaurantId: restaurant.id },
        orderBy: { createdAt: "desc" },
        take: 6,
        include: {
          user: { select: { name: true, email: true, phone: true } },
          items: true,
          address: true,
        },
      }),
      db.menuItem.findMany({
        where: { restaurantId: restaurant.id },
        include: {
          options: true,
          _count: { select: { orderItems: true } },
        },
        orderBy: { orderItems: { _count: "desc" } },
        take: 5,
      }),
    ]);

    // Calculate all-time and today's revenue
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const totalRevenue = allDeliveredOrders.reduce(
      (acc, o) => acc + Number(o.total.toString()),
      0
    );

    const todayRevenue = allDeliveredOrders
      .filter((o) => new Date(o.createdAt) >= startOfToday)
      .reduce((acc, o) => acc + Number(o.total.toString()), 0);

    return {
      restaurant,
      metrics: {
        totalOrders,
        pendingOrders,
        preparingOrders,
        completedOrders,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        todayRevenue: Number(todayRevenue.toFixed(2)),
      },
      recentOrders,
      popularItems: menuItems,
    };
  } catch (error) {
    console.error("Error fetching owner overview:", error);
    return null;
  }
}

export async function getOwnerOrders(ownerId: string, status?: string) {
  try {
    const restaurant = await db.restaurant.findUnique({
      where: { ownerId },
      select: { id: true, name: true, slug: true },
    });

    if (!restaurant) return { restaurant: null, orders: [] };

    const whereClause: any = { restaurantId: restaurant.id };

    if (status === "active") {
      whereClause.status = {
        in: [
          OrderStatus.PENDING,
          OrderStatus.CONFIRMED,
          OrderStatus.PREPARING,
          OrderStatus.READY,
          OrderStatus.OUT_FOR_DELIVERY,
        ],
      };
    } else if (status === "completed") {
      whereClause.status = {
        in: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
      };
    } else if (status && Object.values(OrderStatus).includes(status as OrderStatus)) {
      whereClause.status = status as OrderStatus;
    }

    const orders = await db.order.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        items: true,
        address: true,
      },
    });

    return { restaurant, orders };
  } catch (error) {
    console.error("Error fetching owner orders:", error);
    return { restaurant: null, orders: [] };
  }
}

export async function getOwnerMenuItems(ownerId: string) {
  try {
    const restaurant = await db.restaurant.findUnique({
      where: { ownerId },
      select: { id: true, name: true, slug: true },
    });

    if (!restaurant) return { restaurant: null, items: [], categories: [] };

    const items = await db.menuItem.findMany({
      where: { restaurantId: restaurant.id },
      include: {
        options: true,
        _count: { select: { orderItems: true } },
      },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    // Extract unique categories
    const categories = Array.from(new Set(items.map((i) => i.category))).filter(Boolean);

    return { restaurant, items, categories };
  } catch (error) {
    console.error("Error fetching owner menu items:", error);
    return { restaurant: null, items: [], categories: [] };
  }
}

export async function getOwnerRestaurantSettings(ownerId: string) {
  try {
    return await db.restaurant.findUnique({
      where: { ownerId },
      include: {
        categories: true,
        operatingHours: { orderBy: { dayOfWeek: "asc" } },
      },
    });
  } catch (error) {
    console.error("Error fetching restaurant settings:", error);
    return null;
  }
}
