"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AdminProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            const { data } = await supabase.auth.getUser();
            const currentUser = data.user;

            if (!currentUser) {
                router.push("/account/login");
                return;
            }

            setEmail(currentUser.email || "");

            const { data: adminData } = await supabase
                .from("admins")
                .select("full_name")
                .eq("email", currentUser.email)
                .single();

            setFullName(adminData?.full_name || "");
            setLoading(false);
        };

        fetchProfile();
    }, [router]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");

        // ✅ Update full_name in admins table
        const { error: nameError } = await supabase
            .from("admins")
            .update({ full_name: fullName })
            .eq("email", email);

        if (nameError) {
            setMessage("❌ Failed to update name.");
            return;
        }

        // ✅ Update password if provided
        if (newPassword.trim() !== "") {
            const { error: pwError } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (pwError) {
                setMessage("❌ Failed to update password: " + pwError.message);
                return;
            }

            setMessage("✅ Password updated. Please log in again.");

            // 🔒 Sign out safely
            await supabase.auth.signOut();
            router.push("/account/login");
            return;
        }

        setMessage("✅ Profile updated successfully!");
    };

    if (loading)
        return (
            <main className="min-h-screen flex items-center justify-center text-gray-400">
                Loading profile...
            </main>
        );

    return (
        <main className="max-w-xl mx-auto mt-16 px-6">
            <div className="bg-white border rounded-xl shadow-md p-8">
                <h1 className="text-2xl font-bold text-green-800 mb-2">Admin Profile</h1>
                <p className="text-sm text-gray-500 mb-6">Manage your personal details and credentials.</p>

                <form onSubmit={handleUpdate} className="space-y-5">
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            disabled
                            className="w-full bg-gray-100 text-gray-500 border rounded-md px-3 py-2 cursor-not-allowed"
                        />
                    </div>

                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                        />
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">New Password</label>
                        <input
                            type="password"
                            placeholder="Leave blank to keep current password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                        />
                    </div>

                    {/* Message */}
                    {message && (
                        <div
                            className={`text-sm px-4 py-2 rounded-md ${message.startsWith("✅")
                                    ? "bg-green-50 text-green-700 border border-green-200"
                                    : "bg-red-50 text-red-700 border border-red-200"
                                }`}
                        >
                            {message}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full bg-green-700 text-white py-2 rounded-md hover:bg-green-800 transition duration-200"
                    >
                        Save Changes
                    </button>
                </form>
            </div>
        </main>

    );
}
