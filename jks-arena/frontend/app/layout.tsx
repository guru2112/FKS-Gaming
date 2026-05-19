import type { Metadata } from "next";

import {
  Bebas_Neue,
  Space_Grotesk,
} from "next/font/google";

import { Toaster } from "sonner";

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

export const metadata:
  Metadata = {

  title:
    "JKS Arena | Gaming Cafe",

  description:
    "Competitive gaming nights, premium rigs, and a cafe built for squads.",

};

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