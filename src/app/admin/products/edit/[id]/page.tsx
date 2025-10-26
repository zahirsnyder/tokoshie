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

  // Fetch existing product data
  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching product:", error.message);
        return;
      }

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

  // Handle update submission
  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert("You must be logged in to update the product.");
      return;
    }

    let image_url = form.image_url;

    // 🟠 Step 1: Delete old image (via secure API) if uploading new
    if (imageFile && form.image_url) {
      try {
        const url = new URL(form.image_url);
        const pathParts = url.pathname.split("/");
        const bucketIndex = pathParts.findIndex((part) => part === "product-images");
        const filePath = pathParts.slice(bucketIndex + 1).join("/");

        if (!filePath) throw new Error("❌ Failed to parse file path from image URL.");

        console.log("🧹 Deleting old image via server API:", filePath);

        // 🔐 Call secure API route (service key deletes for real)
        const res = await fetch("/api/delete-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filePath }),
        });

        const result = await res.json();

        if (!res.ok) {
          console.error("❌ Failed to delete old image:", result.error);
        } else {
          console.log("✅ Old image deleted successfully:", filePath);
        }
      } catch (err) {
        console.error("❌ Error deleting old image:", err);
      }
    }

    // 🟢 Step 2: Upload new image
    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const filename = `${Date.now()}.${ext}`;
      const filePath = `products/${filename}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, imageFile);

      if (uploadError) {
        console.error("Image upload failed:", uploadError.message);
        alert("Failed to upload image.");
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      image_url = publicUrlData.publicUrl;
    }

    // 🟢 Step 3: Update product in database
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

    if (error) {
      console.error("Update failed:", error.message);
      alert("Failed to update product.");
    } else {
      router.push("/admin/products");
    }
  }

  if (loading) {
    return <div className="p-6 text-gray-500">Loading product...</div>;
  }

  return (
    <main className="max-w-xl mx-auto p-6">
      {/* Back link */}
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

        {/* Preview current or uploaded image */}
        <div>
          {form.image_url ? (
            <div className="relative w-32 h-32 mb-2">
              <Image
                src={form.image_url}
                alt="Product"
                fill
                sizes="128px"
                className="object-cover rounded border"
              />
            </div>
          ) : (
            <p className="text-sm text-gray-500">No image uploaded</p>
          )}
        </div>

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
