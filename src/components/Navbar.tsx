"use client";
import { getUserRole } from "@/lib/getUserRole";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const { cartItems } = useCart();
  const totalItems = cartItems.length;
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const r = await getUserRole(user.email ?? "");
        setRole(r);
      }
    };
    fetchUser();
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <nav className="max-w-6xl mx-auto flex items-center justify-between py-4 px-6">
        {/* Logo */}
        <Link href="/" className="text-lg font-bold text-green-800">
          TOKOSHIE
        </Link>

        {/* Navigation Links */}
        <div className="flex gap-8 text-gray-700 items-center">
          <Link href="/shop">Shop</Link>

          {/* Conditionally render based on role */}
          {role === "admin" ? (
            <Link href="/admin">Admin</Link>
          ) : (
            <Link href="/account/profile">Account</Link>
          )}

          {/* Cart Button */}
          <Link
            href="/cart"
            className="flex items-center bg-green-700 text-white px-4 py-1.5 rounded-full"
          >
            Cart
            {totalItems > 0 && (
              <span className="ml-2 bg-white text-green-700 px-2 rounded-full text-sm font-semibold">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </nav>
    </header>
  );
}
