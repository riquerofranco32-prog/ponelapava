"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { CartItem, Product } from "@/types";

// ── State & Actions ─────────────────────────────────────
interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: "ADD_ITEM"; product: Product; quantity?: number }
  | { type: "REMOVE_ITEM"; productId: string }
  | { type: "UPDATE_QUANTITY"; productId: string; quantity: number }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_DRAWER" }
  | { type: "SET_DRAWER"; open: boolean }
  | { type: "HYDRATE"; items: CartItem[] };

const CART_STORAGE_KEY = "ponelapava_cart";

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const qty = action.quantity ?? 1;
      const existing = state.items.find(
        (item) => item.product.id === action.product.id
      );
      if (existing) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.product.id === action.product.id
              ? { ...item, quantity: item.quantity + qty }
              : item
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { product: action.product, quantity: qty }],
      };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter(
          (item) => item.product.id !== action.productId
        ),
      };

    case "UPDATE_QUANTITY": {
      if (action.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(
            (item) => item.product.id !== action.productId
          ),
        };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.product.id === action.productId
            ? { ...item, quantity: action.quantity }
            : item
        ),
      };
    }

    case "CLEAR_CART":
      return { ...state, items: [] };

    case "TOGGLE_DRAWER":
      return { ...state, isOpen: !state.isOpen };

    case "SET_DRAWER":
      return { ...state, isOpen: action.open };

    case "HYDRATE":
      return { ...state, items: action.items };

    default:
      return state;
  }
}

// ── Context ─────────────────────────────────────────────
interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  itemCount: number;
  subtotal: number;
  total: number;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleDrawer: () => void;
  setDrawer: (open: boolean) => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

// ── Provider ─────────────────────────────────────────────
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false,
  });

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CartItem[];
        dispatch({ type: "HYDRATE", items: parsed });
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      // ignore storage errors
    }
  }, [state.items]);

  const itemCount = useMemo(
    () => state.items.reduce((acc, item) => acc + item.quantity, 0),
    [state.items]
  );

  const subtotal = useMemo(
    () =>
      state.items.reduce(
        (acc, item) => acc + item.product.price * item.quantity,
        0
      ),
    [state.items]
  );

  const addItem = useCallback((product: Product, quantity?: number) => {
    dispatch({ type: "ADD_ITEM", product, quantity });
  }, []);

  const removeItem = useCallback((productId: string) => {
    dispatch({ type: "REMOVE_ITEM", productId });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", productId, quantity });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
  }, []);

  const toggleDrawer = useCallback(() => {
    dispatch({ type: "TOGGLE_DRAWER" });
  }, []);

  const setDrawer = useCallback((open: boolean) => {
    dispatch({ type: "SET_DRAWER", open });
  }, []);

  const value: CartContextValue = {
    items: state.items,
    isOpen: state.isOpen,
    itemCount,
    subtotal,
    total: subtotal, // future: add shipping costs here
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleDrawer,
    setDrawer,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// ── Hook ─────────────────────────────────────────────────
export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
