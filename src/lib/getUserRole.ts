import { supabase } from "@/lib/supabaseClient";

export async function getUserRole(email?: string): Promise<"admin" | "customer" | null> {
  if (!email) return null;

  console.log("🔍 Checking role for:", email);

  // 1️⃣ Check Admin Table
  const { data: adminData, error: adminError } = await supabase
    .from("admins")
    .select("role")
    .eq("email", email)
    .maybeSingle();

  console.log("👑 Admin table result:", adminData);

  if (adminError) console.error("Admin check error:", adminError.message);
  if (adminData?.role?.toLowerCase() === "admin") return "admin";

  // 2️⃣ Check Customer Table — no role required
  const { data: customerData, error: customerError } = await supabase
    .from("customers")
    .select("email")
    .eq("email", email)
    .maybeSingle();

  console.log("👤 Customer table result:", customerData);

  if (customerError) console.error("Customer check error:", customerError.message);
  if (customerData) return "customer";

  return null;
}
