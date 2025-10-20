"use client";

import { useCart } from "@/context/CartContext";
import { Product } from "@/context/CartContext";
import { useState } from "react";
import { toast } from "react-hot-toast"; // ✅ Lightweight toast library

export default function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(false);

  const handleAdd = () => {
    setLoading(true);
    addToCart(product);
    toast.success(`${product.name} added to cart 🛒`, {
      position: "bottom-center",
      duration: 2000,
      style: {
        background: "#16a34a",
        color: "#fff",
      },
    });
    setLoading(false);
  };

  return (
    <button
      onClick={handleAdd}
      disabled={loading}
      className={`mt-6 px-6 py-2 rounded text-white font-semibold transition ${
        loading
          ? "bg-green-400 cursor-not-allowed"
          : "bg-green-700 hover:bg-green-800"
      }`}
    >
      {loading ? "Adding..." : "Add to Cart"}
    </button>
  );
}
