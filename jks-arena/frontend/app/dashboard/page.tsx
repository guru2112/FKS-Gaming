"use client";

import { useEffect, useState, useMemo, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import {
  fetchBookings,
  cancelBooking,
  API_BASE_URL,
  type Booking as AuthBooking,
  type Profile,
} from "@/lib/auth";

import Sidebar from "@/components/dashboard/Sidebar";
import MobileMenu from "@/components/dashboard/MobileMenu";
import Header from "@/components/dashboard/Header";
import LiveArenaStatus from "@/components/dashboard/LiveArenaStatus";
import UpcomingHeroCard from "@/components/dashboard/UpComingHeroCard";
import PushNotificationManager from "@/components/PushNotificationManager";
import BottomNav from "@/components/dashboard/BottomNav";
import { getCachedThemeColor, getCachedNeonColor, getDynamicBgColor } from "@/lib/theme";

export type LocalBooking = Omit<AuthBooking, "status"> & {
  userName?: string;
  userContact?: string;
  contactNumber?: string;
  companions?: {
    name: string;
    phone: string;
  }[];
  game?: string;
  status: string;
};

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
  },
  {
    name: "Book Slot",
    href: "/book",
  },
  {
    name: "My Sessions",
    href: "/history",
  },
  {
    name: "Games Library",
    href: "/games",
  },
  {
    name: "Settings",
    href: "/settings",
  },
  {
    name: "Help & Support",
    href: "/help-support",
  },
];

