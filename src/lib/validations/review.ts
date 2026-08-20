import { z } from "zod";

export const createReviewSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  rating: z
    .number({ message: "Rating must be between 1 and 5" })
    .int("Rating must be a whole number")
    .min(1, "Minimum rating is 1 star")
    .max(5, "Maximum rating is 5 stars"),
  comment: z
    .string()
    .max(1000, "Comment cannot exceed 1000 characters")
    .optional(),
});

export const updateReviewSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, "Minimum rating is 1 star")
    .max(5, "Maximum rating is 5 stars"),
  comment: z
    .string()
    .max(1000, "Comment cannot exceed 1000 characters")
    .optional(),
});

export const reviewReplySchema = z.object({
  content: z
    .string()
    .min(2, "Reply must be at least 2 characters")
    .max(1000, "Reply cannot exceed 1000 characters"),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type ReviewReplyInput = z.infer<typeof reviewReplySchema>;
