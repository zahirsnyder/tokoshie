'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Address } from '@/types/address';

type AddressWithCompany = Partial<Address> & { company?: string };

interface Props {
  userId: string;
  initialData?: AddressWithCompany; // allow optional company without `any`
  onSuccess: (address: Address) => void;
  onCancel?: () => void;
}

export default function AddressForm({
  userId,
  initialData,
  onSuccess,
  onCancel,
}: Props) {
  const supabase = createClientComponentClient();

  // --- form state (matches DB columns) ---------------------------------------
  const [form, setForm] = useState({
    first_name: initialData?.first_name ?? '',
    last_name: initialData?.last_name ?? '',
    phone: initialData?.phone ?? '',
    // company is optional; only sent if present in your table
    company: initialData?.company ?? '',
    address1: initialData?.address1 ?? '',
    address2: initialData?.address2 ?? '',
    country: initialData?.country ?? 'Malaysia',
    state: initialData?.state ?? '',
    city: initialData?.city ?? '',
    postal_code: initialData?.postal_code ?? '',
    is_default: Boolean(initialData?.is_default),
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // helpers
  const setField = (name: string, value: unknown) => {
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.first_name.trim()) next.first_name = 'First name is required';
    if (!form.last_name.trim()) next.last_name = 'Last name is required';
    if (!form.phone.trim()) next.phone = 'Phone number is required';
    if (!form.address1.trim()) next.address1 = 'Address is required';
    if (!form.city.trim()) next.city = 'City is required';
    if (!form.state.trim()) next.state = 'State is required';
    if (!form.postal_code.trim()) next.postal_code = 'Postal code is required';
    if (!form.country.trim()) next.country = 'Country is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrorMsg(null);

    // Build payload – use undefined for optional strings
    const payload: Record<string, unknown> = {
      user_id: userId,
      first_name: form.first_name,
      last_name: form.last_name,
      phone: form.phone, // mandatory
      address1: form.address1,
      address2: form.address2 || undefined,
      country: form.country,
      state: form.state,
      city: form.city,
      postal_code: form.postal_code,
      is_default: form.is_default,
    };
    if (form.company) payload.company = form.company; // only if your table has this column

    const isEdit = Boolean(initialData?.id);
    const query = supabase.from('addresses');

    // 1) Save the address (insert or update)
    const { data, error } = isEdit
      ? await query.update(payload).eq('id', initialData!.id as string).select().single()
      : await query.insert([payload]).select().single();

    if (error) {
      setIsLoading(false);
      console.error(error);
      setErrorMsg(error.message || 'Something went wrong');
      return;
    }

    const saved = data as Address;

    // 2) Enforce single-default-per-user:
    if (form.is_default) {
      const { error: clearErr } = await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId)
        .neq('id', saved.id);

      if (clearErr) {
        console.warn('Failed to clear other default addresses:', clearErr.message);
      }
    }

    setIsLoading(false);
    onSuccess(saved);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white">
      {/* Names */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="first_name" className="text-sm font-medium text-gray-900">First name *</label>
          <input
            id="first_name"
            value={form.first_name}
            onChange={(e) => setField('first_name', e.target.value)}
            className={`w-full border rounded-md px-3 py-2 border-gray-300 focus:outline-none focus:border-black ${errors.first_name ? 'border-red-500' : ''}`}
            placeholder="Enter first name"
            required
            aria-invalid={!!errors.first_name}
            aria-describedby={errors.first_name ? 'first_name_error' : undefined}
          />
          {errors.first_name && <p id="first_name_error" className="text-xs text-red-500">{errors.first_name}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="last_name" className="text-sm font-medium text-gray-900">Last name *</label>
          <input
            id="last_name"
            value={form.last_name}
            onChange={(e) => setField('last_name', e.target.value)}
            className={`w-full border rounded-md px-3 py-2 border-gray-300 focus:outline-none focus:border-black ${errors.last_name ? 'border-red-500' : ''}`}
            placeholder="Enter last name"
            required
            aria-invalid={!!errors.last_name}
            aria-describedby={errors.last_name ? 'last_name_error' : undefined}
          />
          {errors.last_name && <p id="last_name_error" className="text-xs text-red-500">{errors.last_name}</p>}
        </div>
      </div>

      {/* Address line 1 */}
      <div className="space-y-2">
        <label htmlFor="address1" className="text-sm font-medium text-gray-900">Address *</label>
        <input
          id="address1"
          value={form.address1}
          onChange={(e) => setField('address1', e.target.value)}
          className={`w-full border rounded-md px-3 py-2 border-gray-300 focus:outline-none focus:border-black ${errors.address1 ? 'border-red-500' : ''}`}
          placeholder="Enter street address"
          required
          aria-invalid={!!errors.address1}
          aria-describedby={errors.address1 ? 'address1_error' : undefined}
        />
        {errors.address1 && <p id="address1_error" className="text-xs text-red-500">{errors.address1}</p>}
      </div>

      {/* Address line 2 */}
      <div className="space-y-2">
        <label htmlFor="address2" className="text-sm font-medium text-gray-900">Apartment, suite, etc. (optional)</label>
        <input
          id="address2"
          value={form.address2}
          onChange={(e) => setField('address2', e.target.value)}
          className="w-full border rounded-md px-3 py-2 border-gray-300 focus:outline-none focus:border-black"
          placeholder="Apartment, suite, etc."
        />
      </div>

      {/* City / State / Postal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label htmlFor="city" className="text-sm font-medium text-gray-900">City *</label>
          <input
            id="city"
            value={form.city}
            onChange={(e) => setField('city', e.target.value)}
            className={`w-full border rounded-md px-3 py-2 border-gray-300 focus:outline-none focus:border-black ${errors.city ? 'border-red-500' : ''}`}
            placeholder="City"
            required
            aria-invalid={!!errors.city}
            aria-describedby={errors.city ? 'city_error' : undefined}
          />
          {errors.city && <p id="city_error" className="text-xs text-red-500">{errors.city}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="state" className="text-sm font-medium text-gray-900">State *</label>
          <select
            id="state"
            value={form.state}
            onChange={(e) => setField('state', e.target.value)}
            className={`w-full border rounded-md px-3 py-2 border-gray-300 focus:outline-none focus:border-black ${errors.state ? 'border-red-500' : ''}`}
            required
            aria-invalid={!!errors.state}
            aria-describedby={errors.state ? 'state_error' : undefined}
          >
            <option value="" disabled>Select state</option>
            <option value="Kuala Lumpur">Kuala Lumpur</option>
            <option value="Selangor">Selangor</option>
            <option value="Penang">Penang</option>
            <option value="Johor">Johor</option>
            <option value="Perak">Perak</option>
            <option value="Kedah">Kedah</option>
            <option value="Kelantan">Kelantan</option>
            <option value="Melaka">Melaka</option>
            <option value="Negeri Sembilan">Negeri Sembilan</option>
            <option value="Pahang">Pahang</option>
            <option value="Perlis">Perlis</option>
            <option value="Sabah">Sabah</option>
            <option value="Sarawak">Sarawak</option>
            <option value="Terengganu">Terengganu</option>
          </select>
          {errors.state && <p id="state_error" className="text-xs text-red-500">{errors.state}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="postal_code" className="text-sm font-medium text-gray-900">Postal code *</label>
          <input
            id="postal_code"
            value={form.postal_code}
            onChange={(e) => setField('postal_code', e.target.value)}
            className={`w-full border rounded-md px-3 py-2 border-gray-300 focus:outline-none focus:border-black ${errors.postal_code ? 'border-red-500' : ''}`}
            placeholder="Postal code"
            required
            aria-invalid={!!errors.postal_code}
            aria-describedby={errors.postal_code ? 'postal_error' : undefined}
          />
          {errors.postal_code && <p id="postal_error" className="text-xs text-red-500">{errors.postal_code}</p>}
        </div>
      </div>

      {/* Phone (mandatory) */}
      <div className="space-y-2">
        <label htmlFor="phone" className="text-sm font-medium text-gray-900">Phone number *</label>
        <input
          id="phone"
          value={form.phone}
          onChange={(e) => setField('phone', e.target.value)}
          className={`w-full border rounded-md px-3 py-2 border-gray-300 focus:outline-none focus:border-black ${errors.phone ? 'border-red-500' : ''}`}
          placeholder="+60 12-345 6789"
          required
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? 'phone_error' : undefined}
        />
        {errors.phone && <p id="phone_error" className="text-xs text-red-500">{errors.phone}</p>}
      </div>

      {/* Country */}
      <div className="space-y-2">
        <label htmlFor="country" className="text-sm font-medium text-gray-900">Country *</label>
        <select
          id="country"
          value={form.country}
          onChange={(e) => setField('country', e.target.value)}
          className={`w-full border rounded-md px-3 py-2 border-gray-300 focus:outline-none focus:border-black ${errors.country ? 'border-red-500' : ''}`}
          required
          aria-invalid={!!errors.country}
          aria-describedby={errors.country ? 'country_error' : undefined}
        >
          <option value="Malaysia">Malaysia</option>
          <option value="Singapore">Singapore</option>
          <option value="Indonesia">Indonesia</option>
        </select>
        {errors.country && <p id="country_error" className="text-xs text-red-500">{errors.country}</p>}
      </div>

      {/* Default checkbox */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is_default"
          checked={form.is_default}
          onChange={(e) => setField('is_default', e.target.checked)}
          className="rounded border-gray-300 focus:ring-black"
        />
        <label htmlFor="is_default" className="text-sm text-gray-700">
          Set as default address
        </label>
      </div>

      {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-6">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            disabled={isLoading}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 rounded-md bg-black text-white hover:bg-gray-900 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : initialData?.id ? 'Update Address' : 'Save Address'}
        </button>
      </div>
    </form>
  );
}
