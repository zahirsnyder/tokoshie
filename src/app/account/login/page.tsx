"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { getUserRole } from "@/lib/getUserRole";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showModal, setShowModal] = useState(false);

  // ✅ Add this helper here
  const redirectByRole = (role: string | null) => {
    if (role === "admin") router.push("/admin");
    else if (role === "company" || role === "customer") {
      router.push("/account/profile");
    } else {
      setErrorMsg("Access denied: your email is not registered.");
    }
  };

  // ✅ Use it inside useEffect()
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user;
      if (user?.email) {
        const role = await getUserRole(user.email);
        redirectByRole(role);
      }
    };

    checkSession();

    // Prefill logic
    const emailFromQuery = searchParams.get("email");
    const isRegistered = searchParams.get("registered");
    if (emailFromQuery) {
      setEmail(emailFromQuery);
      if (isRegistered) {
        setErrorMsg("This email is already registered. Please log in.");
      }
    }
  }, [searchParams, supabase, router]);

  // ✅ Use it inside handleLogin()
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        setShowModal(true);
      } else {
        setErrorMsg(error.message);
      }
      setLoading(false);
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user;
    if (!user?.email) {
      setErrorMsg("Unable to retrieve user session.");
      setLoading(false);
      return;
    }

    const role = await getUserRole(user.email);
    redirectByRole(role);

    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-4">
      <form onSubmit={handleLogin} className="w-full max-w-sm text-center">
        <h1 className="text-3xl font-bold text-black mb-2">Welcome back</h1>
        <p className="text-black font-medium mb-6">Log in to access your account</p>

        <div className="flex bg-gray-100 rounded-full p-1 mb-8 shadow-inner">
          <Link
            href="/account/register"
            className="w-1/2 py-2 rounded-full text-gray-600 hover:text-black text-sm font-medium text-center"
          >
            Sign up
          </Link>
          <button
            type="button"
            disabled
            className="w-1/2 py-2 rounded-full bg-white text-black font-medium shadow"
          >
            Login
          </button>
        </div>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full border border-gray-400 rounded-full py-3 px-5 mb-4"
          required
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full border border-gray-400 rounded-full py-3 px-5 mb-4"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-700 text-white rounded-full py-3 disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {errorMsg && <p className="text-red-600 text-sm mt-4">{errorMsg}</p>}
      </form>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-sm p-6 rounded-xl shadow-xl relative text-center">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-4 text-gray-400 hover:text-black text-xl"
            >
              ×
            </button>
            <h2 className="text-xl font-semibold text-red-600 mb-2">Email not verified</h2>
            <p className="text-sm text-gray-700">
              Please check your inbox for a confirmation link before logging in.
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="mt-6 bg-green-700 text-white px-6 py-2 rounded-full hover:bg-green-800 transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
