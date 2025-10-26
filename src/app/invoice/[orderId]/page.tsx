import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import InvoiceActions from "@/components/InvoiceActions";
import Link from "next/link";

/** Row shape returned by get_full_customer_orders_by_email */
type RpcOrderRow = {
  // Order Info
  order_id: string;
  order_number: string;
  total_amount: number | string;
  payment_status: string;
  shipping_status: string | null;
  payment_method: string;
  tracking_number: string | null;
  created_at: string;

  // Item Info
  product_id: string;
  product_name: string;
  product_description: string | null;
  image_url: string | null;
  category: string | null;
  quantity: number;
  unit_price: number | string;
  subtotal: number | string;

  // Customer / Company
  customer_full_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  customer_gender: string | null;
  customer_dob: string | null;

  // Billing (Personal)
  billing_address_line1: string | null;
  billing_address_line2: string | null;
  billing_city: string | null;
  billing_state: string | null;
  billing_postal_code: string | null;
  billing_country: string | null;
  billing_first_name: string | null;
  billing_last_name: string | null;
  billing_phone: string | null;

  // Billing (Company)
  company_name: string | null;
  company_ssm: string | null;
  company_address1: string | null;
  company_address2: string | null;
  company_postcode: string | null;
  company_city: string | null;
  company_state: string | null;
  company_country: string | null;

  // Optional if your RPC includes it
  shipping_address?: string | null;
};

type OrderItem = {
  product_id: string;
  product_name: string;
  product_description: string | null;
  image_url: string | null;
  category: string | null;
  quantity: number;
  unit_price: number | string;
  subtotal: number | string;
};

type GroupedOrder = {
  order_id: string;
  order_number: string;
  customer_name: string | null;
  customer_email: string | null;
  shipping_address?: string | null;

  // Personal billing
  billing_first_name?: string | null;
  billing_last_name?: string | null;
  billing_phone?: string | null;
  billing_address_line1?: string | null;
  billing_address_line2?: string | null;
  billing_city?: string | null;
  billing_state?: string | null;
  billing_postal_code?: string | null;
  billing_country?: string | null;

  // Company billing
  company_name?: string | null;
  company_ssm?: string | null;
  company_address1?: string | null;
  company_address2?: string | null;
  company_postcode?: string | null;
  company_city?: string | null;
  company_state?: string | null;
  company_country?: string | null;

  total_amount: number | string;
  payment_status: string;
  shipping_status: string | null;
  payment_method: string;
  tracking_number?: string | null;
  created_at: string;

  items: OrderItem[];
};

interface InvoicePageProps {
  params: { orderId: string };
}

export const dynamic = "force-dynamic";

