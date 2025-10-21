"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStep(2);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    const { data: adminData } = await supabase
      .from("admins")
      .select("email")
      .eq("email", email.toLowerCase())
      .single();

    router.push(adminData ? "/admin" : "/");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-4">
      <form
        onSubmit={step === 1 ? handleNext : handleLogin}
        className="w-full max-w-sm text-center"
      >
        <h1 className="text-3xl font-bold text-black mb-2">Welcome</h1>
        <p className="text-black font-medium mb-6">Sign up or log in to continue</p>

        {/* Tabs */}
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

        {/* Step 1: Email */}
        {step === 1 && (
          <>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Phone or Email"
              className="w-full border border-gray-400 rounded-full py-3 px-5 mb-4 focus:outline-none focus:ring-2 focus:ring-green-700"
              required
            />
            <button
              type="submit"
              className="w-full bg-[#1c3d25] text-white font-medium rounded-full py-3 hover:bg-[#16351f] transition"
            >
              Continue
            </button>
          </>
        )}

        {/* Step 2: Password */}
        {step === 2 && (
          <>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full border border-gray-400 rounded-full py-3 px-5 mb-4 focus:outline-none focus:ring-2 focus:ring-green-700"
              required
            />
            <button
              type="submit"
              className="w-full bg-[#1c3d25] text-white font-medium rounded-full py-3 hover:bg-[#16351f] transition"
            >
              Continue
            </button>
          </>
        )}
      </form>
    </main>
  );
}
