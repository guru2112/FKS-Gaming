"use client";

import { useEffect, useState } from "react";
import { fetchProfile, type Profile } from "@/lib/auth";

import Link from "next/link";
import HelpSupportSection from "@/components/HelpSupportSection";

export default function HelpSupportPage() {

  const [, setProfile] = useState<Profile | null>(() => {
    if (typeof window === "undefined") return null;
    const savedProfile = localStorage.getItem("profile");
    if (!savedProfile) return null;
    try {
      return JSON.parse(savedProfile) as Profile;
    } catch (err) {
      console.error(err);
      return null;
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const token = localStorage.getItem("auth_token") || "";
    const role = localStorage.getItem("auth_role") || "";

    if (!token) {
      window.location.href = "/login";
      return;
    }

    if (role === "admin") {
      window.location.href = "/admin";
      return;
    }

    async function load() {
      try {
        setIsLoading(true);
        const fresh = await fetchProfile(token);
        localStorage.setItem("profile", JSON.stringify(fresh));
        setProfile(fresh);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile.");
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FDF8F5]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#ff6b35]/20 border-t-[#ff6b35]" />
          <p className="font-display text-sm uppercase tracking-widest text-[#ff6b35]">
            Loading Support...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#FDF8F5] text-[#1A1A1A] overflow-hidden selection:bg-[#ff6b35] selection:text-white relative">

      {/* Subtle Background Grid Pattern */}


      {/* MAIN */}
      <div className="flex flex-col w-full h-full relative min-w-0 z-10 max-w-4xl mx-auto">
        {/* HEADER AREA */}
        <div className="shrink-0 w-full bg-[#FDF8F5]/90 backdrop-blur-xl border-b border-[#ff6b35]/20 z-40">
          <div className="px-6 py-5 w-full flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-600 hover:text-[#ff6b35] transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto w-full">
          <div className="px-6 py-8 pb-20 w-full max-w-350 mx-auto">
            <main className="space-y-6">

              {error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm font-medium">
                  {error}
                </div>
              )}

              {/* TITLE */}
              <div className="px-2">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ff6b35]">
                  Support Center
                </p>
                <h2 className="mt-2 font-display text-3xl sm:text-4xl text-[#1A1A1A] tracking-tight">
                  Help & <span className="text-[#ff6b35]">Support</span>
                </h2>
              </div>

              {/* CONTENT LAYOUT */}
              <div className="w-full">
                <HelpSupportSection isDark={false} />
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}