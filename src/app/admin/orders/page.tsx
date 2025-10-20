import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic"; // always fetch latest data

// TypeScript types for clarity
type Order = {
  id: string;
  order_number: string;
  total_amount: number;
  payment_status: string;
  shipping_status: string;
  created_at: string;
  customers?: {
    full_name?: string;
    email?: string;
  }[]; // <-- fixed: customers comes as array
};

export default async function AdminOrdersPage() {
  const { data: orders, error } = await supabaseAdmin
    .from("orders")
    .select(
      `
      id,
      order_number,
      total_amount,
      payment_status,
      shipping_status,
      created_at,
      customers ( full_name, email )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading orders:", error.message);
  }

  return (
    <main className="min-h-screen bg-white p-10">
      <h1 className="text-2xl font-bold mb-6">Orders</h1>

      {!orders?.length && <p className="text-gray-500">No orders found.</p>}

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700 sticky top-0">
            <tr>
              <th className="p-3 text-left">Order #</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Total (RM)</th>
              <th className="p-3 text-left">Payment</th>
              <th className="p-3 text-left">Shipping</th>
              <th className="p-3 text-left">Date</th>
            </tr>
          </thead>

          <tbody>
            {orders?.map((o: Order) => {
              // safely handle customers array
              const customer = o.customers?.[0];
              return (
                <tr key={o.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-mono">{o.order_number}</td>
                  <td className="p-3">
                    {customer?.full_name || customer?.email || "—"}
                  </td>
                  <td className="p-3">{o.total_amount?.toFixed(2)}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        o.payment_status === "Paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {o.payment_status}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        o.shipping_status === "Shipped"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {o.shipping_status}
                    </span>
                  </td>
                  <td className="p-3 text-gray-500 text-xs">
                    {new Date(o.created_at).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
