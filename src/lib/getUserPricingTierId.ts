import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

type PricingTier = {
  name: string;
};

export async function getUserPricingTierInfo(): Promise<
  { tierId: number; tierName: string } | null
> {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("companies")
    .select(
      `
      tier_id,
      pricing_tiers:tier_id (
        name
      )
    `
    )
    .eq("auth_user_id", user.id)
    .single();

  if (
    error ||
    !data ||
    !data.tier_id ||
    !data.pricing_tiers ||
    Array.isArray(data.pricing_tiers)
  ) {
    return null;
  }

  return {
    tierId: data.tier_id,
    tierName: (data.pricing_tiers as PricingTier).name,
  };
}
