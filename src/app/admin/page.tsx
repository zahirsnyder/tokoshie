"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

export default function AdminDashboard() {
    interface Order {
        id: string;
        customer_name?: string;
        total?: number;
        status?: string;
        created_at: string;
        product_name?: string;
    }

    interface SalesTrend {
        date: string;
        total: number;
    }

    interface TopProduct {
        name: string;
        count: number;
    }

    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [adminName, setAdminName] = useState("Admin");

    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        totalCustomers: 0,
        totalProducts: 0,
        revenueToday: 0,
        revenueYesterday: 0,
        revenue7Days: 0,
        revenue30Days: 0,
    });

    const [orders, setOrders] = useState<Order[]>([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [salesTrend, setSalesTrend] = useState<SalesTrend[]>([]);

    useEffect(() => {
        const fetchUser = async () => {
            const { data } = await supabase.auth.getUser();
            const currentUser = data.user;
            if (!currentUser) {
                router.push("/account/login");
                return;
            }

            const { data: adminData } = await supabase
                .from("admins")
                .select("full_name")
                .eq("email", currentUser.email)
                .single();

            setAdminName(adminData?.full_name || "Admin");
            setUser(currentUser);
        };

        fetchUser();
    }, [router]);

    useEffect(() => {
        if (user) fetchDashboardData();
    }, [user]);

    const fetchDashboardData = async () => {
        const [ordersRes, customersRes, productsRes] = await Promise.all([
            supabase.from("orders").select("*"),
            supabase.from("customers").select("*"),
            supabase.from("products").select("*"),
        ]);

        const orders = ordersRes.data || [];
        const customers = customersRes.data || [];
        const products = productsRes.data || [];

        // Revenue calculations
        const now = new Date();
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        const last7Days = new Date(today);
        last7Days.setDate(today.getDate() - 6); // include today

        const last30Days = new Date(today);
        last30Days.setDate(today.getDate() - 29);

        let totalRevenue = 0;
        let revenueToday = 0;
        let revenueYesterday = 0;
        let revenue7Days = 0;
        let revenue30Days = 0;

        const productCount: Record<string, number> = {};
        const dailySales: Record<string, number> = {};

        orders.forEach((o) => {
            const total = o.total || 0;
            const createdAt = new Date(o.created_at);

            totalRevenue += total;

            if (createdAt >= today) revenueToday += total;
            if (createdAt >= yesterday && createdAt < today) revenueYesterday += total;
            if (createdAt >= last7Days) revenue7Days += total;
            if (createdAt >= last30Days) revenue30Days += total;

            // Top products
            if (o.product_name) {
                productCount[o.product_name] = (productCount[o.product_name] || 0) + 1;
            }

            // Sales trend
            const date = createdAt.toLocaleDateString("en-GB");
            dailySales[date] = (dailySales[date] || 0) + total;
        });

        const topProducts = Object.entries(productCount)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);

        const salesTrend = Object.entries(dailySales).map(([date, total]) => ({
            date,
            total,
        }));

        setStats({
            totalOrders: orders.length,
            totalRevenue,
            totalCustomers: customers.length,
            totalProducts: products.length,
            revenueToday,
            revenueYesterday,
            revenue7Days,
            revenue30Days,
        });

        setOrders(orders.slice(-5).reverse());
        setTopProducts(topProducts);
        setSalesTrend(salesTrend);
    };

    if (!user) {
        return (
            <main className="min-h-screen flex items-center justify-center text-gray-400">
                Loading dashboard...
            </main>
        );
    }

    return (
        <main className="h-screen w-screen flex flex-col bg-[#f5f9f3] overflow-hidden">
            {/* Header */}
            <header className="bg-gradient-to-r from-green-50 to-white px-6 py-6 rounded-b-lg shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="text-3xl">👋</div>
                    <div>
                        <p className="text-sm text-gray-500">Welcome back</p>
                        <h1 className="text-xl font-semibold text-green-800">{adminName}</h1>
                    </div>
                </div>
            </header>

            {/* Dashboard Grid */}
            <section className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 w-full overflow-y-auto">
                {/* Left Panel */}
                <div className="flex flex-col gap-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                        <StatCard title="Orders" value={stats.totalOrders} emoji="📦" />
                        <StatCard title="Revenue" value={`RM ${stats.totalRevenue.toFixed(2)}`} emoji="💰" />
                        <StatCard title="Customers" value={stats.totalCustomers} emoji="👥" />
                        <StatCard title="Products" value={stats.totalProducts} emoji="🛍️" />
                    </div>

                    {/* Quick Links */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <QuickLink href="/admin/orders" emoji="📦" label="Orders" />
                        <QuickLink href="/admin/products" emoji="🛍️" label="Products" />
                        <QuickLink href="/admin/customers" emoji="👥" label="Customers" />
                        <QuickLink href="/admin/profile" emoji="⚙️" label="Settings" />
                    </div>

                    {/* Sales Breakdown */}
                    <div className="bg-white border rounded-xl p-5 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-700 mb-4">Sales Summary</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                            <div className="flex justify-between">
                                <span>Today</span>
                                <span className="font-medium text-green-700">
                                    RM {stats.revenueToday.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Yesterday</span>
                                <span className="font-medium text-green-700">
                                    RM {stats.revenueYesterday.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Last 7 Days</span>
                                <span className="font-medium text-green-700">
                                    RM {stats.revenue7Days.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Last 30 Days</span>
                                <span className="font-medium text-green-700">
                                    RM {stats.revenue30Days.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Top Products */}
                    <div className="bg-white border rounded-xl p-5 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-700 mb-4">Top Products</h3>
                        {topProducts.length === 0 ? (
                            <p className="text-gray-500 text-sm">No product data yet.</p>
                        ) : (
                            <ul className="space-y-2 text-sm">
                                {topProducts.map((p, i) => (
                                    <li key={p.name} className="flex justify-between text-gray-700">
                                        <span>
                                            {i + 1}. {p.name}
                                        </span>
                                        <span className="text-green-700 font-semibold">{p.count} sold</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Right Panel */}
                <div className="flex flex-col gap-6">
                    {/* Sales Chart */}
                    <div className="bg-white border rounded-xl p-5 shadow-sm h-[300px]">
                        <h3 className="text-sm font-semibold text-gray-700 mb-4">Sales Trend</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={salesTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" fontSize={10} />
                                <YAxis fontSize={10} />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#15803d"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Recent Orders */}
                    <div className="bg-white border rounded-xl p-5 shadow-sm flex-1 overflow-auto">
                        <h3 className="text-sm font-semibold text-gray-700 mb-4">Recent Orders</h3>
                        {orders.length === 0 ? (
                            <p className="text-gray-500 text-sm">No orders yet.</p>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="text-gray-500 border-b text-left">
                                    <tr>
                                        <th className="py-1.5">Customer</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((o) => (
                                        <tr key={o.id} className="border-b last:border-none">
                                            <td className="py-1.5">{o.customer_name || "-"}</td>
                                            <td>RM {o.total?.toFixed(2)}</td>
                                            <td>
                                                <span
                                                    className={`px-2 py-0.5 text-xs rounded-full ${o.status === "completed"
                                                        ? "bg-green-100 text-green-700"
                                                        : o.status === "pending"
                                                            ? "bg-yellow-100 text-yellow-700"
                                                            : "bg-gray-100 text-gray-600"
                                                        }`}
                                                >
                                                    {o.status || "N/A"}
                                                </span>
                                            </td>
                                            <td>{new Date(o.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}

// 📦 Stat Card
function StatCard({
    title,
    value,
    emoji,
}: {
    title: string;
    value: string | number;
    emoji: string;
}) {
    return (
        <div className="bg-white border rounded-xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div className="text-xl">{emoji}</div>
            <p className="text-xs text-gray-500">{title}</p>
            <h3 className="text-lg font-semibold text-green-700">{value}</h3>
        </div>
    );
}

// 🔗 Quick Link
function QuickLink({
    href,
    emoji,
    label,
}: {
    href: string;
    emoji: string;
    label: string;
}) {
    return (
        <Link
            href={href}
            className="bg-white border rounded-xl p-4 text-center text-sm shadow-sm hover:shadow-md transition"
        >
            <div className="text-2xl mb-1">{emoji}</div>
            <div className="text-gray-700 font-medium">{label}</div>
        </Link>
    );
}
