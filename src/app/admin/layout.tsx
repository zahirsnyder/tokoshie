"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getUserRole } from "@/lib/getUserRole";
import type { User } from "@supabase/supabase-js";
import { LogOut, Bell, Menu, X } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClientComponentClient();

  const [user, setUser] = useState<User | null>(null);
  const [adminName, setAdminName] = useState("Admin");
  const [loading, setLoading] = useState(true);
  const [newOrders, setNewOrders] = useState(0);
  const [todaySales, setTodaySales] = useState(0);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      let sessionUser: User | null = null;
      for (let i = 0; i < 10; i++) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.user) {
          sessionUser = sessionData.session.user;
          break;
        }
        await new Promise((res) => setTimeout(res, 100));
      }

      if (!sessionUser || cancelled) {
        router.replace("/account/login");
        return;
      }

      const role = await getUserRole(sessionUser.email!);
      if (role !== "admin") {
        router.replace("/account/profile");
        return;
      }

      const { data: adminData } = await supabase
        .from("admins")
        .select("full_name")
        .eq("email", sessionUser.email)
        .single();

      if (!cancelled) {
        setAdminName(adminData?.full_name || "Admin");
        setUser(sessionUser);
        setLoading(false);
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  useEffect(() => {
    const fetchOrders = async () => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from("orders")
        .select("total_amount, created_at")
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString());

      if (error) {
        console.error("Orders fetch error:", error);
        return;
      }

      const total = data?.reduce((sum, o) => sum + (o.total_amount || 0), 0) ?? 0;
      setTodaySales(total);
      setNewOrders(data?.length ?? 0);
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f5f9f3] text-[#3f3f3f]">
        <div className="animate-pulse text-sm">Verifying admin access…</div>
      </main>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-[#f5f9f3] text-[#2f2f2f] overflow-hidden">
      {/* Top Navbar */}
      <header className="flex-none bg-[#ecf4e5] border-b border-[#cfe0b8] shadow-sm z-10">
        <div className="flex justify-between items-center px-4 py-2">
          {/* Left side */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setNavOpen(!navOpen)}
              className="md:hidden p-2 rounded hover:bg-[#d7eac8]"
              aria-label="Toggle navigation"
            >
              {navOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <Link href="/admin" className="text-xl font-bold tracking-wide">
              TOKOSHIE
            </Link>

            <div className="hidden md:flex items-center space-x-2">
              <TopLink href="/admin/orders" label="Orders" active={pathname.includes("/orders")} />
              <TopLink href="/admin/products" label="Products" active={pathname.includes("/products")} />
              <TopLink href="/admin/customers" label="Customers" active={pathname.includes("/customers")} />
              <TopLink href="/admin/reports" label="Reports" active={pathname.includes("/reports")} />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="hidden md:flex flex-col items-end text-right">
              <span className="font-semibold">{adminName}</span>
              <span className="text-xs text-[#666]">{newOrders} new / RM{todaySales.toFixed(2)}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded hover:bg-[#d7eac8]"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {navOpen && (
          <div className="md:hidden border-t border-[#cfe0b8] bg-[#ecf4e5]">
            <div className="flex flex-col p-2">
              <TopLink href="/admin/orders" label="Orders" active={pathname.includes("/orders")} />
              <TopLink href="/admin/products" label="Products" active={pathname.includes("/products")} />
              <TopLink href="/admin/customers" label="Customers" active={pathname.includes("/customers")} />
              <TopLink href="/admin/reports" label="Reports" active={pathname.includes("/reports")} />
            </div>
          </div>
        )}
      </header>

      {/* Page Content */}
      <main className="flex-1 w-full overflow-auto">
        {children}
      </main>
    </div>
  );
}

function TopLink({ href, label, active }: { href: string; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`block px-3 py-2 border-b-2 transition-all duration-150 ${active
        ? "text-[#2f4c28] border-[#3c5830] font-semibold"
        : "text-[#6b7760] border-transparent hover:text-[#3c5830] hover:border-[#3c5830]"
        }`}
    >
      {label}
    </Link>
  );
}
