"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// 🧩 Product Type
export interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  description?: string;
  category?: string;
}

// 🧩 Cart Item with Quantity
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

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCartItems(JSON.parse(saved));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // ✅ Add or increase quantity
  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // ✅ Remove item entirely
  const removeItem = (id: string) => {
    setCartItems((prev) => prev.filter((p) => p.id !== id));
  };

  // ✅ Increase / Decrease
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
          p.id === id ? { ...p, quantity: Math.max(1, p.quantity - 1) } : p
        )
        .filter((p) => p.quantity > 0)
    );
  };

  // ✅ Clear cart
  const clearCart = () => setCartItems([]);

  // ✅ Total
  const total = cartItems.reduce((sum, p) => sum + p.price * p.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeItem, increaseQty, decreaseQty, clearCart, total }}
    >
      {children}
    </CartContext.Provider>
  );
}

// 🧩 Hook
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
