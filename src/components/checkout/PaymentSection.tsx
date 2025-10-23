'use client';

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
        <div className="space-y-4">
          <p className="text-sm text-gray-700">Cryptocurrency</p>
          <p className="text-sm text-gray-600">
            Billing address <span className="font-medium">Same as Delivery</span>
          </p>

          {selectedAddress && (
            <div className="text-sm text-gray-700 leading-relaxed border rounded-md p-4">
              <p className="font-medium text-black">
                {selectedAddress.first_name} {selectedAddress.last_name}
              </p>
              {selectedAddress.address1 && <p>{selectedAddress.address1}</p>}
              {selectedAddress.address2 && <p>{selectedAddress.address2}</p>}
              <p>
                {selectedAddress.postal_code} - {selectedAddress.country}
              </p>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => onConfirm()}
              disabled={loading}
              className={`px-5 py-2 rounded-md text-sm font-semibold ${
                loading
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
