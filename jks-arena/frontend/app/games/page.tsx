"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { type Profile, API_BASE_URL } from "@/lib/auth";
import GamesSection from "@/components/GamesSection";
import BottomNav from "@/components/dashboard/BottomNav";
import Sidebar from "@/components/dashboard/Sidebar";
import MobileMenu from "@/components/dashboard/MobileMenu";
import Header from "@/components/dashboard/Header";
import { getCachedThemeColor, getDynamicBgColor } from "@/lib/theme";

const navItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Book Slot", href: "/book" },
  { name: "My Sessions", href: "/history" },
  { name: "Games Library", href: "/games" },
  { name: "Settings", href: "/settings" },
  { name: "Help & Support", href: "/help-support" },
];

export default function GamesPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dashboardBg, setDashboardBg] = useState<Record<string, string>>({});
  const [themeBg, setThemeBg] = useState("");

  // Dynamic theme color from topbar image
  const applyTheme = useCallback((topbarUrl: string | undefined | null) => {
    if (!topbarUrl) { setThemeBg(""); return; }
    const cached = getCachedThemeColor(topbarUrl);
    if (cached) {
      setThemeBg(cached);
    } else {
      getDynamicBgColor(topbarUrl);
    }
  }, []);

  useEffect(() => {
    const topbarUrl = profile?.topbarUrl || dashboardBg["Topbar"];
    applyTheme(topbarUrl);
  }, [profile?.topbarUrl, dashboardBg["Topbar"], applyTheme]);

  useEffect(() => {
    const handler = (e: Event) => setThemeBg((e as CustomEvent<string>).detail);
    window.addEventListener("jks-theme-updated", handler);
    return () => window.removeEventListener("jks-theme-updated", handler);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedProfile = localStorage.getItem("profile");
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (err) {
        console.error(err);
      }
    }

    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/login");
      return;
    }

    setIsLoading(false);
  }, [router]);

  // Fetch dashboard backgrounds (topbar, sidebar, etc.)
  useEffect(() => {
    async function fetchDashboardBg() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/media`);
        const data = await res.json();
        if (data.items) {
          const bgMap: Record<string, string> = {};
          data.items
            .filter((item: any) => item.category === "Dashboard" && item.dashboardType)
            .forEach((item: any) => {
              bgMap[item.dashboardType] = item.secure_url;
            });
          setDashboardBg(bgMap);
        }
      } catch (err) {
        console.error("Failed to load dashboard backgrounds:", err);
      }
    }
    fetchDashboardBg();
  }, []);

  const getInitials = (name: string = "") => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("profile");
    localStorage.removeItem("auth_role");
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FFF4E6]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ff6b35]/20 border-t-[#ff6b35]" />
      </div>
    );
  }

  const hasTopbarBg = !!(profile?.topbarUrl || dashboardBg["Topbar"]);

  return (
    <div
      className="flex h-screen w-full overflow-hidden text-[#1A1A1A] selection:bg-[#ff6b35] selection:text-white relative"
      style={{ backgroundColor: themeBg || "#FFF4E6" }}
    >

      {/* CSS Animations */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes topbar-scroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        .animate-topbar-scroll { animation: topbar-scroll 20s ease-in-out infinite alternate; }
      `}</style>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
        profile={profile}
        getInitials={getInitials}
        handleLogout={handleLogout}
        navItems={navItems}
        bgUrl={dashboardBg["Mobile Menu"]}
      />

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-[20%] h-full shrink-0 border-r border-[#ff6b35]/20 z-50 relative">
        <Sidebar
          profile={profile}
          getInitials={getInitials}
          handleLogout={handleLogout}
          bgUrl={dashboardBg["Sidebar"]}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-col w-full md:w-[80%] h-full relative min-w-0 z-10">

        {/* Header Area (with optional topbar bg) */}
        <div
          className={`shrink-0 w-full backdrop-blur-xl relative overflow-hidden min-h-[300px] md:min-h-0 rounded-b-[2.5rem] md:rounded-none ${hasTopbarBg ? 'border-b border-white/10' : 'border-b border-[#ff6b35]/20'}`}
          style={!hasTopbarBg ? { backgroundColor: themeBg ? `${themeBg}e6` : "#FFF4E6" } : undefined}
        >
          {/* Topbar Background Image */}
          {(profile?.topbarUrl || dashboardBg["Topbar"]) && (
            <div className="absolute inset-0 z-0 overflow-hidden">
              <img src={profile?.topbarUrl || dashboardBg["Topbar"]} alt="Topbar BG" className="w-full min-h-[200%] object-cover opacity-95 animate-topbar-scroll" />
              <div className="absolute inset-0 bg-[#FFF4E6]/15" />
            </div>
          )}

          {/* Mobile Header */}
          <div className="relative z-10 w-full flex flex-col min-h-[200px] md:min-h-0 md:hidden">
            <div className="px-5 pt-5">
              <Header
                profile={profile}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
                getInitials={getInitials}
                handleLogout={handleLogout}
                hasTopbarBg={hasTopbarBg}
              />
            </div>
            <div className="px-5 pt-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#ff6b35]">JKS Arena</p>
              <h1 className={`font-display text-4xl font-black tracking-tight leading-none ${hasTopbarBg ? "text-white drop-shadow-lg" : "text-[#1A1A1A]"}`}>Games Library</h1>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="relative z-10 px-6 py-5 w-full hidden md:block">
            <Header
              profile={profile}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
              getInitials={getInitials}
              handleLogout={handleLogout}
              hasTopbarBg={hasTopbarBg}
            />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          <div className="px-4 md:px-6 py-6 max-w-[1200px] mx-auto pb-24 md:pb-6">
            <GamesSection title="All Games" />
          </div>
        </div>

        {/* Mobile BottomNav */}
        <div className="md:hidden">
          <BottomNav />
        </div>

      </div>
    </div>
  );
}
