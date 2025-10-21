"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { getUserRole } from "@/lib/getUserRole";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";

export default function ProfilePage() {
    const router = useRouter();
    const supabase = createClientComponentClient();

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [gender, setGender] = useState("");
    const [dob, setDob] = useState("");
    const [profileCompleted, setProfileCompleted] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            const { data, error } = await supabase.auth.getUser();

            if (error || !data.user) {
                router.push("/account/login");
                return;
            }

            const currentUser = data.user;
            const role = await getUserRole(currentUser.email || "");

            if (role === "admin") {
                router.push("/admin");
                return;
            }

            // Ensure user exists in "customers"
            const { data: existing, error: checkError } = await supabase
                .from("customers")
                .select("*")
                .eq("id", currentUser.id)
                .single();

            if (!existing && !checkError) {
                await supabase.from("customers").insert([
                    {
                        id: currentUser.id,
                        email: currentUser.email,
                        full_name: currentUser.user_metadata?.full_name || "",
                    },
                ]);
            }

            // If customer exists, load gender and dob
            if (existing) {
                setGender(existing.gender || "");
                setDob(existing.dob || "");
                if (existing.gender && existing.dob) {
                    setProfileCompleted(true);
                }
            }

            setUser(currentUser);
            setLoading(false);
        };

        loadUser();
    }, [supabase, router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    const handleCompleteProfile = async () => {
        if (!user) return;

        if (!gender || !dob) {
            alert("Please fill in both gender and date of birth.");
            return;
        }

        const { error } = await supabase
            .from("customers")
            .update({ gender, dob })
            .eq("id", user.id);

        if (error) {
            alert("Failed to update profile.");
        } else {
            setProfileCompleted(true);
            alert("Profile completed successfully!");
        }
    };

    const firstName =
        user?.user_metadata?.full_name?.split(" ")[0] ||
        user?.email?.split("@")[0];

    if (loading || !user) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-white text-gray-600">
                Loading your account...
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-white py-10 px-4 md:px-10 text-gray-800">
            <div className="max-w-7xl mx-auto">
                {/* Top Section */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-lg text-gray-500 mb-1">
                            Hi, <strong>{firstName}</strong>.
                        </h2>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Panel */}
                    <div className="flex-1 space-y-6">
                        {/* Action Tiles */}
                        <div className="grid grid-cols-2 md:grid-cols-4 border border-gray-200 rounded-md divide-x divide-y md:divide-y-0 overflow-hidden text-center">
                            <Link
                                href="/account/profile/edit"
                                className="py-6 hover:bg-gray-50 flex flex-col items-center gap-1"
                            >
                                <span className="text-2xl">👤</span>
                                <span className="text-sm font-medium">My Profile</span>
                            </Link>
                            <Link
                                href="/account/address"
                                className="py-6 hover:bg-gray-50 flex flex-col items-center gap-1"
                            >
                                <span className="text-2xl">📒</span>
                                <span className="text-sm font-medium">Address Book</span>
                            </Link>
                            <Link
                                href="/account/orders"
                                className="py-6 hover:bg-gray-50 flex flex-col items-center gap-1"
                            >
                                <span className="text-2xl">📦</span>
                                <span className="text-sm font-medium">Order History</span>
                            </Link>
                            <Link
                                href="/account/vouchers"
                                className="py-6 hover:bg-gray-50 flex flex-col items-center gap-1"
                            >
                                <span className="text-2xl">🎫</span>
                                <span className="text-sm font-medium">Vouchers</span>
                            </Link>
                        </div>

                        {/* Recent Orders */}
                        <div className="border border-gray-200 rounded-md p-6 bg-white">
                            <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
                            <div className="flex flex-col items-center justify-center text-sm text-gray-500 py-10">
                                <div className="text-4xl mb-3">📦</div>
                                <p>You haven’t placed any orders recently.</p>
                                <Link
                                    href="/shop"
                                    className="mt-4 bg-green-700 hover:bg-green-800 text-white px-5 py-2 rounded-md text-sm font-medium"
                                >
                                    Continue shopping
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div className="w-full lg:w-80 space-y-6">
                        {/* Complete Your Profile */}
                        {!profileCompleted && (
                            <div className="border border-gray-200 rounded-md p-5 bg-white">
                                <h4 className="text-md font-semibold mb-1">
                                    Complete your profile
                                </h4>
                                <p className="text-sm text-gray-600 mb-4">
                                    Complete the information for a better shopping experience.
                                </p>
                                <div className="space-y-3">
                                    <select
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                    >
                                        <option value="">Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                    <input
                                        type="date"
                                        value={dob}
                                        onChange={(e) => setDob(e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                    />
                                    <button
                                        onClick={handleCompleteProfile}
                                        className="w-full bg-green-800 text-white py-2 rounded-md text-sm font-medium hover:bg-green-900"
                                    >
                                        Complete
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Membership Card */}
                        <div className="bg-gray-900 text-white rounded-md p-4 flex items-center justify-between">
                            <div>
                                <h5 className="text-lg font-bold">Basic Member</h5>
                                <p className="text-xs text-gray-300">Never expire</p>
                            </div>
                            <div className="bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-md">
                                {firstName?.slice(0, 2)?.toUpperCase()}
                            </div>
                        </div>

                        {/* Credits & Points */}
                        <div className="grid grid-cols-2 border border-gray-200 rounded-md overflow-hidden text-center text-sm">
                            <div className="p-4 border-r">
                                <p className="text-gray-600">RM 0.00</p>
                                <p className="font-medium text-gray-700">Credit</p>
                            </div>
                            <div className="p-4">
                                <p className="text-gray-600">10 Point</p>
                                <p className="font-medium text-gray-700">Point</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
