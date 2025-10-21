"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { getUserRole } from "@/lib/getUserRole";
import type { User } from "@supabase/supabase-js";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.push("/account/login");
        return;
      }

      const currentUser = data.user;
      const email = currentUser.email?.toLowerCase();
      const role = await getUserRole(email || "");

      if (role === "admin") {
        router.push("/admin");
        return;
      }

      setUser(currentUser);
      setLoading(false);
    };

    loadUser();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleResendEmail = async () => {
    if (!user?.email) return;

    setSending(true);
    setSent(false);
    setError("");

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: user.email,
    });

    if (error) {
      console.error("Resend failed:", error.message);
      setError("Failed to send verification email.");
    } else {
      setSent(true);
    }

    setSending(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white text-gray-600">
        Loading your account...
      </main>
    );
  }

  if (!user) return null;

  const isVerified = !!user.email_confirmed_at;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-800 px-4">
      <div className="w-full max-w-lg p-8 bg-white border border-gray-200 rounded-xl text-center shadow-sm">
        <h1 className="text-2xl font-semibold mb-2">
          Welcome, {user.user_metadata?.full_name || user.email}
        </h1>
        <p className="text-sm text-gray-500 mb-6">{user.email}</p>

        {/* Email Verification Status */}
        {!isVerified ? (
          <div className="bg-yellow-100 text-yellow-900 border border-yellow-300 rounded p-4 text-sm mb-6">
            <p>Your email is <strong>not verified</strong>.</p>
            {sent ? (
              <p className="text-green-700 mt-2 font-medium">
                ✅ Verification email sent! Check your inbox.
              </p>
            ) : (
              <button
                onClick={handleResendEmail}
                disabled={sending}
                className="mt-3 text-sm underline hover:text-yellow-800"
              >
                {sending ? "Sending..." : "Send Verification Email"}
              </button>
            )}
            {error && (
              <p className="text-red-600 text-sm mt-2">{error}</p>
            )}
          </div>
        ) : (
          <div className="text-green-600 font-medium text-sm mb-6">
            ✅ Your email is verified
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => router.push("/account/orders")}
            className="w-full py-2 rounded-md bg-green-700 text-white hover:bg-green-800 transition"
          >
            View Orders
          </button>
          <button
            onClick={handleLogout}
            className="w-full py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </main>
  );
}
