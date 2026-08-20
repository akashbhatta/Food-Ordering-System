"use server";

import bcrypt from "bcryptjs";
import { db } from "@/server/db";
import { registerSchema, loginSchema, type RegisterInput, type LoginInput } from "@/lib/validations/auth";
import { signIn, signOut } from "@/server/auth";
import { type ActionResponse } from "@/lib/types";
import { Role, RestaurantStatus } from "@prisma/client";
import { generateSlug } from "@/lib/utils";
import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";

/**
 * Registers a new user (CUSTOMER or OWNER) and validates fields server-side.
 */
export async function registerUser(
  rawInput: RegisterInput
): Promise<ActionResponse<{ userId: string; role: Role }>> {
  try {
    const validatedFields = registerSchema.safeParse(rawInput);

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Invalid registration fields provided.",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { name, email, password, phone, role } = validatedFields.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Standardize phone number with +977 if entered as 10-digit Nepali mobile number
    let formattedPhone = phone?.trim();
    if (formattedPhone) {
      const cleanDigits = formattedPhone.replace(/[\s\-()]/g, "");
      if (/^[9][6-8]\d{8}$/.test(cleanDigits)) {
        formattedPhone = `+977 ${cleanDigits}`;
      }
    }

    // Check if email already registered
    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return {
        success: false,
        message: "An account with this email address already exists.",
        errors: { email: ["Email address is already in use."] },
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in transaction
    const newUser = await db.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          phone: formattedPhone || null,
          hashedPassword,
          role: role === "OWNER" ? Role.OWNER : Role.CUSTOMER,
        },
      });

      // If registering as a Restaurant Owner, provision an initial pending restaurant profile
      if (role === "OWNER") {
        const defaultName = `${name.trim()}'s Kitchen`;
        const slug = `${generateSlug(defaultName)}-${createdUser.id.slice(-4)}`;

        await tx.restaurant.create({
          data: {
            ownerId: createdUser.id,
            name: defaultName,
            slug,
            description: "Welcome to our kitchen! Update your description and menu in the dashboard.",
            phone: formattedPhone || "+977 9800000000",
            email: normalizedEmail,
            street: "Kathmandu Valley",
            city: "Kathmandu",
            state: "Bagmati",
            zipCode: "44600",
            status: RestaurantStatus.PENDING,
            isActive: false,
          },
        });
      }

      return createdUser;
    });

    return {
      success: true,
      message: "Account created successfully! You can now log in.",
      data: { userId: newUser.id, role: newUser.role },
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      message: "An unexpected error occurred during registration. Please try again.",
    };
  }
}

/**
 * Server-side login handler using NextAuth credentials provider.
 */
export async function loginUser(
  rawInput: LoginInput
): Promise<ActionResponse<{ role?: Role }>> {
  try {
    const validated = loginSchema.safeParse(rawInput);
    if (!validated.success) {
      return {
        success: false,
        message: "Invalid login credentials provided.",
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const { email, password } = validated.data;
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Verify user exists in database first
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || !user.hashedPassword) {
      return {
        success: false,
        message: "Invalid email address or password.",
      };
    }

    if (user.isBanned) {
      return {
        success: false,
        message: "Your account has been suspended by an administrator.",
      };
    }

    // 2. Verify password match
    const passwordsMatch = await bcrypt.compare(password, user.hashedPassword);
    if (!passwordsMatch) {
      return {
        success: false,
        message: "Invalid email address or password.",
      };
    }

    // 3. Perform NextAuth signIn
    try {
      await signIn("credentials", {
        email: normalizedEmail,
        password,
        redirect: false,
      });
    } catch (authErr) {
      // Re-throw redirect if Next.js internal redirect
      if (isRedirectError(authErr)) {
        throw authErr;
      }
      if (authErr instanceof AuthError) {
        if (authErr.type === "CredentialsSignin") {
          return {
            success: false,
            message: "Invalid email address or password.",
          };
        }
      }
      console.error("NextAuth signIn inner error:", authErr);
    }

    return {
      success: true,
      message: "Signed in successfully.",
      data: { role: user.role },
    };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            success: false,
            message: "Invalid email address or password.",
          };
        default:
          return {
            success: false,
            message: error.message || "Authentication failed. Please verify your credentials.",
          };
      }
    }

    console.error("Login action error:", error);
    return {
      success: false,
      message: "An error occurred while signing in. Please check your credentials.",
    };
  }
}

/**
 * Signs out current user and invalidates session.
 */
export async function logoutUser() {
  await signOut({ redirectTo: "/" });
}
