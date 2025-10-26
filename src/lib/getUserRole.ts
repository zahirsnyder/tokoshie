import { supabase } from "./supabaseClient";

export async function getUserRole(
  email?: string
): Promise<"admin" | "company" | "customer" | null> {
  const norm = (email ?? "").trim().toLowerCase();
  if (!norm) return null;

  console.log("[getUserRole] start → email:", norm);

  // 🔹 1️⃣ Check Admins
  const { data: adminData, error: adminErr } = await supabase
    .from("admins")
    .select("role")
    .ilike("email", norm)
    .maybeSingle();

  console.log("[getUserRole] admins result:", adminData);
  if (adminErr) console.warn("[getUserRole] admins error:", adminErr.message);

  if (adminData?.role?.toLowerCase() === "admin") {
    console.log("[getUserRole] role resolved: admin");
    return "admin";
  }

  // 🔹 2️⃣ Check Companies
  const { data: compData, error: compErr } = await supabase
    .from("companies")
    .select("company_email")
    .ilike("company_email", norm)
    .maybeSingle();

  console.log("[getUserRole] companies result:", compData);
  if (compErr) console.warn("[getUserRole] companies error:", compErr.message);

  if (compData) {
    console.log("[getUserRole] role resolved: company");
    return "company";
  }

  // 🔹 3️⃣ Check Customers
  const { data: custData, error: custErr } = await supabase
    .from("customers")
    .select("email")
    .ilike("email", norm)
    .maybeSingle();

  console.log("[getUserRole] customers result:", custData);
  if (custErr) console.warn("[getUserRole] customers error:", custErr.message);

  if (custData) {
    console.log("[getUserRole] role resolved: customer");
    return "customer";
  }

  // 🚫 None found
  console.log("[getUserRole] role resolved: null");
  return null;
}
