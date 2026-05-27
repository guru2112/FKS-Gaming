import type { Metadata } from "next";

import {
  Bebas_Neue,
  Space_Grotesk,
} from "next/font/google";

import { Toaster } from "sonner";
import PushNotificationManager from "@/components/PushNotificationManager";

import "./globals.css";

// =========================================================
// 🔥 FONTS
// =========================================================

const displayFont =
  Bebas_Neue({
    variable:
      "--font-display",

    subsets: ["latin"],

    weight: "400",
  });

const bodyFont =
  Space_Grotesk({
    variable:
      "--font-body",

    subsets: ["latin"],
  });

// =========================================================
// 🔥 METADATA
// =========================================================

export async function generateMetadata(): Promise<Metadata> {
  let faviconUrl = "/favicon.ico"; // Default fallback

  try {
    // Provide a solid production fallback so it doesn't try localhost on Vercel
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://fks-gaming.onrender.com";
    // Allow static generation by caching for 1 hour instead of 'no-store'
    const res = await fetch(`${apiUrl}/api/media/logo`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      if (data && data.secure_url) {
        // Append timestamp to break aggressive browser favicon caching
        faviconUrl = `${data.secure_url}?v=${Date.now()}`;
      }
    }
  } catch (err) {
    console.error("Failed to fetch dynamic favicon:", err);
  }

  return {
    title: "JKS Arena | Gaming Cafe",
    description: "Competitive gaming nights, premium rigs, and a cafe built for squads.",
    icons: {
      icon: faviconUrl,
      shortcut: faviconUrl,
      apple: faviconUrl,
    },
  };
}

// =========================================================
// 🔥 ROOT LAYOUT
// =========================================================

export default function RootLayout({

  children,

}: Readonly<{
  children: React.ReactNode;
}>) {

  return (

    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable} h-full antialiased`}
    >

      <body className="min-h-full flex flex-col text-slate-900">

        <PushNotificationManager />

        {children}

        <Toaster
          theme="dark"
          position="top-right"
          richColors
          toastOptions={{
            style: {
              background: "#1a1a1a",
              border: "1px solid rgba(255, 107, 53, 0.2)",
              color: "#fff",
              fontFamily: "var(--font-body)",
            },
          }}
        />

      </body>

    </html>

  );

}