export default async function InvoicePage({ params }: InvoicePageProps) {
  const { orderId } = params;
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return notFound();

  const { data, error } = await supabase.rpc("get_full_customer_orders_by_email", {
    user_email: user.email,
  });

  if (error || !data || data.length === 0) return notFound();

  // Strongly type the rows (no `any`)
  const rows = data as unknown as RpcOrderRow[];

  // Group rows by order_id
  const groupedOrders: Record<string, GroupedOrder> = {};
  for (const row of rows) {
    if (!groupedOrders[row.order_id]) {
      groupedOrders[row.order_id] = {
        order_id: row.order_id,
        order_number: row.order_number,
        customer_name: row.customer_full_name ?? null,
        customer_email: row.customer_email ?? null,
        shipping_address: row.shipping_address ?? null,

        billing_first_name: row.billing_first_name ?? null,
        billing_last_name: row.billing_last_name ?? null,
        billing_phone: row.billing_phone ?? null,
        billing_address_line1: row.billing_address_line1 ?? null,
        billing_address_line2: row.billing_address_line2 ?? null,
        billing_city: row.billing_city ?? null,
        billing_state: row.billing_state ?? null,
        billing_postal_code: row.billing_postal_code ?? null,
        billing_country: row.billing_country ?? null,

        company_name: row.company_name ?? null,
        company_ssm: row.company_ssm ?? null,
        company_address1: row.company_address1 ?? null,
        company_address2: row.company_address2 ?? null,
        company_postcode: row.company_postcode ?? null,
        company_city: row.company_city ?? null,
        company_state: row.company_state ?? null,
        company_country: row.company_country ?? null,

        total_amount: row.total_amount,
        payment_status: row.payment_status,
        shipping_status: row.shipping_status ?? null,
        payment_method: row.payment_method,
        tracking_number: row.tracking_number ?? null,
        created_at: row.created_at,
        items: [],
      };
    }

    groupedOrders[row.order_id].items.push({
      product_id: row.product_id,
      product_name: row.product_name,
      product_description: row.product_description ?? null,
      image_url: row.image_url ?? null,
      category: row.category ?? null,
      quantity: row.quantity,
      unit_price: row.unit_price,
      subtotal: row.subtotal,
    });
  }

  const order = groupedOrders[orderId];
  if (!order) return notFound();

  const isCompany = Boolean(order.company_name?.trim());
  const fmt = (v: number | string | null | undefined) => Number(v ?? 0).toFixed(2);

  // Server logs
  console.log("🧾 Selected order data:", order);
  console.log("🧾 Available keys:", Object.keys(order));

  const noPersonalBilling =
    !isCompany &&
    !order.billing_first_name &&
    !order.billing_last_name &&
    !order.billing_address_line1 &&
    !order.billing_city &&
    !order.billing_state &&
    !order.billing_postal_code &&
    !order.billing_country;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-3xl mx-auto mb-6 print:hidden">
        <Link href="/account/orders" className="text-sm text-green-800 hover:underline">
          ← Return to Orders
        </Link>
      </div>

      <div className="max-w-4xl mx-auto bg-white border border-gray-200 shadow-md rounded-lg p-8 relative print:p-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 tracking-wide">TOKOSHIE</h1>
          <p className="text-sm text-gray-500 mt-1">Official Invoice</p>
        </div>

        {/* Invoice Summary */}
        <div className="flex justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Invoice #{order.order_number}
            </h2>
            <p className="text-sm text-gray-600">
              Date: {format(new Date(order.created_at), "dd/MM/yyyy")}
            </p>
            <p className="text-sm text-gray-600">Payment: {order.payment_method}</p>
          </div>
          <div className="text-right text-sm text-gray-700">
            <p className="font-medium">{order.customer_name}</p>
            <p>{order.customer_email}</p>
          </div>
        </div>

        {/* Billing / Shipping */}
        {isCompany ? (
          <>
            {/* Company → Billing */}
            <div className="mb-6 text-sm text-gray-700">
              <h3 className="font-semibold mb-1">Billing Address</h3>
              {order.company_name && <p className="font-medium">{order.company_name}</p>}
              {order.company_ssm && <p>SSM: {order.company_ssm}</p>}
              {order.company_address1 && <p>{order.company_address1}</p>}
              {order.company_address2 && <p>{order.company_address2}</p>}
              <p>
                {(order.company_postcode ?? "")} {(order.company_city ?? "")}
                {order.company_state ? `, ${order.company_state}` : ""}
              </p>
              {order.company_country && <p>{order.company_country}</p>}
            </div>

            {/* Company → Shipping (personal contact lines) */}
            <div className="mb-6 text-sm text-gray-700">
              <h3 className="font-semibold mb-1">Shipping Address</h3>
              {(order.billing_first_name || order.billing_last_name) && (
                <p>
                  {order.billing_first_name ?? ""} {order.billing_last_name ?? ""}
                </p>
              )}
              {order.billing_phone && <p>{order.billing_phone}</p>}
              {(order.billing_address_line1 || order.billing_address_line2) && (
                <p>
                  {order.billing_address_line1}
                  {order.billing_address_line2 ? `, ${order.billing_address_line2}` : ""}
                </p>
              )}
              <p>
                {(order.billing_city ?? "")}
                {order.billing_state ? `, ${order.billing_state}` : ""}
                {order.billing_postal_code ? ` ${order.billing_postal_code}` : ""}
                {order.billing_country ? `, ${order.billing_country}` : ""}
              </p>
            </div>
          </>
        ) : (
          <div className="mb-6 text-sm text-gray-700">
            <h3 className="font-semibold mb-1">Billing Information</h3>
            {noPersonalBilling ? (
              <p className="italic text-gray-500">No billing information available.</p>
            ) : (
              <>
                <p>
                  {(order.billing_first_name ?? "")} {(order.billing_last_name ?? "")}
                </p>
                {order.billing_phone && <p>{order.billing_phone}</p>}
                {(order.billing_address_line1 || order.billing_address_line2) && (
                  <p>
                    {order.billing_address_line1}
                    {order.billing_address_line2 ? `, ${order.billing_address_line2}` : ""}
                  </p>
                )}
                <p>
                  {(order.billing_city ?? "")}
                  {order.billing_state ? `, ${order.billing_state}` : ""}
                  {order.billing_postal_code ? ` ${order.billing_postal_code}` : ""}
                  {order.billing_country ? `, ${order.billing_country}` : ""}
                </p>
              </>
            )}
          </div>
        )}

        {/* Items Table */}
        <div className="mb-6">
          <table className="w-full text-sm border border-gray-200">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-2 border-r border-gray-200">Item</th>
                <th className="p-2 border-r border-gray-200">Qty</th>
                <th className="p-2 border-r border-gray-200">Price</th>
                <th className="p-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.product_id} className="border-t">
                  <td className="p-2">{item.product_name}</td>
                  <td className="p-2">{item.quantity}</td>
                  <td className="p-2">RM {fmt(item.unit_price)}</td>
                  <td className="p-2 text-right">RM {fmt(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 border-t font-semibold">
                <td colSpan={3} className="p-2 text-right">
                  Total:
                </td>
                <td className="p-2 text-right">RM {fmt(order.total_amount)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Status Info */}
        <div className="mb-4 text-sm text-gray-700 flex justify-between flex-wrap gap-y-1">
          <div>
            <strong>Payment Status:</strong>{" "}
            <span className="capitalize">{order.payment_status}</span>
          </div>
          {order.tracking_number && (
            <div>
              <strong>Tracking:</strong> {order.tracking_number}
            </div>
          )}
        </div>

        {/* Print / Actions */}
        <div className="print:hidden">
          <InvoiceActions />
        </div>
      </div>
    </main>
  );
}
