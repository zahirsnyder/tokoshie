"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

interface Product {
    id: string;
    name: string;
    price: number;
    description: string | null;
    image_url?: string | null;
    created_at: string;
}

export default function ProductList() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // 🔹 Fetch all products
    async function fetchProducts() {
        const { data, error } = await supabase
            .from("products")
            .select("id, name, price, description, image_url, created_at")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error loading products:", error.message);
        } else if (data) {
            setProducts(data);
        }
        setLoading(false);
    }

    // 🔹 Delete a product
    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this product?")) return;

        const { error } = await supabase.from("products").delete().eq("id", id);
        if (error) {
            alert("Failed to delete product: " + error.message);
        } else {
            fetchProducts();
        }
    }

    useEffect(() => {
        fetchProducts();
    }, []);

    if (loading)
        return (
            <div className="p-6 text-gray-500 text-center animate-pulse">
                Loading products...
            </div>
        );

    return (
        <main className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold flex items-center gap-2">
                    🛍️ Products
                </h1>
                <Link
                    href="/admin/products/new"
                    className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition"
                >
                    + Add Product
                </Link>
            </div>

            {/* Product List */}
            {products.length === 0 ? (
                <p className="text-gray-500 text-center">No products found.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((p) => (
                        <div
                            key={p.id}
                            className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
                        >
                            {/* Image */}
                            <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                                {p.image_url ? (
                                    <div className="relative w-full h-full">
                                        <Image
                                            src={p.image_url || "/placeholder.jpg"}
                                            alt={p.name}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <span className="text-gray-400 text-sm">No Image</span>
                                )}
                            </div>

                            {/* Details */}
                            <div className="p-4 flex flex-col justify-between h-[180px]">
                                <div>
                                    <h2 className="text-lg font-semibold">{p.name}</h2>
                                    <p className="text-green-700 font-medium">
                                        RM {p.price.toFixed(2)}
                                    </p>
                                    {p.description && (
                                        <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                                            {p.description}
                                        </p>
                                    )}
                                </div>

                                <div className="flex justify-between items-center mt-4">
                                    <Link
                                        href={`/admin/products/edit/${p.id}`}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(p.id)}
                                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
