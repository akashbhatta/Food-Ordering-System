"use server";

import { db } from "@/server/db";
import { requireAuth } from "@/server/auth/guards";
import { addressSchema, type AddressInput } from "@/lib/validations/address";
import { type ActionResponse } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function createAddressAction(
  rawInput: AddressInput
): Promise<ActionResponse<{ addressId: string }>> {
  try {
    const user = await requireAuth();

    const validated = addressSchema.safeParse(rawInput);
    if (!validated.success) {
      return {
        success: false,
        message: "Invalid address fields provided.",
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const { label, street, city, state, zipCode, isDefault } = validated.data;

    const newAddress = await db.$transaction(async (tx) => {
      // If setting as default, unset other defaults
      if (isDefault) {
        await tx.address.updateMany({
          where: { userId: user.id },
          data: { isDefault: false },
        });
      }

      // Check if this is user's first address, if so make it default
      const existingCount = await tx.address.count({ where: { userId: user.id } });
      const makeDefault = isDefault || existingCount === 0;

      return tx.address.create({
        data: {
          userId: user.id,
          label: label.trim(),
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          zipCode: zipCode.trim(),
          isDefault: makeDefault,
        },
      });
    });

    revalidatePath("/checkout");
    revalidatePath("/profile");

    return {
      success: true,
      message: "Address saved successfully.",
      data: { addressId: newAddress.id },
    };
  } catch (error) {
    console.error("Create address error:", error);
    return { success: false, message: "Failed to save address." };
  }
}

export async function updateAddressAction(
  addressId: string,
  rawInput: AddressInput
): Promise<ActionResponse> {
  try {
    const user = await requireAuth();

    const validated = addressSchema.safeParse(rawInput);
    if (!validated.success) {
      return {
        success: false,
        message: "Invalid address fields provided.",
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const { label, street, city, state, zipCode, isDefault } = validated.data;

    // Verify ownership
    const existing = await db.address.findUnique({
      where: { id: addressId },
      select: { userId: true },
    });

    if (!existing || existing.userId !== user.id) {
      return { success: false, message: "Address not found or unauthorized." };
    }

    await db.$transaction(async (tx) => {
      if (isDefault) {
        await tx.address.updateMany({
          where: { userId: user.id },
          data: { isDefault: false },
        });
      }

      await tx.address.update({
        where: { id: addressId },
        data: {
          label: label.trim(),
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          zipCode: zipCode.trim(),
          isDefault,
        },
      });
    });

    revalidatePath("/checkout");
    revalidatePath("/profile");

    return { success: true, message: "Address updated successfully." };
  } catch (error) {
    console.error("Update address error:", error);
    return { success: false, message: "Failed to update address." };
  }
}

export async function deleteAddressAction(addressId: string): Promise<ActionResponse> {
  try {
    const user = await requireAuth();

    const existing = await db.address.findUnique({
      where: { id: addressId },
      select: { userId: true, isDefault: true },
    });

    if (!existing || existing.userId !== user.id) {
      return { success: false, message: "Address not found or unauthorized." };
    }

    await db.$transaction(async (tx) => {
      await tx.address.delete({ where: { id: addressId } });

      // If deleted address was default, make another address default if available
      if (existing.isDefault) {
        const remaining = await tx.address.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
        });
        if (remaining) {
          await tx.address.update({
            where: { id: remaining.id },
            data: { isDefault: true },
          });
        }
      }
    });

    revalidatePath("/checkout");
    revalidatePath("/profile");

    return { success: true, message: "Address deleted." };
  } catch (error) {
    console.error("Delete address error:", error);
    return { success: false, message: "Failed to delete address." };
  }
}

export async function setDefaultAddressAction(addressId: string): Promise<ActionResponse> {
  try {
    const user = await requireAuth();

    await db.$transaction(async (tx) => {
      await tx.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });

      await tx.address.updateMany({
        where: { id: addressId, userId: user.id },
        data: { isDefault: true },
      });
    });

    revalidatePath("/checkout");
    revalidatePath("/profile");

    return { success: true, message: "Default address updated." };
  } catch (error) {
    console.error("Set default address error:", error);
    return { success: false, message: "Failed to set default address." };
  }
}
