"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { getUserRole } from "@/lib/getUserRole";
import type { User } from "@supabase/supabase-js";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      const currentUser = data.user;

      if (!currentUser) {
        router.push("/account/login");
        return;
      }

      const emailLower = (currentUser.email ?? "").toLowerCase();
      const role = await getUserRole(emailLower);

      if (role === "admin") {
        router.push("/admin");
        return;
      }

      // role is customer or null; if null you maybe want to treat as customer or force register
      setUser(currentUser);
      setLoading(false);
    };

    init();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white text-gray-600">
        Loading your account...
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-800">
      <div className="w-full max-w-lg p-8 border border-gray-200 rounded-xl text-center shadow-sm">
        <h1 className="text-2xl font-semibold mb-4">Welcome, {user.email}</h1>
        <p className="text-gray-500 mb-8">Manage your TOKOSHIE account</p>

        <div className="space-y-3">
          <button
            onClick={() => router.push("/account/orders")}
            className="w-full py-2 border rounded-md bg-green-700 text-white hover:bg-green-800 transition"
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
