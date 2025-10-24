"use client";

import { getUserRole } from "@/lib/getUserRole";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import type { User } from "@supabase/supabase-js";
import { FaUserCircle } from "react-icons/fa";
import { BsCart2 } from "react-icons/bs";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const { cartItems } = useCart();
  const totalItems = cartItems.length;
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClientComponentClient();

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => setMounted(true), []);

  // Subscribe to auth changes (most reliable way to keep navbar in sync)
  useEffect(() => {
    let isMounted = true;

    // 1) Get current session immediately
    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setUser(data.session?.user ?? null);
    });

    // 2) Listen for future changes
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  // Fetch role whenever user changes (don’t block UI if it returns null)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!user?.email) {
        setRole(null);
        return;
      }
      try {
        const r = await getUserRole(user.email);
        if (!cancelled) setRole(r ?? null);
      } catch {
        if (!cancelled) setRole(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const displayName =
    user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setDropdownOpen(false);
    router.push("/");
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "About", href: "/about" },
    { label: "Wholesale", href: "/wholesale" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <nav className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6 text-base font-medium relative">

        {/* Left: Hamburger (mobile) + desktop nav */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen((s) => !s)}
            className="md:hidden focus:outline-none cursor-pointer hover:bg-gray-100 p-1.5 rounded"
            aria-label="Toggle navigation menu"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="hidden md:flex items-center gap-8 text-gray-700">
            {navLinks.map((link) => {
              const isActive = mounted && pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition ${
                    isActive ? "text-black underline underline-offset-4" : "text-gray-700 hover:text-black"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Center: Logo */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <Link href="/" className="text-2xl font-extrabold tracking-wide text-black hover:opacity-90 transition">
            TOKOSHIE
          </Link>
        </div>

        {/* Right: Profile + Cart */}
        <div className="flex items-center gap-6 text-gray-700 relative">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-2 hover:text-black transition px-2 py-1 rounded-md hover:bg-gray-100 focus:outline-none"
              >
                <FaUserCircle className="text-xl" />
                <span className="font-medium hidden sm:inline">
                  {displayName}{role === "admin" ? " • Admin" : ""}
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 shadow-lg rounded-md py-1 z-50">
                  <Link
                    href={role === "admin" ? "/admin" : "/account/profile"}
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-black"
                  >
                    {role === "admin" ? "Admin" : "Profile"}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-black"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/account/login" className="flex items-center gap-2 hover:text-black transition">
              <FaUserCircle className="text-xl" />
              <span className="hidden sm:inline">Login</span>
            </Link>
          )}

          <Link href="/cart" className="relative hover:text-black transition">
            <BsCart2 className="text-2xl" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-green-700 text-white text-xs font-semibold rounded-full px-1.5 py-0.5">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-sm px-6 py-4 space-y-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block text-gray-700 text-base transition ${
                  isActive ? "font-semibold text-black" : "hover:text-black"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
