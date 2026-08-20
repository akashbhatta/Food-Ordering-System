"use client";

import * as React from "react";
import { validateCartServer, type ValidatedCartSummary } from "@/server/actions/cart";
import { toast } from "sonner";

export interface ClientCartItem {
  id: string; // Unique key: `${menuItemId}-${optionsKey}`
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
  category?: string;
  restaurantId: string;
  restaurantName: string;
  selectedOptionIds?: string[];
  selectedOptionsText?: string;
  specialNotes?: string;
}

export interface AddItemInput {
  menuItemId: string;
  name: string;
  price: number;
  quantity?: number;
  image?: string | null;
  category?: string;
  restaurantId: string;
  restaurantName: string;
  selectedOptionIds?: string[];
  selectedOptionsText?: string;
  specialNotes?: string;
}

interface ConflictState {
  isOpen: boolean;
  pendingItem: AddItemInput | null;
  existingRestaurantName: string;
  newRestaurantName: string;
}

interface CartContextType {
  items: ClientCartItem[];
  restaurantId: string | null;
  restaurantName: string | null;
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  minOrderAmount: number;
  isMinOrderMet: boolean;
  hasUnavailableItems: boolean;
  isLoading: boolean;
  conflictState: ConflictState;
  addItem: (item: AddItemInput) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  resolveConflict: (replace: boolean) => void;
}

const CartContext = React.createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "feasthub_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ClientCartItem[]>([]);
  const [restaurantId, setRestaurantId] = React.useState<string | null>(null);
  const [restaurantName, setRestaurantName] = React.useState<string | null>(null);

  const [summary, setSummary] = React.useState<ValidatedCartSummary>({
    items: [],
    restaurantId: null,
    restaurantName: null,
    subtotal: 0,
    deliveryFee: 0,
    tax: 0,
    total: 0,
    minOrderAmount: 0,
    isMinOrderMet: true,
    hasUnavailableItems: false,
    itemCount: 0,
  });

  const [isLoading, setIsLoading] = React.useState(false);
  const [isHydrated, setIsHydrated] = React.useState(false);

  const [conflictState, setConflictState] = React.useState<ConflictState>({
    isOpen: false,
    pendingItem: null,
    existingRestaurantName: "",
    newRestaurantName: "",
  });

  // 1. Hydrate from localStorage on initial mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.items) && parsed.items.length > 0) {
          setItems(parsed.items);
          setRestaurantId(parsed.restaurantId || null);
          setRestaurantName(parsed.restaurantName || null);
        }
      }
    } catch (e) {
      console.error("Failed to load cart from localStorage", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // 2. Validate authoritative prices with server whenever items change
  React.useEffect(() => {
    if (!isHydrated) return;

    // Save to localStorage
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({ items, restaurantId, restaurantName })
      );
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }

    if (items.length === 0) {
      setSummary({
        items: [],
        restaurantId: null,
        restaurantName: null,
        subtotal: 0,
        deliveryFee: 0,
        tax: 0,
        total: 0,
        minOrderAmount: 0,
        isMinOrderMet: true,
        hasUnavailableItems: false,
        itemCount: 0,
      });
      setRestaurantId(null);
      setRestaurantName(null);
      return;
    }

    // Call server validation action
    const validate = async () => {
      setIsLoading(true);
      try {
        const result = await validateCartServer(
          items.map((i) => ({
            menuItemId: i.menuItemId,
            quantity: i.quantity,
            selectedOptionIds: i.selectedOptionIds,
            specialNotes: i.specialNotes,
          }))
        );

        if (result.success && result.data) {
          setSummary(result.data);
          if (result.data.restaurantId) {
            setRestaurantId(result.data.restaurantId);
            setRestaurantName(result.data.restaurantName);
          }
        }
      } catch (err) {
        console.error("Cart server validation failed:", err);
      } finally {
        setIsLoading(false);
      }
    };

    validate();
  }, [items, isHydrated, restaurantId, restaurantName]);

  // Helper to generate unique cart line item ID
  const generateCartItemId = (menuItemId: string, optionIds: string[] = []) => {
    const sorted = [...optionIds].sort().join("-");
    return `${menuItemId}${sorted ? `-${sorted}` : ""}`;
  };

  // Add Item to Cart (supports multi-restaurant)
  const addItem = (newItem: AddItemInput) => {
    const qty = Math.max(1, newItem.quantity || 1);

    const uniqueId = generateCartItemId(newItem.menuItemId, newItem.selectedOptionIds);

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === uniqueId);
      if (existingIndex > -1) {
        // Increment existing item
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + qty;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          specialNotes: newItem.specialNotes || updated[existingIndex].specialNotes,
        };
        return updated;
      } else {
        // Add new item
        return [
          ...prev,
          {
            id: uniqueId,
            menuItemId: newItem.menuItemId,
            name: newItem.name,
            price: newItem.price,
            quantity: qty,
            image: newItem.image,
            category: newItem.category,
            restaurantId: newItem.restaurantId,
            restaurantName: newItem.restaurantName,
            selectedOptionIds: newItem.selectedOptionIds,
            selectedOptionsText: newItem.selectedOptionsText,
            specialNotes: newItem.specialNotes,
          },
        ];
      }
    });

    setRestaurantId(newItem.restaurantId);
    setRestaurantName(newItem.restaurantName);

    toast.success(`Added "${newItem.name}" to cart`, {
      description: `${newItem.restaurantName} • ${qty}x`,
    });
  };

  // Resolve conflict prompt
  const resolveConflict = (replace: boolean) => {
    if (replace && conflictState.pendingItem) {
      const p = conflictState.pendingItem;
      const uniqueId = generateCartItemId(p.menuItemId, p.selectedOptionIds);
      const qty = Math.max(1, p.quantity || 1);

      setItems([
        {
          id: uniqueId,
          menuItemId: p.menuItemId,
          name: p.name,
          price: p.price,
          quantity: qty,
          image: p.image,
          category: p.category,
          restaurantId: p.restaurantId,
          restaurantName: p.restaurantName,
          selectedOptionIds: p.selectedOptionIds,
          selectedOptionsText: p.selectedOptionsText,
          specialNotes: p.specialNotes,
        },
      ]);
      setRestaurantId(p.restaurantId);
      setRestaurantName(p.restaurantName);

      toast.info(`Cart cleared and updated to ${p.restaurantName}`);
    }

    setConflictState({
      isOpen: false,
      pendingItem: null,
      existingRestaurantName: "",
      newRestaurantName: "",
    });
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item))
    );
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => {
      const filtered = prev.filter((item) => item.id !== itemId);
      if (filtered.length === 0) {
        setRestaurantId(null);
        setRestaurantName(null);
      }
      return filtered;
    });
    toast.info("Item removed from cart");
  };

  const clearCart = () => {
    setItems([]);
    setRestaurantId(null);
    setRestaurantName(null);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
    toast.info("Your cart is now empty");
  };

  const itemCount = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        restaurantId,
        restaurantName,
        itemCount,
        subtotal: summary.subtotal,
        deliveryFee: summary.deliveryFee,
        tax: summary.tax,
        total: summary.total,
        minOrderAmount: summary.minOrderAmount,
        isMinOrderMet: summary.isMinOrderMet,
        hasUnavailableItems: summary.hasUnavailableItems,
        isLoading,
        conflictState,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        resolveConflict,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
