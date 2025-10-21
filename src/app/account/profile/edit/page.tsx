'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';

export default function EditProfilePage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [user, setUser] = useState<User | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);

  // ✅ Modal state
  const [showCancelModal, setShowCancelModal] = useState(false);

  // ✅ Load user and customer data
  useEffect(() => {
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.push('/account/login');
        return;
      }

      const currentUser = data.user;
      setUser(currentUser);
      setEmail(currentUser.email || '');

      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (customer && !customerError) {
        const nameParts = (customer.full_name || '').split(' ');
        setFirstName(nameParts[0] || '');
        setLastName(nameParts.slice(1).join(' ') || '');
        setGender(customer.gender || '');
        setDob(customer.dob || '');
        setPhone(customer.phone || '');
      }

      setLoading(false);
    };

    loadUser();
  }, [supabase, router]);

  const handleSubmit = async () => {
    if (!user) return;
    const fullName = `${firstName} ${lastName}`.trim();

    const { error } = await supabase
      .from('customers')
      .update({ full_name: fullName, gender, dob, phone })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating customer:', error.message);
      alert('Failed to update profile. Please try again.');
    } else {
      alert('Profile updated successfully!');
      router.push('/account/profile');
    }
  };

  const handleVerifyEmail = async () => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    if (error) {
      alert('Failed to send verification email.');
    } else {
      alert('Verification email sent.');
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white text-gray-600">
        Loading your profile...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white py-10 px-4 md:px-10 text-gray-800">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Back Link & Title */}
        <div>
          <Link href="/account/profile" className="text-sm text-green-800 hover:underline">
            ← Back
          </Link>
          <h1 className="text-3xl font-bold mt-2">My Account</h1>
        </div>

        {/* Account Details */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Account Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="border border-black rounded-full px-4 py-2 w-full"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="border border-black rounded-full px-4 py-2 w-full"
            />
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="border border-black rounded-full px-4 py-2 w-full text-gray-700"
            >
              <option value="">Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="border border-black rounded-full px-4 py-2 w-full text-gray-700"
            />
            <input
              type="email"
              disabled
              value={email}
              className="border border-black rounded-full px-4 py-2 w-full text-gray-500 bg-gray-100"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border border-black rounded-full px-4 py-2 w-full"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 justify-end mt-4">
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-green-800 text-white rounded-full text-sm hover:bg-green-900"
            >
              Submit
            </button>
          </div>
        </div>

        {/* Address Section */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Primary Address</h2>
          <div className="border border-gray-200 rounded-md p-4">
            <p className="font-medium">{firstName || 'No name'}</p>
            <Link
              href="/account/address"
              className="text-sm text-green-800 hover:underline"
            >
              View Addresses
            </Link>
          </div>
        </div>

        {/* Authentication Section */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Authentication Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-md p-4 space-y-1">
              <p className="font-medium flex items-center gap-1">🔒 Password</p>
              <Link
                href="/account/change-password"
                className="text-sm text-green-800 hover:underline"
              >
                Change password
              </Link>
            </div>
            <div className="border border-gray-200 rounded-md p-4 space-y-1">
              <p className="font-medium flex items-center gap-1">📧 Email</p>
              <p className="text-sm text-gray-700">{email}</p>
              {!user?.email_confirmed_at && (
                <button
                  onClick={handleVerifyEmail}
                  className="text-sm text-green-800 hover:underline"
                >
                  Verify now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 🔴 Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center shadow-lg">
            <h2 className="text-lg font-semibold mb-2">Discard changes?</h2>
            <p className="text-sm text-gray-700 mb-4">
              Are you sure you want to cancel? Any unsaved changes will be lost.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 border rounded-full text-sm text-gray-700 hover:bg-gray-100"
              >
                No, stay
              </button>
              <button
                onClick={() => router.push('/account/profile')}
                className="px-4 py-2 bg-red-600 text-white rounded-full text-sm hover:bg-red-700"
              >
                Yes, cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
