import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Dev origins for HMR (no hardcoded IPs)
  // Add your local network IP here ONLY for local dev if needed
  allowedDevOrigins: ["localhost"],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      {
        // Allow lh3.googleusercontent.com for Google profile pictures
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
    ],
  },

  // ✅ Required for Google OAuth popup communication
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },

  // ✅ Disable x-powered-by header for security
  poweredByHeader: false,
};

export default nextConfig;