import { supabaseAdmin } from "@/lib/supabaseAdmin";
import React from "react";

// Raw result from SQL function
type RawRow = {
  id: string;
  full_name: string;
  email: string;
  created_at?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
};

type GroupedCustomer = {
  id: string;
  full_name: string;
  email: string;
  created_at?: string;
  addresses: {
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  }[];
};

function groupCustomers(rows: RawRow[]): GroupedCustomer[] {
  const map = new Map<string, GroupedCustomer>();

  for (const row of rows) {
    const {
      id,
      full_name,
      email,
      created_at,
      address1,
      address2,
      city,
      state,
      postal_code,
      country,
    } = row;

    if (!map.has(id)) {
      map.set(id, {
        id,
        full_name,
        email,
        created_at,
        addresses: [],
      });
    }

    const address = { address1, address2, city, state, postal_code, country };
    if (address1 || address2 || city || state || postal_code || country) {
      map.get(id)?.addresses.push(address);
    }
  }

  return Array.from(map.values());
}

export default async function AdminCustomersPage() {
  const { data: rawCustomers, error } = await supabaseAdmin
    .rpc("get_customers_with_address")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load customers:", error.message);
  }

  const customers = groupCustomers(rawCustomers || []);

  return (
    <main className="min-h-screen bg-gray-50 p-10">
      <h1 className="text-3xl font-semibold text-gray-800 mb-8">🧑‍💼 Customers</h1>

      {!customers.length ? (
        <div className="text-gray-500 text-center">No customers found.</div>
      ) : (
        <div className="overflow-x-auto shadow border border-gray-200 rounded-xl bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Addresses
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap flex items-center space-x-3">
                    <div className="flex-shrink-0 h-10 w-10 bg-black text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      {customer.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {customer.full_name}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {customer.email}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {customer.addresses.length === 0 ? (
                      <span className="text-gray-400">No address</span>
                    ) : (
                      <div className="space-y-2">
                        {customer.addresses.map((addr, i) => (
                          <div
                            key={`${customer.id}-${i}`}
                            className="bg-gray-50 border border-gray-200 p-3 rounded-md shadow-sm"
                          >
                            <p className="text-gray-700 text-sm">
                              {[addr.address1, addr.address2]
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                            <p className="text-gray-600 text-xs mt-1">
                              {[addr.city, addr.state, addr.postal_code, addr.country]
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                    {customer.created_at
                      ? new Date(customer.created_at).toLocaleDateString("en-MY", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
