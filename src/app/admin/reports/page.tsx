"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { saveAs } from "file-saver";

type SalesPoint = {
  date: string;
  total: number;
};

type TopProduct = {
  name: string;
  count: number;
};

export default function AdminReportPage() {
  const [loading, setLoading] = useState(true);
  const [salesTrend, setSalesTrend] = useState<SalesPoint[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    const [ordersRes, customersRes, productsRes] = await Promise.all([
      supabase.from("orders").select("*"),
      supabase.from("customers").select("id"),
      supabase.from("products").select("id"),
    ]);

    const orders = ordersRes.data || [];

    // Aggregate revenue + orders
    let revenue = 0;
    const trendMap: Record<string, number> = {};
    const productMap: Record<string, number> = {};

    orders.forEach((o) => {
      const total = o.total ?? 0;
      const createdAt = new Date(o.created_at);
      const date = createdAt.toLocaleDateString("en-GB");

      revenue += total;
      trendMap[date] = (trendMap[date] || 0) + total;

      if (o.product_name) {
        productMap[o.product_name] = (productMap[o.product_name] || 0) + 1;
      }
    });

    const trendData = Object.entries(trendMap).map(([date, total]) => ({
      date,
      total,
    }));

    const top = Object.entries(productMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setSalesTrend(trendData);
    setTopProducts(top);
    setMetrics({
      totalRevenue: revenue,
      totalOrders: orders.length,
      totalCustomers: customersRes.data?.length || 0,
      totalProducts: productsRes.data?.length || 0,
    });

    setLoading(false);
  };

  const downloadCSV = () => {
    const rows = salesTrend.map((point) => `${point.date},${point.total}`);
    const csv = `Date,Revenue\n${rows.join("\n")}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "sales_report.csv");
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">📊 Report</h1>
        <button
          onClick={downloadCSV}
          className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 text-sm"
        >
          ⬇️ Download CSV
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading report...</p>
      ) : (
        <>
          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Revenue" value={`RM ${metrics.totalRevenue.toFixed(2)}`} />
            <StatCard label="Total Orders" value={metrics.totalOrders} />
            <StatCard label="Customers" value={metrics.totalCustomers} />
            <StatCard label="Products" value={metrics.totalProducts} />
          </div>

          {/* Sales Chart */}
          <div className="bg-white border p-6 rounded-xl shadow-sm mb-8">
            <h2 className="text-lg font-medium mb-4 text-gray-700">Sales Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
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

          {/* Top Products */}
          <div className="bg-white border p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-medium mb-4 text-gray-700">Top Products</h2>
            {topProducts.length === 0 ? (
              <p className="text-sm text-gray-500">No data.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {topProducts.map((product, i) => (
                  <li key={product.name} className="flex justify-between text-gray-800">
                    <span>{i + 1}. {product.name}</span>
                    <span className="text-green-700 font-medium">{product.count} sold</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </main>
  );
}

// Stat card component
function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white p-4 border rounded-xl shadow-sm text-center">
      <p className="text-xs text-gray-500">{label}</p>
      <h3 className="text-lg font-semibold text-green-700">{value}</h3>
    </div>
  );
}