function DashboardPageContent() {
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
  
  const [bookings, setBookings] =
    useState<LocalBooking[]>([]);

  const [error, setError] =
    useState<string | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [
    isMobileMenuOpen,
    setIsMobileMenuOpen,
  ] = useState(false);

  const searchParams = useSearchParams();
  const justBooked = searchParams.get("justBooked") === "true";

  // Dashboard background images
  const [dashboardBg, setDashboardBg] = useState<Record<string, string>>({});
  const [themeBg, setThemeBg] = useState("");
  const [themeNeon, setThemeNeon] = useState("");

  // Dynamic theme color from topbar image (for cards only)
  const applyTheme = useCallback((topbarUrl: string | undefined | null) => {
    if (!topbarUrl) { setThemeBg(""); setThemeNeon(""); return; }
    const cached = getCachedThemeColor(topbarUrl);
    if (cached) {
      setThemeBg(cached);
      setThemeNeon(getCachedNeonColor(topbarUrl) || "");
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
    const handler = (e: Event) => setThemeNeon((e as CustomEvent<string>).detail);
    window.addEventListener("jks-theme-neon", handler);
    return () => window.removeEventListener("jks-theme-neon", handler);
  }, []);

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

  // Clear the query param so refresh doesn't re-show the banner
  useEffect(() => {
    if (justBooked) {
      const url = new URL(window.location.href);
      url.searchParams.delete("justBooked");
      window.history.replaceState({}, "", url.toString());
    }
  }, [justBooked]);

  /* =========================================================
     🔥 CANCEL BOOKING HANDLER
  ========================================================= */

  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancelBooking = async (bookingId: string) => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    setIsCancelling(true);
    try {
      const res = await cancelBooking(bookingId, token);
      toast.success(res.message || "Booking cancelled.");
      // Refresh bookings
      const updated = await fetchBookings(token);
      setBookings(updated);
    } catch (err: any) {
      toast.error(err?.message || "Failed to cancel booking.");
    } finally {
      setIsCancelling(false);
    }
  };

  /* =========================================================
     🔥 FETCH PROFILE
  ========================================================= */

  const fetchFreshProfile = async (
    token: string
  ) => {
    const response = await fetch(
      `${API_BASE_URL}/api/user/me?t=${Date.now()}`,
      {
        method: "GET",

        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type":
            "application/json",
        },

        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        "Failed to fetch profile"
      );
    }

    return await response.json();
  };

  /* =========================================================
     🔥 INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    const token =
      localStorage.getItem(
        "auth_token"
      ) || "";

    const role =
      localStorage.getItem(
        "auth_role"
      ) || "";

    // 🔥 No token

    if (!token) {
      window.location.href =
        "/login";

      return;
    }

    // 🔥 Admin redirect

    if (role === "admin") {
      window.location.href =
        "/admin";

      return;
    }

    async function loadDashboard() {
      try {
        setIsLoading(true);

        const [
          profileData,
          bookingsData,
        ] = await Promise.all([
          fetchFreshProfile(token),

          fetchBookings(token),
        ]);

        // 🔥 Save profile

        localStorage.setItem(
          "profile",
          JSON.stringify(profileData)
        );

        setProfile({
          ...profileData,

          avatarUrl:
            profileData.avatarUrl ||
            "",
        });

        setBookings(
          (bookingsData as LocalBooking[]) ||
            []
        );

        setError(null);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load dashboard."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, []);

  /* =========================================================
     🔥 LOGOUT
  ========================================================= */

  function handleLogout() {
    localStorage.clear();

    window.location.href =
      "/login";
  }

  /* =========================================================
     🔥 GET INITIALS
  ========================================================= */

  function getInitials(
    name?: string
  ) {
    if (!name) return "U";

    return (
      name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(
          (part) =>
            part[0]?.toUpperCase() ??
            ""
        )
        .join("") || "U"
    );
  }

  /* =========================================================
     🔥 UPCOMING BOOKING
  ========================================================= */

  const upcomingBooking =
    useMemo(() => {
      const now =
        new Date().getTime();

      const futureBookings =
        bookings.filter(
          (booking) =>
            booking.status !==
              "cancelled" &&
            new Date(
              booking.slotStart
            ).getTime() > now
        );

      futureBookings.sort(
        (a, b) =>
          new Date(
            a.slotStart
          ).getTime() -
          new Date(
            b.slotStart
          ).getTime()
      );

      return futureBookings.length >
        0
        ? futureBookings[0]
        : null;
    }, [bookings]);

  /* =========================================================
     🔥 LOADING SCREEN
  ========================================================= */

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFF4E6]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#ff6b35]/20 border-t-[#ff6b35]" />

          <p className="font-display text-sm uppercase tracking-widest text-[#ff6b35]">
            Loading Profile...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     🔥 MAIN UI
  ========================================================= */

  return (
    <div
      className="flex h-screen w-full overflow-hidden text-[#1A1A1A] selection:bg-[#ff6b35] selection:text-white relative"
      style={{ backgroundColor: themeBg || "#FFF4E6" }}
    >

      <PushNotificationManager />

      {/* 🔥 Hide scrollbar */}

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @keyframes topbar-scroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }

        .animate-topbar-scroll {
          animation: topbar-scroll 20s ease-in-out infinite alternate;
        }
      `}</style>

      {/* MOBILE MENU */}

      <MobileMenu
        isOpen={isMobileMenuOpen}
        setIsOpen={
          setIsMobileMenuOpen
        }
        profile={profile}
        getInitials={getInitials}
        handleLogout={handleLogout}
        navItems={navItems}
        bgUrl={dashboardBg["Mobile Menu"]}
      />

      {/* SIDEBAR */}

      <div className="hidden md:block w-[20%] h-full shrink-0 border-r border-[#ff6b35]/20 z-50 relative">

        <Sidebar
          profile={profile}
          getInitials={getInitials}
          handleLogout={handleLogout}
          bgUrl={dashboardBg["Sidebar"]}
        />
      </div>

      {/* MAIN CONTENT */}

      <div className="flex flex-col w-full md:w-[80%] h-full relative min-w-0 z-10">

        {/* HEADER */}

        <div
          className={`shrink-0 w-full backdrop-blur-xl relative overflow-hidden min-h-[300px] md:min-h-0 rounded-b-[2.5rem] md:rounded-none ${profile?.topbarUrl || dashboardBg["Topbar"] ? 'border-b border-white/10' : 'border-b border-[#ff6b35]/20'}`}
          style={!(profile?.topbarUrl || dashboardBg["Topbar"]) ? { backgroundColor: themeBg ? `${themeBg}e6` : "#FFF4E6" } : undefined}
        >
          {(profile?.topbarUrl || dashboardBg["Topbar"]) && (
            <div className="absolute inset-0 z-0 overflow-hidden">
              <img src={profile?.topbarUrl || dashboardBg["Topbar"]} alt="Topbar BG" className="w-full min-h-[200%] object-cover opacity-95 animate-topbar-scroll" />
              <div className="absolute inset-0 bg-[#FFF4E6]/15" />
            </div>
          )}

          <div className="relative z-10 w-full flex flex-col min-h-[200px] md:min-h-0 md:hidden">
            {/* TOP: Header with profile */}
            <div className="px-5 pt-5">
              <Header
                profile={profile}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
                getInitials={getInitials}
                handleLogout={handleLogout}
                hasTopbarBg={!!(profile?.topbarUrl || dashboardBg["Topbar"])}
              />
            </div>

            {/* Welcome + subtitle */}
            <div className="px-5 pt-4">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#ff6b35] mb-1">
                Welcome back
              </p>
              <h2 className={`font-display text-4xl font-black tracking-tight leading-none ${profile?.topbarUrl || dashboardBg["Topbar"] ? "text-white drop-shadow-lg" : "text-[#1A1A1A]"}`}>
                {profile?.name?.split(" ")[0] || "Player"}
              </h2>
              <p className={`mt-2 text-sm font-bold tracking-[0.18em] uppercase leading-relaxed ${profile?.topbarUrl || dashboardBg["Topbar"] ? "text-white drop-shadow-md" : "text-slate-500"}`}>
                <span className="text-[#ff6b35]">JKS Arena</span> • Ready for your<br />next gaming session
              </p>
            </div>
          </div>

          {/* Desktop header */}
          <div className="relative z-10 px-6 py-5 w-full hidden md:block">
            <Header
              profile={profile}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
              getInitials={getInitials}
              handleLogout={handleLogout}
              hasTopbarBg={!!(profile?.topbarUrl || dashboardBg["Topbar"])}
            />
          </div>
        </div>

        {/* CONTENT */}

        <div className="flex-1 overflow-y-auto w-full hide-scrollbar relative -mt-20 md:mt-0">
          <div className="px-4 md:px-6 pt-0 md:pt-8 pb-20 w-full max-w-[1400px] mx-auto">

            <main className="space-y-10">

              {/* ERROR */}

              {error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm font-medium">

                  {error}
                </div>
              )}

              {/* BOOKING SUCCESS BANNER */}
              <AnimatePresence>
                {justBooked && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="relative overflow-hidden rounded-2xl border border-green-500/30 bg-green-500/10 p-5"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 pointer-events-none" />
                    <div className="relative flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-green-300 uppercase tracking-wider">
                          Booking Confirmed!
                        </p>
                        <p className="text-xs text-green-400/70 mt-1">
                          Your slot has been reserved. Scroll down to see your upcoming session.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* HERO SECTION */}

              <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr] items-stretch">

                <LiveArenaStatus
                  bookings={bookings}
                  psBgUrl={dashboardBg["PS"]}
                  simBgUrl={dashboardBg["Simulator"]}
                  themeBg={themeBg}
                  themeNeon={themeNeon}
                />

                <UpcomingHeroCard
                  themeBg={themeBg}
                  booking={
                    upcomingBooking
                  }
                  onCancel={
                    handleCancelBooking
                  }
                  isCancelling={isCancelling}
                  timerBgUrl={dashboardBg["Timer Card"]}
                  detailsBgUrl={dashboardBg["Details Card"]}
                />
              </section>
            </main>
          </div>
        </div>

        {/* BOTTOM NAV */}
        <BottomNav />
      </div>
      </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#FFF4E6]">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#ff6b35]/20 border-t-[#ff6b35]" />
        </div>
      }
    >
      <DashboardPageContent />
    </Suspense>
  );
}
