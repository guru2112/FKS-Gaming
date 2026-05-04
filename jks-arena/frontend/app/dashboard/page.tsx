"use client";

import { useEffect, useState } from "react";
import {
  createBooking,
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
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);
  const [bookingForm, setBookingForm] = useState({
    device: "PS1",
    slotStart: "",
    durationHours: "1",
    players: "1",
  });

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
          fetchProfile(token),
          fetchPlans(token),
          fetchBookings(token),
        ]);
        setProfile(profileData);
        setPlans(plansData);
        setBookings(bookingsData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load dashboard.";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:px-16">
          <p className="text-sm uppercase tracking-[0.3em] text-orange-300">Loading</p>
          <h1 className="font-display mt-4 text-4xl">Preparing your dashboard...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:px-16">
          <p className="text-sm uppercase tracking-[0.3em] text-orange-300">Error</p>
          <h1 className="font-display mt-4 text-4xl">{error}</h1>
          <a href="/login" className="mt-6 inline-flex text-orange-200">
            Back to login
          </a>
        </div>
      </div>
    );
  }

  async function handleBookingSubmit() {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      setBookingMessage(null);
      const booking = await createBooking(token, {
        device: bookingForm.device as "PS1" | "PS2" | "PS3" | "SIM1",
        slotStart: bookingForm.slotStart,
        durationHours: Number(bookingForm.durationHours),
        players: Number(bookingForm.players),
      });
      setBookings((prev) => [booking, ...prev]);
      setBookingMessage("Booking confirmed. Arrive 5-10 minutes early.");
      setBookingForm({ device: "PS1", slotStart: "", durationHours: "1", players: "1" });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create booking.";
      setBookingMessage(errorMessage);
    }
  }

  function handleLogout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_role");
    window.location.href = "/login";
  }

  function getInitials(name?: string) {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/).slice(0, 2);
    return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "U";
  }

  const currentPlan = profile?.currentPlan || plans[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="relative">
        <div className="absolute inset-0 opacity-80">
          <div className="absolute -top-24 left-1/2 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-orange-500/30 blur-[120px]" />
          <div className="absolute right-[-120px] top-32 h-[320px] w-[320px] rounded-full bg-pink-500/20 blur-[140px]" />
        </div>

        <div className="relative z-10 flex min-h-screen flex-col gap-6 px-4 py-6 sm:px-6 md:flex-row md:px-6 md:py-10">
          <aside className="surface-panel flex w-full flex-col justify-between gap-6 rounded-3xl p-5 md:sticky md:top-8 md:h-[calc(100vh-80px)] md:w-64 md:gap-0">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/20 text-lg font-semibold text-orange-100">
                  {getInitials(profile?.name)}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Member</p>
                  <p className="text-sm text-white">{profile?.name}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500">Menu</p>
                <nav className="mt-3 grid grid-cols-2 gap-2 text-xs uppercase tracking-[0.3em] text-slate-300 md:block md:space-y-3">
                <a href="#home" className="rounded-2xl px-3 py-2 transition hover:bg-slate-900/60 md:block">
                  Home
                </a>
                <a href="#games" className="rounded-2xl px-3 py-2 transition hover:bg-slate-900/60 md:block">
                  Games
                </a>
                <a href="#booking" className="rounded-2xl px-3 py-2 transition hover:bg-slate-900/60 md:block">
                  Booking
                </a>
                <a href="#history" className="rounded-2xl px-3 py-2 transition hover:bg-slate-900/60 md:block">
                  History
                </a>
                </nav>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-full border border-slate-700 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-200"
            >
              Logout
            </button>
          </aside>

          <main className="flex-1">
            <header id="home" className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-orange-300">Dashboard</p>
                <h1 className="font-display text-3xl text-white sm:text-4xl md:text-5xl">
                  Welcome back{profile ? `, ${profile.name}` : ""}.
                </h1>
                <p className="mt-3 text-slate-300">
                  Track your slots, manage your plan, and keep your squad ready.
                </p>
              </div>
              <div className="surface-panel rounded-3xl px-6 py-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Member</p>
                <p className="mt-2 text-lg text-white">{profile?.email}</p>
              </div>
            </header>

          <section className="mt-10 grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
            <div className="surface-panel rounded-3xl p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Current plan</p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-display text-3xl text-white">
                    {currentPlan ? currentPlan.name : "No plan"}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    {currentPlan ? `Rs ${currentPlan.priceMonthly} / month` : "Choose a plan to unlock perks."}
                  </p>
                </div>
                <button className="rounded-full border border-slate-600 px-5 py-2 text-xs uppercase tracking-[0.2em] text-slate-200">
                  Upgrade
                </button>
              </div>
              <div className="mt-6 grid gap-2 text-sm text-slate-300">
                {(currentPlan?.perks ?? ["No perks available"]).map((perk) => (
                  <div key={perk} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-orange-400" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface-panel rounded-3xl p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Your plans</p>
              <div className="mt-5 grid gap-4">
                {plans.map((plan) => (
                  <div
                    key={plan._id}
                    className="flex items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-950/60 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm text-slate-100">{plan.name}</p>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        Rs {plan.priceMonthly} / month
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                      Select
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="booking" className="mt-10">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Bookings</p>
            </div>

            <div className="mt-6 grid gap-4">
              <div className="surface-panel rounded-3xl p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Book a slot</p>
                <p className="mt-3 text-sm text-slate-400">
                  PS: Rs 60 per head/hour. Simulator: Rs 100 per head/hour. Max 5 players.
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <select
                    value={bookingForm.device}
                    onChange={(event) =>
                      setBookingForm((prev) => ({ ...prev, device: event.target.value }))
                    }
                    className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm"
                  >
                    <option value="PS1">PS1</option>
                    <option value="PS2">PS2</option>
                    <option value="PS3">PS3</option>
                    <option value="SIM1">Driving Simulator</option>
                  </select>
                  <input
                    type="datetime-local"
                    value={bookingForm.slotStart}
                    onChange={(event) =>
                      setBookingForm((prev) => ({ ...prev, slotStart: event.target.value }))
                    }
                    className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm"
                  />
                  <input
                    type="number"
                    min={1}
                    value={bookingForm.durationHours}
                    onChange={(event) =>
                      setBookingForm((prev) => ({ ...prev, durationHours: event.target.value }))
                    }
                    placeholder="Duration (hours)"
                    className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm"
                  />
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={bookingForm.players}
                    onChange={(event) =>
                      setBookingForm((prev) => ({ ...prev, players: event.target.value }))
                    }
                    placeholder="Players (1-5)"
                    className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm"
                  />
                </div>
                <button
                  onClick={handleBookingSubmit}
                  className="mt-4 rounded-full bg-orange-500 px-5 py-2 text-xs uppercase tracking-[0.2em] text-slate-950"
                >
                  Confirm booking
                </button>
                {bookingMessage ? (
                  <p className="mt-3 text-sm text-slate-300">{bookingMessage}</p>
                ) : null}
              </div>

              <div id="history" className="grid gap-4">
                {bookings.length === 0 ? (
                  <div className="surface-panel rounded-3xl p-6">
                    <p className="text-sm text-slate-300">
                      You have no bookings yet. Reserve your first slot and start gaming.
                    </p>
                  </div>
                ) : (
                  bookings.map((booking) => (
                    <div
                      key={booking._id}
                      className="surface-panel flex flex-col gap-4 rounded-3xl p-6 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="text-lg text-white">
                          {booking.device} {booking.game ? `· ${booking.game}` : ""}
                        </p>
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                          {new Date(booking.slotStart).toLocaleString()}
                        </p>
                        <p className="mt-2 text-sm text-slate-400">
                          {booking.players} players · {booking.durationHours} hours
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                          {booking.status}
                        </span>
                        <p className="mt-3 text-sm text-slate-400">Rs {booking.totalPrice}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          <div id="games">
            <GamesSection title="Games on the floor" />
          </div>
          </main>
        </div>
      </div>
    </div>
  );
}
