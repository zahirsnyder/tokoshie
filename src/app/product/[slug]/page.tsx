import { supabase } from "@/lib/supabaseClient";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!product) return <p>Product not found</p>;

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <img src={product.image_url} className="w-full rounded-lg" alt={product.name} />
      <h1 className="text-2xl font-bold mt-4">{product.name}</h1>
      <p className="text-green-700 text-xl mt-2">RM {product.price}</p>
      <p className="text-gray-600 mt-4">{product.description}</p>
      <button className="mt-6 px-6 py-2 bg-green-700 text-white rounded hover:bg-green-800">
        Add to Cart
      </button>
    </main>
  );
}
