import { supabase } from "./supabaseClient";

export async function getTieredPrice(productId: string, tierId: number): Promise<number | null> {
  const { data, error } = await supabase
    .from("product_prices")
    .select("price")
    .eq("product_id", productId)
    .eq("tier_id", tierId)
    .single();

  if (error) {
    console.warn("Tiered price not found:", error.message);
    return null;
  }

  return data.price;
}
