"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import Link from "next/link";

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    image_url: "",
    stock: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      const { data } = await supabase.from("products").select("*").eq("id", id).single();
      if (data) {
        setForm({
          name: data.name || "",
          price: data.price?.toString() || "",
          description: data.description || "",
          image_url: data.image_url || "",
          stock: data.stock?.toString() || "",
        });
      }
      setLoading(false);
    }
    fetchProduct();
  }, [id]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    let image_url = form.image_url;

    // Upload new image if selected
    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, imageFile);

      if (!uploadError) {
        const { data } = supabase.storage.from("product-images").getPublicUrl(filePath);
        image_url = data.publicUrl;
      }
    }

    const { error } = await supabase
      .from("products")
      .update({
        name: form.name,
        price: parseFloat(form.price),
        description: form.description,
        image_url,
        stock: form.stock ? parseInt(form.stock) : null,
      })
      .eq("id", id);

    if (!error) {
      router.push("/admin/products");
    } else {
      alert("Update failed.");
    }
  }

  if (loading) return <div className="p-6 text-gray-500">Loading product...</div>;

  return (
    <main className="max-w-xl mx-auto p-6">
      {/* Back Button */}
      <div className="mb-4">
        <Link
          href="/admin/products"
          className="inline-block text-sm text-gray-600 hover:text-gray-800 transition"
        >
          ← Back to Products
        </Link>
      </div>

      <h1 className="text-2xl font-semibold mb-6">Edit Product</h1>

      <form onSubmit={handleUpdate} className="space-y-4">
        <input
          type="text"
          placeholder="Product Name"
          className="border rounded w-full p-2"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <input
          type="number"
          step="0.01"
          placeholder="Price (RM)"
          className="border rounded w-full p-2"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
        />

        <input
          type="number"
          placeholder="Stock"
          className="border rounded w-full p-2"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
        />

        <textarea
          placeholder="Description"
          className="border rounded w-full p-2"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        {/* Preview image */}
        {form.image_url && (
          <div className="relative w-32 h-32">
            <Image
              src={form.image_url || "/placeholder.jpg"}
              alt="Product"
              fill
              sizes="128px"
              className="object-cover rounded border"
            />
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
        />

        <button
          type="submit"
          className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition"
        >
          Update Product
        </button>
      </form>
    </main>
  );
}
