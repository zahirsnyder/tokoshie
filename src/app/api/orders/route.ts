import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// 🧩 Helper — Generate order number like TOK-20251020-AB12
function genOrderNumber(): string {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TOK-${ymd}-${rand}`;
}

// 🧩 Types
interface Customer {
  name: string;
  email: string;
  address?: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity?: number;
}

interface OrderPayload {
  customer: Customer;
  items: CartItem[];
  total: number;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as OrderPayload;

    const { customer, items, total } = body;

    if (!customer?.email || !items?.length || !total) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // 1️⃣ Upsert customer
    const { data: cust, error: custErr } = await supabaseAdmin
      .from("customers")
      .upsert(
        {
          full_name: customer.name,
          email: customer.email,
          address: customer.address ?? "",
        },
        { onConflict: "email" },
      )
      .select("*")
      .single();

    if (custErr || !cust) {
      console.error("Customer upsert error:", custErr);
      return NextResponse.json({ error: "Customer error" }, { status: 500 });
    }

    // 2️⃣ Create order
    const orderNumber = genOrderNumber();

    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_id: cust.id,
        total_amount: total,
        payment_status: "Pending",
        shipping_status: "Pending",
      })
      .select("*")
      .single();

    if (orderErr || !order) {
      console.error("Order create error:", orderErr);
      return NextResponse.json({ error: "Order create error" }, { status: 500 });
    }

    // 3️⃣ Insert order items
    const lineItems = items.map((p) => ({
      order_id: order.id,
      product_id: p.id,
      name: p.name,
      unit_price: p.price,
      quantity: p.quantity ?? 1,
    }));

    const { error: itemsErr } = await supabaseAdmin
      .from("order_items")
      .insert(lineItems);

    if (itemsErr) {
      console.error("Order items error:", itemsErr);
      return NextResponse.json({ error: "Order items error" }, { status: 500 });
    }

    // ✅ Success
    return NextResponse.json(
      { ok: true, orderNumber, orderId: order.id },
      { status: 200 },
    );
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
