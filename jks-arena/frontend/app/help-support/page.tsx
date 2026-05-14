"use client";

import { useEffect, useState, useMemo } from "react";

import { API_BASE_URL, type Profile } from "@/lib/auth";

import Sidebar from "@/components/dashboard/Sidebar";
import MobileMenu from "@/components/dashboard/MobileMenu";
import Header from "@/components/dashboard/Header";
import HelpSupportSection from "@/components/HelpSupportSection";

export default function HelpSupportPage() {

  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = useMemo(
    () => [
      { name: "Dashboard", href: "/dashboard" },
      { name: "Book Slot", href: "/book" },
      { name: "My Sessions", href: "/dashboard#history" },
      { name: "Games Library", href: "/dashboard#games" },
      { name: "Settings", href: "/settings" },
      { name: "Help & Support", href: "/help-support" },
    ],
    []
  );

  const fetchFreshProfile = async (token: string) => {
    const res = await fetch(`${API_BASE_URL}/api/user/me?t=${Date.now()}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch profile");
    return await res.json();
  };

  function handleLogout() {
    localStorage.clear();
    window.location.href = "/login";
  }

  function getInitials(name?: string) {
    if (!name) return "U";
    return (
      name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("") || "U"
    );
  }

  useEffect(() => {
    const token = localStorage.getItem("auth_token") || "";
    const role = localStorage.getItem("auth_role") || "";

    const savedProfile = localStorage.getItem("profile");
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (err) {
        console.error(err);
      }
    }

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
        const fresh = await fetchFreshProfile(token);
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
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none bg-[linear-gradient(to_right,#80808020_1px,transparent_1px),linear-gradient(to_bottom,#80808020_1px,transparent_1px)] bg-size-[24px_24px]"></div>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
        profile={profile}
        getInitials={getInitials}
        handleLogout={handleLogout}
        navItems={navItems}
      />

      {/* SIDEBAR */}
      <div className="hidden md:block w-[20%] h-full shrink-0 border-r border-[#ff6b35]/20 bg-transparent z-50 relative">
        <Sidebar profile={profile} getInitials={getInitials} handleLogout={handleLogout} />
      </div>

      {/* MAIN */}
      <div className="flex flex-col w-full md:w-[80%] h-full relative min-w-0 z-10">

        {/* HEADER */}
        <div className="shrink-0 w-full bg-[#FDF8F5]/90 backdrop-blur-xl border-b border-[#ff6b35]/20 z-40">
          <div className="px-6 py-5 w-full">
            <Header
              profile={profile}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
              getInitials={getInitials}
              handleLogout={handleLogout}
            />
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
              <div className="grid md:grid-cols-3 gap-8 items-start">

                {/* LEFT SIDE: CONTACT INFO CARD */}
                <div className="md:col-span-1 space-y-6">
                  <div className="rounded-[36px] border-2 border-black bg-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-14 h-14 rounded-2xl bg-[#FDF8F5] border border-[#ff6b35]/20 flex items-center justify-center">
                        <svg
                          className="w-7 h-7 text-[#ff6b35]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5h18M9 3v2m6-2v2m-9 4h12m-12 4h12m-12 4h7"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-2xl font-black uppercase text-[#1A1A1A]">
                          Contact
                        </h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                          Gaming support team
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="rounded-2xl border border-black/5 bg-[#FDF8F5] p-5">
                        <p className="text-[10px] uppercase tracking-[0.25em] text-[#ff6b35] font-black mb-2">
                          Email
                        </p>
                        <p className="text-sm font-black text-[#1A1A1A]">
                          support@jksarena.com
                        </p>
                      </div>

                      <div className="rounded-2xl border border-black/5 bg-[#FDF8F5] p-5">
                        <p className="text-[10px] uppercase tracking-[0.25em] text-[#ff6b35] font-black mb-2">
                          Phone
                        </p>
                        <p className="text-sm font-black text-[#1A1A1A]">
                          +91 98765 43210
                        </p>
                      </div>

                      <div className="rounded-2xl border border-black/5 bg-[#FDF8F5] p-5">
                        <p className="text-[10px] uppercase tracking-[0.25em] text-[#ff6b35] font-black mb-2">
                          Location
                        </p>
                        <p className="text-sm font-black text-[#1A1A1A] leading-relaxed">
                          Ashok Nagar, Vikhroli East, Mumbai
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT SIDE: FAQ */}
                <div className="md:col-span-2">
                  <HelpSupportSection />
                </div>

              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}