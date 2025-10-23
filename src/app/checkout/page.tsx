'use client';

import { useCart } from '@/context/CartContext';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { User } from '@supabase/supabase-js';
import AddressSection from '@/components/checkout/AddressSection';
import DeliverySection from '@/components/checkout/DeliverySection';
import PaymentSection from '@/components/checkout/PaymentSection';
import OrderSummary from '@/components/checkout/OrderSummary';
import type { Address } from '@/types/address';

export default function CheckoutPage() {
  const { cartItems, total, clearCart } = useCart();
  const supabase = createClientComponentClient();

  const [user, setUser] = useState<User | null>(null);
  const [step, setStep] = useState<'address' | 'delivery' | 'payment'>('address');

  // which panel is currently being edited (null = none → show Edit on all sections)
  const [activePanel, setActivePanel] = useState<null | 'address' | 'delivery' | 'payment'>(null);

  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      const u = data?.user;
      if (!u) return;
      setUser(u);

      const { data: addresses } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', u.id);

      setSavedAddresses(addresses || []);
      const def = addresses?.find(a => a.is_default);
      if (def) setSelectedAddress(def);
    };
    loadUser();
  }, [supabase]);

  const handleConfirmOrder = async () => {
    setLoading(true);
    setErrMsg(null);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: selectedAddress, items: cartItems, total }),
      });
      if (!res.ok) throw new Error('Order failed');
      setOrderPlaced(true);
      clearCart();
    } catch (err) {
      console.error(err);
      setErrMsg('Order failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <main className="max-w-2xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold text-green-700 mb-4">Order Confirmed</h1>
        <p className="text-gray-700">Thanks for your order.</p>
      </main>
    );
  }

  const noTabActive = activePanel === null;
  const showEditAddress  = noTabActive || activePanel === 'address';
  const showEditDelivery = noTabActive || activePanel === 'delivery';
  const showEditPayment  = noTabActive || activePanel === 'payment';

  return (
    <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 px-4 py-10 text-gray-900">
      <section className="md:col-span-2 space-y-10 !border-0 !shadow-none !rounded-none">
        <AddressSection
          savedAddresses={savedAddresses}
          selectedAddress={selectedAddress}
          setSelectedAddress={setSelectedAddress}
          onAddAddress={(addr) => setSavedAddresses(prev => [addr, ...prev])}
          onNext={() => {
            setStep('delivery');
            setActivePanel(null); // close active edit so all Edit buttons reappear
          }}
          step={step}
          showEdit={showEditAddress}
          onEditRequest={() => {
            setStep('address');
            setActivePanel('address');
          }}
          onCancelEdit={() => setActivePanel(null)}
        />

        <DeliverySection
          step={step}
          onNext={() => {
            setStep('payment');
            setActivePanel(null);
          }}
          selectedAddress={selectedAddress}
          showEdit={showEditDelivery}
          onEditRequest={() => {
            setStep('delivery');
            setActivePanel('delivery');
          }}
          onCancelEdit={() => setActivePanel(null)}
        />

        <PaymentSection
          step={step}
          loading={loading}
          error={errMsg}
          onConfirm={handleConfirmOrder}
          selectedAddress={selectedAddress}
          showEdit={showEditPayment}
          onEditRequest={() => {
            setStep('payment');
            setActivePanel('payment');
          }}
        />
      </section>

      <OrderSummary cartItems={cartItems} total={total} />
    </main>
  );
}
