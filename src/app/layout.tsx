import { CartProvider } from "@/context/CartContext";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import NavbarWrapper from "@/components/NavbarWrapper";
import MainWrapper from "@/components/MainWrapper";
import { Noto_Serif_JP } from "next/font/google";
import { Suspense } from "react"; // ✅ Add Suspense

const notoJP = Noto_Serif_JP({ subsets: ["latin"], weight: ["400", "700"] });

export const metadata = {
  title: "TOKOSHIE Matcha | Premium Japanese Matcha Powder",
  description:
    "Discover TOKOSHIE — premium ceremonial-grade matcha directly from Kyoto. Freshly stone-ground, crafted for modern taste.",
  openGraph: {
    title: "TOKOSHIE Matcha",
    description: "A timeless Japanese ritual — crafted for modern taste.",
    images: [
      "https://leeietrnrohkqubdcqzk.supabase.co/storage/v1/object/public/product-images/Matcha%20product%20size.png",
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TOKOSHIE Matcha",
    description: "Premium ceremonial matcha, freshly packed for Malaysia.",
    images: [
      "https://leeietrnrohkqubdcqzk.supabase.co/storage/v1/object/public/product-images/Matcha%20product%20size.png",
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`bg-white text-gray-900 ${notoJP.className}`}>
        <CartProvider>
          <div className="print:hidden">
            <NavbarWrapper />
          </div>

          <MainWrapper>
            {/* ✅ Wrap children in Suspense */}
            <Suspense fallback={<div>Loading...</div>}>
              {children}
            </Suspense>
          </MainWrapper>

          <Toaster position="top-right" />
        </CartProvider>
      </body>
    </html>
  );
}
