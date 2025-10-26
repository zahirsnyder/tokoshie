"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

type Company = {
    id: string;
    user_id: string;
    company_name: string;
    company_email: string;
    phone: string;
    company_ssm: string;
    company_address1: string;
    company_address2?: string;
    company_postcode: string;
    company_city: string;
    company_state: string;
    company_country: string;
};

export default function CompanyProfilePage() {
    const supabase = createClientComponentClient();
    const router = useRouter();

    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const loadCompany = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                router.push("/account/login");
                return;
            }

            const { data, error } = await supabase
                .from("companies")
                .select("*")
                .eq("user_id", user.id)
                .single();

            if (error) {
                console.error("Error loading company:", error.message);
            } else {
                setCompany(data);
            }

            setLoading(false);
        };

        loadCompany();
    }, [supabase, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCompany((prev) =>
            prev ? { ...prev, [name]: value } : prev
        );

    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!company) return; // ✅ exit early if company is null

        setSaving(true);
        setMessage("");

        const { error } = await supabase
            .from("companies")
            .update(company)
            .eq("id", company.id);

        if (error) {
            setMessage("❌ Failed to update company.");
            console.error(error);
        } else {
            setMessage("✅ Company profile updated successfully.");
        }

        setSaving(false);
    };


    if (loading) {
        return <p className="p-6 text-gray-500">Loading company info…</p>;
    }

    if (!company) {
        return (
            <main className="p-6">
                <h1 className="text-xl font-semibold mb-4">Company Profile</h1>
                <p className="text-gray-600">No company profile found for this account.</p>
            </main>
        );
    }

    return (
        <main className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Company Profile</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    name="company_name"
                    placeholder="Company Name"
                    className="w-full border p-2 rounded"
                    value={company.company_name || ""}
                    onChange={handleChange}
                />

                <input
                    type="email"
                    name="company_email"
                    placeholder="Company Email"
                    className="w-full border p-2 rounded"
                    value={company.company_email || ""}
                    onChange={handleChange}
                />

                <input
                    type="text"
                    name="phone"
                    placeholder="Phone"
                    className="w-full border p-2 rounded"
                    value={company.phone || ""}
                    onChange={handleChange}
                />

                <input
                    type="text"
                    name="company_ssm"
                    placeholder="SSM Number"
                    className="w-full border p-2 rounded"
                    value={company.company_ssm || ""}
                    onChange={handleChange}
                />

                <input
                    type="text"
                    name="company_address1"
                    placeholder="Address Line 1"
                    className="w-full border p-2 rounded"
                    value={company.company_address1 || ""}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="company_address2"
                    placeholder="Address Line 2"
                    className="w-full border p-2 rounded"
                    value={company.company_address2 || ""}
                    onChange={handleChange}
                />
                <div className="flex gap-4">
                    <input
                        type="text"
                        name="company_postcode"
                        placeholder="Postcode"
                        className="w-full border p-2 rounded"
                        value={company.company_postcode || ""}
                        onChange={handleChange}
                    />
                    <input
                        type="text"
                        name="company_city"
                        placeholder="City"
                        className="w-full border p-2 rounded"
                        value={company.company_city || ""}
                        onChange={handleChange}
                    />
                </div>

                <div className="flex gap-4">
                    <input
                        type="text"
                        name="company_state"
                        placeholder="State"
                        className="w-full border p-2 rounded"
                        value={company.company_state || ""}
                        onChange={handleChange}
                    />
                    <input
                        type="text"
                        name="company_country"
                        placeholder="Country"
                        className="w-full border p-2 rounded"
                        value={company.company_country || ""}
                        onChange={handleChange}
                    />
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition"
                >
                    {saving ? "Saving..." : "Save Changes"}
                </button>

                {message && <p className="text-sm mt-2">{message}</p>}
            </form>
        </main>
    );
}
