"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { api } from "@/lib/apiClient";

interface LiveArenaStatusProps {
  bookings: any[];
  psBgUrl?: string;
  simBgUrl?: string;
  themeBg?: string;
  themeNeon?: string;
}

const initialTime = Date.now();

export default function LiveArenaStatus({
  bookings,
  psBgUrl,
  simBgUrl,
  themeBg,
  themeNeon,
}: LiveArenaStatusProps) {
  const [currentTime, setCurrentTime] = useState(initialTime);
  const [mounted, setMounted] = useState(false);
  const [activeDevice, setActiveDevice] = useState<string | null>(null);
  const [isSlotsOpen, setIsSlotsOpen] = useState(false);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // =========================================================
  // AUTO REFRESH STATUS
  // =========================================================

  useEffect(() => {
    const interval = setInterval(
      () => setCurrentTime(Date.now()),
      60000
    );

    return () => clearInterval(interval);
  }, []);

  // =========================================================
  // CHECK SLOT STATUS
  // =========================================================

  const checkIsOccupied = (deviceCode: string) => {
    return bookings.some((booking) => {
      const matchDevice =
        booking.device
          .replace(/\s+/g, "")
          .toUpperCase() ===
        deviceCode
          .replace(/\s+/g, "")
          .toUpperCase();

      if (!matchDevice || booking.status === "cancelled") {
        return false;
      }

      const startTime = new Date(booking.slotStart).getTime();
      const endTime =
        startTime + booking.durationHours * 60 * 60 * 1000;

      return (
        booking.status === "active" ||
        (currentTime >= startTime && currentTime < endTime)
      );
    });
  };

  // =========================================================
  // TODAY BOOKINGS
  // =========================================================

  const todayDateStr = new Date()
    .toISOString()
    .split("T")[0];

  const formatTime = (value: string) => {
    const date = new Date(value);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTodayBookings = (deviceId: string) => {
    const userToday = bookings
      .filter((booking) => {
        if (booking.status === "cancelled") return false;
        const bookingDevice = String(booking.device)
          .replace(/\s+/g, "")
          .toUpperCase();
        if (bookingDevice !== deviceId) return false;
        return new Date(booking.slotStart)
          .toISOString()
          .startsWith(todayDateStr);
      })
      .map((booking) => ({
        ...booking,
        isUserBooking: true,
      }));

    const scheduleToday = schedule
      .filter((booking) => {
        const bookingDevice = String(booking.device)
          .replace(/\s+/g, "")
          .toUpperCase();
        return bookingDevice === deviceId;
      })
      .map((booking) => ({
        ...booking,
        isUserBooking: false,
      }));

    const merged = new Map<string, any>();
    [...scheduleToday, ...userToday].forEach((booking) => {
      const key = String(
        booking._id || `${booking.device}-${booking.slotStart}`
      );
      if (!merged.has(key)) {
        merged.set(key, booking);
        return;
      }
      const existing = merged.get(key);
      merged.set(key, {
        ...existing,
        ...booking,
        isUserBooking:
          existing.isUserBooking || booking.isUserBooking,
      });
    });

    return Array.from(merged.values()).sort(
      (a, b) =>
        new Date(a.slotStart).getTime() -
        new Date(b.slotStart).getTime()
    );
  };

  const handleOpenSlots = (deviceId: string) => {
    setActiveDevice(deviceId);
    setIsSlotsOpen(true);
  };

  const handleCloseSlots = () => {
    setIsSlotsOpen(false);
  };

  // =========================================================
  // FETCH TODAY SCHEDULE
  // =========================================================

  useEffect(() => {
    async function fetchSchedule() {
      if (!isSlotsOpen || !activeDevice) return;
      setLoadingSchedule(true);
      setScheduleError(null);
      try {
        const data = await api.get(
          `/api/bookings/schedule?date=${todayDateStr}&device=${activeDevice}`
        );
        setSchedule(data.bookings || []);
      } catch (err: any) {
        console.error(err);
        setScheduleError(err.message || "Network error: could not load schedule.");
        setSchedule([]);
      } finally {
        setLoadingSchedule(false);
      }
    }

    fetchSchedule();
  }, [activeDevice, isSlotsOpen, todayDateStr]);

  // =========================================================
  // PS5 SLOTS
  // =========================================================

  const ps5Slots = ["PS1", "PS2", "PS3"].map((id) => {
    const isOccupied = checkIsOccupied(id);

    return {
      id,
      status: isOccupied ? "OCCUPIED" : "AVAILABLE",
      color: isOccupied ? "bg-red-500" : "bg-green-500",
      text: isOccupied ? "text-red-600" : "text-green-600",
    };
  });

  // =========================================================
  // SIMULATOR SLOTS
  // =========================================================

  const simSlots = ["SIM1"].map((id) => {
    const isOccupied = checkIsOccupied(id);

    return {
      id,
      status: isOccupied ? "OCCUPIED" : "AVAILABLE",
      color: isOccupied ? "bg-red-500" : "bg-green-500",
      text: isOccupied ? "text-red-600" : "text-green-600",
    };
  });

  return (
    <div
      className="flex flex-col backdrop-blur-xl border border-white/50 rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.06)] h-full"
      style={
        themeBg
          ? { backgroundColor: `${themeBg}99` }
          : { backgroundColor: "rgba(255,255,255,0.4)" }
      }
    >
      <style>{`
        @property --angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes border-spin {
          0%   { --angle: 0deg; }
          100% { --angle: 360deg; }
        }
      `}</style>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-[#ff6b35]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>

          <h3 className="text-sm font-black uppercase tracking-widest text-[#1A1A1A]">
            Live Arena Status
          </h3>
        </div>

        <Link
          href="#"
          className="text-[10px] font-bold uppercase tracking-widest text-[#ff6b35] hover:text-[#1A1A1A] transition-colors"
        >
          View All
        </Link>
      </div>

      {/* CONTENT */}
      <div className="space-y-8 flex-1">
        {/* PS5 ARENA */}
        <div>
          <div className="flex justify-between items-end mb-4">
            <p className="text-sm font-black text-[#1A1A1A]">
              PS5 Arena
            </p>

            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              4 Slots
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {ps5Slots.map((slot) => (
              <button
                key={slot.id}
                type="button"
                onClick={() => handleOpenSlots(slot.id)}
                className="bg-white border border-[#1A1A1A]/10 rounded-2xl p-4 flex flex-col items-center justify-end gap-1.5 shadow-sm relative overflow-hidden min-h-[110px] text-left transition-transform duration-200 hover:-translate-y-0.5"
              >
                {psBgUrl && (
                  <div className="absolute inset-0">
                    <img
                      src={psBgUrl}
                      alt="PS BG"
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-black/30" />
                  </div>
                )}

                <span className="relative z-10 text-base font-black text-white drop-shadow-lg">
                  {slot.id}
                </span>

                <div className="relative z-10 flex items-center gap-1.5 bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${slot.color}`}
                  />

                  <span className="text-[8px] font-bold tracking-widest uppercase text-white">
                    {slot.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* SIMULATOR + BOOK BUTTON */}
        <div>
          <div className="flex justify-between items-end mb-4">
            <p className="text-sm font-black text-[#1A1A1A]">
              Simulator Zone
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {simSlots.map((slot) => (
              <button
                key={slot.id}
                type="button"
                onClick={() => handleOpenSlots(slot.id)}
                className="bg-white border border-[#1A1A1A]/10 rounded-2xl p-4 flex items-center justify-between px-5 shadow-sm relative overflow-hidden min-h-[110px] transition-transform duration-200 hover:-translate-y-0.5 cursor-pointer"
              >
                {simBgUrl && (
                  <div className="absolute inset-0">
                    <img
                      src={simBgUrl}
                      alt="Sim BG"
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-black/30" />
                  </div>
                )}

                <span className="relative z-10 text-base font-black text-white drop-shadow-lg">
                  {slot.id}
                </span>

                <div className="relative z-10 flex items-center gap-1.5 bg-black/30 backdrop-blur-sm px-2.5 py-1.5 rounded-full border border-white/10">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${slot.color}`}
                  />

                  <span className="text-[8px] font-bold tracking-widest uppercase text-white">
                    {slot.status}
                  </span>
                </div>
              </button>
            ))}

            {/* BOOK MY SLOT BUTTON */}
            <Link
              href="/book"
              className="group relative flex flex-col items-center justify-center w-full rounded-2xl p-[3px] transition-all duration-300 hover:scale-[1.01] min-h-[110px]"
              style={{
                background: themeNeon
                  ? `conic-gradient(from var(--angle), ${themeNeon}, white, white, ${themeNeon})`
                  : `conic-gradient(from var(--angle), #ff6b35, white, white, #ff6b35)`,
                animation: "border-spin 3s linear infinite",
              }}
            >
              <div className="w-full h-full rounded-2xl bg-white flex flex-col items-center justify-center gap-1">
                <svg className="w-7 h-7 text-[#1A1A1A]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 13.5v3m1.5-1.5h-3" />
                </svg>
                <span className="text-sm font-black text-[#1A1A1A] uppercase tracking-[0.12em]">
                  BOOK
                </span>
                <span className="text-[9px] font-black text-[#1A1A1A]/50 uppercase tracking-[0.35em]">
                  YOUR SLOT
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {mounted && isSlotsOpen && activeDevice &&
        createPortal(
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200"
            onClick={handleCloseSlots}
          >
            <div
              className="rounded-[2rem] p-[3px] max-w-md w-full shadow-xl animate-in zoom-in-95 duration-300"
              style={{
                background: themeNeon
                  ? `conic-gradient(from var(--angle), ${themeNeon}, #fff, #fff, ${themeNeon})`
                  : `conic-gradient(from var(--angle), #ff6b35, #fff, #fff, #ff6b35)`,
                animation: "border-spin 3s linear infinite",
              }}
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
            <div className="bg-white rounded-[2rem] overflow-hidden">
              <div className="h-1.5 w-full bg-gradient-to-r from-[#ff6b35] via-[#ff6b35]/60 to-transparent" />

              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#ff6b35]">
                      Today
                    </p>
                    <h3 className="mt-1 text-lg font-display text-[#1A1A1A] uppercase tracking-tight">
                      {activeDevice} <span className="text-[#ff6b35]">Details</span>
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleCloseSlots}
                    className="p-2 rounded-full bg-[#FDF8F5] border border-black/10 text-slate-500 hover:text-[#ff6b35] hover:border-[#ff6b35]/30 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="max-h-[55vh] overflow-y-auto">
                  {loadingSchedule ? (
                    <div className="py-12 flex justify-center">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ff6b35]/20 border-t-[#ff6b35]" />
                    </div>
                  ) : scheduleError ? (
                    <div className="py-10 text-center">
                      <p className="text-sm font-bold text-slate-400">
                        {scheduleError}
                      </p>
                    </div>
                  ) : getTodayBookings(activeDevice).length === 0 ? (
                    <div className="py-10 text-center">
                      <p className="text-sm font-bold text-slate-400">
                        No bookings for today.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 text-sm">
                      {getTodayBookings(activeDevice).map((booking) => (
                        <div
                          key={booking._id}
                          className="flex items-center justify-between py-2 border-b border-black/5 last:border-0"
                        >
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                              {formatTime(booking.slotStart)} - {formatTime(booking.slotEnd)}
                            </span>
                            <p className="text-sm font-bold text-[#1A1A1A] mt-1">
                              {booking.game || "Session"} • {booking.durationHours}h
                            </p>
                            {booking.isUserBooking && (
                              <span className="mt-1 inline-flex text-[9px] font-black uppercase tracking-widest text-[#ff6b35]">
                                Your booking
                              </span>
                            )}
                          </div>
                          <span
                            className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                              booking.status === "active"
                                ? "border-green-500/30 text-green-600 bg-green-50"
                                : "border-[#ff6b35]/20 text-[#ff6b35] bg-white"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleCloseSlots}
                  className="mt-6 w-full bg-[#ff6b35] text-white rounded-xl py-3 text-[11px] font-black uppercase tracking-widest hover:bg-[#e05928] transition-colors shadow-[0_0_15px_rgba(255,107,53,0.2)]"
                >
                  Close
                </button>
              </div>
            </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
