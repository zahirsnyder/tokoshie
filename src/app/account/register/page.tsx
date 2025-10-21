"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStep(2);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🟢 1. Create Supabase Auth User
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    if (error) {
      alert(error.message);
      return;
    }

    const user = data.user;
    if (!user) {
      alert("Sign-up failed. Please try again.");
      return;
    }

    // 🟢 2. Insert into `customers` table
    const { error: insertError } = await supabase.from("customers").insert([
      {
        full_name: name,
        email: email,
        phone: null,
        address: null,
        city: null,
        postcode: null,
      },
    ]);

    if (insertError) {
      console.error("Customer insert failed:", insertError.message);
    }

    // 🟢 3. Redirect to homepage or profile
    router.push("/account/profile");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <form
        onSubmit={step === 1 ? handleNext : handleRegister}
        className="w-full max-w-md text-center px-6"
      >
        {step === 1 ? (
          <>
            <h1 className="text-3xl font-bold mb-2 text-gray-900">Welcome</h1>
            <p className="text-gray-600 mb-8">
              Sign up or log in to continue
            </p>

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
                onClick={() => router.push("/account/login")}
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
              Fill in detail for your account
            </p>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="w-full border border-gray-300 rounded-full py-3 px-5 mb-4 focus:outline-none focus:ring-2 focus:ring-green-700"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full border border-gray-300 rounded-full py-3 px-5 mb-4 focus:outline-none focus:ring-2 focus:ring-green-700"
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
