"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUserRole } from "@/lib/getUserRole";
import type { User } from "@supabase/supabase-js";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            const { data } = await supabase.auth.getUser();
            const currentUser = data.user;

            if (!currentUser) {
                router.push("/account/login");
                return;
            }

            const emailLower = (currentUser.email ?? "").toLowerCase();
            const role = await getUserRole(emailLower);

            if (role !== "admin") {
                // If not admin → redirect to profile or login
                router.push("/account/profile");
                return;
            }

            // user is admin
            setUser(currentUser);
            setLoading(false);
        };

        init();

        const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            // 🛡️ handle null session safely
            if (!session?.user) {
                setUser(null);
                router.push("/account/login");
                return;
            }

            const email = session.user.email?.toLowerCase() ?? "";

            // Optional: check Supabase role again (for future-proofing)
            const role = await getUserRole(email);
            if (role !== "admin") {
                router.push("/account/profile");
                return;
            }

            setUser(session.user);
            setLoading(false);
        });

        return () => {
            listener.subscription?.unsubscribe?.();
        };
    }, [router]);

    if (loading) {
        return <main className="min-h-screen flex items-center justify-center bg-white">
            <div className="animate-pulse text-gray-500 text-sm">
                Verifying admin access…
            </div>
        </main>;
    }

    if (!user) return null;

    return (
        <main className="min-h-screen bg-white">
            <header className="bg-green-700 text-white py-4 shadow">
                <nav className="max-w-6xl mx-auto flex items-center justify-between px-6">
                    <Link href="/admin" className="text-lg font-semibold tracking-wide">
                        TOKOSHIE Admin
                    </Link>
                    <div className="flex items-center gap-6 text-sm">
                        <Link href="/admin/orders" className="hover:text-gray-200">Orders</Link>
                        <Link href="/admin/products" className="hover:text-gray-200">Products</Link>
                        <Link href="/admin/customers" className="hover:text-gray-200">Customers</Link>
                        <button
                            onClick={async () => {
                                const { error } = await supabase.auth.signOut();
                                if (error) console.error("Logout failed:", error);
                                setUser(null);
                                router.push("/");
                            }}
                            className="text-sm hover:text-red-200"
                        >
                            Logout
                        </button>
                    </div>
                </nav>
            </header>

            <div className="max-w-6xl mx-auto p-8">{children}</div>
        </main>
    );
}
