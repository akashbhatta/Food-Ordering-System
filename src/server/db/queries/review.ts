import { db } from "../index";

export async function getRestaurantReviews(restaurantId: string) {
  return db.review.findMany({
    where: { restaurantId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      reply: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRestaurantRatingStats(restaurantId: string) {
  const result = await db.review.aggregate({
    where: { restaurantId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return {
    averageRating: result._avg.rating ? Number(result._avg.rating.toFixed(1)) : 0,
    totalReviews: result._count.rating,
  };
}
