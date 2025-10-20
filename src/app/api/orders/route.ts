import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function genOrderNumber() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TOK-${ymd}-${rand}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      customer = { name: "", email: "", address: "" },
      items = [],
      total = 0
    } = body;

    if (!customer?.email || !items.length || !total) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // 1) Upsert customer
    const { data: cust, error: custErr } = await supabaseAdmin
      .from("customers")
      .upsert(
        {
          full_name: customer.name,
          email: customer.email,
          address: customer.address
        },
        { onConflict: "email" }
      )
      .select("*")
      .single();

    if (custErr) {
      console.error(custErr);
      return NextResponse.json({ error: "Customer error" }, { status: 500 });
    }

    // 2) Create order
    const orderNumber = genOrderNumber();
    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_id: cust.id,
        total_amount: total,
        payment_status: "Pending",
        shipping_status: "Pending"
      })
      .select("*")
      .single();

    if (orderErr) {
      console.error(orderErr);
      return NextResponse.json({ error: "Order create error" }, { status: 500 });
    }

    // 3) Insert order_items (quantity default = 1 for now)
    const lineItems = items.map((p: any) => ({
      order_id: order.id,
      product_id: p.id,
      name: p.name,
      unit_price: p.price,
      quantity: p.quantity ?? 1
    }));

    const { error: itemsErr } = await supabaseAdmin
      .from("order_items")
      .insert(lineItems);

    if (itemsErr) {
      console.error(itemsErr);
      return NextResponse.json({ error: "Order items error" }, { status: 500 });
    }

    return NextResponse.json(
      { ok: true, orderNumber, orderId: order.id },
      { status: 200 }
    );
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
