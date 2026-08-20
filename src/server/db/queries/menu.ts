import { db } from "../index";

export interface FoodFilterParams {
  searchQuery?: string;
  category?: string;
  cuisineSlug?: string;
  restaurantId?: string;
  minPrice?: number;
  maxPrice?: number;
  isAvailable?: boolean;
  sortBy?: "price_asc" | "price_desc" | "name_asc" | "popular_desc" | "newest";
  page?: number;
  limit?: number;
}

export async function getRestaurantMenu(restaurantId: string) {
  try {
    return await db.menuItem.findMany({
      where: { restaurantId },
      include: {
        options: true,
      },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
  } catch {
    return [];
  }
}

export async function getMenuItemById(id: string) {
  try {
    return await db.menuItem.findUnique({
      where: { id },
      include: {
        options: true,
        restaurant: {
          include: {
            categories: true,
            operatingHours: true,
          },
        },
      },
    });
  } catch {
    return null;
  }
}

export async function getPopularDishes(limit = 8) {
  try {
    return await db.menuItem.findMany({
      where: {
        isAvailable: true,
        restaurant: {
          status: "APPROVED",
          isActive: true,
        },
      },
      include: {
        options: true,
        restaurant: {
          select: {
            id: true,
            name: true,
            slug: true,
            deliveryFee: true,
            avgDeliveryMin: true,
          },
        },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export async function getFoodCatalog(filters?: FoodFilterParams) {
  try {
    const page = Math.max(1, filters?.page || 1);
    const limit = Math.max(1, Math.min(50, filters?.limit || 12));
    const skip = (page - 1) * limit;

    let orderBy: any = { createdAt: "desc" };
    if (filters?.sortBy === "price_asc") {
      orderBy = { price: "asc" };
    } else if (filters?.sortBy === "price_desc") {
      orderBy = { price: "desc" };
    } else if (filters?.sortBy === "name_asc") {
      orderBy = { name: "asc" };
    } else if (filters?.sortBy === "popular_desc") {
      orderBy = { orderItems: { _count: "desc" } };
    }

    const where: any = {
      restaurant: {
        status: "APPROVED",
        isActive: true,
        ...(filters?.cuisineSlug && {
          categories: {
            some: { slug: filters.cuisineSlug },
          },
        }),
        ...(filters?.restaurantId && {
          id: filters.restaurantId,
        }),
      },
      ...(filters?.isAvailable !== undefined && { isAvailable: filters.isAvailable }),
      ...(filters?.category && { category: { equals: filters.category, mode: "insensitive" } }),
      ...(filters?.searchQuery && {
        OR: [
          { name: { contains: filters.searchQuery, mode: "insensitive" } },
          { description: { contains: filters.searchQuery, mode: "insensitive" } },
        ],
      }),
      ...((filters?.minPrice !== undefined || filters?.maxPrice !== undefined) && {
        price: {
          ...(filters?.minPrice !== undefined && { gte: filters.minPrice }),
          ...(filters?.maxPrice !== undefined && { lte: filters.maxPrice }),
        },
      }),
    };

    const [total, dishes] = await Promise.all([
      db.menuItem.count({ where }),
      db.menuItem.findMany({
        where,
        include: {
          options: true,
          restaurant: {
            select: {
              id: true,
              name: true,
              slug: true,
              deliveryFee: true,
              avgDeliveryMin: true,
              minOrderAmount: true,
            },
          },
          _count: {
            select: { orderItems: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    return {
      dishes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  } catch {
    return {
      dishes: [],
      pagination: { page: 1, limit: 12, total: 0, totalPages: 1 },
    };
  }
}
