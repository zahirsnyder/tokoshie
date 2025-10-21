"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

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

    // ✅ Check if user exists in "admins" table
    const { data: adminData, error: adminError } = await supabase
      .from("admins")
      .select("email")
      .eq("email", email.toLowerCase())
      .single();

    if (adminError && adminError.code !== "PGRST116") {
      // (code 116 = no rows found)
      console.error(adminError.message);
    }

    // ✅ Redirect based on role
    if (adminData) {
      router.push("/admin");
    } else {
      router.push("/");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <form
        onSubmit={step === 1 ? handleNext : handleLogin}
        className="w-full max-w-md text-center px-6"
      >
        {step === 1 ? (
          <>
            <h1 className="text-3xl font-bold mb-2 text-gray-900">Welcome</h1>
            <p className="text-gray-600 mb-8">Sign up or log in to continue</p>

            <div className="flex justify-center gap-4 mb-8">
              <button
                type="button"
                className="px-6 py-2 rounded-full font-medium bg-green-700 text-white shadow"
                disabled
              >
                Sign up
              </button>
              <button
                type="button"
                className="px-6 py-2 rounded-full font-medium bg-gray-100 text-gray-700"
              >
                Login
              </button>
            </div>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Phone or Email"
              className="w-full border border-gray-300 rounded-full py-3 px-5 mb-4 focus:outline-none focus:ring-2 focus:ring-green-700"
            />
            <button
              type="submit"
              className="w-full bg-green-700 text-white font-medium rounded-full py-3 hover:bg-green-800 transition"
            >
              Continue
            </button>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-2 text-gray-900">
              Almost done
            </h1>
            <p className="text-gray-600 mb-8">
              Enter your password to continue
            </p>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full border border-gray-300 rounded-full py-3 px-5 mb-4 focus:outline-none focus:ring-2 focus:ring-green-700"
              required
            />
            <button
              type="submit"
              className="w-full bg-green-700 text-white font-medium rounded-full py-3 hover:bg-green-800 transition"
            >
              Continue
            </button>
          </>
        )}
      </form>
    </main>
  );
}
