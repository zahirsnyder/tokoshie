"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddProductPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    slug: "",
    price: "",
    description: "",
    stock: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  // 🧠 Helper: Auto-generate slug from product name
  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-") // replace spaces with dashes
      .replace(/[^\w-]+/g, ""); // remove invalid chars
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      let image_url: string | null = null;

      // 🟢 Ensure slug is generated
      const slug = form.slug || generateSlug(form.name);

      // ✅ Upload image if provided
      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const filename = `${Date.now()}.${ext}`;
        const filePath = `products/${filename}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        image_url = publicUrlData.publicUrl;
      }

      // ✅ Insert product record
      const { error: insertError } = await supabase.from("products").insert([
        {
          name: form.name,
          slug, // 👈 required field
          price: parseFloat(form.price),
          description: form.description || null,
          stock: form.stock ? parseInt(form.stock) : 0,
          image_url,
          category: "matcha", // optional default
        },
      ]);

      if (insertError) throw insertError;

      alert("✅ Product added successfully!");
      router.push("/admin/products");
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error adding product:", err.message);
        alert(err.message);
      } else {
        console.error("Unknown error adding product:", err);
        alert("An unknown error occurred.");
      }
    }
  }

  return (
    <main className="max-w-xl mx-auto p-6">
      {/* Back Button */}
      <div className="mb-4">
        <Link
          href="/admin/products"
          className="text-sm text-gray-600 hover:text-gray-800 transition"
        >
          ← Back to Products
        </Link>
      </div>

      <h1 className="text-2xl font-semibold mb-6">Add Product</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Name */}
        <input
          type="text"
          placeholder="Product Name"
          className="border rounded w-full p-2"
          value={form.name}
          onChange={(e) => {
            const newName = e.target.value;
            setForm({
              ...form,
              name: newName,
              slug: generateSlug(newName), // auto-update slug as you type
            });
          }}
          required
        />

        {/* Slug (auto-filled, editable if needed) */}
        <input
          type="text"
          placeholder="Slug"
          className="border rounded w-full p-2"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          required
        />

        {/* Price */}
        <input
          type="number"
          step="0.01"
          placeholder="Price (RM)"
          className="border rounded w-full p-2"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
        />

        {/* Stock */}
        <input
          type="number"
          placeholder="Stock"
          className="border rounded w-full p-2"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
        />

        {/* Description */}
        <textarea
          placeholder="Description"
          className="border rounded w-full p-2"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        {/* Image Upload */}
        <div>
          <label className="text-sm font-medium">Product Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="block mt-1"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition"
        >
          {saving ? "Saving..." : "Save Product"}
        </button>
      </form>
    </main>
  );
}
