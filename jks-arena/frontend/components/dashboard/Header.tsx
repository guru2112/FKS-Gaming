"use client";

import { useEffect, useRef, useState } from "react";
import { Profile } from "@/lib/auth";
import NotificationBell from "@/components/dashboard/NotificationBell";

interface HeaderProps {
  profile: Profile | null;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
  getInitials: (name?: string) => string;
  handleLogout: () => void;
}

export default function Header({
  profile,
  setIsMobileMenuOpen,
  getInitials,
  handleLogout,
}: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Safely handle "Click Outside" to close the profile dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <header className="flex items-center justify-between w-full">
      {/* ===================================================== */}
      {/* LEFT SIDE */}
      {/* ===================================================== */}
      <div className="flex items-center">
        {/* DESKTOP WELCOME */}
        <div className="hidden md:block">
          <h1 className="font-display text-3xl text-[#1A1A1A] sm:text-4xl tracking-tight">
            Welcome back,{" "}
            <span className="text-[#ff6b35]">
              {profile?.name?.split(" ")[0] || "Player"}
            </span>{" "}
            👋
          </h1>
          <p className="mt-2 text-xs font-bold tracking-[0.18em] uppercase text-slate-500">
            <span className="text-[#ff6b35]">JKS Arena</span> • Ready for your next gaming session
          </p>
        </div>

        {/* MOBILE LOGO */}
        <div className="md:hidden">
          <h1 className="font-display text-2xl font-black tracking-wide">
            <span className="text-[#1A1A1A]">JKS</span>
            <span className="text-[#ff6b35]"> ARENA</span>
          </h1>
        </div>
      </div>

      {/* ===================================================== */}
      {/* MOBILE RIGHT SIDE */}
      {/* ===================================================== */}
      <div className="md:hidden flex items-center gap-3 flex-row-reverse">
        {/* MENU BUTTON */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex items-center justify-center w-11 h-11 rounded-2xl border border-[#ff6b35]/20 bg-white shadow-sm text-slate-500 hover:text-[#ff6b35] hover:border-[#ff6b35]/40 transition-all duration-300"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* NOTIFICATION BELL */}
        <NotificationBell />

        {/* PROFILE DROPDOWN */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="group flex items-center gap-3 rounded-2xl border border-[#ff6b35]/15 bg-white px-3 py-2 shadow-[0_4px_15px_rgba(255,107,53,0.06)]"
          >
            {/* AVATAR */}
            <div className="relative flex h-10 w-10 shrink-0 overflow-hidden items-center justify-center rounded-full bg-[#FDF8F5] border-2 border-[#ff6b35] text-xs font-black text-[#ff6b35]">
              {profile?.avatarUrl ? (
                <img
                  key={profile.avatarUrl}
                  src={profile.avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                getInitials(profile?.name)
              )}
            </div>

            {/* USER DETAILS */}
            <div className="flex flex-col min-w-0 text-left">
              <p className="text-[11px] font-black uppercase tracking-[0.08em] text-[#1A1A1A] leading-none truncate max-w-[90px]">
                {profile?.name || "Player"}
              </p>
              <p className="text-[10px] text-slate-500 mt-1 truncate max-w-[90px]">
                {profile?.email || "player@jksarena.com"}
              </p>
            </div>
          </button>

          {/* DROPDOWN MENU */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-52 overflow-hidden rounded-2xl border border-[#ff6b35]/20 bg-white/95 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] z-50 animate-in fade-in slide-in-from-top-2">
              <a
                href="/settings"
                className="flex w-full items-center gap-3 px-4 py-4 text-left text-sm font-bold text-[#1A1A1A] hover:bg-[#ff6b35]/5 hover:text-[#ff6b35] transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9 9 0 1118.88 17.8M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Profile
              </a>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-4 text-left text-sm font-bold text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-300 border-t border-slate-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V7m-6 14h6a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ===================================================== */}
      {/* DESKTOP PROFILE */}
      {/* ===================================================== */}
      <div className="hidden md:flex items-center gap-4">
        {/* NOTIFICATION BELL */}
        <NotificationBell />

        {/* PROFILE CARD */}
        <div className="group flex items-center gap-4 rounded-3xl border border-[#ff6b35]/15 bg-white px-4 py-3 shadow-[0_8px_30px_rgba(255,107,53,0.08)] hover:border-[#ff6b35]/40 transition-all duration-300">
          {/* AVATAR */}
          <div className="relative">
            {/* GLOW */}
            <div className="absolute inset-0 rounded-full bg-[#ff6b35]/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="relative flex h-14 w-14 overflow-hidden items-center justify-center rounded-full bg-white border-2 border-[#ff6b35] text-sm font-black text-[#ff6b35] shadow-sm">
              {profile?.avatarUrl ? (
                <img
                  key={profile.avatarUrl}
                  src={profile.avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg">
                  {getInitials(profile?.name)}
                </span>
              )}
            </div>

            {/* ONLINE DOT */}
            <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
          </div>

          {/* USER DETAILS */}
          <div className="flex flex-col">
            <p className="text-sm font-black uppercase tracking-[0.08em] text-[#1A1A1A] leading-none">
              {profile?.name || "Player"}
            </p>
            <p className="text-xs text-slate-500 mt-1 tracking-wide">
              {profile?.email || "player@jksarena.com"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}