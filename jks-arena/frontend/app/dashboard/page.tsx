"use client";

import { useEffect, useState } from "react";
import {
  fetchBookings,
  fetchPlans,
  fetchProfile,
  type Booking,
  type Plan,
  type Profile,
} from "@/lib/auth";
import GamesSection from "@/components/GamesSection";

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const role = localStorage.getItem("auth_role");
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
        const [profileData, plansData, bookingsData] = await Promise.all([
          fetchProfile(token!),
          fetchPlans(token!),
          fetchBookings(token!),
        ]);
        setProfile(profileData);
        setPlans(plansData);
        setBookings(bookingsData);
        
        // Pre-fill name from profile
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load dashboard.";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, []);

  function handleLogout() {
    localStorage.clear();
    window.location.href = "/login";
  }

  function getInitials(name?: string) {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/).slice(0, 2);
    return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "U";
  }

  const currentPlan = profile?.currentPlan || plans[0];

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
          <p className="font-display text-sm uppercase tracking-widest text-slate-500">Preparing Arena...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="relative">
        {/* Soft Background Accents */}
        <div className="absolute inset-0 opacity-40 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-orange-200 blur-[120px]" />
          <div className="absolute right-[-100px] top-40 h-[300px] w-[300px] rounded-full bg-cyan-100 blur-[100px]" />
        </div>

        <div className="relative z-10 flex min-h-screen flex-col gap-6 px-4 py-6 sm:px-6 md:flex-row md:px-8 md:py-10">
          
          {/* Sidebar */}
          <aside className="flex w-full flex-col justify-between gap-8 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:sticky md:top-10 md:h-[calc(100vh-80px)] md:w-72">
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-lg font-bold text-white shadow-lg shadow-orange-200">
                  {getInitials(profile?.name)}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-600">Active Member</p>
                  <p className="text-sm font-bold text-slate-900 truncate max-w-[140px]">{profile?.name}</p>
                </div>
              </div>

              <nav className="space-y-2">
                <p className="px-3 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Navigation</p>
                {[
                  { name: 'Overview', href: '#home' },
                  { name: 'Book Slot', href: '/book' },
                  { name: 'Library', href: '#games' },
                  { name: 'History', href: '#history' }
                ].map(item => (
                  <a key={item.name} href={item.href} className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-orange-50 hover:text-orange-600">
                    {item.name}
                  </a>
                ))}
              </nav>
            </div>

            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center rounded-xl border border-slate-200 py-3 text-xs font-bold uppercase tracking-widest text-slate-500 transition hover:bg-slate-50 hover:text-red-500"
            >
              Logout Session
            </button>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-10">
            <header id="home" className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-orange-600">Player Dashboard</p>
                <h1 className="font-display mt-2 text-4xl text-slate-900 sm:text-5xl">
                  Welcome back, <span className="text-orange-500">{profile?.name?.split(' ')[0]}</span>.
                </h1>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Linked Account</p>
                <p className="text-sm font-medium text-slate-700">{profile?.email}</p>
              </div>
            </header>

            {/* Plan Status */}
            <section className="grid gap-6 md:grid-cols-2">
              <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
                <div className="flex items-center justify-between">
                   <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Current Plan</p>
                   <span className="rounded-full bg-orange-100 px-3 py-1 text-[10px] font-bold uppercase text-orange-700">Active</span>
                </div>
                <h2 className="font-display mt-4 text-3xl text-slate-900">{currentPlan?.name}</h2>
                <p className="mt-2 text-sm text-slate-500">
                  {currentPlan ? `₹${currentPlan.priceMonthly} billed monthly` : "No active subscription"}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {currentPlan?.perks?.map((perk) => (
                    <span key={perk} className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-1.5 text-xs text-slate-600">
                      • {perk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-[32px] border border-orange-100 bg-orange-50/50 p-8">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">Quick Actions</p>
                <h3 className="font-display mt-4 text-2xl text-slate-900">Level up your experience</h3>
                <p className="mt-2 text-sm text-slate-600">Upgrade to VIP for private rooms and zero-wait entry.</p>
                <button className="mt-6 rounded-full bg-orange-500 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600">
                  View All Plans
                </button>
              </div>
            </section>

            {/* Booking Callout */}
            <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.35em] text-orange-600">Book slot</p>
                  <h2 className="font-display mt-2 text-3xl text-slate-900">Reserve a rig in seconds</h2>
                  <p className="mt-3 text-sm text-slate-500">
                    Bookings are now on a dedicated page. Add every player name and contact number
                    before submitting the request.
                  </p>
                  <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Pricing</p>
                      <p className="mt-2 font-semibold text-slate-900">PS: ₹60/hr • Simulator: ₹100/hr</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Tip</p>
                      <p className="mt-2 font-semibold text-slate-900">Keep arrival time ready before booking.</p>
                    </div>
                  </div>
                </div>
                <a
                  href="/book"
                  className="inline-flex items-center justify-center rounded-full bg-orange-500 px-10 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600"
                >
                  Go to Booking Page
                </a>
              </div>
            </section>

            {/* Booking History */}
            <section id="history" className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h2 className="font-display text-2xl text-slate-900">Recent Sessions</h2>
                <a href="#" className="text-xs font-bold uppercase text-orange-600 hover:underline">View All</a>
              </div>

              <div className="grid gap-4">
                {bookings.length === 0 ? (
                  <div className="rounded-[32px] border-2 border-dashed border-slate-200 p-12 text-center">
                    <p className="text-slate-400">No sessions recorded. Start your first raid today!</p>
                  </div>
                ) : (
                  bookings.map((booking) => (
                    <div key={booking._id} className="group relative flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                           <span className="font-bold text-xs">{booking.device}</span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {booking.game || "General Gaming"}
                          </p>
                          <p className="text-xs font-medium text-slate-500">
                            {new Date(booking.slotStart).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} @ {new Date(booking.slotStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between md:text-right gap-6">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{booking.players} Players</p>
                          <p className="text-sm font-bold text-slate-900">₹{booking.totalPrice}</p>
                        </div>
                        <span className={`rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest ${
                          booking.status === 'upcoming' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Library */}
            <div id="games" className="pt-10">
              <GamesSection title="Games in the Vault" />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}