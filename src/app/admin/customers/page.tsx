import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function AdminCustomersPage() {
  const { data: customers } = await supabaseAdmin
    .from("customers")
    .select("id, full_name, email, address, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-white p-10">
      <h1 className="text-2xl font-bold mb-6">Customers</h1>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Address</th>
              <th className="p-3 text-left">Joined</th>
            </tr>
          </thead>
          <tbody>
            {customers?.map((c) => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{c.full_name || "—"}</td>
                <td className="p-3">{c.email}</td>
                <td className="p-3 text-gray-500">{c.address || "—"}</td>
                <td className="p-3 text-gray-400 text-xs">
                  {new Date(c.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
