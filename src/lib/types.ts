import type { UserRole, RestaurantStatus, OrderStatus, PaymentMethod } from "./constants";

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  image?: string | null;
}

export interface MenuItemOptionSnapshot {
  id: string;
  name: string;
  price: number;
}

export interface CartItemOption {
  id: string;
  name: string;
  price: number;
}

export interface CartItemState {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  image?: string | null;
  quantity: number;
  specialNotes?: string;
  options?: CartItemOption[];
}

export interface CartState {
  restaurantId: string | null;
  restaurantName: string | null;
  items: CartItemState[];
}

export interface ActionResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}
