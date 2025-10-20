"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUserRole } from "@/lib/getUserRole";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 🟢 Step 1: Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      // 🟢 Step 2: Get the logged-in user
      const user = data?.user;
      if (!user?.email) {
        setError("Unable to fetch user session.");
        setLoading(false);
        return;
      }

      // 🟢 Step 3: Check role (from admins/customers table)
      const role = await getUserRole(user.email);

      // 🟢 Step 4: Redirect based on role
      if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/account/profile");
      }
    } catch (err: any) {
      console.error("Unexpected login error:", err);
      setError("Unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-8 border border-gray-200 rounded-xl shadow-sm">
        <h1 className="text-2xl font-semibold text-center mb-6">
          Login to <span className="text-green-700">TOKOSHIE</span>
        </h1>

        {error && (
          <p className="text-red-500 text-sm mb-3 text-center">{error}</p>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-700 focus:ring-1"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-700 focus:ring-1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white py-2 rounded-md transition ${
              loading
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-700 hover:bg-green-800"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
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
