"use server";

import { db } from "@/server/db";
import { requireAdmin } from "@/server/auth/guards";
import { type ActionResponse } from "@/lib/types";
import { Role, RestaurantStatus, OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

/**
 * Toggles a user's banned status (isBanned).
 * Banned users are denied login through NextAuth credentials authorization.
 */
export async function toggleUserBanAction(
  userId: string
): Promise<ActionResponse<{ isBanned: boolean }>> {
  try {
    const admin = await requireAdmin();

    if (admin.id === userId) {
      return { success: false, message: "Administrators cannot ban their own account." };
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, isBanned: true, role: true },
    });

    if (!user) {
      return { success: false, message: "User not found." };
    }

    if (user.role === Role.ADMIN) {
      return { success: false, message: "Cannot ban another administrator." };
    }

    const updated = await db.user.update({
      where: { id: userId },
      data: { isBanned: !user.isBanned },
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin");

    return {
      success: true,
      message: `User ${updated.name} has been ${updated.isBanned ? "suspended/banned" : "reactivated"}.`,
      data: { isBanned: updated.isBanned },
    };
  } catch (error) {
    console.error("Toggle ban error:", error);
    return { success: false, message: "Failed to update user status." };
  }
}

/**
 * Changes a user's platform role (CUSTOMER, RESTAURANT_OWNER, ADMIN).
 */
export async function changeUserRoleAction(
  userId: string,
  newRole: Role
): Promise<ActionResponse> {
  try {
    const admin = await requireAdmin();

    if (admin.id === userId && newRole !== Role.ADMIN) {
      return { success: false, message: "You cannot demote your own admin account." };
    }

    await db.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin");

    return { success: true, message: `User role updated to ${newRole}.` };
  } catch (error) {
    console.error("Change role error:", error);
    return { success: false, message: "Failed to update user role." };
  }
}

/**
 * Updates restaurant moderation status (APPROVED, PENDING, REJECTED, SUSPENDED)
 * and active status.
 */
export async function updateRestaurantStatusAction(
  restaurantId: string,
  newStatus: RestaurantStatus,
  isActive?: boolean
): Promise<ActionResponse> {
  try {
    await requireAdmin();

    const restaurant = await db.restaurant.findUnique({
      where: { id: restaurantId },
      select: { id: true, name: true, slug: true },
    });

    if (!restaurant) {
      return { success: false, message: "Restaurant not found." };
    }

    await db.restaurant.update({
      where: { id: restaurantId },
      data: {
        status: newStatus,
        ...(isActive !== undefined && { isActive }),
      },
    });

    revalidatePath("/admin/restaurants");
    revalidatePath("/admin");
    revalidatePath("/restaurants");
    revalidatePath(`/restaurants/${restaurant.slug}`);
    revalidatePath("/");

    return {
      success: true,
      message: `Restaurant "${restaurant.name}" status updated to ${newStatus}.`,
    };
  } catch (error) {
    console.error("Update restaurant status error:", error);
    return { success: false, message: "Failed to update restaurant status." };
  }
}

/**
 * Creates a global category.
 */
export async function createCategoryAction(input: {
  name: string;
  image?: string;
}): Promise<ActionResponse<{ categoryId: string }>> {
  try {
    await requireAdmin();

    if (!input.name || input.name.trim().length === 0) {
      return { success: false, message: "Category name is required." };
    }

    const name = input.name.trim();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    const existing = await db.category.findFirst({
      where: { OR: [{ name }, { slug }] },
    });

    if (existing) {
      return { success: false, message: "A category with this name or slug already exists." };
    }

    const created = await db.category.create({
      data: {
        name,
        slug,
        image: input.image?.trim() || null,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/restaurants");
    revalidatePath("/food");
    revalidatePath("/");

    return {
      success: true,
      message: `Category "${created.name}" created successfully.`,
      data: { categoryId: created.id },
    };
  } catch (error) {
    console.error("Create category error:", error);
    return { success: false, message: "Failed to create category." };
  }
}

/**
 * Updates a global category.
 */
export async function updateCategoryAction(
  categoryId: string,
  input: { name: string; image?: string }
): Promise<ActionResponse> {
  try {
    await requireAdmin();

    const name = input.name.trim();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    await db.category.update({
      where: { id: categoryId },
      data: {
        name,
        slug,
        image: input.image?.trim() || null,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/restaurants");
    revalidatePath("/food");
    revalidatePath("/");

    return { success: true, message: `Category updated successfully.` };
  } catch (error) {
    console.error("Update category error:", error);
    return { success: false, message: "Failed to update category." };
  }
}

/**
 * Deletes a global category.
 */
export async function deleteCategoryAction(categoryId: string): Promise<ActionResponse> {
  try {
    await requireAdmin();

    await db.category.delete({
      where: { id: categoryId },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/restaurants");
    revalidatePath("/food");
    revalidatePath("/");

    return { success: true, message: "Category deleted." };
  } catch (error) {
    console.error("Delete category error:", error);
    return { success: false, message: "Failed to delete category." };
  }
}

/**
 * Deletes an inappropriate/spam review.
 */
export async function deleteReviewAction(reviewId: string): Promise<ActionResponse> {
  try {
    await requireAdmin();

    const review = await db.review.findUnique({
      where: { id: reviewId },
      select: { id: true, restaurantId: true },
    });

    if (!review) {
      return { success: false, message: "Review not found." };
    }

    await db.review.delete({
      where: { id: reviewId },
    });

    revalidatePath("/admin/reviews");
    revalidatePath("/admin");

    return { success: true, message: "Review removed successfully." };
  } catch (error) {
    console.error("Delete review error:", error);
    return { success: false, message: "Failed to delete review." };
  }
}

/**
 * Admin emergency order status override.
 */
export async function adminUpdateOrderStatusAction(
  orderId: string,
  newStatus: OrderStatus
): Promise<ActionResponse> {
  try {
    await requireAdmin();

    await db.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/orders/${orderId}`);
    revalidatePath("/admin");

    return { success: true, message: `Order status overridden to ${newStatus}.` };
  } catch (error) {
    console.error("Admin update order error:", error);
    return { success: false, message: "Failed to update order status." };
  }
}
