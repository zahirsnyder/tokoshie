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
                {/* Page Title */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-6">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
                        All products
                    </h1>

                    {/* Sort Dropdown */}
                    <div className="flex items-center gap-3 text-sm text-gray-700 mt-4 md:mt-0">
                        <span className="font-medium">Sort by :</span>
                        <select className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-1 focus:ring-green-700">
                            <option>Featured</option>
                            <option>Newest</option>
                            <option>Price: Low to High</option>
                            <option>Price: High to Low</option>
                        </select>
                    </div>
                </div>

                {/* Category Filter (Centered Below Title) */}
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    {["All", "Ceremonial", "Culinary", "Starter Kit"].map((cat) => (
                        <button
                            key={cat}
                            className="px-4 py-2 border border-gray-300 rounded-full hover:bg-green-700 hover:text-white transition text-sm"
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Product Grid */}
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 place-items-center">
                    {products?.map((p) => (
                        <Link
                            key={p.id}
                            href={`/product/${p.slug}`}
                            className="group relative w-full max-w-xs bg-white rounded-xl overflow-hidden shadow hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                        >
                            {/* SALE Tag */}
                            {p.is_on_sale && (
                                <div className="absolute top-3 left-3 bg-green-800 text-white text-xs font-semibold px-2 py-1 rounded-md z-10">
                                    Sale
                                </div>
                            )}

                            {/* Product Image - full width */}
                            <div className="relative w-full h-[300px]">
                                <Image
                                    src={p.image_url || "/placeholder.jpg"}
                                    alt={p.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            {/* Info */}
                            <div className="p-4">
                                <h2 className="text-base font-semibold text-gray-900 leading-snug group-hover:text-green-700 transition-colors">
                                    {p.name}
                                </h2>

                                {p.category && (
                                    <p className="text-sm text-gray-500 capitalize mt-1">
                                        {p.category}
                                    </p>
                                )}

                                <div className="mt-2">
                                    {p.old_price ? (
                                        <>
                                            <p className="text-lg font-bold text-green-700">
                                                RM {p.price.toFixed(2)}
                                            </p>
                                            <p className="text-sm text-gray-400 line-through">
                                                RM {p.old_price.toFixed(2)}
                                            </p>
                                        </>
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

                {/* Empty State */}
                {products?.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        No products available yet.
                    </div>
                )}
            </main>
        </Suspense>
    );
}
