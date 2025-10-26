"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import Modal from "@/components/Modal";

interface Product {
    id: string;
    name: string;
    price: number;
    description: string | null;
    image_url?: string | null;
    created_at: string;
    stock?: number;
}

export default function ProductList() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    async function fetchProducts() {
        const { data, error } = await supabase
            .from("products")
            .select("id, name, price, description, image_url, created_at, stock")
            .order("created_at", { ascending: false });

        if (error) console.error("Load error:", error.message);
        if (data) setProducts(data);
        setLoading(false);
    }

    const deleteProduct = async () => {
        if (!deleteId) return;

        // Step 1: Get the product and its image URL
        const { data: product, error: fetchError } = await supabase
            .from("products")
            .select("image_url")
            .eq("id", deleteId)
            .maybeSingle(); // ✅ Safe fallback

        if (fetchError) {
            console.error("Failed to fetch product before deletion:", fetchError.message);
            alert("Failed to fetch product.");
            return;
        }

        // Step 2: Delete the image via secure API route
        if (product?.image_url) {
            try {
                const url = new URL(product.image_url);
                const pathParts = url.pathname.split("/");
                const bucketIndex = pathParts.findIndex(part => part === "product-images");
                const filePath = pathParts.slice(bucketIndex + 1).join("/");

                console.log("🧩 File path resolved for server:", filePath);

                if (filePath) {
                    const res = await fetch("/api/delete-image", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ filePath }),
                    });

                    const result = await res.json();

                    if (!res.ok) {
                        console.error("❌ Failed to delete via server:", result.error);
                    } else {
                        console.log("✅ Image deleted via server route:", filePath);
                    }
                }
            } catch (err) {
                console.error("❌ Error parsing image URL:", err);
            }
        }

        // Step 3: Delete the product row
        const { error: deleteError } = await supabase
            .from("products")
            .delete()
            .eq("id", deleteId);

        if (deleteError) {
            alert("Delete failed");
        }

        setDeleteId(null);
        fetchProducts(); // Refresh list
    };

    return (
        <main className="max-w-6xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-2xl font-semibold text-gray-800">🛍️ Products</h1>
                <Link
                    href="/admin/products/new"
                    className="bg-[#2f4c28] text-white font-medium px-4 py-2 rounded-md hover:bg-[#24401f] transition"
                >
                    + Add Product
                </Link>
            </div>

            {/* Loading */}
            {loading && (
                <p className="text-gray-400 text-center py-8 animate-pulse">
                    Loading products…
                </p>
            )}

            {/* No Products */}
            {!loading && products.length === 0 && (
                <p className="text-gray-400 text-center py-8">No products found.</p>
            )}

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                    <div
                        key={product.id}
                        className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition"
                    >
                        {/* Image */}
                        <div className="relative w-full h-48 bg-gray-100">
                            {product.image_url ? (
                                <Image
                                    src={product.image_url}
                                    alt={product.name}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    priority={products.indexOf(product) < 3} // prioritize top 3 products
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                                    No Image
                                </div>
                            )}
                            {product.stock !== undefined && product.stock <= 0 && (
                                <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-medium px-2 py-1 rounded">
                                    Out of Stock
                                </span>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-4 flex flex-col h-[200px] justify-between">
                            <div className="space-y-1">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {product.name}
                                </h2>
                                <p className="text-sm text-gray-500 line-clamp-2">
                                    {product.description}
                                </p>
                                <div className="text-sm text-gray-700 font-medium">
                                    RM {product.price.toFixed(2)}
                                </div>
                                <div className="text-sm text-gray-500">
                                    Stock:{" "}
                                    <span
                                        className={`font-semibold ${product.stock !== undefined && product.stock <= 0
                                            ? "text-red-600"
                                            : "text-gray-800"
                                            }`}
                                    >
                                        {product.stock ?? "N/A"}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-2 mt-4">
                                <Link
                                    href={`/admin/products/edit/${product.id}`}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition"
                                >
                                    ✏️ Edit
                                </Link>
                                <button
                                    onClick={() => setDeleteId(product.id)}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition"
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Delete Modal */}
            {deleteId && (
                <Modal
                    title="Delete Product"
                    description="Are you sure you want to delete this product?"
                    onCancel={() => setDeleteId(null)}
                    onConfirm={deleteProduct}
                />
            )}
        </main>
    );
}
