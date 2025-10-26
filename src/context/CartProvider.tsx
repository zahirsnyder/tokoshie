"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Product } from "./CartContext";
import type { CartItem } from "./CartContext";

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: Product) => void;
    removeItem: (id: string) => void;
    increaseQty: (id: string) => void;
    decreaseQty: (id: string) => void;
    clearCart: () => void;
    total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const supabase = createClientComponentClient();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [userId, setUserId] = useState<string | null>(null);

    // 1️⃣ Get authenticated user
    useEffect(() => {
        const getUser = async () => {
            const { data } = await supabase.auth.getUser();
            setUserId(data.user?.id ?? null);
            console.log("Auth user ID:", data?.user?.id);
        };

        getUser();

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            const newUserId = session?.user?.id ?? null;

            if (!newUserId) {
                setCartItems([]); // ✅ Clear in-memory cart
            }

            setUserId(newUserId);
        });

        return () => {
            listener?.subscription.unsubscribe();
        };
    }, []);

    // 2️⃣ Load cart from Supabase when userId changes
    useEffect(() => {
        if (!userId) return;

        const loadCart = async () => {
            const { data, error } = await supabase
                .from("carts")
                .select("items")
                .eq("user_id", userId)
                .single();

            if (error && error.code !== "PGRST116") {
                console.warn("Cart fetch failed:", error.message);
            }

            if (data?.items) {
                console.log("Loaded cart from DB:", data.items);
                setCartItems(data.items);
            }
        };

        loadCart();
    }, [userId]);

    // 3️⃣ Save cart to Supabase
    const saveCart = async (items: CartItem[]) => {
        if (!userId) return;
        console.log("Saving cart to Supabase for:", userId, items);

        const { error } = await supabase
            .from("carts")
            .upsert({ user_id: userId, items })
            .eq("user_id", userId);

        if (error) console.warn("Failed to save cart:", error.message);
    };

    // 🛒 Cart actions
    const updateCart = (updater: (prev: CartItem[]) => CartItem[]) => {
        setCartItems((prev) => {
            const next = updater(prev);
            saveCart(next); // 🔄 Sync with DB
            return next;
        });
    };

    const addToCart = (product: Product) => {
        updateCart((prev) => {
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
        updateCart((prev) => prev.filter((p) => p.id !== id));
    };

    const increaseQty = (id: string) => {
        updateCart((prev) =>
            prev.map((p) =>
                p.id === id ? { ...p, quantity: p.quantity + 1 } : p
            )
        );
    };

    const decreaseQty = (id: string) => {
        updateCart((prev) =>
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
            supabase.from("carts").delete().eq("user_id", userId);
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

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used inside CartProvider");
    return context;
}
