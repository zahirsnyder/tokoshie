import { supabase } from "@/lib/supabaseClient";

export async function getUserRole(email?: string): Promise<"admin" | "customer" | null> {
  try {
    if (!email) return null;

    console.log("🔍 Checking role for:", email);

    // 1️⃣ Check if the user is an admin
    const { data: adminData, error: adminError } = await supabase
      .from("admins")
      .select("role")
      .eq("email", email)
      .maybeSingle();

    console.log("👑 Admin table result:", adminData);

    if (adminError) console.error("Admin check error:", adminError.message);

    if (adminData && adminData.role?.toLowerCase() === "admin") return "admin";

    // 2️⃣ Otherwise, check if they're a customer
    const { data: customerData, error: customerError } = await supabase
      .from("customers")
      .select("email")
      .eq("email", email)
      .maybeSingle();

    console.log("👤 Customer table result:", customerData);

    if (customerError) console.error("Customer check error:", customerError.message);

    if (customerData) return "customer";

    // 3️⃣ Default fallback
    return null;
  } catch (err) {
    console.error("Unexpected error in getUserRole:", err);
    return null;
  }
}
