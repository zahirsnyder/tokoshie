import { supabaseAdmin } from "@/lib/supabaseAdmin";
import CustomerTable from "./CustomerTable";

type RawRow = {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  gender?: string;
  dob?: string;
  created_at?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  is_default?: boolean;
};

type GroupedCustomer = {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  gender?: string;
  dob?: string;
  created_at?: string;
  addresses: {
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    is_default?: boolean;
  }[];
};

function groupCustomers(rows: RawRow[]): GroupedCustomer[] {
  const map = new Map<string, GroupedCustomer>();

  for (const row of rows) {
    const {
      id, full_name, email, phone, gender, dob, created_at,
      address1, address2, city, state, postal_code, country, is_default,
    } = row;

    if (!map.has(id)) {
      map.set(id, {
        id,
        full_name,
        email,
        phone,
        gender,
        dob,
        created_at,
        addresses: [],
      });
    }

    const address = { address1, address2, city, state, postal_code, country, is_default };
    if (Object.values(address).some(Boolean)) {
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

      {customers.length === 0 ? (
        <div className="text-gray-500 text-center">No customers found.</div>
      ) : (
        <CustomerTable customers={customers} />
      )}
    </main>
  );
}
