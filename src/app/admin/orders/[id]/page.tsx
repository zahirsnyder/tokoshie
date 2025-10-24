import { supabaseAdmin } from "@/lib/supabaseAdmin";
import Link from "next/link";
import { notFound } from "next/navigation";

// --- 🧾 Type Definitions ---
type OrderItem = {
  quantity: number;
  unit_price: number;
  subtotal: number;
  products: {
    name: string;
  }[];
};

type Customer = {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postcode: string;
};

type OrderDetail = {
  id: string;
  order_number: string;
  total_amount: number;
  payment_status: string;
  shipping_status: string;
  tracking_number: string;
  created_at: string;
  customers: Customer[]; // <- If it's an array from Supabase
  order_items: OrderItem[];
};

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const orderId = params.id;

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select(
      `
        id,
        order_number,
        total_amount,
        payment_status,
        shipping_status,
        tracking_number,
        created_at,
        customers (
          full_name,
          email,
          phone,
          address,
          city,
          postcode
        ),
        order_items (
          quantity,
          unit_price,
          subtotal,
          products (
            name
          )
        )
      `
    )
    .eq("id", orderId)
    .single();

  if (!data || error) {
    console.error("Order not found:", error?.message);
    return notFound();
  }

  const order = data as OrderDetail;
  const customer = order.customers?.[0]; // ✅ safer access
  const items = order.order_items;

  return (
    <main className="min-h-screen bg-white p-10">
      <Link href="/admin/orders" className="text-sm text-blue-600 underline mb-6 inline-block">
        ← Back to orders
      </Link>

      <h1 className="text-2xl font-bold mb-2">Order #{order.order_number}</h1>
      <p className="text-sm text-gray-500 mb-6">
        Placed on {new Date(order.created_at).toLocaleString()}
      </p>

      {/* Customer Info */}
      <div className="mb-6 bg-gray-50 p-5 rounded-lg border">
        <h2 className="text-lg font-semibold mb-2">Customer Information</h2>
        <p><strong>Name:</strong> {customer?.full_name || "—"}</p>
        <p><strong>Email:</strong> {customer?.email || "—"}</p>
        <p><strong>Phone:</strong> {customer?.phone || "—"}</p>
        <p><strong>Address:</strong></p>
        <p className="text-sm text-gray-700 whitespace-pre-line">
          {customer?.address || "—"}, {customer?.city || "—"}, {customer?.postcode || "—"}
        </p>
      </div>

      {/* Order Items */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Items</h2>
        {items?.length ? (
          <table className="w-full border rounded-md text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 text-left">Product</th>
                <th className="p-3 text-left">Quantity</th>
                <th className="p-3 text-left">Price</th>
                <th className="p-3 text-left">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-3">{item.products?.[0]?.name || "—"}</td>
                  <td className="p-3">{item.quantity}</td>
                  <td className="p-3">RM {item.unit_price?.toFixed(2)}</td>
                  <td className="p-3">RM {item.subtotal?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-sm">No items found.</p>
        )}
      </div>

      {/* Summary */}
      <div className="bg-gray-50 p-5 rounded-lg border">
        <h2 className="text-lg font-semibold mb-2">Summary</h2>
        <p><strong>Total:</strong> RM {order.total_amount?.toFixed(2)}</p>
        <p><strong>Payment Status:</strong>{" "}
          <span className="text-green-700 font-medium">{order.payment_status}</span>
        </p>
        <p><strong>Shipping Status:</strong>{" "}
          <span className="text-blue-700 font-medium">{order.shipping_status}</span>
        </p>
        {order.tracking_number && (
          <p><strong>Tracking:</strong> <span className="text-sm">{order.tracking_number}</span></p>
        )}
      </div>
    </main>
  );
}
