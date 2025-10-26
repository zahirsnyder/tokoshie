'use client';

import { useState } from 'react';
import type { Address } from '@/types/address';

interface Props {
  step: 'address' | 'delivery' | 'payment';
  loading: boolean;
  error: string | null;
  onConfirm: () => Promise<void> | void;
  selectedAddress: Address | null;

  showEdit?: boolean;
  onEditRequest?: () => void;
}

export default function PaymentSection({
  step,
  loading,
  error,
  onConfirm,
  selectedAddress,
  showEdit = false,
  onEditRequest,
}: Props) {
  const isActive = step === 'payment';
  const [method, setMethod] = useState<'fpx' | 'card'>('fpx');

  return (
    <section className="pt-6 !border-0 !shadow-none !rounded-none">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Payment</h3>

        {!isActive && showEdit && (
          <button
            type="button"
            onClick={onEditRequest}
            className="text-sm text-gray-800 hover:underline"
          >
            Edit
          </button>
        )}
      </div>

      {!isActive ? (
        <p className="text-sm text-gray-600">Delivery method confirmed.</p>
      ) : (
        <div className="space-y-6">
          {/* Payment Method Selection */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-800">Select Payment Method</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                className={`border rounded-md p-4 cursor-pointer transition-all ${method === 'fpx'
                    ? 'border-black ring-2 ring-black'
                    : 'border-gray-300 hover:border-gray-400'
                  }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="fpx"
                  checked={method === 'fpx'}
                  onChange={() => setMethod('fpx')}
                  className="hidden"
                />
                <div className="flex items-center gap-3">
                  <span className="text-lg">🏦</span>
                  <span className="text-sm font-semibold text-gray-800">FPX Online Banking</span>
                </div>
              </label>

              <label
                className={`border rounded-md p-4 cursor-pointer transition-all ${method === 'card'
                    ? 'border-black ring-2 ring-black'
                    : 'border-gray-300 hover:border-gray-400'
                  }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={method === 'card'}
                  onChange={() => setMethod('card')}
                  className="hidden"
                />
                <div className="flex items-center gap-3">
                  <span className="text-lg">💳</span>
                  <span className="text-sm font-semibold text-gray-800">Debit / Credit Card</span>
                </div>
              </label>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => onConfirm()}
              disabled={loading}
              className={`px-5 py-2 rounded-md text-sm font-semibold ${loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-900'
                }`}
            >
              {loading ? 'Placing order…' : 'Place Order'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
