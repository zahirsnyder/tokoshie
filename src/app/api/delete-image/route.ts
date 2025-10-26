import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 🛠 Admin client with service role key (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ⚠️ keep this in server only
);

// ✅ POST endpoint: deletes file from storage safely
export async function POST(req: NextRequest) {
  try {
    const { filePath } = await req.json();
    if (!filePath) {
      return NextResponse.json({ error: "Missing filePath" }, { status: 400 });
    }

    console.log("🗑️ Server deleting file:", filePath);

    const { data, error } = await supabaseAdmin
      .storage
      .from("product-images")
      .remove([filePath]);

    if (error) {
      console.error("❌ Delete error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("✅ Deleted successfully:", data);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("❌ Server error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
