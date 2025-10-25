"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";

type OrderRow = {
  order_id: string;
  order_number: string;
  total_amount: number;
  payment_status: string;
  shipping_status: string;
  payment_method: string;
  tracking_number: string;
  created_at: string;
  product_id: string;
  product_name: string;
  product_description: string;
  image_url: string;
  category: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
};

type OrderItem = {
  product_id: string;
  product_name: string;
  product_description: string;
  image_url: string;
  category: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
};

type Order = {
  order_id: string;
  order_number: string;
  total_amount: number;
  payment_status: string;
  shipping_status: string;
  payment_method: string;
  tracking_number: string;
  created_at: string;
  items: OrderItem[];
};

export default function OrdersPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔁 Group raw rows into structured orders with items
  function groupOrders(rows: OrderRow[]): Order[] {
    const grouped: Record<string, Order> = {};

    for (const row of rows) {
      if (!grouped[row.order_id]) {
        grouped[row.order_id] = {
          order_id: row.order_id,
          order_number: row.order_number,
          total_amount: row.total_amount,
          payment_status: row.payment_status,
          shipping_status: row.shipping_status,
          payment_method: row.payment_method,
          tracking_number: row.tracking_number,
          created_at: row.created_at,
          items: [],
        };
      }

      grouped[row.order_id].items.push({
        product_id: row.product_id,
        product_name: row.product_name,
        product_description: row.product_description,
        image_url: row.image_url,
        category: row.category,
        quantity: row.quantity,
        unit_price: row.unit_price,
        subtotal: row.subtotal,
      });
    }

    return Object.values(grouped);
  }


  useEffect(() => {
    const fetchOrders = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

      if (!user) {
        router.push("/account/login");
        return;
      }

      console.log("✅ Authenticated user:", user.email);

      const { data, error } = await supabase.rpc("get_full_customer_orders_by_email", {
        user_email: user.email,
      });

      if (error) {
        console.error("❌ Error fetching orders:", error);
      } else {
        console.log("✅ Raw orders data:", data);
        const grouped = groupOrders(data || []);
        console.log("✅ Grouped orders:", grouped);
        setOrders(grouped);
      }

      setLoading(false);
    };

    fetchOrders();
  }, [supabase, router]);

  return (
    <main className="min-h-screen bg-white px-4 py-10 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">📦 Your Orders</h1>

      <div className="mb-6">
        <Link href="/account/profile" className="text-sm text-green-800 hover:underline">
          ← Back to Profile
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading orders...</p>
      ) : orders.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          <p className="mb-4">You don’t have any orders yet.</p>
          <Link
            href="/shop"
            className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded text-sm"
          >
            🛒 Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          {orders.map((order) => (
            <div
              key={order.order_id}
              className="border rounded-lg shadow-sm overflow-hidden p-4 bg-white"
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h2 className="font-semibold text-lg">#{order.order_number}</h2>
                  <p className="text-sm text-gray-500">
                    {format(new Date(order.created_at), "dd MMM yyyy")}
                  </p>
                </div>
                <Link
                  href={`/invoice/${order.order_id}`}
                  className="text-sm text-green-700 hover:underline"
                >
                  View Invoice
                </Link>
              </div>

              <div className="text-sm text-gray-700 mb-3 space-y-1">
                <p>Status: <strong>{order.payment_status}</strong></p>
                <p>Shipping: <strong>{order.shipping_status}</strong></p>
                <p>Payment Method: <strong>{order.payment_method}</strong></p>
                <p>Tracking #: <strong>{order.tracking_number}</strong></p>
              </div>

              <div className="border-t pt-3">
                {order.items.map((item) => (
                  <div key={item.product_id} className="flex items-start mb-4">
                    <Image
                      src={item.image_url}
                      alt={item.product_name}
                      width={64}
                      height={64}
                      className="object-cover rounded mr-4 border"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-gray-500">{item.category}</p>
                      <p className="text-xs text-gray-400 mt-1">{item.product_description}</p>
                      <p className="text-sm">
                        {item.quantity} × RM {item.unit_price.toFixed(2)} ={" "}
                        <strong>RM {item.subtotal.toFixed(2)}</strong>
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-right font-semibold text-lg mt-4">
                Total: RM {order.total_amount.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
