"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
    const { cartItems } = useCart();
    const totalItems = cartItems.length;

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
            <nav className="max-w-6xl mx-auto flex items-center justify-between py-4 px-6">
                {/* Logo */}
                <Link href="/" className="text-lg font-bold tracking-wide text-green-800">
                    TOKOSHIE
                </Link>

                {/* Links */}
                <div className="flex items-center gap-8 text-gray-700">
                    <Link href="/shop" className="hover:text-green-700 transition">
                        Shop
                    </Link>

                    <Link href="/account/profile" className="hover:text-green-700">
                        Account
                    </Link>

                    {/* Cart Button */}
                    <Link
                        href="/cart"
                        className="flex items-center gap-2 bg-green-700 text-white px-4 py-1.5 rounded-full hover:bg-green-800 transition"
                    >
                        <ShoppingCart size={16} />
                        <span className="font-medium">Cart</span>
                        {totalItems > 0 && (
                            <span className="ml-1 text-sm bg-white text-green-700 font-semibold px-2 py-0.5 rounded-full">
                                {totalItems}
                            </span>
                        )}
                    </Link>
                </div>
            </nav>
        </header>
    );
}
