import { db } from "../index";
import { RestaurantStatus } from "@prisma/client";

export interface RestaurantFilterParams {
  searchQuery?: string;
  categorySlug?: string;
  city?: string;
  maxDeliveryFee?: number;
  minRating?: number;
  isOpenOnly?: boolean;
  sortBy?: "rating_desc" | "delivery_asc" | "min_order_asc" | "name_asc";
  page?: number;
  limit?: number;
}

export async function getCategories() {
  try {
    return await db.category.findMany({
      include: {
        _count: {
          select: { restaurants: true },
        },
      },
      orderBy: { name: "asc" },
    });
  } catch {
    return [];
  }
}

export async function getFeaturedRestaurants(limit = 6) {
  try {
    return await db.restaurant.findMany({
      where: {
        status: RestaurantStatus.APPROVED,
        isActive: true,
      },
      include: {
        categories: true,
        reviews: {
          select: { rating: true },
        },
        _count: {
          select: {
            menuItems: true,
            reviews: true,
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

export async function getApprovedRestaurants(filters?: RestaurantFilterParams) {
  try {
    const page = Math.max(1, filters?.page || 1);
    const limit = Math.max(1, Math.min(50, filters?.limit || 12));
    const skip = (page - 1) * limit;

    // Build sort order
    let orderBy: Record<string, "asc" | "desc"> = { createdAt: "desc" };
    if (filters?.sortBy === "delivery_asc") {
      orderBy = { deliveryFee: "asc" };
    } else if (filters?.sortBy === "min_order_asc") {
      orderBy = { minOrderAmount: "asc" };
    } else if (filters?.sortBy === "name_asc") {
      orderBy = { name: "asc" };
    }

    const where: any = {
      status: RestaurantStatus.APPROVED,
      isActive: true,
      ...(filters?.city && { city: { contains: filters.city, mode: "insensitive" } }),
      ...(filters?.maxDeliveryFee !== undefined && {
        deliveryFee: { lte: filters.maxDeliveryFee },
      }),
      ...(filters?.searchQuery && {
        OR: [
          { name: { contains: filters.searchQuery, mode: "insensitive" } },
          { description: { contains: filters.searchQuery, mode: "insensitive" } },
          {
            menuItems: {
              some: {
                name: { contains: filters.searchQuery, mode: "insensitive" },
              },
            },
          },
        ],
      }),
      ...(filters?.categorySlug && {
        categories: {
          some: {
            slug: filters.categorySlug,
          },
        },
      }),
    };

    // If open-only requested, verify operating hours for current day
    const now = new Date();
    const currentDay = now.getDay();
    const currentTimeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const [totalRaw, allRestaurants] = await Promise.all([
      db.restaurant.count({ where }),
      db.restaurant.findMany({
        where,
        include: {
          categories: true,
          operatingHours: true,
          reviews: {
            select: { rating: true },
          },
          _count: {
            select: {
              reviews: true,
              menuItems: true,
            },
          },
        },
        orderBy,
      }),
    ]);

    // Apply in-memory rating filter & open status filter if requested
    let filtered = allRestaurants;

    if (filters?.isOpenOnly) {
      filtered = filtered.filter((r) => {
        const todayHours = r.operatingHours.find((h) => h.dayOfWeek === currentDay);
        if (!todayHours || todayHours.isClosed) return false;
        return currentTimeStr >= todayHours.openTime && currentTimeStr <= todayHours.closeTime;
      });
    }

    if (filters?.minRating) {
      filtered = filtered.filter((r) => {
        const avg =
          r.reviews.length > 0
            ? r.reviews.reduce((acc, rev) => acc + rev.rating, 0) / r.reviews.length
            : 0;
        return avg >= filters.minRating!;
      });
    }

    if (filters?.sortBy === "rating_desc") {
      filtered.sort((a, b) => {
        const avgA =
          a.reviews.length > 0
            ? a.reviews.reduce((acc, r) => acc + r.rating, 0) / a.reviews.length
            : 0;
        const avgB =
          b.reviews.length > 0
            ? b.reviews.reduce((acc, r) => acc + r.rating, 0) / b.reviews.length
            : 0;
        return avgB - avgA;
      });
    }

    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + limit);

    return {
      restaurants: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  } catch {
    return {
      restaurants: [],
      pagination: { page: 1, limit: 12, total: 0, totalPages: 1 },
    };
  }
}

export async function getRestaurantBySlug(slug: string) {
  try {
    return await db.restaurant.findUnique({
      where: { slug },
      include: {
        categories: true,
        operatingHours: {
          orderBy: { dayOfWeek: "asc" },
        },
        menuItems: {
          include: {
            options: true,
          },
          orderBy: [{ category: "asc" }, { name: "asc" }],
        },
        reviews: {
          include: {
            user: {
              select: { id: true, name: true, image: true },
            },
            reply: true,
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            reviews: true,
            orders: true,
            menuItems: true,
          },
        },
      },
    });
  } catch {
    return null;
  }
}

export async function getOwnerRestaurant(ownerId: string) {
  try {
    return await db.restaurant.findUnique({
      where: { ownerId },
      include: {
        categories: true,
        operatingHours: {
          orderBy: { dayOfWeek: "asc" },
        },
      },
    });
  } catch {
    return null;
  }
}
