"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getUserRole } from "@/lib/getUserRole";
import type { User } from "@supabase/supabase-js";
import { LogOut, Bell, Menu, X } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [adminName, setAdminName] = useState("Admin");
  const [loading, setLoading] = useState(true);
  const [newOrders, setNewOrders] = useState(0);
  const [todaySales, setTodaySales] = useState(0);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      const currentUser = data.user;

      if (!currentUser) {
        router.push("/account/login");
        return;
      }

      const role = await getUserRole(currentUser.email!.toLowerCase());
      if (role !== "admin") {
        router.push("/account/profile");
        return;
      }

      const { data: adminData } = await supabase
        .from("admins")
        .select("full_name")
        .eq("email", currentUser.email)
        .single();

      setAdminName(adminData?.full_name || "Admin");
      setUser(currentUser);
      setLoading(false);
    };

    init();
  }, [router]);

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

  if (!user) return null;

  return (
    <div className="w-screen h-screen flex flex-col bg-[#f5f9f3] text-[#2f2f2f] overflow-hidden">
      {/* Top Navbar */}
      <header className="flex-none bg-[#ecf4e5] border-b border-[#cfe0b8] shadow-sm z-10">
        <div className="w-full px-6 py-2.5 flex items-center justify-between gap-4 relative">
          {/* Left: Logo */}
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-[#3c5830] tracking-wide">TOKOSHIE</h1>
          </div>

          {/* Center: Navigation (centered) */}
          <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 gap-5 text-sm font-medium">
            <TopLink href="/admin" label="Dashboard" active={pathname === "/admin"} />
            <TopLink href="/admin/orders" label="Orders" active={pathname.startsWith("/admin/orders")} />
            <TopLink href="/admin/products" label="Products" active={pathname.startsWith("/admin/products")} />
            <TopLink href="/admin/customers" label="Customers" active={pathname.startsWith("/admin/customers")} />
            <TopLink href="/admin/profile" label="Profile" active={pathname.startsWith("/admin/profile")} />
          </div>

          {/* Right: Admin Info & Actions */}
          <div className="flex items-center gap-3">
            {/* Toggle only visible on small screens */}
            <button
              onClick={() => setNavOpen(!navOpen)}
              className="p-2 rounded-md bg-[#3c5830] text-white lg:hidden"
              aria-label="Toggle Menu"
            >
              {navOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <Bell size={20} className={newOrders > 0 ? "text-[#4e7d3b] animate-pulse" : "text-[#7d8b6e]"} />
              {newOrders > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full px-1.5 leading-none">
                  {newOrders}
                </span>
              )}
            </div>

            {/* Sales */}
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-[11px] text-[#6b7760] leading-tight">Today</span>
              <span className="text-sm font-semibold text-[#3d5e2f]">RM {todaySales.toFixed(2)}</span>
            </div>

            {/* Admin Info (name + email) */}
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-medium text-[#3c5830]">{adminName}</span>
              <span className="text-xs text-[#6b7760]">{user?.email}</span>
            </div>

            {/* Avatar (tailwind-only) */}
            <Link
              href="/admin/profile"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#3c5830] text-white font-bold hover:opacity-90 transition"
              title="Profile"
            >
              {adminName.charAt(0).toUpperCase()}
            </Link>

            {/* Logout: RED circular background + white icon */}
            <button
              onClick={handleLogout}
              title="Logout"
              aria-label="Logout"
              className="inline-grid place-items-center w-9 h-9 rounded-full bg-red-600 hover:bg-red-700 text-white transition"
            >
              <LogOut size={18} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Mobile Nav Menu (only shows when navOpen and on small screens) */}
        {navOpen && (
          <nav className="w-full flex flex-col gap-2 px-6 pb-3 lg:hidden">
            <TopLink href="/admin" label="Dashboard" active={pathname === "/admin"} />
            <TopLink href="/admin/orders" label="Orders" active={pathname.startsWith("/admin/orders")} />
            <TopLink href="/admin/products" label="Products" active={pathname.startsWith("/admin/products")} />
            <TopLink href="/admin/customers" label="Customers" active={pathname.startsWith("/admin/customers")} />
            <TopLink href="/admin/profile" label="Profile" active={pathname.startsWith("/admin/profile")} />
          </nav>
        )}
      </header>

      {/* Page Content */}
      <main className="flex-1 w-full overflow-auto">{children}</main>
    </div>
  );
}

function TopLink({ href, label, active }: { href: string; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`block px-2 py-1 border-b-2 transition-all duration-150 ${
        active ? "text-[#2f4c28] border-[#3c5830] font-semibold" : "text-[#6b7760] border-transparent hover:text-[#3c5830] hover:border-[#3c5830]"
      }`}
    >
      {label}
    </Link>
  );
}
