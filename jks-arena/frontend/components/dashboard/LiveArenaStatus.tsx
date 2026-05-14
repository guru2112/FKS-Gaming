"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface LiveArenaStatusProps {
  bookings: any[];
}

export default function LiveArenaStatus({
  bookings,
}: LiveArenaStatusProps) {

  const [currentTime, setCurrentTime] =
    useState(Date.now());

  // =========================================================
  // AUTO REFRESH STATUS
  // =========================================================

  useEffect(() => {

    const interval = setInterval(
      () => setCurrentTime(Date.now()),
      60000
    );

    return () =>
      clearInterval(interval);

  }, []);

  // =========================================================
  // CHECK SLOT STATUS
  // =========================================================

  const checkIsOccupied = (
    deviceCode: string
  ) => {

    return bookings.some(
      (booking) => {

        const matchDevice =
          booking.device
            .replace(/\s+/g, "")
            .toUpperCase() ===
          deviceCode
            .replace(/\s+/g, "")
            .toUpperCase();

        if (
          !matchDevice ||
          booking.status ===
            "cancelled"
        ) {
          return false;
        }

        const startTime =
          new Date(
            booking.slotStart
          ).getTime();

        const endTime =
          startTime +
          booking.durationHours *
            60 *
            60 *
            1000;

        return (
          booking.status ===
            "active" ||
          (currentTime >=
            startTime &&
            currentTime <
              endTime)
        );

      }
    );

  };

  // =========================================================
  // PS5 SLOTS
  // =========================================================

  const ps5Slots = [
    "PS1",
    "PS2",
    "PS3",
  ].map((id) => {

    const isOccupied =
      checkIsOccupied(id);

    return {
      id,
      status: isOccupied
        ? "OCCUPIED"
        : "AVAILABLE",
      color: isOccupied
        ? "bg-red-500"
        : "bg-green-500",
      text: isOccupied
        ? "text-red-600"
        : "text-green-600",
    };

  });

  // =========================================================
  // SIMULATOR SLOTS
  // =========================================================

  const simSlots = [
    "SIM1",
  ].map((id) => {

    const isOccupied =
      checkIsOccupied(id);

    return {
      id,
      status: isOccupied
        ? "OCCUPIED"
        : "AVAILABLE",
      color: isOccupied
        ? "bg-red-500"
        : "bg-green-500",
      text: isOccupied
        ? "text-red-600"
        : "text-green-600",
    };

  });

  return (

    <div className="flex flex-col bg-[#FDF8F5] border border-[#1A1A1A] rounded-4xl p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] h-full">

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

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

            {ps5Slots.map(
              (slot) => (

                <div
                  key={slot.id}
                  className="bg-white border border-[#1A1A1A]/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 shadow-sm"
                >

                  <span className="text-xs font-black text-[#1A1A1A]">
                    {slot.id}
                  </span>

                  <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">

                    <span
                      className={`w-1.5 h-1.5 rounded-full ${slot.color}`}
                    />

                    <span
                      className={`text-[8px] font-bold tracking-widest uppercase ${slot.text}`}
                    >

                      {slot.status}

                    </span>

                  </div>

                </div>

              )
            )}

          </div>

        </div>

        {/* SIMULATOR */}

        <div>

          <div className="flex justify-between items-end mb-4">

            <p className="text-sm font-black text-[#1A1A1A]">
              Simulator Zone
            </p>

            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              2 Slots
            </p>

          </div>

          <div className="grid grid-cols-2 gap-3">

            {simSlots.map(
              (slot) => (

                <div
                  key={slot.id}
                  className="bg-white border border-[#1A1A1A]/10 rounded-2xl p-4 flex items-center justify-between px-5 shadow-sm"
                >

                  <span className="text-xs font-black text-[#1A1A1A]">
                    {slot.id}
                  </span>

                  <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-full border border-slate-100">

                    <span
                      className={`w-1.5 h-1.5 rounded-full ${slot.color}`}
                    />

                    <span
                      className={`text-[8px] font-bold tracking-widest uppercase ${slot.text}`}
                    >

                      {slot.status}

                    </span>

                  </div>

                </div>

              )
            )}

          </div>

        </div>

      </div>

      {/* BOOK BUTTON */}

      <div className="mt-8 pt-6 border-t border-[#1A1A1A]/10">

        <Link
          href="/book"
          className="group relative flex items-center justify-center gap-3 w-full overflow-hidden rounded-2xl bg-[#ff6b35] px-6 py-4 text-white shadow-[0_8px_25px_rgba(255,107,53,0.28)] transition-all duration-300 hover:scale-[1.01] hover:bg-[#eb5d2a]"
        >

          <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-1000"></div>

          <svg
            className="relative z-10 w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >

            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10m-11 9h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v11a2 2 0 002 2z"
            />

          </svg>

          <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.28em]">
            Book My Slot
          </span>

        </Link>

      </div>

    </div>

  );

}