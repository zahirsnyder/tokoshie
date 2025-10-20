import { CartProvider } from "@/context/CartContext";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900">
        {/* ✅ Wrap all client components inside CartProvider */}
        <CartProvider>
          {/* ✅ Only one navbar — includes CartButton internally */}
          <Navbar />

          {/* Page Content */}
          <main className="pt-6">{children}</main>

          {/* Toast notifications */}
          <Toaster position="top-right" />
        </CartProvider>
      </body>
    </html>
  );
}
