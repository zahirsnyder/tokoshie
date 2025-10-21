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
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStep(2);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      // ✅ Step 1: Register user (Supabase will trigger customers insert automatically)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name }, // this is stored in raw_user_meta_data
        },
      });

      if (error) {
        console.error("Signup failed:", error.message);
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      // ✅ Step 2: Inform the user
      setSuccessMsg(
        "Registration successful! Please check your email to verify your account before logging in."
      );

      // ✅ Optional delay before redirecting to login
      setTimeout(() => {
        router.push("/account/login");
      }, 3000);
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

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-4">
      <form
        onSubmit={step === 1 ? handleNext : handleRegister}
        className="w-full max-w-sm text-center"
      >
        <h1 className="text-3xl font-bold text-black mb-2">Create Account</h1>
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
              disabled={!email}
              className="w-full bg-green-700 text-white rounded-full py-3 disabled:opacity-60 hover:bg-green-800 transition"
            >
              Continue
            </button>
          </>
        )}

        {/* Step 2: Full name + Password */}
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
              disabled={loading}
              className="w-full bg-green-700 text-white rounded-full py-3 disabled:opacity-60 hover:bg-green-800 transition"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </>
        )}

        {/* Feedback */}
        {errorMsg && <p className="text-red-600 text-sm mt-4">{errorMsg}</p>}
        {successMsg && (
          <p className="text-green-700 text-sm mt-4 font-medium">
            {successMsg}
          </p>
        )}
      </form>
    </main>
  );
}
