import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Suspense } from "react";
import Image from "next/image";

export default async function ShopPage() {
    const { data: products, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error loading products:", error.message);
        return (
            <main className="min-h-screen flex items-center justify-center bg-white text-gray-600">
                Failed to load products.
            </main>
        );
    }

    return (
        <Suspense
            fallback={
                <main className="min-h-screen bg-white grid grid-cols-1 md:grid-cols-3 gap-8 p-10">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="animate-pulse rounded-xl bg-gray-100 h-[320px]"
                        />
                    ))}
                </main>
            }
        >
            <main className="min-h-screen bg-white text-gray-900 px-6 md:px-12 lg:px-24 py-16">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-14">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-6 md:mb-0">
                        All Products
                    </h1>

                    {/* Category Filter */}
                    <div className="flex flex-wrap justify-center gap-3 mb-10">
                        {["All", "Ceremonial", "Culinary", "Starter Kit"].map((cat) => (
                            <button
                                key={cat}
                                className="px-4 py-2 border border-gray-300 rounded-full hover:bg-green-700 hover:text-white transition text-sm"
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Sort Dropdown */}
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                        <span className="font-medium">Sort by :</span>
                        <select className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-1 focus:ring-green-700">
                            <option>Featured</option>
                            <option>Newest</option>
                            <option>Price: Low to High</option>
                            <option>Price: High to Low</option>
                        </select>
                    </div>
                </div>

                {/* Product Grid */}
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
                    {products?.map((p) => (
                        <Link
                            key={p.id}
                            href={`/product/${p.slug}`}
                            className="group relative block overflow-hidden rounded-xl bg-white border border-gray-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                        >
                            {/* SALE Tag */}
                            {p.is_on_sale && (
                                <div className="absolute top-3 left-3 bg-green-800 text-white text-xs font-semibold px-2 py-1 rounded-md">
                                    Sale
                                </div>
                            )}

                            {/* Product Image */}
                            <div className="relative aspect-[4/5] overflow-hidden">
                                <Image
                                    src={p.image_url || "/placeholder.jpg"}
                                    alt={p.name}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>

                            {/* Info */}
                            <div className="p-5">
                                <h2 className="text-base md:text-lg font-semibold text-gray-900 leading-snug group-hover:text-green-700 transition-colors">
                                    {p.name}
                                </h2>
                                {p.category && (
                                    <p className="text-sm text-gray-500 capitalize mt-0.5">
                                        {p.category}
                                    </p>
                                )}

                                <div className="mt-2">
                                    {p.old_price ? (
                                        <div>
                                            <p className="text-lg font-bold text-green-700">
                                                RM {p.price.toFixed(2)}
                                            </p>
                                            <p className="text-sm text-gray-400 line-through">
                                                RM {p.old_price.toFixed(2)}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-lg font-bold text-green-700">
                                            RM {p.price.toFixed(2)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Empty state */}
                {products?.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        No products available yet.
                    </div>
                )}
            </main>
        </Suspense>
    );

}
