"use server";

import { db } from "@/server/db";
import { requireAuth, requireOwner } from "@/server/auth/guards";
import { createReviewSchema, updateReviewSchema, reviewReplySchema, type CreateReviewInput, type UpdateReviewInput } from "@/lib/validations/review";
import { type ActionResponse } from "@/lib/types";
import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

/**
 * Creates a verified customer review for a delivered order.
 * Strictly verifies that:
 * 1. The order exists and was placed by this customer (`order.userId === user.id`)
 * 2. The order has reached `DELIVERED` status
 * 3. No review has already been submitted for this order (`orderId` uniqueness)
 */
export async function createReviewAction(
  rawInput: CreateReviewInput
): Promise<ActionResponse<{ reviewId: string }>> {
  try {
    const user = await requireAuth();

    const validated = createReviewSchema.safeParse(rawInput);
    if (!validated.success) {
      return {
        success: false,
        message: "Invalid review fields provided.",
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const { orderId, rating, comment } = validated.data;

    // 1. Fetch order and verify eligibility
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        review: true,
        restaurant: { select: { id: true, slug: true } },
      },
    });

    if (!order) {
      return { success: false, message: "Order not found." };
    }

    if (order.userId !== user.id) {
      return { success: false, message: "You can only review orders placed under your own account." };
    }

    if (order.status !== OrderStatus.DELIVERED) {
      return {
        success: false,
        message: "You can only submit a review once your meal has been confirmed as delivered.",
      };
    }

    if (order.review) {
      return {
        success: false,
        message: "A review has already been submitted for this order. You can edit your existing review instead.",
      };
    }

    // 2. Create the review
    const newReview = await db.review.create({
      data: {
        userId: user.id,
        restaurantId: order.restaurantId,
        orderId: order.id,
        rating,
        comment: comment?.trim() || null,
      },
    });

    revalidatePath(`/orders/${order.id}`);
    revalidatePath(`/restaurants/${order.restaurant.slug}`);
    revalidatePath("/admin/reviews");
    revalidatePath("/restaurants");
    revalidatePath("/");

    return {
      success: true,
      message: "Thank you for sharing your review and rating!",
      data: { reviewId: newReview.id },
    };
  } catch (error) {
    console.error("Create review error:", error);
    return { success: false, message: "Failed to submit review." };
  }
}

/**
 * Updates an existing customer review (rating and/or comment).
 */
export async function updateReviewAction(
  reviewId: string,
  rawInput: UpdateReviewInput
): Promise<ActionResponse> {
  try {
    const user = await requireAuth();

    const validated = updateReviewSchema.safeParse(rawInput);
    if (!validated.success) {
      return {
        success: false,
        message: "Invalid review fields provided.",
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const { rating, comment } = validated.data;

    // Verify ownership
    const review = await db.review.findUnique({
      where: { id: reviewId },
      include: {
        restaurant: { select: { slug: true } },
        order: { select: { id: true } },
      },
    });

    if (!review) {
      return { success: false, message: "Review not found." };
    }

    if (review.userId !== user.id && user.role !== "ADMIN") {
      return { success: false, message: "Unauthorized to edit this review." };
    }

    await db.review.update({
      where: { id: reviewId },
      data: {
        rating,
        comment: comment?.trim() || null,
      },
    });

    revalidatePath(`/orders/${review.order.id}`);
    revalidatePath(`/restaurants/${review.restaurant.slug}`);
    revalidatePath("/admin/reviews");

    return { success: true, message: "Your review has been updated." };
  } catch (error) {
    console.error("Update review error:", error);
    return { success: false, message: "Failed to update review." };
  }
}

/**
 * Deletes a customer's review.
 */
export async function deleteCustomerReviewAction(reviewId: string): Promise<ActionResponse> {
  try {
    const user = await requireAuth();

    const review = await db.review.findUnique({
      where: { id: reviewId },
      include: {
        restaurant: { select: { slug: true } },
        order: { select: { id: true } },
      },
    });

    if (!review) {
      return { success: false, message: "Review not found." };
    }

    if (review.userId !== user.id && user.role !== "ADMIN") {
      return { success: false, message: "Unauthorized to delete this review." };
    }

    await db.review.delete({
      where: { id: reviewId },
    });

    revalidatePath(`/orders/${review.order.id}`);
    revalidatePath(`/restaurants/${review.restaurant.slug}`);
    revalidatePath("/admin/reviews");

    return { success: true, message: "Review deleted successfully." };
  } catch (error) {
    console.error("Delete review error:", error);
    return { success: false, message: "Failed to delete review." };
  }
}

/**
 * Allows a restaurant owner to post or update a reply to a customer review.
 */
export async function ownerReplyToReviewAction(
  reviewId: string,
  rawContent: string
): Promise<ActionResponse> {
  try {
    const user = await requireOwner();

    const validated = reviewReplySchema.safeParse({ content: rawContent });
    if (!validated.success) {
      return {
        success: false,
        message: "Invalid reply content.",
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const { content } = validated.data;

    // Verify review belongs to owner's restaurant
    const review = await db.review.findUnique({
      where: { id: reviewId },
      include: {
        restaurant: { select: { ownerId: true, slug: true } },
      },
    });

    if (!review || (review.restaurant.ownerId !== user.id && user.role !== "ADMIN")) {
      return { success: false, message: "Unauthorized to reply to this review." };
    }

    await db.reviewReply.upsert({
      where: { reviewId },
      update: { content: content.trim() },
      create: {
        reviewId,
        content: content.trim(),
      },
    });

    revalidatePath(`/restaurants/${review.restaurant.slug}`);
    revalidatePath("/admin/reviews");

    return { success: true, message: "Your response to the customer has been posted." };
  } catch (error) {
    console.error("Owner reply error:", error);
    return { success: false, message: "Failed to post reply." };
  }
}
