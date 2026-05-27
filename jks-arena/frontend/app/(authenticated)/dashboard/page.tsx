"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { fetchBookings, cancelBooking, API_BASE_URL, type Booking as AuthBooking } from "@/lib/auth";
import LiveArenaStatus from "@/components/dashboard/LiveArenaStatus";
import UpcomingHeroCard from "@/components/dashboard/UpComingHeroCard";
import UserRescheduleModal from "@/components/UserRescheduleModal";

export type LocalBooking = Omit<AuthBooking, "status"> & {
  userName?: string;
  userContact?: string;
  contactNumber?: string;
  companions?: { name: string; phone: string }[];
  game?: string;
  status: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justBooked = searchParams.get("justBooked") === "true";

  const [bookings, setBookings] = useState<LocalBooking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dashboardBg, setDashboardBg] = useState<Record<string, string>>({});
  const [themeBg, setThemeBg] = useState("");
  const [themeNeon, setThemeNeon] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [rescheduleBooking, setRescheduleBooking] = useState<LocalBooking | null>(null);

  useEffect(() => {
    const handlerBg = (e: Event) => setThemeBg((e as CustomEvent<string>).detail);
    const handlerNeon = (e: Event) => setThemeNeon((e as CustomEvent<string>).detail);
    window.addEventListener("jks-theme-updated", handlerBg);
    window.addEventListener("jks-theme-neon", handlerNeon);
    return () => {
      window.removeEventListener("jks-theme-updated", handlerBg);
      window.removeEventListener("jks-theme-neon", handlerNeon);
    };
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const [bookingsData, bgRes] = await Promise.all([
        fetchBookings(token),
        fetch(`${API_BASE_URL}/api/media`)
      ]);

      setBookings((bookingsData as LocalBooking[]) || []);
      
      if (bgRes.ok) {
        const bgData = await bgRes.json();
        if (bgData.items) {
          const bgMap: Record<string, string> = {};
          bgData.items
            .filter((item: any) => item.category === "Dashboard" && item.dashboardType)
            .forEach((item: any) => {
              bgMap[item.dashboardType] = item.secure_url;
            });
          setDashboardBg(bgMap);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load dashboard data.");
    }
  };

  useEffect(() => {
    loadData();
  }, [router]);

  useEffect(() => {
    if (justBooked) {
      const url = new URL(window.location.href);
      url.searchParams.delete("justBooked");
      window.history.replaceState({}, "", url.toString());
    }
  }, [justBooked]);

  const handleCancelBooking = async (bookingId: string) => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    setIsCancelling(true);
    try {
      const res = await cancelBooking(bookingId, token);
      toast.success(res.message || "Booking cancelled.");
      const updated = await fetchBookings(token);
      setBookings(updated);
    } catch (err: any) {
      toast.error(err?.message || "Failed to cancel booking.");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleRescheduleSuccess = () => {
    setRescheduleBooking(null);
    loadData();
  };

  const upcomingBooking = useMemo(() => {
    const now = new Date().getTime();
    const futureBookings = bookings.filter(
      (booking) => booking.status !== "cancelled" && new Date(booking.slotStart).getTime() > now
    );
    futureBookings.sort((a, b) => new Date(a.slotStart).getTime() - new Date(b.slotStart).getTime());
    return futureBookings.length > 0 ? futureBookings[0] : null;
  }, [bookings]);

  return (
    <div className="px-4 md:px-6 pt-0 md:pt-8 pb-20 w-full max-w-[1400px] mx-auto">
      <main className="space-y-10">
        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

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
            booking={upcomingBooking}
            onCancel={handleCancelBooking}
            onReschedule={(b) => setRescheduleBooking(b)}
            isCancelling={isCancelling}
            timerBgUrl={dashboardBg["Timer Card"]}
            detailsBgUrl={dashboardBg["Details Card"]}
          />
        </section>

        {rescheduleBooking && (
          <UserRescheduleModal
            booking={rescheduleBooking}
            onClose={() => setRescheduleBooking(null)}
            onSuccess={handleRescheduleSuccess}
          />
        )}
      </main>
    </div>
  );
}
