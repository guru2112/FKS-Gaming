"use client";

import { useState } from "react";

export default function NotificationTab() {

  const [
    bookingConfirmation,
    setBookingConfirmation,
  ] = useState(true);

  const [
    bookingReminder,
    setBookingReminder,
  ] = useState(true);

  const [
    tournamentAlerts,
    setTournamentAlerts,
  ] = useState(false);

  const [
    offersDiscounts,
    setOffersDiscounts,
  ] = useState(true);

  const [
    newGames,
    setNewGames,
  ] = useState(true);

  const ToggleSwitch = ({
    enabled,
    setEnabled,
  }: {
    enabled: boolean;
    setEnabled: (
      value: boolean
    ) => void;
  }) => (

    <button
      onClick={() =>
        setEnabled(!enabled)
      }
      className={`relative h-7 w-14 rounded-full transition-all duration-300 ${
        enabled
          ? "bg-[#ff6b35]"
          : "bg-slate-300"
      }`}
    >

      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300 ${
          enabled
            ? "left-8"
            : "left-1"
        }`}
      />

    </button>

  );

  return (

    <div className="rounded-[32px] border border-[#ff6b35]/15 bg-white/70 backdrop-blur-xl p-8 shadow-xl">

      {/* HEADER */}

      <div className="mb-8">

        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#ff6b35]">

          Notification Settings

        </p>

        <h3 className="mt-3 text-3xl font-black text-[#1A1A1A]">

          Alerts & Preferences

        </h3>

      </div>

      {/* SECTIONS */}

      <div className="space-y-5">

        {/* BOOKING CONFIRMATION */}

        <div className="flex items-center justify-between rounded-2xl border border-[#ff6b35]/10 bg-white/60 p-5">

          <div>

            <p className="text-sm font-black uppercase tracking-wide text-[#1A1A1A]">

              Booking Confirmation

            </p>

            <p className="mt-1 text-xs text-slate-500">

              Receive instant booking confirmations.

            </p>

          </div>

          <ToggleSwitch
            enabled={bookingConfirmation}
            setEnabled={setBookingConfirmation}
          />

        </div>

        {/* BOOKING REMINDER */}

        <div className="flex items-center justify-between rounded-2xl border border-[#ff6b35]/10 bg-white/60 p-5">

          <div>

            <p className="text-sm font-black uppercase tracking-wide text-[#1A1A1A]">

              Booking Reminder

            </p>

            <p className="mt-1 text-xs text-slate-500">

              Get reminded before your gaming session starts.

            </p>

          </div>

          <ToggleSwitch
            enabled={bookingReminder}
            setEnabled={setBookingReminder}
          />

        </div>

        {/* NEW GAMES */}

        <div className="flex items-center justify-between rounded-2xl border border-[#ff6b35]/10 bg-white/60 p-5">

          <div>

            <p className="text-sm font-black uppercase tracking-wide text-[#1A1A1A]">

              New Games Added

            </p>

            <p className="mt-1 text-xs text-slate-500">

              Get alerts when new games are added to JKS Arena.

            </p>

          </div>

          <ToggleSwitch
            enabled={newGames}
            setEnabled={setNewGames}
          />

        </div>

        {/* TOURNAMENT ALERTS */}

        <div className="flex items-center justify-between rounded-2xl border border-[#ff6b35]/10 bg-white/60 p-5">

          <div>

            <p className="text-sm font-black uppercase tracking-wide text-[#1A1A1A]">

              Tournament Alerts

            </p>

            <p className="mt-1 text-xs text-slate-500">

              Receive tournament and esports event announcements.

            </p>

          </div>

          <ToggleSwitch
            enabled={tournamentAlerts}
            setEnabled={setTournamentAlerts}
          />

        </div>

        {/* OFFERS */}

        <div className="flex items-center justify-between rounded-2xl border border-[#ff6b35]/10 bg-white/60 p-5">

          <div>

            <p className="text-sm font-black uppercase tracking-wide text-[#1A1A1A]">

              Offers & Discounts

            </p>

            <p className="mt-1 text-xs text-slate-500">

              Get notified about happy hours and exclusive offers.

            </p>

          </div>

          <ToggleSwitch
            enabled={offersDiscounts}
            setEnabled={setOffersDiscounts}
          />

        </div>

      </div>

      {/* SAVE BUTTON */}

      <button
        className="mt-8 rounded-2xl bg-[#ff6b35] px-8 py-4 text-[11px] font-black uppercase tracking-[0.25em] text-white shadow-[0_0_20px_rgba(255,107,53,0.3)] transition-all duration-300 hover:scale-[1.02]"
      >

        Save Preferences

      </button>

    </div>

  );

}