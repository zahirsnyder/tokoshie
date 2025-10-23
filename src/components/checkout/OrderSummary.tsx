'use client';

import Image from 'next/image';
import type { CartItem } from '@/context/CartContext';

interface Props {
  cartItems: CartItem[];
  total: number; // subtotal from cart context
}

export default function OrderSummary({ cartItems, total }: Props) {
  const delivery = 10.0;
  const grandTotal = total + delivery;

  return (
    <aside className="space-y-6 text-sm">
      <div>
        <h2 className="text-base font-semibold mb-4">Summary</h2>

        {cartItems.map((item) => {
          // ---- Optional fields without changing CartItem ----
          const rec = item as unknown as Record<string, unknown>;
          const image =
            (typeof rec.image === 'string' && rec.image) ||
            (typeof rec.image_url === 'string' && rec.image_url) ||
            '/placeholder.jpg';
          const size = typeof rec.size === 'string' ? rec.size : undefined;
          const color = typeof rec.color === 'string' ? rec.color : undefined;

          return (
            <div key={item.id} className="flex gap-4 mb-4">
              <div className="w-16 h-16 relative rounded overflow-hidden flex-shrink-0">
                <Image
                  src={image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.name}</p>
                <div className="text-gray-500">
                  <span>Qty: {item.quantity}</span>
                  {size && <span className="ml-2">· Size: {size}</span>}
                  {color && <span className="ml-2">· Color: {color}</span>}
                </div>
                <p className="text-gray-800 font-medium">
                  RM {(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          );
        })}

        <div className="space-y-1 border-t pt-4">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>RM {total.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>Delivery</span>
            <span>RM {delivery.toFixed(2)}</span>
          </div>

          <div className="flex justify-between font-semibold border-t pt-2 mt-2">
            <span>Total</span>
            <span>RM {grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="promo" className="block text-sm mb-1">
            Promo code
          </label>
          <input
            id="promo"
            placeholder="Enter promo code"
            className="w-full border px-4 py-2 rounded text-sm focus:outline-none focus:border-black border-gray-300"
          />
        </div>
      </div>

      <p className="text-xs text-center text-gray-500">
        By placing your order, you agree to our{' '}
        <a href="#" className="underline">
          Terms
        </a>{' '}
        and{' '}
        <a href="#" className="underline">
          Privacy Policy
        </a>
        .
      </p>
    </aside>
  );
}
