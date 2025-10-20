"use client";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

export default function CheckoutPage() {
  const { cartItems, total, clearCart } = useCart();
  const [form, setForm] = useState({ name: "", address: "", email: "" });
  const [submitted, setSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { name: form.name, email: form.email, address: form.address },
          items: cartItems.map((p) => ({ ...p, quantity: 1 })), // quantity=1 for now
          total
        })
      });

      const json = await res.json();
      if (!res.ok) {
        setErrMsg(json?.error || "Failed to place order");
        setLoading(false);
        return;
      }

      setOrderNumber(json.orderNumber);
      clearCart();
      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setErrMsg("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <main className="max-w-lg mx-auto text-center p-8">
        <h1 className="text-2xl font-bold mb-4">Thank you, {form.name}!</h1>
        <p className="mb-2">Your order has been received.</p>
        {orderNumber && (
          <p className="text-sm text-gray-400">Order No: <span className="font-mono">{orderNumber}</span></p>
        )}
      </main>
    );
  }

  if (!cartItems.length) {
    return <p className="text-center mt-10 text-gray-500">Your cart is empty.</p>;
  }

  return (
    <main className="max-w-lg mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full border rounded p-2"
        />
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full border rounded p-2"
        />
        <input
          name="address"
          placeholder="Delivery Address"
          value={form.address}
          onChange={handleChange}
          required
          className="w-full border rounded p-2"
        />

        <h2 className="text-xl font-semibold mt-6">Order Summary</h2>
        <ul className="border rounded p-4">
          {cartItems.map((item) => (
            <li key={item.id} className="flex justify-between py-1">
              <span>{item.name}</span>
              <span>RM {item.price}</span>
            </li>
          ))}
        </ul>

        <p className="text-right font-bold mt-2">Total: RM {total.toFixed(2)}</p>

        {errMsg && <p className="text-red-500 mt-2">{errMsg}</p>}

        <button
          type="submit"
          disabled={loading}
          className={`w-full text-white py-2 rounded mt-4 transition ${
            loading ? "bg-green-400 cursor-not-allowed" : "bg-green-700 hover:bg-green-800"
          }`}
        >
          {loading ? "Placing Order..." : "Confirm Order"}
        </button>
      </form>
    </main>
  );
}
