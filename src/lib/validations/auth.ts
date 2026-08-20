import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        // Allow Nepali formats: +977 98XXXXXXXX, 98XXXXXXXX, 97XXXXXXXX, 96XXXXXXXX, or general valid phone
        const cleaned = val.replace(/[\s\-()]/g, "");
        return /^(\+?977)?[9][6-8]\d{8}$/.test(cleaned) || /^[+]?[0-9]{7,15}$/.test(cleaned);
      },
      {
        message: "Please enter a valid 10-digit mobile number (e.g. 98XXXXXXXX or +977 98XXXXXXXX)",
      }
    ),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password is too long"),
  role: z.enum(["CUSTOMER", "OWNER"], {
    message: "Please select either Customer or Restaurant Owner",
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
