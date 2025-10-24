import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const form = await req.formData();
    const orderId = form.get("order_id") as string;
    const newStatus = form.get("shipping_status") as string;

    if (!orderId || !newStatus) {
        return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
        .from("orders")
        .update({ shipping_status: newStatus })
        .eq("id", orderId);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.redirect(new URL("/admin/orders", req.url));
}
