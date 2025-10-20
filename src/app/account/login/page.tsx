"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setError(error.message);
    router.push("/account/profile");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-8 border border-gray-200 rounded-xl shadow-sm">
        <h1 className="text-2xl font-semibold text-center mb-6">Login to TOKOSHIE</h1>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-700 focus:ring-1"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-700 focus:ring-1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-green-700 text-white py-2 rounded-md hover:bg-green-800 transition"
          >
            Login
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-4 text-center">
          Don’t have an account?{" "}
          <Link href="/account/register" className="text-green-700 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </main>
  );
}
