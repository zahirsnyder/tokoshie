"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AddProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    let image_url = null;

    // ✅ Upload image if available
    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, imageFile);

      if (uploadError) {
        alert("Image upload failed!");
        setSaving(false);
        return;
      }

      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);
      image_url = data.publicUrl;
    }

    // ✅ Save product to DB
    const { error } = await supabase.from("products").insert([
      {
        name: form.name,
        price: parseFloat(form.price),
        description: form.description,
        image_url,
      },
    ]);

    setSaving(false);
    if (error) alert(error.message);
    else router.push("/admin/products");
  }

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Add Product</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Name"
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
        <textarea
          placeholder="Description (optional)"
          className="border rounded w-full p-2"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <div>
          <label className="text-sm font-medium">Product Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="block mt-1"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
        >
          {saving ? "Saving..." : "Save Product"}
        </button>
      </form>
    </main>
  );
}
