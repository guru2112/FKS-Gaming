import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Allows Hot Module Replacement (HMR) to work on your mobile device IP
  allowedDevOrigins: ["192.168.1.16", "localhost"],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
    ],
  },

  // 🔥 ADDED: This allows the Google Login popup to communicate with your app
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },
};

export default nextConfig;