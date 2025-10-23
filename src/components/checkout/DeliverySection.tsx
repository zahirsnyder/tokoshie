'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import type { Address } from '@/types/address';

interface Props {
  step: 'address' | 'delivery' | 'payment';
  onNext: () => void;
  selectedAddress: Address | null;

  showEdit?: boolean;
  onEditRequest?: () => void;
  onCancelEdit?: () => void;
}

export default function DeliverySection({
  step,
  onNext,
  selectedAddress, // kept for parity if you later need address-specific delivery rules
  showEdit = false,
  onEditRequest,
  onCancelEdit,
}: Props) {
  const [selectedDelivery] = useState('standard');

  const isActive = step === 'delivery';
  const isCompleted = step === 'payment';
  const isDisabled = step === 'address';

  // ---- date helpers: tomorrow → +4 days from today -------------------------
  const estimateText = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() + 1); // next day
    const end = new Date(today);
    end.setDate(today.getDate() + 4); // 4 days onward from today

    const monthShort = (d: Date) => d.toLocaleString('en-US', { month: 'short' });

    const sameMonth = start.getMonth() === end.getMonth();
    const startStr = `${monthShort(start)} ${start.getDate()}`;
    const endStr = `${sameMonth ? '' : monthShort(end) + ' '}${end.getDate()}`;

    return `${startStr} - ${endStr}`;
  }, []);
  // --------------------------------------------------------------------------

  return (
    <div className={`pb-12 ${isDisabled ? 'opacity-50' : ''}`}>
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-medium text-black">Delivery Method</h2>

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
              onClick={onCancelEdit}
              className="text-sm text-gray-500 hover:text-black"
            >
              Cancel
            </button>
          )}
        </div>

      </div>

      {/* Completed State */}
      {isCompleted && (
        <>
          <div className="mb-8">
            <div className="text-sm text-gray-700 leading-relaxed">
              <p className="font-medium text-black mb-1">
                Standard delivery (Total RM10.00)
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-lg">📦</span>
                <p className="text-gray-700">
                  Estimated delivery between {estimateText}
                </p>
              </div>
            </div>
          </div>

          {/* Section divider */}
          <div className="h-[2px] bg-gradient-to-r from-gray-300 via-gray-500 to-gray-300" />
        </>
      )}

      {/* Active State */}
      {isActive && (
        <>
          <div className="space-y-8">
            <p className="text-sm text-gray-700">
              Standard delivery (Total RM10.00)
            </p>

            <div className="flex items-center space-x-3">
              <span className="text-lg">📦</span>
              <p className="text-sm text-gray-700">
                Estimated delivery between{' '}
                <span className="font-medium text-black">{estimateText}</span>
              </p>
            </div>

            <div className="flex justify-center md:justify-end pt-4">
              <Button
                onClick={onNext}
                className="bg-black text-white hover:bg-gray-800 py-3 px-8 rounded-lg font-medium text-sm"
              >
                Confirm Delivery Method
              </Button>
            </div>
          </div>

          {/* Section divider */}
          <div className="mt-8 h-[2px] bg-gradient-to-r from-gray-300 via-gray-500 to-gray-300" />
        </>
      )}
    </div>
  );
}
