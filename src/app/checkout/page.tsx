"use client";

import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { User } from "@supabase/supabase-js";
import Image from "next/image";

type Step = "address" | "delivery" | "payment";

export default function CheckoutPage() {
    const { cartItems, total, clearCart } = useCart();
    const supabase = createClientComponentClient();
    const [user, setUser] = useState<User | null>(null);
    const [step, setStep] = useState<Step>("address");
    const [loading, setLoading] = useState(false);
    const [errMsg, setErrMsg] = useState<string | null>(null);
    const [orderPlaced, setOrderPlaced] = useState(false);

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        postcode: "",
    });

    useEffect(() => {
        const loadUser = async () => {
            const { data } = await supabase.auth.getUser();
            const u = data?.user;
            if (u) {
                setUser(u);
                setForm((f) => ({
                    ...f,
                    name:
                        u.user_metadata?.full_name ||
                        `${u.user_metadata?.first_name ?? ""} ${u.user_metadata?.last_name ?? ""}`,
                    email: u.email ?? "",
                }));
            }
        };
        loadUser();
    }, [supabase]);

    const updateCustomerInfo = async () => {
        if (!user) return;

        const { data, error } = await supabase
            .from("customers")
            .upsert(
                {
                    id: user.id,
                    email: user.email,
                    full_name: form.name,
                    phone: form.phone,
                    address: form.address,
                    city: form.city,
                    state: form.state,
                    postcode: form.postcode,
                },
                {
                    onConflict: "id", // make sure 'id' is PRIMARY KEY or UNIQUE
                }
            );

        if (error) {
            console.error("Upsert failed:", error.message);
        }
    };

    const handleConfirmOrder = async () => {
        setLoading(true);
        setErrMsg(null);

        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customer: form,
                    items: cartItems,
                    total,
                }),
            });

            if (!res.ok) throw new Error("Order failed");
            setOrderPlaced(true);
            clearCart();
        } catch (err) {
            setErrMsg("Order failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (orderPlaced) {
        return (
            <main className="max-w-2xl mx-auto p-8 text-center">
                <h1 className="text-2xl font-bold text-green-700 mb-4">Order Confirmed</h1>
                <p className="text-gray-700">Thanks for your order. We’ll send a confirmation email shortly.</p>
                <a
                    href="/shop"
                    className="inline-block mt-6 bg-green-700 text-white px-6 py-3 rounded hover:bg-green-800"
                >
                    Continue Shopping
                </a>
            </main>
        );
    }

    return (
        <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 px-4 py-10">
            {/* LEFT SECTION */}
            <section className="md:col-span-2 space-y-10">

                {/* STEP 1: DELIVERY ADDRESS */}
                <div>
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">
                            {step !== "address" && <span className="text-green-600 mr-2">✔</span>} Delivery Address
                        </h2>
                        {step !== "address" && (
                            <button
                                onClick={() => setStep("address")}
                                className="text-sm text-gray-600 hover:underline"
                            >
                                Edit
                            </button>
                        )}
                    </div>

                    {step === "address" ? (
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                await updateCustomerInfo();
                                setStep("delivery");
                            }}
                            className="space-y-6 mt-6"
                        >
                            {/* First + Last name */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    required
                                    placeholder="First name"
                                    value={form.name.split(" ")[0] || ""}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            name: `${e.target.value} ${form.name.split(" ")[1] || ""}`,
                                        })
                                    }
                                    className="w-full border px-4 py-2 rounded"
                                />
                                <input
                                    type="text"
                                    required
                                    placeholder="Last name"
                                    value={form.name.split(" ")[1] || ""}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            name: `${form.name.split(" ")[0] || ""} ${e.target.value}`,
                                        })
                                    }
                                    className="w-full border px-4 py-2 rounded"
                                />
                            </div>

                            {/* Email */}
                            <input
                                type="email"
                                value={form.email}
                                disabled
                                className="w-full border px-4 py-2 rounded bg-gray-100 text-gray-600"
                            />

                            {/* Address */}
                            <input
                                type="text"
                                required
                                placeholder="Street address"
                                value={form.address}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                                className="w-full border px-4 py-2 rounded"
                            />

                            {/* City + State */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    required
                                    placeholder="City"
                                    value={form.city}
                                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                                    className="w-full border px-4 py-2 rounded"
                                />
                                <input
                                    type="text"
                                    required
                                    placeholder="State"
                                    value={form.state}
                                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                                    className="w-full border px-4 py-2 rounded"
                                />
                            </div>

                            {/* Postcode */}
                            <input
                                type="text"
                                required
                                placeholder="Postcode"
                                value={form.postcode}
                                onChange={(e) => setForm({ ...form, postcode: e.target.value })}
                                className="w-full border px-4 py-2 rounded"
                            />

                            {/* Phone */}
                            <div className="flex gap-2">
                                <select className="w-[120px] border px-3 py-2 rounded" defaultValue="+60">
                                    <option value="+60">🇲🇾 +60</option>
                                    <option value="+65">🇸🇬 +65</option>
                                    <option value="+66">🇹🇭 +66</option>
                                </select>
                                <input
                                    type="tel"
                                    required
                                    placeholder="Phone number"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    className="flex-1 border px-4 py-2 rounded"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex justify-between mt-6">
                                <button
                                    type="button"
                                    onClick={() => window.history.back()}
                                    className="px-6 py-2 border rounded hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-black text-white px-6 py-2 rounded hover:bg-gray-900"
                                >
                                    Confirm Delivery Address
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="mt-3 text-sm text-gray-700 leading-relaxed">
                            <p className="font-medium">{form.name}</p>
                            <p>{form.address}, {form.city}, {form.state}, {form.postcode}</p>
                            <p>{form.phone}</p>
                        </div>
                    )}
                </div>

                <hr />

                {/* DELIVERY METHOD */}
                <div>
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">
                            {step === "payment" && <span className="text-green-600 mr-2">✔</span>} Delivery Method
                        </h2>
                        {step === "payment" && (
                            <button
                                onClick={() => setStep("delivery")}
                                className="text-sm text-gray-600 hover:underline"
                            >
                                Edit
                            </button>
                        )}
                    </div>

                    {step === "delivery" ? (
                        <div className="mt-4 space-y-4">
                            <div className="flex justify-between items-center bg-gray-100 px-4 py-3 rounded">
                                <div>
                                    <p className="font-medium text-gray-800">Standard delivery (RM 10.00)</p>
                                    <p className="text-sm text-gray-500">
                                        Estimated delivery: <strong>Oct 23 – Oct 28</strong>
                                    </p>
                                </div>
                                <span>📦</span>
                            </div>
                            <button
                                onClick={() => setStep("payment")}
                                className="mt-2 bg-black text-white py-2 px-6 rounded hover:bg-gray-900"
                            >
                                Confirm Delivery Method
                            </button>
                        </div>
                    ) : step === "payment" ? (
                        <div className="mt-3 text-sm text-gray-700 leading-relaxed">
                            <p className="font-medium">Standard delivery (Total RM 10.00)</p>
                            <p className="text-gray-500">
                                Estimated delivery between <strong>Oct 23 – Oct 28</strong>
                            </p>
                        </div>
                    ) : null}
                </div>

                <hr />

                {/* PAYMENT */}
                <div>
                    <h2 className="text-lg font-semibold mb-3">Payment</h2>
                    <p className="text-sm text-gray-600 mb-4">Select your payment method</p>

                    {step === "payment" && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                <button className="px-4 py-3 rounded text-sm font-medium bg-gray-50 hover:bg-gray-100">
                                    <Image src="/paypal.svg" alt="PayPal" width={80} height={24} className="mx-auto mb-1" />
                                    PayPal
                                </button>
                                <button className="px-4 py-3 rounded text-sm font-medium bg-gray-50 hover:bg-gray-100">
                                    Debit or credit card
                                </button>
                                <button className="px-4 py-3 rounded text-sm font-medium bg-gray-50 hover:bg-gray-100">
                                    Cryptocurrency
                                </button>
                            </div>

                            {errMsg && <p className="text-sm text-red-600 mb-3">{errMsg}</p>}

                            <button
                                onClick={handleConfirmOrder}
                                disabled={loading}
                                className="bg-black text-white py-3 px-6 rounded hover:bg-gray-900"
                            >
                                {loading ? "Placing Order..." : "Confirm Payment Method"}
                            </button>
                        </>
                    )}
                </div>
            </section>

            {/* RIGHT SIDEBAR */}
            <aside className="space-y-6">
                <div className="p-6 rounded-lg bg-white">
                    <h2 className="text-xl font-semibold mb-4">Summary</h2>
                    {cartItems.map((item) => (
                        <div key={item.id} className="flex items-start gap-4 mb-4">
                            <div className="w-16 h-16 relative rounded overflow-hidden">
                                <Image
                                    src={item.image_url || "/placeholder.jpg"}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1 text-sm">
                                <p className="text-gray-800">{item.name}</p>
                                <p className="text-gray-500">Qty: {item.quantity}</p>
                                <p className="text-gray-700 font-medium">RM {item.price.toFixed(2)}</p>
                            </div>
                        </div>
                    ))}

                    <div className="pt-4 mt-4 text-sm">
                        <p className="flex justify-between">
                            <span>Subtotal</span>
                            <span>RM {total.toFixed(2)}</span>
                        </p>
                        <p className="flex justify-between">
                            <span>Delivery</span>
                            <span>RM 10.00</span>
                        </p>
                        <p className="flex justify-between font-semibold text-black mt-2">
                            <span>Total</span>
                            <span>RM {(total + 10).toFixed(2)}</span>
                        </p>
                    </div>

                    <div className="mt-4">
                        <label htmlFor="promo" className="block text-sm mb-1">Promo Code</label>
                        <input
                            id="promo"
                            placeholder="Enter promo code"
                            className="w-full border px-4 py-2 rounded text-sm"
                        />
                    </div>
                </div>

                <p className="text-xs text-center text-gray-500">
                    By placing your order, you agree to our{" "}
                    <a href="#" className="underline">Terms</a> &{" "}
                    <a href="#" className="underline">Privacy Policy</a>.
                </p>
            </aside>
        </main>
    );
}
