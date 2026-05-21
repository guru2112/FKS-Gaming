"use client";

import { useEffect, useState } from "react";

import {
  fetchProfile,
  type Profile,
} from "@/lib/auth";

import SettingsMobileMenu from "@/components/dashboard/settings/SettingsMobileMenu";
import AccountTab from "@/components/dashboard/settings/AccountTab";
import SecurityTab from "@/components/dashboard/settings/SecurityTab";
import NotificationTab from "@/components/dashboard/settings/NotificationTab";
import SettingsSidebar from "@/components/dashboard/settings/SettingsSidebar";
import SettingsBottomNav from "@/components/dashboard/settings/SettingsBottomNav";

export default function SettingsPage() {

  const [profile, setProfile] =
    useState<Profile | null>(() => {
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

  const [isLoading, setIsLoading] =
    useState(true);

  const [activeTab, setActiveTab] =
    useState("account");

  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false);

  // =========================================================
  // FETCH PROFILE
  // =========================================================

  // ✅ Use shared fetchProfile from auth.ts — no hardcoded URLs
  const fetchFreshProfile = async (token: string) => {
    return fetchProfile(token);
  };

  // =========================================================
  // LOAD PROFILE
  // =========================================================

  useEffect(() => {

    const token =
      localStorage.getItem(
        "auth_token"
      ) || "";

    if (!token) {

      window.location.href =
        "/login";

      return;

    }

    async function loadData() {

      try {

        setIsLoading(true);

        const data =
          await fetchFreshProfile(
            token
          );

        localStorage.setItem(
          "profile",
          JSON.stringify(data)
        );

        setProfile(data);

      } catch (err) {

        console.error(err);

      } finally {

        setIsLoading(false);

      }

    }

    loadData();

  }, []);

  // =========================================================
  // REFRESH PROFILE
  // =========================================================

  const refreshProfile =
    async (updatedUser?: any) => {

      if (updatedUser) {

        localStorage.setItem(
          "profile",
          JSON.stringify(updatedUser)
        );

        setProfile(updatedUser);

        return;

      }

      const token =
        localStorage.getItem(
          "auth_token"
        );

      if (token) {

        const updatedProfile =
          await fetchFreshProfile(
            token
          );

        localStorage.setItem(
          "profile",
          JSON.stringify(updatedProfile)
        );

        setProfile(updatedProfile);

      }

    };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {

    localStorage.clear();

    window.location.href =
      "/login";

  };

  // =========================================================
  // INITIALS
  // =========================================================

  const getInitials = (
    name?: string
  ) => {

    if (!name) return "U";

    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) =>
        p[0]?.toUpperCase()
      )
      .join("");

  };

  // =========================================================
  // NAV ITEMS
  // =========================================================

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
      href: "/dashboard#history",
    },

    {
      name: "Games Library",
      href: "/dashboard#games",
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

  // =========================================================
  // LOADER
  // =========================================================

  if (isLoading) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-[#FDF8F5]">

        <div className="flex flex-col items-center gap-4">

          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#ff6b35]/20 border-t-[#ff6b35]" />

          <p className="text-sm font-black uppercase tracking-widest text-[#ff6b35]">
            Loading Settings...
          </p>

        </div>

      </div>

    );

  }

  return (

    <div className="flex h-screen w-full bg-[#FDF8F5] text-[#1A1A1A] overflow-hidden relative">

      {/* GRID */}



      {/* MOBILE MENU */}

      <SettingsMobileMenu
  isOpen={isMobileMenuOpen}
  setIsOpen={setIsMobileMenuOpen}
  activeTab={activeTab}
  setActiveTab={setActiveTab}
  profile={profile}
  getInitials={getInitials}
/>

      {/* SIDEBAR */}

      <div className="hidden md:block w-[20%] h-full shrink-0 z-40">

        <SettingsSidebar
          activeTab={activeTab}
          setActiveTab={
            setActiveTab
          }
          profile={profile}
          getInitials={getInitials}
        />

      </div>

      {/* MAIN */}

      <div className="flex flex-col flex-1 min-w-0 relative z-10">

        {/* HEADER */}

<div className="h-20.5 shrink-0 border-b border-[#ff6b35]/10 bg-[#FDF8F5]/90 backdrop-blur-xl px-6">

  <div className="h-full flex items-center justify-between">

    {/* LEFT */}

    <div>

      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ff6b35] mb-1">
        Account Center
      </p>

      <h1 className="text-2xl font-black uppercase tracking-tight">
        Settings
      </h1>

    </div>

    {/* RIGHT */}

    <div className="flex items-center gap-4">

      {/* MOBILE MENU BUTTON */}

      <button
        onClick={() =>
          setIsMobileMenuOpen(
            true
          )
        }
        className="md:hidden flex items-center justify-center w-11 h-11 rounded-2xl border border-[#ff6b35]/15 bg-white text-slate-600 shadow-sm hover:text-[#ff6b35] hover:border-[#ff6b35]/30 transition-all duration-300"
      >

        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >

          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />

        </svg>

      </button>

      {/* PROFILE */}

      <div className="hidden md:flex items-center gap-4 rounded-3xl border border-[#ff6b35]/15 bg-white px-4 py-3 shadow-[0_8px_30px_rgba(255,107,53,0.08)]">

        {/* AVATAR */}

        <div className="relative">

          <div className="flex h-12 w-12 overflow-hidden items-center justify-center rounded-full bg-white border-2 border-[#ff6b35] text-sm font-black text-[#ff6b35]">

            {profile?.avatarUrl ? (

                <img
                  src={profile?.avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />

            ) : (

              <span className="text-lg">
                {getInitials(
                  profile?.name
                )}
              </span>

            )}

          </div>

          <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-green-500 border-2 border-white" />

        </div>

        {/* USER */}

        <div className="flex flex-col">

          <p className="text-sm font-black uppercase tracking-[0.08em] text-[#1A1A1A] leading-none">
            {profile?.name ||
              "Player"}
          </p>

          <p className="text-xs text-slate-500 mt-1 tracking-wide">
            {profile?.email}
          </p>

        </div>

      </div>

    </div>

  </div>

</div>

        {/* CONTENT */}

<div className="flex-1 overflow-y-auto">

  <div className="p-6 md:p-8 pb-24 md:pb-8">

    {/* BACK BUTTON */}

    <div className="mb-6 flex justify-end">

      <a
        href="/dashboard"
        className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-[#ff6b35]/15 bg-white text-[11px] font-black uppercase tracking-[0.2em] text-slate-600 hover:text-[#ff6b35] hover:border-[#ff6b35]/30 transition-all duration-300 shadow-sm"
      >

        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >

          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />

        </svg>

        Back to Dashboard

      </a>

    </div>

    {/* TAB CONTENT */}

    {activeTab ===
      "account" && (

      <AccountTab
        profile={profile}
        onProfileUpdated={
          refreshProfile
        }
      />

    )}

    {activeTab ===
      "security" && (
      <SecurityTab />
    )}

    {activeTab ===
      "notifications" && (
      <NotificationTab
        profile={profile}
        onProfileUpdated={refreshProfile}
      />
    )}

  </div>

</div>

      </div>

      <SettingsBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

    </div>

  );

}