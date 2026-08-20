import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { getCurrentUser } from "./session";
import { db } from "@/server/db";

export class AuthorizationError extends Error {
  constructor(message: string = "Unauthorized access") {
    super(message);
    this.name = "AuthorizationError";
  }
}

/**
 * Requires an authenticated user session.
 * If unauthenticated, either redirects to login (if in page context) or throws.
 */
export async function requireAuth(options?: { redirectTo?: string }) {
  const user = await getCurrentUser();

  if (!user) {
    if (options?.redirectTo) {
      redirect(`/login?callbackUrl=${encodeURIComponent(options.redirectTo)}`);
    }
    throw new AuthorizationError("Authentication required. Please sign in.");
  }

  if (user.isBanned) {
    throw new AuthorizationError("Your account has been suspended. Please contact support.");
  }

  return user;
}

/**
 * Enforces that the current authenticated user possesses one of the allowed roles.
 */
export async function requireRole(
  allowedRoles: Role | Role[],
  options?: { redirectTo?: string }
) {
  const user = await requireAuth(options);
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (!roles.includes(user.role)) {
    if (options?.redirectTo) {
      redirect(options.redirectTo);
    }
    throw new AuthorizationError(
      `Access denied. Required role: ${roles.join(" or ")}, but user is ${user.role}.`
    );
  }

  return user;
}

/**
 * Enforces ADMIN role on the server.
 */
export async function requireAdmin(options?: { redirectTo?: string }) {
  return requireRole(Role.ADMIN, options);
}

/**
 * Enforces RESTAURANT OWNER role on the server.
 */
export async function requireOwner(options?: { redirectTo?: string }) {
  return requireRole(Role.OWNER, options);
}

/**
 * Enforces CUSTOMER role on the server.
 */
export async function requireCustomer(options?: { redirectTo?: string }) {
  return requireRole(Role.CUSTOMER, options);
}

/**
 * Enforces resource ownership.
 * Allows access if user owns the resource OR if user is an ADMIN.
 */
export async function requireOwnership(resourceOwnerId: string) {
  const user = await requireAuth();

  if (user.role === Role.ADMIN) {
    return user; // Admins have oversight access
  }

  if (user.id !== resourceOwnerId) {
    throw new AuthorizationError("You do not have permission to access or modify this resource.");
  }

  return user;
}

/**
 * Enforces that the authenticated owner owns the specific restaurant.
 */
export async function requireRestaurantOwnership(restaurantId: string) {
  const user = await requireRole(Role.OWNER);

  const restaurant = await db.restaurant.findUnique({
    where: { id: restaurantId },
    select: { ownerId: true },
  });

  if (!restaurant) {
    throw new AuthorizationError("Restaurant not found.");
  }

  if (restaurant.ownerId !== user.id && user.role !== Role.ADMIN) {
    throw new AuthorizationError("You do not have permission to manage this restaurant.");
  }

  return { user, restaurant };
}
