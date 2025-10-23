'use client';

import { useEffect, useMemo, useState } from 'react';
import AddressForm from '@/app/account/address/AddressForm';
import type { Address } from '@/types/address';

interface Props {
  savedAddresses: Address[];
  selectedAddress: Address | null;
  setSelectedAddress: (a: Address | null) => void;
  onAddAddress: (a: Address) => void;

  onNext: () => void;
  step: 'address' | 'delivery' | 'payment';

  showEdit?: boolean;
  onEditRequest?: () => void;
  onCancelEdit?: () => void;
}

export default function AddressSection({
  savedAddresses,
  selectedAddress,
  setSelectedAddress,
  onAddAddress,
  onNext,
  step,
  showEdit = false,
  onEditRequest,
  onCancelEdit,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  const sorted = useMemo(() => {
    const copy = [...savedAddresses];
    copy.sort((a, b) => Number(b.is_default) - Number(a.is_default));
    return copy;
  }, [savedAddresses]);

  useEffect(() => {
    setAddresses(sorted);
    if (!selectedAddress && sorted.length) {
      const def = sorted.find(a => a.is_default) ?? sorted[0];
      setSelectedAddress(def);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorted]);

  const isActive = step === 'address';
  const isCompleted = step === 'delivery' || step === 'payment';

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    setAddresses(prev => prev.filter(a => a.id !== id));
    if (selectedAddress?.id === id) setSelectedAddress(null);
  };

  const startEdit = (address: Address) => {
    setEditingAddress(address);
    setShowForm(true);
    setCollapsed(false);
  };

  const cancelForm = () => {
    setEditingAddress(null);
    setShowForm(false);
  };

  if (isActive && collapsed) {
    return (
      <div className="pb-12">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[20px] leading-6 font-medium text-black">Delivery Address</h2>
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="text-sm text-gray-800 hover:underline"
          >
            Edit
          </button>
        </div>

        {selectedAddress && (
          <div className="text-sm text-gray-800 leading-relaxed">
            <p className="font-medium text-black mb-1">
              {selectedAddress.first_name} {selectedAddress.last_name}
            </p>
            {selectedAddress.address1 && <p>{selectedAddress.address1}</p>}
            {(selectedAddress.city || selectedAddress.state || selectedAddress.postal_code) && (
              <p>
                {selectedAddress.city && `${selectedAddress.city}, `}
                {selectedAddress.state && `${selectedAddress.state}, `}
                {selectedAddress.postal_code}
              </p>
            )}
            {selectedAddress.country && <p>{selectedAddress.country}</p>}
          </div>
        )}

        <div className="mt-8 h-[2px] bg-gradient-to-r from-gray-300 via-gray-500 to-gray-300" />
      </div>
    );
  }

  return (
    <div className="pb-12">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[20px] leading-6 font-medium text-black">Delivery Address</h2>

        {!isActive && showEdit && (
          <button
            type="button"
            onClick={onEditRequest}
            className="text-sm font-semibold text-gray-800 hover:underline"
          >
            Edit
          </button>
        )}

        {isActive && (
          <button
            type="button"
            onClick={() => {
              if (showForm) {
                cancelForm();
              } else {
                setCollapsed(true);
                onCancelEdit?.();
              }
            }}
            className="text-sm text-gray-500 hover:text-black"
          >
            Cancel
          </button>
        )}
      </div>

      {!showForm && (
        <p className="text-sm text-gray-600 mb-6 font-semibold">
          Select your delivery address or add a new one
        </p>
      )}

      {isCompleted && selectedAddress && (
        <>
          <div className="text-sm text-gray-800 leading-relaxed mb-8">
            <p className="font-medium text-black mb-1">
              {selectedAddress.first_name} {selectedAddress.last_name}
            </p>
            {selectedAddress.address1 && <p>{selectedAddress.address1}</p>}
            <p>
              {selectedAddress.postal_code} – {selectedAddress.country}
            </p>
          </div>
          <div className="h-[2px] bg-gradient-to-r from-gray-300 via-gray-500 to-gray-300 mb-8" />
        </>
      )}

      {/* List with 3 columns (Name | Address | Actions) */}
      {isActive && !showForm && (
        <>
          <div className="space-y-3">
            {addresses.map(address => {
              const isSelected = selectedAddress?.id === address.id;

              // Three fixed lines for the middle column
              const line1 = address.address1 || '';
              const line2 = [address.city, address.state].filter(Boolean).join(', ');
              const line3 = [address.postal_code, address.country]
                .filter(Boolean)
                .join(' – ');

              return (
                <div
                  key={address.id}
                  className={[
                    'border rounded-md px-5 py-3 transition-colors',
                    isSelected ? 'border-black' : 'border-gray-300 hover:border-gray-400',
                  ].join(' ')}
                >
                  {/* 12-col grid: 3 / 7 / 2 */}
                  <div className="grid grid-cols-12 items-start gap-4">
                    {/* (1) Radio + Name */}
                    <label className="col-span-12 md:col-span-3 flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="address"
                        checked={isSelected}
                        onChange={() => setSelectedAddress(address)}
                        className="accent-black"
                      />
                      <span className="text-sm font-bold text-black truncate">
                        {address.first_name} {address.last_name}
                      </span>
                    </label>

                    {/* (2) Address – three left-aligned lines */}
                    <div className="col-span-12 md:col-span-7 text-left break-words">
                      {line1 && <p className="text-sm font-semibold">{line1}</p>}
                      {line2 && <p className="text-sm font-semibold">{line2}</p>}
                      {line3 && <p className="text-sm font-semibold">{line3}</p>}
                    </div>

                    {/* (3) Actions */}
                    <div className="col-span-12 md:col-span-2 flex md:justify-end items-start gap-4 text-sm whitespace-nowrap">
                      {address.is_default && (
                        <span className="px-2 py-1 rounded-full text-xs font-extrabold border-2 text-green-700 border-green-700 bg-green-50">
                          Default
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => startEdit(address)}
                        className="font-extrabold text-gray-900 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(address.id)}
                        className="font-extrabold text-gray-900 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add New */}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setEditingAddress(null);
                setShowForm(true);
              }}
              className="inline-flex items-center gap-2 border-2 border-black rounded-full px-4 py-2 text-sm font-extrabold text-black hover:bg-black hover:text-white"
            >
              Add New Address <span className="text-base leading-none">+</span>
            </button>
          </div>

          {/* Confirm */}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              disabled={!selectedAddress}
              onClick={onNext}
              className={[
                'px-6 py-3 rounded-full text-sm font-semibold',
                selectedAddress
                  ? 'bg-black text-white hover:bg-gray-900'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed',
              ].join(' ')}
            >
              Confirm Delivery Address
            </button>
          </div>

          <div className="mt-8 h-[2px] bg-gradient-to-r from-gray-300 via-gray-500 to-gray-300" />
        </>
      )}

      {/* Add/Edit form */}
      {showForm && (
        <div className="mt-2">
          <AddressForm
            userId={selectedAddress?.user_id || addresses[0]?.user_id || 'demo-user'}
            initialData={editingAddress || undefined}
            onSuccess={(newAddr) => {
              setShowForm(false);
              setEditingAddress(null);

              const updated = editingAddress
                ? addresses.map(a => (a.id === editingAddress.id ? newAddr : a))
                : [newAddr, ...addresses];

              if (!editingAddress) onAddAddress(newAddr);
              setAddresses(updated);
              setSelectedAddress(newAddr);
            }}
            onCancel={() => {
              cancelForm();
              onCancelEdit?.();
            }}
          />
        </div>
      )}
    </div>
  );
}
