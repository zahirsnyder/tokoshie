"use client";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CartButton() {
  const { cartItems } = useCart();

  return (
    <Link
      href="/cart"
      className="fixed top-4 right-4 bg-green-700 text-white px-4 py-2 rounded-full shadow hover:bg-green-800 transition"
    >
      🛒 Cart ({cartItems.length})
    </Link>
  );
}
