"use client";

import React, { useMemo, useState } from "react";

// Types
type Address = {
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    is_default?: boolean;
};

type Customer = {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    gender?: string;
    dob?: string;
    created_at?: string;
    addresses: Address[];
};

const ITEMS_PER_PAGE = 10;

export default function CustomerTable({ customers }: { customers: Customer[] }) {
    const [search, setSearch] = useState("");
    const [sortField, setSortField] = useState<"full_name" | "email">("full_name");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [page, setPage] = useState(1);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    // Filtered, Sorted & Paginated Customers
    const filteredCustomers = useMemo(() => {
        const filtered = customers.filter((c) =>
            `${c.full_name} ${c.email}`.toLowerCase().includes(search.toLowerCase())
        );

        const sorted = [...filtered].sort((a, b) => {
            const aField = a[sortField]?.toLowerCase() || "";
            const bField = b[sortField]?.toLowerCase() || "";

            if (aField < bField) return sortOrder === "asc" ? -1 : 1;
            if (aField > bField) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });

        return sorted;
    }, [customers, search, sortField, sortOrder]);

    const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
    const paginatedCustomers = filteredCustomers.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
    );

    const handleSort = (field: "full_name" | "email") => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    return (
        <>
            {/* Search input */}
            <div className="flex items-center justify-between mb-4">
                <input
                    type="text"
                    placeholder="Search by name or email"
                    className="border px-3 py-2 rounded-md text-sm w-64"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1); // reset page on search
                    }}
                />
                <div className="text-sm text-gray-500">
                    Showing {paginatedCustomers.length} of {filteredCustomers.length} results
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto shadow border border-gray-200 rounded-xl bg-white">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th
                                className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase cursor-pointer"
                                onClick={() => handleSort("full_name")}
                            >
                                Customer {sortField === "full_name" && (sortOrder === "asc" ? "↑" : "↓")}
                            </th>
                            <th
                                className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase cursor-pointer"
                                onClick={() => handleSort("email")}
                            >
                                Email {sortField === "email" && (sortOrder === "asc" ? "↑" : "↓")}
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase">
                                Address
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {paginatedCustomers.map((customer) => {
                            const defaultAddr =
                                customer.addresses.find((addr) => addr.is_default) ||
                                customer.addresses[0];

                            return (
                                <tr key={customer.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 font-medium">{customer.full_name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{customer.email}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">
                                        {defaultAddr ? (
                                            [defaultAddr.address1, defaultAddr.city, defaultAddr.country]
                                                .filter(Boolean)
                                                .join(", ")
                                        ) : (
                                            <span className="text-gray-400">No address</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 space-x-2">
                                        <button
                                            onClick={() => setSelectedCustomer(customer)}
                                            className="text-blue-600 hover:underline text-sm"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-600">
                    Page {page} of {totalPages}
                </div>
                <div className="space-x-2">
                    <button
                        className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                        onClick={() => setPage((p) => p - 1)}
                        disabled={page === 1}
                    >
                        Previous
                    </button>
                    <button
                        className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={page === totalPages}
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* Details Modal */}
            {selectedCustomer && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-6 relative">
                        <button
                            className="absolute top-4 right-4 text-gray-600 hover:text-black"
                            onClick={() => setSelectedCustomer(null)}
                        >
                            ✕
                        </button>

                        <h2 className="text-xl font-semibold mb-4">Customer Details</h2>

                        <div className="space-y-2">
                            <p><strong>Name:</strong> {selectedCustomer.full_name}</p>
                            <p><strong>Email:</strong> {selectedCustomer.email}</p>
                            <p><strong>Phone:</strong> {selectedCustomer.phone || "—"}</p>
                            <p><strong>Gender:</strong> {selectedCustomer.gender || "—"}</p>
                            <p><strong>Date of Birth:</strong> {selectedCustomer.dob || "—"}</p>
                            <p><strong>Joined:</strong> {new Date(selectedCustomer.created_at || "").toLocaleString()}</p>
                        </div>

                        <div className="mt-6">
                            <h3 className="font-semibold mb-2">Addresses</h3>
                            {selectedCustomer.addresses.length === 0 ? (
                                <p className="text-sm text-gray-500">No addresses available.</p>
                            ) : (
                                <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                    {selectedCustomer.addresses.map((addr, i) => (
                                        <li
                                            key={i}
                                            className="bg-gray-50 border border-gray-200 p-3 rounded"
                                        >
                                            {addr.is_default && (
                                                <span className="text-green-600 text-xs font-semibold uppercase">
                                                    Default
                                                </span>
                                            )}
                                            <p className="text-sm font-medium text-gray-800">
                                                {[addr.address1, addr.address2]
                                                    .filter(Boolean)
                                                    .join(", ")}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {[addr.city, addr.state, addr.postal_code, addr.country]
                                                    .filter(Boolean)
                                                    .join(", ")}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
