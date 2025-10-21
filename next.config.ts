import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseUrl.replace("https://", ""),
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
