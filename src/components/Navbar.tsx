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
    const [mounted, setMounted] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null); // ✅ ref to profile dropdown
    const supabase = createClientComponentClient();

    // ✅ Close dropdown if clicked outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setDropdownOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                const r = await getUserRole(user.email ?? "");
                setRole(r);
            }
        };
        fetchUser();
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

                {/* Left: Navigation Links */}
                <div className="flex items-center gap-8 text-gray-700">
                    {navLinks.map((link) => {
                        const isActive = mounted && pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`transition ${isActive
                                    ? "text-black underline underline-offset-4"
                                    : "text-gray-700 hover:text-black"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
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

                {/* Right: Profile Dropdown + Cart */}
                <div className="flex items-center gap-6 text-gray-700 relative">
                    {user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-2 hover:text-black transition px-2 py-1 rounded-md hover:bg-gray-100 focus:outline-none"
                            >
                                <FaUserCircle className="text-xl" />
                                <span className="font-medium hidden sm:inline">{displayName}</span>
                            </button>

                            {/* Dropdown */}
                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 shadow-lg rounded-md py-1 z-50">
                                    <Link
                                        href={role === "admin" ? "/admin" : "/account/profile"}
                                        onClick={() => setDropdownOpen(false)}
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-black"
                                    >
                                        Profile
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
                        <Link
                            href="/account/login"
                            className="flex items-center gap-2 hover:text-black transition"
                        >
                            <FaUserCircle className="text-xl" />
                            <span className="hidden sm:inline">Login</span>
                        </Link>
                    )}

                    {/* Cart */}
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
        </header>
    );
}

