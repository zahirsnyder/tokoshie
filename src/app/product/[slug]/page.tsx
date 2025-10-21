import { supabase } from "@/lib/supabaseClient";
import AddToCartButton from "@/components/AddToCartButton";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Details",
  description: "View product information and add to cart.",
};

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !product) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-12 text-center">
        <h1 className="text-xl font-semibold text-gray-700">
          Product Not Found
        </h1>
        <p className="text-gray-500 mt-2">
          We couldn’t find the product you’re looking for.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f9faf9] text-gray-800 py-12">
      <div className="max-w-6xl mx-auto px-6 lg:px-10 space-y-12">
        {/* 🟩 Section 1: Product Overview */}
        <section className="bg-white rounded-xl shadow-sm p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Product Image */}
            <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden shadow">
              <Image
                src={product.image_url || "/placeholder.jpg"}
                alt={product.name}
                fill
                priority
                className="object-cover"
              />
            </div>

            {/* Product Info */}
            <div className="flex flex-col gap-4">
              {/* Title + Price */}
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <p className="text-2xl font-semibold text-green-700">
                RM {product.price.toFixed(2)}
              </p>

              {/* Size Selector */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Size</p>
                <div className="flex gap-2">
                  {["50g", "100g", "200g"].map((size) => (
                    <button
                      key={size}
                      className="px-4 py-2 border border-gray-300 rounded-full text-sm hover:border-green-600 hover:text-green-700 transition"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock Indicator */}
              {product.stock !== undefined && (
                <p
                  className={`text-sm font-medium ${
                    product.stock <= 0 ? "text-red-600" : "text-gray-600"
                  }`}
                >
                  {product.stock > 0
                    ? `${product.stock} pcs available`
                    : "Out of Stock"}
                </p>
              )}

              {/* Add to Cart */}
              <div className="mt-4">
                <AddToCartButton product={product} />
              </div>
            </div>
          </div>
        </section>

        {/* 🩶 Section 2: Description & Specifications */}
        <section className="bg-[#f6f8f6] rounded-xl p-6 md:p-8 shadow-sm">
          {/* Description */}
          <div className="mb-10">
            <h2 className="text-lg font-semibold mb-3 text-gray-900">
              Product Description
            </h2>
            <p className="leading-relaxed text-gray-700 whitespace-pre-line">
              {product.description || "No description provided."}
            </p>
          </div>

          {/* Specifications */}
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900">
                Product Specification
              </h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>
                  <strong>Product Name:</strong> {product.name}
                </li>
                <li>
                  <strong>Taste Profile:</strong> Almond, Herb, Honey
                </li>
                <li>
                  <strong>Origin:</strong> Uji, Kyoto (Single Origin)
                </li>
                <li>
                  <strong>Harvest:</strong> Spring (1st Flush)
                </li>
                <li>
                  <strong>Ingredients:</strong> 100% Ceremonial Matcha
                </li>
                <li>
                  <strong>Shelf Life:</strong> 12 months
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900">
                Storage Instructions
              </h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>🧊 Store in refrigerator after opening.</li>
                <li>🌤 Keep away from sunlight & moisture.</li>
                <li>📆 Best consumed within 2 months after opening.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 🩵 Section 3: You May Also Like */}
        <section className="bg-[#eef3ef] rounded-xl p-6 md:p-8 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 text-gray-900">
            You may also like
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
              <div className="relative aspect-[4/5]">
                <Image
                  src={product.image_url || "/placeholder.jpg"}
                  alt="Related"
                  fill
                  className="object-cover group-hover:scale-105 transition"
                />
              </div>
              <div className="p-4">
                <p className="font-medium text-sm text-gray-900">
                  {product.name}
                </p>
                <p className="text-sm text-green-700 font-semibold">
                  RM {product.price.toFixed(2)}
                </p>
                {product.old_price && (
                  <p className="text-xs line-through text-gray-400">
                    RM {product.old_price.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
