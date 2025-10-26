"use client";

import { useCart } from "@/context/CartContext";
import type { Product } from "@/context/CartContext"; // ✅ shared type
import toast from "react-hot-toast";

type AddToCartButtonProps = {
  product: Product;
  quantity?: number; // ✅ new optional prop
};

export default function AddToCartButton({ product, quantity = 1 }: AddToCartButtonProps) {
  const { addToCart } = useCart();

  const handleClick = () => {
    if (!product) return;

    // ✅ Pass quantity along with the product
    addToCart({ ...product, quantity } as Product & { quantity: number });

    // ✅ Dynamic success message
    toast.success(
      `${quantity} × ${product.name} added to cart!`,
      { position: "top-right" }
    );
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
