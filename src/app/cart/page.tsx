"use client";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { cartItems, removeItem, increaseQty, decreaseQty, total } = useCart();

  if (!cartItems.length)
    return (
      <main className="max-w-5xl mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Your Cart</h1>
        <p className="text-gray-500">Your cart is empty.</p>
        <a
          href="/shop"
          className="inline-block mt-4 text-green-700 hover:underline font-medium"
        >
          Continue shopping →
        </a>
      </main>
    );

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
        <a
          href="/shop"
          className="text-green-700 hover:underline text-sm font-medium"
        >
          Continue shopping
        </a>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-3 border-b pb-3 mb-4 text-gray-500 text-xs tracking-wide uppercase">
        <span>Product</span>
        <span className="text-center">Quantity</span>
        <span className="text-right">Total</span>
      </div>

      {/* Cart Items */}
      <ul className="space-y-8">
        {cartItems.map((item, index) => (
          <li
            key={`${item.id}-${index}`}
            className="grid grid-cols-3 items-center pb-8 border-b border-gray-200"
          >
            {/* Product Info */}
            <div className="flex items-center gap-5">
              <img
                src={item.image_url}
                alt={item.name}
                className="w-28 h-28 object-cover rounded-lg shadow-sm"
              />
              <div>
                <h2 className="font-medium text-lg text-gray-900">
                  {item.name}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {item.category || "Matcha"}
                </p>
              </div>
            </div>

            {/* Quantity Controls */}
            <div className="flex justify-center items-center">
              <div className="flex items-center bg-gray-50 border border-gray-300 rounded-full overflow-hidden">
                <button
                  onClick={() => decreaseQty(item.id)}
                  className="px-3 py-1 text-lg font-medium text-gray-600 hover:bg-gray-100"
                >
                  −
                </button>
                <span className="px-4 text-gray-800">{item.quantity}</span>
                <button
                  onClick={() => increaseQty(item.id)}
                  className="px-3 py-1 text-lg font-medium text-gray-600 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="ml-4 text-gray-400 hover:text-red-500 transition"
                title="Remove"
              >
                🗑
              </button>
            </div>

            {/* Item Total */}
            <div className="text-right">
              <p className="font-semibold text-gray-900">
                RM {(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="mt-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="w-full md:w-1/3 bg-gray-50 border border-gray-300 rounded-xl p-5 text-gray-700 text-sm">
          <p className="font-semibold text-gray-800 mb-1">Vouchers</p>
          <p>Don’t forget to apply before checkout</p>
        </div>

        <div className="w-full md:w-1/3 text-right">
          <p className="text-sm text-gray-500 mb-1">
            Shipping, taxes, and discounts will be calculated at checkout.
          </p>
          <p className="text-lg font-bold mb-4">
            Subtotal:{" "}
            <span className="text-green-700">
              RM {total.toFixed(2)}
            </span>
          </p>
          <a
            href="/checkout"
            className="block w-full md:w-auto bg-green-700 text-white font-medium text-center px-8 py-3 rounded-lg hover:bg-green-800 transition"
          >
            Checkout
          </a>
        </div>
      </div>
    </main>
  );
}
