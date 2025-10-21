import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

export default async function HomePage() {
  // Fetch featured products (limit 3)
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* 🌿 Hero Section */}
      <section
        className="relative h-[85vh] flex flex-col items-center justify-center text-center bg-cover bg-center"
        style={{
          backgroundImage: "url('https://leeietrnrohkqubdcqzk.supabase.co/storage/v1/object/public/Matcha%20bowl%20header/ChatGPT%20Image%20Oct%2020,%202025,%2008_54_46%20PM.png')", // Replace with your own image
        }}
      >
        {/* Subtle overlay for contrast */}
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px]" />

        <div className="relative z-10 max-w-2xl px-6">
          <h1 className="text-5xl font-bold mb-4 tracking-wide text-gray-900">
            TOKOSHIE MATCHA
          </h1>
          <p className="text-gray-600 mb-8 text-lg">
            A timeless Japanese ritual — crafted for modern taste.
          </p>
          <Link
            href="/shop"
            className="px-6 py-3 bg-green-700 text-white font-semibold rounded hover:bg-green-800 transition-transform hover:scale-[1.03]"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* 🛍️ Featured Products */}
      <section className="py-20 px-6 md:px-12 bg-white">
        <h2 className="text-3xl font-semibold text-center mb-10 text-gray-900">
          Featured Products
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {products?.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.slug}`}
              className="group block rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-all"
            >
              <div className="relative w-full h-[400px]">
                <Image
                  src={p.image_url || "/placeholder.jpg"}
                  alt={p.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-5 bg-white">
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-green-700 transition">
                  {p.name}
                </h3>
                <p className="text-gray-500 text-sm mt-1">{p.category}</p>
                <p className="text-green-700 font-bold mt-2">RM {p.price}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-14">
          <Link
            href="/shop"
            className="inline-block px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 hover:scale-[1.03] transition-transform font-medium"
          >
            View All Products
          </Link>
        </div>
      </section>

      {/* 🍃 About Section */}
      <section className="py-20 px-6 md:px-12 text-center bg-gray-50 border-t border-gray-200">
        <h2 className="text-3xl font-semibold mb-6 text-gray-900">
          About TOKOSHIE
        </h2>
        <p className="max-w-2xl mx-auto text-gray-600 leading-relaxed">
          At TOKOSHIE, we celebrate the essence of timeless craftsmanship.
          Our matcha is sourced directly from Kyoto’s finest tea gardens,
          stone-ground to preserve its delicate aroma and umami.
          <br />
          <br />
          Experience Japan’s heritage — one sip at a time.
        </p>
      </section>
    </main>
  );
}
