"use client";

import { useCart } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { User } from "@supabase/supabase-js";

export default function CartPage() {
    const { cartItems, removeItem, increaseQty, decreaseQty, total } = useCart();
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState<"login" | "signup">("login");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [redirectAfterAuth, setRedirectAfterAuth] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

    useEffect(() => {
        const getUser = async () => {
            const supabaseClient = createClientComponentClient();
            const { data } = await supabaseClient.auth.getUser();
            setUser(data.user ?? null);
        };

        getUser();
    }, []);

    useEffect(() => {
        if (user && redirectAfterAuth) {
            setShowAuthModal(false);
            router.push("/checkout");
        }
    }, [user, redirectAfterAuth, router]);

    const handleCheckout = () => {
        if (!user) {
            setShowAuthModal(true);
        } else {
            router.push("/checkout");
        }
    };

    const handleAuth = async () => {
        setLoading(true);
        setErrorMsg(null);
        setRedirectAfterAuth(true);
        const supabase = createClientComponentClient();

        try {
            if (authMode === "login") {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            first_name: firstName,
                            last_name: lastName,
                        },
                    },
                });
                if (error) throw error;

                const user = data.user;
                if (user) {
                    const { error: insertError } = await supabase.from("customers").insert([
                        {
                            id: user.id,
                            email,
                            name: `${firstName} ${lastName}`,
                        },
                    ]);
                    if (insertError) throw insertError;
                }
            }

            const { data: userData, error: userErr } = await supabase.auth.getUser();
            if (userErr) throw userErr;
            setUser(userData.user ?? null);

        } catch (err) {
            if (err instanceof Error) {
                setErrorMsg(err.message);
            } else {
                setErrorMsg("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (!cartItems.length) {
        return (
            <main className="max-w-5xl mx-auto px-6 py-10 text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-3">Cart</h1>
                <p className="text-gray-500">Cart is empty.</p>
                <Link
                    href="/shop"
                    className="inline-block mt-4 text-green-700 hover:underline font-medium"
                >
                    Continue shopping →
                </Link>
            </main>
        );
    }

    return (
        <main className="max-w-5xl mx-auto px-6 py-10 space-y-10 relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Cart</h1>
                <Link
                    href="/shop"
                    className="text-green-700 hover:underline text-sm font-medium"
                >
                    ← Continue shopping
                </Link>
            </div>

            <ul className="space-y-8">
                {cartItems.map((item, index) => (
                    <li
                        key={`${item.id}-${index}`}
                        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-6"
                    >
                        <div className="flex items-start gap-4 w-full md:w-1/2">
                            <div className="relative w-24 h-24 shrink-0">
                                <Image
                                    src={item.image_url || "/placeholder.jpg"}
                                    alt={item.name}
                                    fill
                                    sizes="96px"
                                    className="object-cover rounded-lg border"
                                />
                            </div>
                            <div>
                                <h2 className="text-lg font-medium text-gray-900">{item.name}</h2>
                                <p className="text-sm text-gray-500">{item.category || "Matcha"}</p>
                                <p className="text-sm font-semibold text-gray-700 mt-1">
                                    RM {item.price.toFixed(2)} each
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between w-full md:w-1/3 gap-3">
                            <div className="flex items-center border rounded-full overflow-hidden bg-gray-50">
                                <button
                                    onClick={() => decreaseQty(item.id)}
                                    className="px-3 py-1 text-lg font-medium text-gray-600 hover:bg-gray-100"
                                >
                                    −
                                </button>
                                <span className="px-4 text-gray-800">{item.quantity}</span>
                                <button
                                    onClick={() => increaseQty(item.id)}
                                    className="px-3 py-1 text-lg font-medium text-gray-600 hover:bg-gray-100"
                                >
                                    +
                                </button>
                            </div>
                            <button
                                onClick={() => removeItem(item.id)}
                                className="text-gray-400 hover:text-red-500 transition"
                                title="Remove"
                            >
                                🗑
                            </button>
                        </div>

                        <div className="w-full md:w-1/6 text-right">
                            <p className="font-semibold text-gray-900">
                                RM {(item.price * item.quantity).toFixed(2)}
                            </p>
                        </div>
                    </li>
                ))}
            </ul>

            <div className="flex flex-col md:flex-row justify-between gap-6 mt-6">
                <div className="w-full md:w-1/3 bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-700 text-sm">
                    <p className="font-semibold text-gray-800 mb-1">Vouchers</p>
                    <p>Apply your vouchers at checkout if available.</p>
                </div>

                <div className="w-full md:w-1/3 text-right">
                    <p className="text-sm text-gray-500 mb-1">
                        Shipping & discounts calculated at checkout
                    </p>
                    <p className="text-xl font-bold mb-4">
                        Subtotal: <span className="text-green-700">RM {total.toFixed(2)}</span>
                    </p>
                    <button
                        onClick={handleCheckout}
                        className="inline-block w-full md:w-auto bg-green-700 text-white text-center px-6 py-3 rounded-lg font-medium hover:bg-green-800 transition"
                    >
                        Proceed to Checkout
                    </button>
                </div>
            </div>

            {showAuthModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
                    <div className="bg-white max-w-md w-full rounded-xl shadow-xl p-6 relative">
                        <button
                            onClick={() => setShowAuthModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-black"
                        >
                            ✕
                        </button>

                        <h2 className="text-xl font-semibold text-center mb-2">
                            {authMode === "login" ? "Log in" : "Create an account"}
                        </h2>
                        <p className="text-center text-sm text-gray-500 mb-6">
                            {authMode === "login"
                                ? "Welcome back. Enter your password to continue."
                                : "Looks like you're new here, we need a little more info:"}
                        </p>

                        <div className="space-y-4">
                            <input
                                type="email"
                                placeholder="Email address"
                                className="w-full border-b py-2 focus:outline-none"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />

                            {authMode === "signup" && (
                                <div className="flex gap-4">
                                    <input
                                        placeholder="First name"
                                        className="w-1/2 border-b py-2 focus:outline-none"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                    />
                                    <input
                                        placeholder="Last name"
                                        className="w-1/2 border-b py-2 focus:outline-none"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                    />
                                </div>
                            )}

                            <input
                                type="password"
                                placeholder="Password"
                                className="w-full border-b py-2 focus:outline-none"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            {authMode === "signup" && (
                                <ul className="text-xs text-gray-500 space-y-1 pl-4 list-disc">
                                    <li>Include both upper and lower case characters</li>
                                    <li>Include at least one number or symbol</li>
                                    <li>Be at least 8 characters long</li>
                                </ul>
                            )}

                            {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}

                            <button
                                onClick={handleAuth}
                                disabled={loading}
                                className="w-full bg-black text-white py-2 mt-2 hover:bg-gray-900 transition"
                            >
                                {loading ? "Please wait..." : "Continue"}
                            </button>
                        </div>

                        <div className="text-center mt-4 text-sm text-gray-600">
                            {authMode === "login" ? (
                                <>
                                    New to TOKOSHIE?{" "}
                                    <button
                                        onClick={() => setAuthMode("signup")}
                                        className="underline"
                                    >
                                        Create an account
                                    </button>
                                </>
                            ) : (
                                <>
                                    Already have an account?{" "}
                                    <button
                                        onClick={() => setAuthMode("login")}
                                        className="underline"
                                    >
                                        Log in
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
