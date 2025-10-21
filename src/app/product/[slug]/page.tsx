import { supabase } from "@/lib/supabaseClient";
import AddToCartButton from "@/components/AddToCartButton"; // ✅ Import your cart button
import Image from "next/image";

export default async function ProductPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    // ✅ Unwrap params properly for Next.js 15+
    const { slug } = await params;

    // ✅ Fetch single product from Supabase
    const { data: product, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error || !product) {
        console.error("Error fetching product:", error?.message);
        return (
            <p className="text-center mt-10 text-gray-500">
                Product not found or failed to load.
            </p>
        );
    }

    // ✅ Render product details + AddToCart button
    return (
        <main className="p-8 max-w-2xl mx-auto">
            <Image
                src={product.image_url || "/placeholder.jpg"}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-cover"
            />
            <h1 className="text-3xl font-bold mt-6">{product.name}</h1>
            <p className="text-green-700 text-2xl mt-2 font-semibold">
                RM {product.price}
            </p>
            <p className="text-gray-600 mt-4 leading-relaxed">
                {product.description || "No description available."}
            </p>

            {/* 🛒 Client-side Add to Cart button */}
            <AddToCartButton product={product} />
        </main>
    );
}
