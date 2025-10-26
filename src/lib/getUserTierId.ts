import { supabase } from "@/lib/supabaseClient";

export async function getUserPricingTierId(): Promise<number | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const userId = session?.user?.id;
  if (!userId) return null;

  const { data: company } = await supabase
    .from("companies")
    .select("pricing_tier_id")
    .eq("user_id", userId)
    .maybeSingle();

  return company?.pricing_tier_id ?? null;
}