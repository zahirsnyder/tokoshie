import { CartProvider } from "@/context/CartContext";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import { Noto_Serif_JP } from "next/font/google";

const notoJP = Noto_Serif_JP({ subsets: ["latin"], weight: ["400", "700"] });

export const metadata = {
  title: "TOKOSHIE Matcha | Premium Japanese Matcha Powder",
  description:
    "Discover TOKOSHIE — premium ceremonial-grade matcha directly from Kyoto. Freshly stone-ground, crafted for modern taste.",
  openGraph: {
    title: "TOKOSHIE Matcha",
    description: "A timeless Japanese ritual — crafted for modern taste.",
    images: ["https://leeietrnrohkqubdcqzk.supabase.co/storage/v1/object/public/product-images/Matcha%20product%20size.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "TOKOSHIE Matcha",
    description: "Premium ceremonial matcha, freshly packed for Malaysia.",
    images: ["https://leeietrnrohkqubdcqzk.supabase.co/storage/v1/object/public/product-images/Matcha%20product%20size.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 {notoJP.className}">
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
