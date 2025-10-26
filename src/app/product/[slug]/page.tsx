import { supabase } from "@/lib/supabaseClient";
import type { Metadata } from "next";
import { getUserPricingTierInfo } from "@/lib/getUserPricingTierId";
import { getTieredPrice } from "@/lib/getTieredPrice";
import ProductDetails from "@/components/ProductDetails";

// ⛔ Keep this in layout/page.tsx only — not dynamic pages
export const metadata: Metadata = {
  title: "Product Details",
  description: "View product information and add to cart.",
};

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  const tierInfo = await getUserPricingTierInfo();
  let tierName: string | null = null;

  if (tierInfo && product) {
    const tierPrice = await getTieredPrice(product.id, tierInfo.tierId);
    if (tierPrice) {
      product.price = tierPrice;
      tierName = tierInfo.tierName;
    }
  }

  if (error || !product) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-12 text-center">
        <h1 className="text-xl font-semibold text-gray-700">Product Not Found</h1>
        <p className="text-gray-500 mt-2">We couldn’t find the product you’re looking for.</p>
      </main>
    );
  }

  return <ProductDetails product={product} tierName={tierName} />;
}
