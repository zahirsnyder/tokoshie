"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/account/login");
      } else {
        setUser(data.user);
      }
    };
    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (!user) return null;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-800">
      <div className="w-full max-w-lg p-8 border border-gray-200 rounded-xl text-center shadow-sm">
        <h1 className="text-2xl font-semibold mb-4">Welcome, {user.email}</h1>
        <p className="text-gray-500 mb-8">Manage your TOKOSHIE account</p>

        <div className="space-y-3">
          <button
            onClick={() => router.push("/account/orders")}
            className="w-full py-2 border rounded-md hover:bg-gray-50 transition"
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
