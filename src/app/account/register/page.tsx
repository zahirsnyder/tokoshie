"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStep(2);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // ✅ Sign up user via Supabase Auth (trigger will handle customers)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name }, // sent to raw_user_meta_data
      },
    });

    if (error) {
      console.error("Signup failed:", error.message);
      setErrorMsg(error.message);
      return;
    }

    // ✅ The trigger in Supabase automatically inserts into `customers`
    // using NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name'

    // Wait briefly for trigger to finish (optional but safer)
    await new Promise((res) => setTimeout(res, 800));

    router.push("/account/profile");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-4">
      <form
        onSubmit={step === 1 ? handleNext : handleRegister}
        className="w-full max-w-sm text-center"
      >
        <h1 className="text-3xl font-bold text-black mb-2">Welcome</h1>
        <p className="text-black font-medium mb-6">
          Sign up or log in to continue
        </p>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-full p-1 mb-8 shadow-inner">
          <button
            type="button"
            disabled
            className="w-1/2 py-2 rounded-full bg-white text-black font-medium shadow"
          >
            Sign up
          </button>
          <Link
            href="/account/login"
            className="w-1/2 py-2 rounded-full text-gray-600 hover:text-black text-sm font-medium text-center"
          >
            Login
          </Link>
        </div>

        {/* Step 1: Email */}
        {step === 1 && (
          <>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full border border-gray-400 rounded-full py-3 px-5 mb-4"
              required
            />
            <button
              type="submit"
              className="w-full bg-green-700 text-white rounded-full py-3"
            >
              Continue
            </button>
          </>
        )}

        {/* Step 2: Name & Password */}
        {step === 2 && (
          <>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
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
              className="w-full bg-green-700 text-white rounded-full py-3"
            >
              Register
            </button>
          </>
        )}

        {errorMsg && <p className="text-red-600 text-sm mt-4">{errorMsg}</p>}
      </form>
    </main>
  );
}
