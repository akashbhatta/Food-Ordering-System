import { z } from "zod";

export const addressSchema = z.object({
  label: z
    .string()
    .min(1, "Label is required (e.g., Home, Work, Apartment)")
    .max(30, "Label is too long"),
  street: z
    .string()
    .min(3, "Street address is required")
    .max(100, "Street address is too long"),
  city: z
    .string()
    .min(2, "City is required")
    .max(50, "City is too long"),
  state: z
    .string()
    .min(2, "State is required (e.g. OR, CA, NY)")
    .max(20, "State is too long"),
  zipCode: z
    .string()
    .min(3, "Postal/Zip code is required")
    .max(15, "Invalid zip code format"),
  isDefault: z.boolean().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;
