import { supabase } from "@/lib/supabaseClient";

export default async function ShopPage() {
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading products:", error.message);
    return <p>Failed to load products</p>;
  }

  return (
    <main className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      {products?.map((p) => (
        <div key={p.id} className="border rounded-lg p-4 shadow">
          <img
            src={p.image_url || "/placeholder.jpg"}
            alt={p.name}
            className="w-full h-48 object-cover rounded"
          />
          <h2 className="text-lg font-semibold mt-2">{p.name}</h2>
          <p className="text-sm text-gray-500">{p.category}</p>
          <p className="font-bold text-green-700 mt-1">RM {p.price}</p>
        </div>
      ))}
    </main>
  );
}
