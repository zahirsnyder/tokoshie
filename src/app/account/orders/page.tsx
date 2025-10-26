'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';

/** ===== Types ===== */

/** Shape returned by the company-path SELECT (orders + nested order_items + products) */
type CompanyOrderRaw = {
  id: string;
  order_number: string;
  total_amount: number | string;
  payment_status: string;
  shipping_status: string;
  payment_method: string;
  tracking_number: string | null;
  created_at: string;
  order_items: CompanyOrderItemRaw[];
};

type CompanyOrderItemRaw = {
  product_id: string;
  quantity: number;
  unit_price: number | string;
  subtotal: number | string;
  products: {
    name: string | null;
    description: string | null;
    image_url: string | null;
    category: string | null;
  } | null;
};

/** Shape returned by the RPC get_full_customer_orders_by_email */
type OrderRow = {
  order_id: string;
  order_number: string;
  total_amount: number | string;
  payment_status: string;
  shipping_status: string;
  payment_method: string;
  tracking_number: string | null;
  created_at: string;

  product_id: string;
  product_name: string;
  product_description: string | null;
  image_url: string | null;
  category: string | null;
  quantity: number;
  unit_price: number | string;
  subtotal: number | string;
};

/** View models for rendering */
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
  tracking_number: string | null;
  created_at: string;
  items: OrderItem[];
};

/** ===== Utils ===== */
const n = (v: number | string): number => Number(v);

/** ===== Component ===== */
export default function OrdersPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  function groupOrders(rows: OrderRow[]): Order[] {
    const grouped: Record<string, Order> = {};

    for (const row of rows) {
      if (!grouped[row.order_id]) {
        grouped[row.order_id] = {
          order_id: row.order_id,
          order_number: row.order_number,
          total_amount: n(row.total_amount),
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
        product_description: row.product_description ?? '',
        image_url: row.image_url ?? '/placeholder.jpg',
        category: row.category ?? '',
        quantity: row.quantity,
        unit_price: n(row.unit_price),
        subtotal: n(row.subtotal),
      });
    }

    return Object.values(grouped);
  }

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

      if (!user) {
        router.push('/account/login');
        return;
      }

      let rows: OrderRow[] = [];

      try {
        // 🔍 Is the user a company?
        const { data: companyData, error: companyErr } = await supabase
          .from('companies')
          .select('auth_user_id')
          .eq('auth_user_id', user.id)
          .maybeSingle();

        if (companyErr) {
          console.error('❌ Company check failed:', companyErr);
        }

        if (companyData) {
          // 🏢 Company orders (direct select)
          const { data, error } = await supabase
            .from('orders')
            .select(
              `
                id, order_number, total_amount, payment_status, shipping_status,
                payment_method, tracking_number, created_at,
                order_items (
                  product_id, quantity, unit_price, subtotal,
                  products ( name, description, image_url, category )
                )
              `
            )
            .eq('company_id', user.id);

          if (error) {
            console.error('❌ Error fetching company orders:', error);
          } else if (Array.isArray(data)) {
            const typed = data as unknown as CompanyOrderRaw[];

            const mapped: OrderRow[] = typed.flatMap((order) =>
              order.order_items.map((item) => ({
                order_id: order.id,
                order_number: order.order_number,
                total_amount: order.total_amount,
                payment_status: order.payment_status,
                shipping_status: order.shipping_status,
                payment_method: order.payment_method,
                tracking_number: order.tracking_number,
                created_at: order.created_at,

                product_id: item.product_id,
                product_name: item.products?.name ?? '',
                product_description: item.products?.description ?? '',
                image_url: item.products?.image_url ?? '/placeholder.jpg',
                category: item.products?.category ?? '',
                quantity: item.quantity,
                unit_price: item.unit_price,
                subtotal: item.subtotal,
              }))
            );

            rows = mapped;
          }
        } else {
          // 👤 Customer orders (RPC)
          const { data, error } = await supabase.rpc(
            'get_full_customer_orders_by_email',
            { user_email: user.email }
          );

          if (error) {
            console.error('❌ Error fetching customer orders:', error);
          } else if (Array.isArray(data)) {
            rows = data as unknown as OrderRow[];
          }
        }
      } catch (err) {
        console.error('❌ Unexpected error:', err);
      }

      const grouped = groupOrders(rows);
      setOrders(grouped);
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
                    {format(new Date(order.created_at), 'dd MMM yyyy')}
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
                <p>Tracking #: <strong>{order.tracking_number ?? '—'}</strong></p>
              </div>

              <div className="border-t pt-3">
                {order.items.map((item) => (
                  <div key={item.product_id} className="flex items-start mb-4">
                    <Image
                      src={item.image_url || '/placeholder.jpg'}
                      alt={item.product_name || 'Product'}
                      width={64}
                      height={64}
                      className="object-cover rounded mr-4 border"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-gray-500">{item.category}</p>
                      <p className="text-xs text-gray-400 mt-1">{item.product_description}</p>
                      <p className="text-sm">
                        {item.quantity} × RM {item.unit_price.toFixed(2)} ={' '}
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
