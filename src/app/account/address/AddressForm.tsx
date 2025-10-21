'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Address } from '@/types/address';

export default function AddressForm({
    userId,
    onSuccess,
    initialData,
}: {
    userId: string;
    onSuccess: (a: Address) => void;
    initialData?: Partial<Address>;
}) {

    const supabase = createClientComponentClient();

    const [form, setForm] = useState({
        first_name: initialData?.first_name || '',
        last_name: initialData?.last_name || '',
        phone: initialData?.phone || '',
        company: initialData?.company || '',
        address1: initialData?.address1 || '',
        address2: initialData?.address2 || '',
        country: initialData?.country || 'Malaysia',
        state: initialData?.state || '',
        city: initialData?.city || '',
        postal_code: initialData?.postal_code || '',
        is_default: initialData?.is_default || false,
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const target = e.target;
        const { name, value, type } = target;
        const checked = (target as HTMLInputElement).checked;

        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async () => {
        const payload = { ...form, user_id: userId };

        const { data, error } = initialData
            ? await supabase
                .from('addresses')
                .update(payload)
                .eq('id', initialData.id)
                .select()
                .single()
            : await supabase.from('addresses').insert([payload]).select().single();

        if (error) {
            console.error(error);
            alert(initialData ? 'Failed to update address.' : 'Failed to add address.');
        } else {
            onSuccess(data);
        }
    };

    return (
        <div className="border border-gray-200 rounded-md p-6 max-w-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="first_name" value={form.first_name} onChange={handleChange} placeholder="First Name" className="border rounded-full px-4 py-2 w-full" />
                <input name="last_name" value={form.last_name} onChange={handleChange} placeholder="Last Name" className="border rounded-full px-4 py-2 w-full" />
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="border rounded-full px-4 py-2 w-full" />
                <input name="company" value={form.company} onChange={handleChange} placeholder="Company" className="border rounded-full px-4 py-2 w-full" />
                <input name="address1" value={form.address1} onChange={handleChange} placeholder="Address1" className="border rounded-full px-4 py-2 w-full" />
                <input name="address2" value={form.address2} onChange={handleChange} placeholder="Address2" className="border rounded-full px-4 py-2 w-full" />
                <select name="country" value={form.country} onChange={handleChange} className="border rounded-full px-4 py-2 w-full">
                    <option value="Malaysia">Malaysia</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Indonesia">Indonesia</option>
                </select>
                <input name="state" value={form.state} onChange={handleChange} placeholder="Province" className="border rounded-full px-4 py-2 w-full" />
                <input name="city" value={form.city} onChange={handleChange} placeholder="City" className="border rounded-full px-4 py-2 w-full" />
                <input name="postal_code" value={form.postal_code} onChange={handleChange} placeholder="Postal/Zip Code" className="border rounded-full px-4 py-2 w-full" />
            </div>

            <label className="flex items-center gap-2 mt-4 text-sm">
                <input
                    type="checkbox"
                    name="is_default"
                    checked={form.is_default}
                    onChange={handleChange}
                    className="accent-green-700"
                />
                Set as default address
            </label>

            <div className="flex justify-end gap-4 mt-6">
                <button
                    type="button"
                    onClick={() => {
                        // reset or hide handled by parent
                    }}
                    className="px-6 py-2 border border-black rounded-full text-sm text-black hover:bg-gray-100"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-green-800 text-white rounded-full text-sm hover:bg-green-900"
                >
                    {initialData ? 'Update Address' : 'Add Address'}
                </button>
            </div>
        </div>
    );
}

