'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { getUserRole } from '@/lib/getUserRole';

// ✅ Improved Toast component (top right, more visible)
function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div className="fixed top-6 right-6 z-50">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white transition-all ${type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
      >
        {type === 'success' ? (
          <span className="text-lg">✅</span>
        ) : (
          <span className="text-lg">❌</span>
        )}
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}

export default function EditProfilePage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'customer' | 'company' | null>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // 🧍‍♂️ Customer fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');

  // 🏢 Company fields
  const [companyName, setCompanyName] = useState('');
  const [companySSM, setCompanySSM] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyAddress1, setCompanyAddress1] = useState('');
  const [companyAddress2, setCompanyAddress2] = useState('');
  const [companyPostcode, setCompanyPostcode] = useState('');
  const [companyCity, setCompanyCity] = useState('');
  const [companyState, setCompanyState] = useState('');
  const [companyCountry, setCompanyCountry] = useState('');

  // Dropdown data
  const malaysiaStates = [
    'Johor',
    'Kedah',
    'Kelantan',
    'Melaka',
    'Negeri Sembilan',
    'Pahang',
    'Penang',
    'Perak',
    'Perlis',
    'Sabah',
    'Sarawak',
    'Selangor',
    'Terengganu',
    'Kuala Lumpur',
    'Putrajaya',
    'Labuan',
  ];

  const singaporeStates = ['Central Singapore'];

  const stateOptions = companyCountry === 'Singapore' ? singaporeStates : malaysiaStates;

  // Toast helper
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  // Load user data
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

      const userRole = await getUserRole(currentUser.email || '');
      if (userRole === 'customer' || userRole === 'company') {
        setRole(userRole);
      }

      if (userRole === 'customer') {
        const { data: customer } = await supabase
          .from('customers')
          .select('*')
          .eq('id', currentUser.id)
          .single();

        if (customer) {
          const nameParts = (customer.full_name || '').split(' ');
          setFirstName(nameParts[0] || '');
          setLastName(nameParts.slice(1).join(' ') || '');
          setGender(customer.gender || '');
          setDob(customer.dob || '');
          setPhone(customer.phone || '');
        }
      }

      if (userRole === 'company') {
        const { data: company } = await supabase
          .from('companies')
          .select('*')
          .eq('auth_user_id', currentUser.id)
          .single();

        if (company) {
          setCompanyName(company.company_name || '');
          setCompanySSM(company.company_ssm || '');
          setCompanyPhone(company.company_phone || '');
          setCompanyAddress1(company.company_address1 || '');
          setCompanyAddress2(company.company_address2 || '');
          setCompanyPostcode(company.company_postcode || '');
          setCompanyCity(company.company_city || '');
          setCompanyState(company.company_state || '');
          setCompanyCountry(company.company_country || 'Malaysia');
        }
      }

      setLoading(false);
    };

    loadUser();
  }, [supabase, router]);

  // ✅ Submit customer updates
  const handleSubmitCustomer = async () => {
    if (!user) return;
    const fullName = `${firstName} ${lastName}`.trim();

    const { error } = await supabase
      .from('customers')
      .update({ full_name: fullName, gender, dob, phone })
      .eq('id', user.id);

    if (error) showToast('Failed to update profile.', 'error');
    else {
      showToast('Profile updated successfully!', 'success');
      setTimeout(() => router.push('/account/profile'), 2000);
    }
  };

  // ✅ Submit company updates
  const handleSubmitCompany = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('companies')
      .update({
        company_name: companyName,
        company_ssm: companySSM,
        company_phone: companyPhone,
        company_address1: companyAddress1,
        company_address2: companyAddress2,
        company_postcode: companyPostcode,
        company_city: companyCity,
        company_state: companyState,
        company_country: companyCountry,
      })
      .eq('auth_user_id', user.id);

    if (error) showToast('Failed to update company profile.', 'error');
    else {
      showToast('Company profile updated successfully!', 'success');
      setTimeout(() => router.push('/account/profile'), 2000);
    }
  };

  // ✉️ Resend verification
  const handleVerifyEmail = async () => {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) showToast('Failed to send verification email.', 'error');
    else showToast('Verification email sent.', 'success');
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
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className="max-w-4xl mx-auto space-y-10">
        {/* Back Link & Title */}
        <div>
          <Link href="/account/profile" className="text-sm text-green-800 hover:underline">
            ← Back
          </Link>
          <h1 className="text-3xl font-bold mt-2">My Account</h1>
        </div>

        {/* CUSTOMER FORM */}
        {role === 'customer' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Personal Details</h2>
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

            <div className="flex gap-4 justify-end mt-4">
              <button
                onClick={handleSubmitCustomer}
                className="px-6 py-2 bg-green-800 text-white rounded-full text-sm hover:bg-green-900"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* COMPANY FORM */}
        {role === 'company' && (
          <div className="space-y-6 text-sm">
            <h2 className="text-lg font-semibold">Company Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Company Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="border border-black rounded-full px-4 py-2 w-full"
              />
              <input
                type="text"
                placeholder="SSM Number"
                value={companySSM}
                onChange={(e) => setCompanySSM(e.target.value)}
                className="border border-black rounded-full px-4 py-2 w-full"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={companyPhone}
                onChange={(e) => setCompanyPhone(e.target.value)}
                className="border border-black rounded-full px-4 py-2 w-full"
              />
              <input
                type="email"
                disabled
                value={email}
                className="border border-black rounded-full px-4 py-2 w-full bg-gray-100 text-gray-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Address Line 1"
                value={companyAddress1}
                onChange={(e) => setCompanyAddress1(e.target.value)}
                className="border border-black rounded-full px-4 py-2 w-full"
              />
              <input
                type="text"
                placeholder="Address Line 2"
                value={companyAddress2}
                onChange={(e) => setCompanyAddress2(e.target.value)}
                className="border border-black rounded-full px-4 py-2 w-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Postcode"
                value={companyPostcode}
                onChange={(e) => setCompanyPostcode(e.target.value)}
                className="border border-black rounded-full px-4 py-2 w-full"
              />
              <input
                type="text"
                placeholder="City"
                value={companyCity}
                onChange={(e) => setCompanyCity(e.target.value)}
                className="border border-black rounded-full px-4 py-2 w-full"
              />
              <select
                value={companyState}
                onChange={(e) => setCompanyState(e.target.value)}
                className="border border-black rounded-full px-4 py-2 w-full text-gray-700"
              >
                <option value="">Select State</option>
                {stateOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={companyCountry}
              onChange={(e) => {
                setCompanyCountry(e.target.value);
                setCompanyState('');
              }}
              className="border border-black rounded-full px-4 py-2 w-full text-gray-700"
            >
              <option value="Malaysia">Malaysia</option>
              <option value="Singapore">Singapore</option>
            </select>

            <div className="flex justify-end">
              <button
                onClick={handleSubmitCompany}
                className="px-6 py-2 bg-green-800 text-white rounded-full text-sm hover:bg-green-900"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

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

      {/* Cancel Modal */}
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
