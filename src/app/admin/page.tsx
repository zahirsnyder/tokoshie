"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

export default function AdminDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (!data.user || data.user.email !== "zahirsnyder@gmail.com") {
                router.push("/account/login");
            } else {
                setUser(data.user);
            }
        });
    }, [router]);

    if (!user) return null;

    return (
        <>
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <a href="/admin/orders" className="p-6 border rounded-lg hover:bg-gray-50">
                    <h2 className="text-xl font-semibold mb-2">📦 Orders</h2>
                    <p className="text-gray-500 text-sm">View and manage customer orders</p>
                </a>
                <a href="/admin/products" className="p-6 border rounded-lg hover:bg-gray-50">
                    <h2 className="text-xl font-semibold mb-2">🛍️ Products</h2>
                    <p className="text-gray-500 text-sm">Manage matcha items and pricing</p>
                </a>
                <a href="/admin/customers" className="p-6 border rounded-lg hover:bg-gray-50">
                    <h2 className="text-xl font-semibold mb-2">👤 Customers</h2>
                    <p className="text-gray-500 text-sm">View customer info and activity</p>
                </a>
            </div>
        </>
    );
}
