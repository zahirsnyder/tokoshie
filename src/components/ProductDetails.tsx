"use client";

import { useState } from "react";
import Image from "next/image";
import AddToCartButton from "@/components/AddToCartButton";
import type { Product } from "@/context/CartContext"; // ✅ Import proper type

export default function ProductDetails({
  product,
  tierName,
}: {
  product: Product;
  tierName: string | null;
}) {
  const [quantity, setQuantity] = useState<number>(1);
  const unitPrice = product.price;
  const totalPrice = unitPrice * quantity;

  return (
    <main className="min-h-screen bg-[#f9faf9] text-gray-800 py-12">
      <div className="max-w-6xl mx-auto px-6 lg:px-10 space-y-12">
        <section className="bg-white rounded-xl shadow-sm p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Image */}
            <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden shadow">
              <Image
                src={product.image_url || "/placeholder.jpg"}
                alt={product.name}
                fill
                priority
                className="object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex flex-col gap-4">
              <h1 className="text-3xl font-bold">{product.name}</h1>

              <div className="text-2xl font-semibold text-green-700">
                RM {totalPrice.toFixed(2)}
                {tierName && (
                  <span className="ml-2 text-sm text-gray-500 font-normal">
                    ({tierName})
                  </span>
                )}
              </div>

              {/* Quantity Selector */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Quantity
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1 border rounded text-lg"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-16 text-center border rounded"
                    min={1}
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-1 border rounded text-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Stock */}
              {product.stock !== undefined && (
                <p
                  className={`text-sm font-medium ${
                    product.stock <= 0
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  {product.stock > 0
                    ? `${product.stock} pcs available`
                    : "Out of Stock"}
                </p>
              )}

              {/* Add to Cart */}
              <div className="mt-4">
                <AddToCartButton product={product} quantity={quantity} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
