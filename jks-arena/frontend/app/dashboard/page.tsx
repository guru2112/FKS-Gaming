"use client";

import { useEffect, useState, useMemo } from "react";
import { fetchBookings, API_BASE_URL, type Booking as AuthBooking, type Profile } from "@/lib/auth";

import Sidebar from "@/components/dashboard/Sidebar";
import MobileMenu from "@/components/dashboard/MobileMenu";
import Header from "@/components/dashboard/Header";
import LiveArenaStatus from "@/components/dashboard/LiveArenaStatus";
import UpcomingHeroCard from "@/components/dashboard/UpComingHeroCard";
import RecentSessionsTable from "@/components/dashboard/RecentSessionsTable";
import GamesSection from "@/components/GamesSection";
import PushNotificationManager from "@/components/PushNotificationManager";

export type LocalBooking = Omit<AuthBooking, "status"> & {
  userName?: string;
  userContact?: string;
  contactNumber?: string;
  companions?: { name: string; phone: string }[];
  game?: string;
  status: string;
};

const navItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Book Slot", href: "/book" },
  { name: "My Sessions", href: "/dashboard#history" },
  { name: "Games Library", href: "/dashboard#games" },
  { name: "Settings", href: "/settings" },
  { name: "Help & Support", href: "/help-support" },
];

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<LocalBooking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // =========================================================
  // 🔥 FETCH FRESH PROFILE
  // =========================================================
  const fetchFreshProfile = async (token: string) => {
    const res = await fetch(`${API_BASE_URL}/api/user/me?t=${Date.now()}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch profile");
    return await res.json();
  };

  // =========================================================
  // 🔥 INITIAL LOAD
  // =========================================================
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

    async function loadDashboard() {
      try {
        setIsLoading(true);
        const [profileData, bookingsData] = await Promise.all([
          fetchFreshProfile(token!),
          fetchBookings(token!),
        ]);

        localStorage.setItem("profile", JSON.stringify(profileData));

        setProfile({
          ...profileData,
          avatarUrl: profileData.avatarUrl || "",
        });
        setBookings((bookingsData as unknown as LocalBooking[]) || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard.");
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, []);

  // =========================================================
  // 🔥 LOGOUT
  // =========================================================
  function handleLogout() {
    localStorage.clear();
    window.location.href = "/login";
  }

  // =========================================================
  // 🔥 INITIALS
  // =========================================================
  function getInitials(name?: string) {
    if (!name) return "U";
    return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "U";
  }

  // =========================================================
  // 🔥 UPCOMING BOOKING
  // =========================================================
  const upcomingBooking = useMemo(() => {
    const now = new Date().getTime();
    const futureBookings = bookings.filter(
      (b) => b.status !== "cancelled" && new Date(b.slotStart).getTime() > now
    );
    futureBookings.sort((a, b) => new Date(a.slotStart).getTime() - new Date(b.slotStart).getTime());
    return futureBookings.length > 0 ? futureBookings[0] : null;
  }, [bookings]);

  // =========================================================
  // 🔥 LOADER
  // =========================================================
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FDF8F5]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#ff6b35]/20 border-t-[#ff6b35]" />
          <p className="font-display text-sm uppercase tracking-widest text-[#ff6b35]">
            Loading Profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#FDF8F5] text-[#1A1A1A] overflow-hidden selection:bg-[#ff6b35] selection:text-white relative">

      <PushNotificationManager />
      
      {/* 🔥 CSS to completely hide the scrollbar globally */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>

      {/* Subtle Background Grid Pattern */}


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
        <Sidebar
          profile={profile}
          getInitials={getInitials}
          handleLogout={handleLogout}
        />
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
        {/* 🔥 Applied 'hide-scrollbar' class here */}
        <div className="flex-1 overflow-y-auto w-full hide-scrollbar">
          <div className="px-6 py-8 pb-20 w-full max-w-350 mx-auto">
            <main className="space-y-10">
              
              {/* MOBILE WELCOME */}
              <div className="md:hidden -mt-2">
                <h2 className="font-display text-2xl text-[#1A1A1A] tracking-tight leading-none">
                  Welcome back,{" "}
                  <span className="text-[#ff6b35]">
                    {profile?.name?.split(" ")[0] || "Player"}
                  </span>
                  👋
                </h2>
                <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 leading-relaxed">
                  <span className="text-[#ff6b35]">JKS Arena</span>{" "}
                  • Ready for your next gaming session
                </p>
              </div>

              {error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm font-medium">
                  {error}
                </div>
              )}

              {/* HERO */}
              <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr] items-stretch">
                <LiveArenaStatus bookings={bookings} />
                <UpcomingHeroCard booking={upcomingBooking} />
              </section>

              {/* GAMES */}
              <div id="games" className="pt-2">
                <div className="flex justify-between items-end mb-4 px-2">
                  <h2 className="text-sm font-black uppercase tracking-widest text-[#ff6b35]">
                    Games Library
                  </h2>
                  <button className="text-[10px] font-bold uppercase tracking-widest text-[#ff6b35] hover:text-[#1A1A1A] transition-colors">
                    View All Games
                  </button>
                </div>
                <GamesSection />
              </div>

              {/* HISTORY */}
              <div id="history">
                <RecentSessionsTable bookings={bookings} />
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}