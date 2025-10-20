import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE!; // 🚫 Never expose this to client

export const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});
