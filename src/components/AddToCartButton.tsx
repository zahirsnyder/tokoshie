"use client";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/context/CartContext"; // ✅ import the shared type
import toast from "react-hot-toast";

export default function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart();

  const handleClick = () => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`, { position: "top-right" });
  };

  return (
    <button
      onClick={handleClick}
      className="mt-6 px-6 py-2 bg-green-700 text-white rounded hover:bg-green-800 transition"
    >
      Add to Cart
    </button>
  );
}
