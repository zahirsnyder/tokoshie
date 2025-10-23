"use client";

import { getUserRole } from "@/lib/getUserRole";
import { useEffect, useRef, useState } from "react";
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

  // ensures the client’s first render matches the server output
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
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  // mark mounted after hydration
  useEffect(() => setMounted(true), []);

  // fetch user + role once
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const r = await getUserRole(user.email ?? "");
        setRole(r);
      }
    };
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayName =
    user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0];

  const handleLogout = async () => {
    await supabase.auth.signOut();
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
          {/* Hamburger — static classes so SSR/CSR match */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="md:hidden focus:outline-none cursor-pointer hover:bg-gray-100 p-1.5 rounded"
            aria-label="Toggle navigation menu"
            aria-controls="mobile-nav"
            aria-expanded={mobileMenuOpen}
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8 text-gray-700">
            {navLinks.map((link) => {
              // Gate the "active" decoration until mounted so first client render matches SSR
              const isActive = mounted && pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    isActive
                      ? "text-black underline underline-offset-4 transition"
                      : "text-gray-700 hover:text-black transition"
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Center: Logo */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <Link
            href="/"
            className="text-2xl font-extrabold tracking-wide text-black hover:opacity-90 transition"
          >
            TOKOSHIE
          </Link>
        </div>

        {/* Right: Profile + Cart */}
        <div className="flex items-center gap-6 text-gray-700 relative">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-2 hover:text-black transition px-2 py-1 rounded-md hover:bg-gray-100 focus:outline-none"
                aria-haspopup="menu"
                aria-expanded={dropdownOpen}
              >
                <FaUserCircle className="text-xl" aria-hidden="true" />
                <span className="font-medium hidden sm:inline">{displayName}</span>
              </button>

              {dropdownOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 shadow-lg rounded-md py-1 z-50"
                >
                  <Link
                    href={role === "admin" ? "/admin" : "/account/profile"}
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-black"
                    role="menuitem"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-black"
                    role="menuitem"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/account/login" className="flex items-center gap-2 hover:text-black transition">
              <FaUserCircle className="text-xl" aria-hidden="true" />
              <span className="hidden sm:inline">Login</span>
            </Link>
          )}

          {/* Cart */}
          <Link href="/cart" className="relative hover:text-black transition" aria-label="Cart">
            <BsCart2 className="text-2xl" aria-hidden="true" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-green-700 text-white text-xs font-semibold rounded-full px-1.5 py-0.5">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </nav>

      {/* Mobile Dropdown Nav */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav"
          className="md:hidden bg-white border-t border-gray-200 shadow-sm px-6 py-4 space-y-4"
        >
          {navLinks.map((link) => {
            // For mobile we can use pathname directly; still stable on first client render
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={
                  isActive
                    ? "block text-base font-semibold text-black"
                    : "block text-base text-gray-700 hover:text-black"
                }
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
