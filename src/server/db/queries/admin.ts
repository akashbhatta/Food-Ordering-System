import { db } from "@/server/db";
import { Role, RestaurantStatus, OrderStatus } from "@prisma/client";

export async function getAdminOverviewMetrics() {
  try {
    const [
      totalUsers,
      totalRestaurants,
      totalOrders,
      allDeliveredOrders,
      pendingApprovalRestaurants,
      recentOrders,
      recentUsers,
      statusCounts,
    ] = await Promise.all([
      db.user.count(),
      db.restaurant.count(),
      db.order.count(),
      db.order.findMany({
        where: { status: OrderStatus.DELIVERED },
        select: { total: true },
      }),
      db.restaurant.count({
        where: { status: RestaurantStatus.PENDING },
      }),
      db.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        include: {
          user: { select: { name: true, email: true } },
          restaurant: { select: { name: true, slug: true } },
          items: true,
        },
      }),
      db.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isBanned: true,
          createdAt: true,
        },
      }),
      db.restaurant.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
    ]);

    const totalRevenue = allDeliveredOrders.reduce(
      (acc, o) => acc + Number(o.total.toString()),
      0
    );

    const restaurantStatusMap: Record<string, number> = {
      APPROVED: 0,
      PENDING: 0,
      REJECTED: 0,
      SUSPENDED: 0,
    };

    statusCounts.forEach((c) => {
      restaurantStatusMap[c.status] = c._count.status;
    });

    return {
      totalUsers,
      totalRestaurants,
      totalOrders,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      pendingApprovalRestaurants,
      recentOrders,
      recentUsers,
      restaurantStatusMap,
    };
  } catch (error) {
    console.error("Error fetching admin overview metrics:", error);
    return null;
  }
}

export interface AdminUsersParams {
  search?: string;
  role?: string;
  status?: string; // "active" | "banned"
  page?: number;
  limit?: number;
}

export async function getAdminUsers(params: AdminUsersParams) {
  try {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(50, params.limit || 10));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { email: { contains: params.search, mode: "insensitive" } },
        { phone: { contains: params.search, mode: "insensitive" } },
      ];
    }

    if (params.role && Object.values(Role).includes(params.role as Role)) {
      where.role = params.role as Role;
    }

    if (params.status === "banned") {
      where.isBanned = true;
    } else if (params.status === "active") {
      where.isBanned = false;
    }

    const [total, users] = await Promise.all([
      db.user.count({ where }),
      db.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          restaurant: { select: { id: true, name: true, slug: true } },
          _count: { select: { orders: true, reviews: true } },
        },
      }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return { users: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } };
  }
}

export interface AdminRestaurantsParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export async function getAdminRestaurants(params: AdminRestaurantsParams) {
  try {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(50, params.limit || 10));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { city: { contains: params.search, mode: "insensitive" } },
        { email: { contains: params.search, mode: "insensitive" } },
      ];
    }

    if (params.status && Object.values(RestaurantStatus).includes(params.status as RestaurantStatus)) {
      where.status = params.status as RestaurantStatus;
    }

    const [total, restaurants] = await Promise.all([
      db.restaurant.count({ where }),
      db.restaurant.findMany({
        where,
        orderBy: [{ createdAt: "desc" }],
        skip,
        take: limit,
        include: {
          owner: { select: { id: true, name: true, email: true, phone: true } },
          categories: true,
          _count: { select: { menuItems: true, orders: true, reviews: true } },
        },
      }),
    ]);

    return {
      restaurants,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  } catch (error) {
    console.error("Error fetching admin restaurants:", error);
    return { restaurants: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } };
  }
}

export async function getAdminCategories() {
  try {
    return await db.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { restaurants: true } },
      },
    });
  } catch (error) {
    console.error("Error fetching admin categories:", error);
    return [];
  }
}

export interface AdminOrdersParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export async function getAdminOrders(params: AdminOrdersParams) {
  try {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(50, params.limit || 10));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.search) {
      where.OR = [
        { orderNumber: { contains: params.search, mode: "insensitive" } },
        { user: { name: { contains: params.search, mode: "insensitive" } } },
        { restaurant: { name: { contains: params.search, mode: "insensitive" } } },
      ];
    }

    if (params.status && Object.values(OrderStatus).includes(params.status as OrderStatus)) {
      where.status = params.status as OrderStatus;
    }

    const [total, orders] = await Promise.all([
      db.order.count({ where }),
      db.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          restaurant: { select: { id: true, name: true, slug: true } },
          items: true,
          address: true,
        },
      }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    return { orders: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } };
  }
}

export interface AdminReviewsParams {
  search?: string;
  rating?: number;
  page?: number;
  limit?: number;
}

export async function getAdminReviews(params: AdminReviewsParams) {
  try {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(50, params.limit || 10));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.search) {
      where.OR = [
        { comment: { contains: params.search, mode: "insensitive" } },
        { user: { name: { contains: params.search, mode: "insensitive" } } },
        { restaurant: { name: { contains: params.search, mode: "insensitive" } } },
      ];
    }

    if (params.rating) {
      where.rating = params.rating;
    }

    const [total, reviews] = await Promise.all([
      db.review.count({ where }),
      db.review.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true } },
          restaurant: { select: { id: true, name: true, slug: true } },
          order: { select: { id: true, orderNumber: true } },
          reply: true,
        },
      }),
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  } catch (error) {
    console.error("Error fetching admin reviews:", error);
    return { reviews: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } };
  }
}

export interface AdminMenuItemsParams {
  search?: string;
  category?: string;
  isAvailable?: boolean;
  page?: number;
  limit?: number;
}

export async function getAdminMenuItems(params: AdminMenuItemsParams) {
  try {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(50, params.limit || 10));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { restaurant: { name: { contains: params.search, mode: "insensitive" } } },
      ];
    }

    if (params.category) {
      where.category = params.category;
    }

    if (params.isAvailable !== undefined) {
      where.isAvailable = params.isAvailable;
    }

    const [total, items] = await Promise.all([
      db.menuItem.count({ where }),
      db.menuItem.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          restaurant: { select: { id: true, name: true, slug: true } },
          options: true,
          _count: { select: { orderItems: true } },
        },
      }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  } catch (error) {
    console.error("Error fetching admin menu items:", error);
    return { items: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } };
  }
}
