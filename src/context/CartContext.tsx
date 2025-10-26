"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// 🧩 Product Type
export type Product = {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  stock?: number;
  quantity: number;
} & Record<string, string | number | boolean | undefined>;

// 🧩 Cart Item
export interface CartItem extends Product {
  quantity: number;
}

// 🧩 Context Type
interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeItem: (id: string) => void;
  increaseQty: (id: string) => void;
  decreaseQty: (id: string) => void;
  clearCart: () => void;
  total: number;
}

// 🧩 Create Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// 🧩 Provider
export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // ✅ Load current user and listen to auth changes
  useEffect(() => {
    const supabase = createClientComponentClient();

    const getUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setUserId(data.user?.id ?? null);
      } catch (err) {
        if (err instanceof Error) {
          console.error("Failed to get user:", err.message);
        } else {
          console.error("Failed to get user:", err);
        }
      }
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const newUserId = session?.user?.id ?? null;
        setUserId(newUserId);
        if (!newUserId) {
          // Logged out
          setCartItems([]);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []); // ✅ intentionally no supabase in deps

  // ✅ Load cart from localStorage when userId is known
  useEffect(() => {
    if (!userId) return;

    try {
      const saved = localStorage.getItem(`cart-${userId}`);
      if (saved) {
        setCartItems(JSON.parse(saved));
      }
    } catch (err) {
      console.warn("Failed to parse cart from localStorage:", err);
    }
  }, [userId]);

  // ✅ Save cart to localStorage per user
  useEffect(() => {
    if (userId) {
      try {
        localStorage.setItem(`cart-${userId}`, JSON.stringify(cartItems));
      } catch (err) {
        console.warn("Failed to save cart to localStorage:", err);
      }
    }
  }, [cartItems, userId]);

  // ✅ Core Cart Actions
  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        return prev.map((p) =>
          p.id === product.id
            ? { ...p, quantity: p.quantity + (product.quantity || 1) }
            : p
        );
      }
      return [...prev, { ...product, quantity: product.quantity || 1 }];
    });
  };

  const removeItem = (id: string) => {
    setCartItems((prev) => prev.filter((p) => p.id !== id));
  };

  const increaseQty = (id: string) => {
    setCartItems((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, quantity: p.quantity + 1 } : p
      )
    );
  };

  const decreaseQty = (id: string) => {
    setCartItems((prev) =>
      prev
        .map((p) =>
          p.id === id ? { ...p, quantity: p.quantity - 1 } : p
        )
        .filter((p) => p.quantity > 0)
    );
  };

  const clearCart = () => {
    setCartItems([]);
    if (userId) {
      localStorage.removeItem(`cart-${userId}`);
    }
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeItem,
        increaseQty,
        decreaseQty,
        clearCart,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// 🧩 Custom Hook
export function useCart() {
  const context = useContext(CartContext);
  if (!context)
    throw new Error("useCart must be used inside CartProvider");
  return context;
}
