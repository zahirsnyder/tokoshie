'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import AddressForm from './AddressForm';

type Address = {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  company: string;
  address1: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  postal_code: string;
  is_default: boolean;
  created_at?: string;
};

export default function AddressPage() {
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editAddressId, setEditAddressId] = useState<string | null>(null);

  // modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);

  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) return router.push('/account/login');

      setUser(data.user);

      const { data: addressList } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', data.user.id)
        .order('created_at', { ascending: false });

      // optional: keep default at the top
      const sorted = (addressList || []).sort(
        (a, b) => Number(b.is_default) - Number(a.is_default)
      );
      setAddresses(sorted);
    };

    fetchData();
  }, [supabase, router]);

  // helper to apply "only one default" locally and keep default first
  const applyDefaultRule = (prev: Address[], updated: Address) => {
    const exists = prev.some(a => a.id === updated.id);
    let next = exists
      ? prev.map(a => (a.id === updated.id ? { ...a, ...updated } : a))
      : [updated, ...prev];

    if (updated.is_default) {
      next = next.map(a => (a.id === updated.id ? a : { ...a, is_default: false }));
    }

    // keep default first (and then by created_at desc if you like)
    next.sort((a, b) => {
      const defDelta = Number(b.is_default) - Number(a.is_default);
      if (defDelta !== 0) return defDelta;
      const ta = a.created_at ? Date.parse(a.created_at) : 0;
      const tb = b.created_at ? Date.parse(b.created_at) : 0;
      return tb - ta;
    });
    return next;
  };

  const handleAddressAdded = (newAddress: Address) => {
    setAddresses(prev => applyDefaultRule(prev, newAddress));
    setShowForm(false);
  };

  const handleAddressUpdated = (updated: Address) => {
    setAddresses(prev => applyDefaultRule(prev, updated));
    setEditAddressId(null);
  };

  const handleDeleteClick = (address: Address) => {
    setAddressToDelete(address);
    setShowDeleteModal(true);
  };

  // actual deletion after user confirms in modal
  const handleDeleteConfirm = async () => {
    if (!addressToDelete) return;

    const { error } = await supabase.from('addresses').delete().eq('id', addressToDelete.id);

    if (!error) {
      setAddresses(prev => prev.filter(addr => addr.id !== addressToDelete.id));
      setShowDeleteModal(false);
      setAddressToDelete(null);
      if (editAddressId === addressToDelete.id) setEditAddressId(null);
    } else {
      alert('Failed to delete address.');
    }
  };

  return (
    <main className="min-h-screen py-10 px-4 md:px-10 bg-white text-gray-800">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Your Addresses</h1>
            <Link href="/account/profile" className="text-sm text-green-800 hover:underline">
              ← Return to Account Details
            </Link>
          </div>
          <button
            onClick={() => {
              setShowForm(s => !s);
              setEditAddressId(null); // close edit if open
            }}
            className="bg-green-800 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-green-900"
          >
            {showForm ? 'Cancel' : 'Add a New Address'}
          </button>
        </div>

        {/* ADD NEW FORM */}
        {showForm && user && (
          <div className="mb-8">
            <AddressForm userId={user.id} onSuccess={handleAddressAdded} />
          </div>
        )}

        {/* LIST ADDRESSES */}
        {addresses.length > 0 ? (
          <div className="space-y-6">
            {addresses.map(address => (
              <div key={address.id} className="border border-gray-200 rounded-md p-4">
                <p className="font-semibold">
                  {address.first_name} {address.last_name}{' '}
                  {address.is_default && (
                    <span className="text-sm text-green-800 font-medium">(Default)</span>
                  )}
                </p>
                <p>{address.address1}</p>
                {address.address2 && <p>{address.address2}</p>}
                <p>
                  {address.postal_code} {address.city}
                </p>
                <p>{address.state}</p>
                <p>{address.country}</p>
                <p className="text-sm text-gray-600">{address.phone}</p>

                <div className="mt-2 flex gap-4 text-sm">
                  <button
                    onClick={() => setEditAddressId(editAddressId === address.id ? null : address.id)}
                    className="text-green-800 hover:underline"
                  >
                    {editAddressId === address.id ? 'Cancel Edit' : 'Edit'}
                  </button>

                  <span className="text-gray-300">|</span>

                  <button
                    onClick={() => handleDeleteClick(address)}
                    className="text-red-700 hover:underline"
                  >
                    Delete
                  </button>
                </div>

                {/* EDIT FORM */}
                {editAddressId === address.id && (
                  <div className="mt-6">
                    <h3 className="text-md font-semibold mb-2">Edit address</h3>
                    <AddressForm
                      userId={user!.id}
                      initialData={address}
                      onSuccess={handleAddressUpdated}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">You haven’t added any addresses yet.</p>
        )}
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 border border-gray-300 shadow-xl w/full max-w-sm text-center">
            <h2 className="text-lg font-semibold mb-2">Delete Address</h2>
            <p className="text-sm text-gray-700 mb-6">
              Are you sure you want to delete this address?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setAddressToDelete(null);
                }}
                className="px-4 py-2 border rounded-full text-sm text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-full text-sm hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
