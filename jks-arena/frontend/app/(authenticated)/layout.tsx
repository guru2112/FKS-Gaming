"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { type Profile, API_BASE_URL } from "@/lib/auth";

import Sidebar from "@/components/dashboard/Sidebar";
import MobileMenu from "@/components/dashboard/MobileMenu";
import Header from "@/components/dashboard/Header";
import BottomNav from "@/components/dashboard/BottomNav";
import { getCachedThemeColor, getDynamicBgColor } from "@/lib/theme";

const navItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Book Slot", href: "/book" },
  { name: "My Sessions", href: "/history" },
  { name: "Games Library", href: "/games" },
  { name: "Settings", href: "/settings" },
  { name: "Help & Support", href: "/help-support" },
];

function AuthenticatedLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [profile, setProfile] = useState<Profile | null>(() => {
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

  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dashboardBg, setDashboardBg] = useState<Record<string, string>>({});
  const [themeBg, setThemeBg] = useState("");

  // Dynamic theme color from topbar image
  const applyTheme = useCallback((topbarUrl: string | undefined | null) => {
    if (!topbarUrl) {
      setThemeBg("");
      return;
    }
    const cached = getCachedThemeColor(topbarUrl);
    if (cached) {
      setThemeBg(cached);
    } else {
      getDynamicBgColor(topbarUrl);
    }
  }, []);

  const topbarBg = dashboardBg["Topbar"];
  useEffect(() => {
    const topbarUrl = profile?.topbarUrl || topbarBg;
    applyTheme(topbarUrl);
  }, [profile?.topbarUrl, topbarBg, applyTheme]);

  useEffect(() => {
    const handler = (e: Event) => setThemeBg((e as CustomEvent<string>).detail);
    window.addEventListener("jks-theme-updated", handler);
    return () => window.removeEventListener("jks-theme-updated", handler);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("auth_token");
    const role = localStorage.getItem("auth_role");

    if (!token) {
      router.push("/login");
      return;
    }

    if (role === "admin") {
      router.push("/admin");
      return;
    }

    // Refresh profile slightly asynchronously so it doesn't block initial render
    async function refreshProfile() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/user/me?t=${Date.now()}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });
        if (response.ok) {
          const profileData = await response.json();
          localStorage.setItem("profile", JSON.stringify(profileData));
          setProfile(profileData);
        }
      } catch (err) {
        console.error("Failed to refresh profile background:", err);
      }
    }
    refreshProfile();

    setIsLoading(false);
  }, [router]);

  // Fetch dashboard backgrounds
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
    localStorage.clear();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FFF4E6]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#ff6b35]/20 border-t-[#ff6b35]" />
          <p className="font-display text-sm uppercase tracking-widest text-[#ff6b35]">Loading Profile...</p>
        </div>
      </div>
    );
  }

  const hasTopbarBg = !!(profile?.topbarUrl || dashboardBg["Topbar"]);
  
  let pageTitle = "Dashboard";
  if (pathname.includes("/book")) pageTitle = "Book Slot";
  else if (pathname.includes("/history")) pageTitle = "My Sessions";
  else if (pathname.includes("/games")) pageTitle = "Games Library";
  else if (pathname.includes("/settings")) pageTitle = "Settings";
  else if (pathname.includes("/help-support")) pageTitle = "Help & Support";

  return (
    <div
      className="flex h-screen w-full overflow-hidden text-[#1A1A1A] selection:bg-[#ff6b35] selection:text-white relative"
      style={{ backgroundColor: themeBg || "#FFF4E6" }}
    >

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

      {/* Main Content Area */}
      <div className="flex flex-col w-full md:w-[80%] h-full relative min-w-0 z-10">
        
        {/* Header Area */}
        <div
          className={`shrink-0 w-full backdrop-blur-xl relative overflow-hidden md:min-h-0 md:rounded-none ${hasTopbarBg ? 'border-b border-white/10' : 'border-b border-[#ff6b35]/20'}`}
          style={!hasTopbarBg ? { backgroundColor: themeBg ? `${themeBg}e6` : "#FFF4E6" } : undefined}
        >
          {hasTopbarBg && (
            <div className="absolute inset-0 z-0 overflow-hidden">
              <Image src={(profile?.topbarUrl || dashboardBg["Topbar"])!} alt="Topbar BG" fill sizes="100vw" className="object-cover opacity-95" />
              <div className="absolute inset-0 bg-[#FFF4E6]/15" />
            </div>
          )}

          {/* Mobile Header + Title */}
          <div className="relative z-10 w-full flex flex-col pb-6 md:pb-0 md:min-h-0 md:hidden">
            <div className="px-5 pt-5">
              <Header
                profile={profile}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
                getInitials={getInitials}
                handleLogout={handleLogout}
                hasTopbarBg={hasTopbarBg}
              />
            </div>
            
            {/* Contextual Title instead of Welcome Back everywhere */}
            <div className="px-5 pt-4">
              {pathname === "/dashboard" ? (
                <>
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#ff6b35] mb-1">Welcome back</p>
                  <h2 className={`font-display text-4xl font-black tracking-tight leading-none ${hasTopbarBg ? "text-white drop-shadow-lg" : "text-[#1A1A1A]"}`}>
                    {profile?.name?.split(" ")[0] || "Player"}
                  </h2>
                  <p className={`mt-2 text-sm font-bold tracking-[0.18em] uppercase leading-relaxed ${hasTopbarBg ? "text-white drop-shadow-md" : "text-slate-500"}`}>
                    <span className="text-[#ff6b35]">JKS Arena</span> • Ready for your<br />next gaming session
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#ff6b35]">JKS Arena</p>
                  <h1 className={`font-display text-4xl font-black tracking-tight leading-none ${hasTopbarBg ? "text-white drop-shadow-lg" : "text-[#1A1A1A]"}`}>
                    {pageTitle}
                  </h1>
                </>
              )}
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

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          {children}
        </div>

        {/* Mobile BottomNav */}
        <div className="md:hidden">
          <BottomNav />
        </div>

      </div>
    </div>
  );
}

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#FFF4E6]">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#ff6b35]/20 border-t-[#ff6b35]" />
        </div>
      }
    >
      <AuthenticatedLayoutContent>{children}</AuthenticatedLayoutContent>
    </Suspense>
  );
}
