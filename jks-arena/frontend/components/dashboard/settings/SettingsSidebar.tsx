"use client";

import { Profile } from "@/lib/auth";
import Image from "next/image";

interface SettingsSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;

  profile: Profile | null;
  getInitials: (name?: string) => string;
}

const tabs = [
  {
    id: "account",
    label: "Account",
    icon: UserIcon,
  },

  {
    id: "security",
    label: "Security",
    icon: SecurityIcon,
  },

  {
    id: "notifications",
    label: "Notifications",
    icon: BellIcon,
  },
];

export default function SettingsSidebar({
  activeTab,
  setActiveTab,
  profile,
  getInitials,
}: SettingsSidebarProps) {

  return (

    <aside className="flex flex-col w-full h-full bg-[#F3EFEC] border-r border-[#ff6b35]/10">

      {/* TOP */}

      <div className="shrink-0 px-6 pt-10 mb-8">

        <div className="font-display flex flex-col">

          <div className="text-3xl font-black italic tracking-wider drop-shadow-sm">
            <span className="text-[#1A1A1A]">
              ACCOUNT
            </span>{" "}
            <span className="text-[#ff6b35]">
              CENTER
            </span>
          </div>

          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500 mt-1 pl-0.5">
            Settings Panel
          </span>

        </div>

      </div>

      {/* NAVIGATION */}

      <nav className="flex-1 overflow-y-auto px-4 space-y-1.5 custom-scrollbar pb-4">

        {tabs.map((item) => {

          const active =
            activeTab === item.id;

          return (

            <button
              key={item.id}
              onClick={() =>
                setActiveTab(item.id)
              }
              className={`w-full flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                active
                  ? "bg-[#ff6b35] text-white shadow-[0_4px_15px_rgba(255,107,53,0.3)]"
                  : "text-slate-500 hover:bg-[#ff6b35]/5 hover:text-[#ff6b35]"
              }`}
            >

              <div className="flex items-center gap-4">

                <item.icon
                  className={`w-5 h-5 transition-colors ${
                    active
                      ? "text-white"
                      : "text-slate-400 group-hover:text-[#ff6b35]"
                  }`}
                />

                <span
                  className={`text-[13px] font-bold tracking-wide uppercase ${
                    active
                      ? "text-white"
                      : ""
                  }`}
                >
                  {item.label}
                </span>

              </div>

            </button>

          );

        })}

      </nav>

      {/* PROFILE */}

      <div className="shrink-0 p-6 bg-white/40 border-t border-[#ff6b35]/10">

        <div className="flex items-center gap-4 px-1">

          {/* AVATAR */}

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-lg font-black text-[#ff6b35] shadow-[0_2px_10px_rgba(0,0,0,0.05)] ring-2 ring-[#ff6b35] p-0.5">

            <div className="w-full h-full overflow-hidden bg-white rounded-full flex items-center justify-center text-[#ff6b35] relative">

              {profile?.avatarUrl ? (

                <Image
                  key={
                    profile?.avatarUrl ||
                    "settings-avatar"
                  }
                  src={profile?.avatarUrl}
                  alt="Avatar"
                  fill
                  sizes="44px"
                  className="object-cover"
                />

              ) : (

                getInitials(
                  profile?.name
                )

              )}

            </div>

          </div>

          {/* USER */}

          <div className="overflow-hidden">

            <p className="text-sm font-bold text-[#1A1A1A] truncate">
              {profile?.name ||
                "Player"}
            </p>

            <p className="text-[10px] font-bold tracking-wide text-slate-500 mt-0.5">
              <span className="text-[#ff6b35]">
                Level 7
              </span>{" "}
              Gamer
            </p>

          </div>

        </div>

      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #DED5D0;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #C5B8B0;
        }
      `}</style>

    </aside>

  );

}

// =========================================================
// ICONS
// =========================================================

function UserIcon(props: any) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5.121 17.804A9 9 0 1118.88 17.8" />
      <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function SecurityIcon(props: any) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect
        x="3"
        y="11"
        width="18"
        height="11"
        rx="2"
      />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

function BellIcon(props: any) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
}