import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import InvoiceActions from "@/components/InvoiceActions";
import Link from "next/link";

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

type GroupedOrder = {
    order_id: string;
    order_number: string;
    customer_name: string;
    customer_email: string;
    shipping_address: string;

    billing_first_name: string;
    billing_last_name: string;
    billing_phone: string;
    billing_address_line1: string;
    billing_address_line2: string;
    billing_city: string;
    billing_state: string;
    billing_postal_code: string;
    billing_country: string;

    total_amount: number;
    payment_status: string;
    shipping_status: string;
    payment_method: string;
    tracking_number: string;
    created_at: string;

    items: OrderItem[];
};

interface InvoicePageProps {
    params: { orderId: string };
}

export const dynamic = "force-dynamic";

export default async function InvoicePage({ params }: InvoicePageProps) {
    const supabase = createServerComponentClient({ cookies });

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return notFound();

    const { data, error } = await supabase.rpc("get_full_customer_orders_by_email", {
        user_email: user.email,
    });

    if (error || !data) return notFound();

    const groupedOrders: Record<string, GroupedOrder> = {};
    console.log("🧾 Fetched order rows:", data);

    for (const row of data) {
        if (!groupedOrders[row.order_id]) {
            groupedOrders[row.order_id] = {
                order_id: row.order_id,
                order_number: row.order_number,
                customer_name: row.customer_full_name,
                customer_email: row.customer_email,
                shipping_address: row.shipping_address,

                billing_first_name: row.billing_first_name,
                billing_last_name: row.billing_last_name,
                billing_phone: row.billing_phone,
                billing_address_line1: row.address_line1,
                billing_address_line2: row.address_line2,
                billing_city: row.city,
                billing_state: row.state,
                billing_postal_code: row.postal_code,
                billing_country: row.country,

                total_amount: row.total_amount,
                payment_status: row.payment_status,
                shipping_status: row.shipping_status,
                payment_method: row.payment_method,
                tracking_number: row.tracking_number,
                created_at: row.created_at,
                items: [],
            };
        }

        groupedOrders[row.order_id].items.push({
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

    const order = groupedOrders[params.orderId];

    if (!order) return notFound();

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-10">
            {/* ✅ Move back button OUTSIDE invoice */}
            <div className="max-w-3xl mx-auto mb-6 print:hidden">
                <Link href="/account/orders" className="text-sm text-green-800 hover:underline">
                    ← Return to Orders Details
                </Link>
            </div>

            {/* INVOICE CONTAINER */}
            <div className="max-w-4xl mx-auto bg-white border border-gray-200 shadow-md rounded-lg p-8 relative print:p-10">
                {/* Brand */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-800 tracking-wide">TOKOSHIE</h1>
                    <p className="text-sm text-gray-500 mt-1">Official Invoice</p>
                </div>

                {/* Invoice Details */}
                <div className="flex justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Invoice #{order.order_number}</h2>
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

                {/* ✅ Billing Address formatted into 4 lines */}
                <div className="mb-6 text-sm text-gray-700">
                    <h3 className="font-semibold mb-1">Billing Address</h3>
                    <p>
                        {order.billing_first_name} {order.billing_last_name}
                    </p>
                    {order.billing_phone && <p>{order.billing_phone}</p>}
                    {(order.billing_address_line1 || order.billing_address_line2) && (
                        <p>
                            {order.billing_address_line1}
                            {order.billing_address_line2 ? `, ${order.billing_address_line2}` : ""}
                        </p>
                    )}
                    <p>
                        {order.billing_city}, {order.billing_state} {order.billing_postal_code}, {order.billing_country}
                    </p>
                </div>

                {/* Shipping Address */}
                {order.shipping_address && (
                    <div className="mb-6 text-sm text-gray-700">
                        <h3 className="font-semibold mb-1">Shipping Address</h3>
                        <p>{order.shipping_address}</p>
                    </div>
                )}

                {/* Item Table */}
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
                                    <td className="p-2">RM {item.unit_price.toFixed(2)}</td>
                                    <td className="p-2 text-right">RM {item.subtotal.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-gray-100 border-t font-semibold">
                                <td colSpan={3} className="p-2 text-right">
                                    Total:
                                </td>
                                <td className="p-2 text-right">RM {order.total_amount.toFixed(2)}</td>
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

                {/* Print Button */}
                <div className="print:hidden">
                    <InvoiceActions />
                </div>
            </div>
        </main>
    );
}
