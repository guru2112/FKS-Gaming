"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Profile } from "@/lib/auth";

interface MobileMenuProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  profile: Profile | null;
  getInitials: (name?: string) => string;
  handleLogout: () => void;
  navItems?: any;
}

const menuItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: DashboardIcon,
  },

  {
    name: "Book Slot",
    href: "/book",
    icon: CalendarIcon,
  },

  {
    name: "My Sessions",
    href: "/dashboard#history",
    icon: SessionsIcon,
  },

  {
    name: "Games Library",
    href: "/dashboard#games",
    icon: GamepadIcon,
  },

  {
    name: "Settings",
    href: "/settings",
    icon: SettingsIcon,
  },

  {
    name: "Help & Support",
    href: "/help-support",
    icon: HelpIcon,
  },
];

export default function MobileMenu({
  isOpen,
  setIsOpen,
  profile,
  getInitials,
  handleLogout,
}: MobileMenuProps) {

  const pathname = usePathname();

  const [activeHash, setActiveHash] =
    useState("");

  useEffect(() => {

    setActiveHash(
      window.location.hash
    );

    const handleHashChange =
      () =>
        setActiveHash(
          window.location.hash
        );

    window.addEventListener(
      "hashchange",
      handleHashChange
    );

    return () =>
      window.removeEventListener(
        "hashchange",
        handleHashChange
      );

  }, []);

  const isActive = (
    href: string
  ) => {

    if (href.startsWith("#")) {
      return activeHash === href;
    }

    if (href === "/dashboard") {
      return (
        pathname === "/dashboard" &&
        activeHash === ""
      );
    }

    return pathname === href;

  };

  return (

    <>

      {/* OVERLAY */}

      <div
        onClick={() =>
          setIsOpen(false)
        }
        className={`fixed inset-0 z-[90] bg-[#1A1A1A]/60 backdrop-blur-sm transition-all duration-300 md:hidden ${
          isOpen

            ? "opacity-100 pointer-events-auto"

            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* MENU */}

      <div
        className={`fixed top-0 right-0 z-[100] w-72 h-screen bg-[#F3EFEC] border-l border-[#1A1A1A]/10 pt-6 pb-6 px-4 shadow-2xl flex flex-col justify-between transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden ${
          isOpen

            ? "translate-x-0"

            : "translate-x-full"
        }`}
      >

        {/* TOP SECTION */}

        <div>

          {/* HEADER */}

          <div className="flex justify-between items-center mb-8 px-2">

            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#ff6b35]">

              Menu

            </p>

            {/* CLOSE */}

            <button
              onClick={() =>
                setIsOpen(false)
              }
              className="text-slate-500 hover:text-[#ff6b35] transition-colors p-2 -mr-2 bg-white rounded-full border border-[#1A1A1A]/10 shadow-sm"
            >

              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />

              </svg>

            </button>

          </div>

          {/* NAVIGATION */}

          <nav className="space-y-1.5 px-2">

            {menuItems.map((item) => {

              const active =
                isActive(item.href);

              return (

                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => {

                    if (
                      item.href.startsWith(
                        "#"
                      )
                    ) {

                      setActiveHash(
                        item.href
                      );

                    }

                    if (
                      item.href ===
                      "/dashboard"
                    ) {

                      setActiveHash("");

                    }

                    setTimeout(
                      () =>
                        setIsOpen(
                          false
                        ),
                      150
                    );

                  }}
                  className={`flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
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
                      className={`text-[13px] font-bold tracking-wide ${
                        active
                          ? "text-white"
                          : ""
                      }`}
                    >

                      {item.name}

                    </span>

                  </div>

                </Link>

              );

            })}

          </nav>

        </div>

        {/* BOTTOM PROFILE & LOGOUT */}

        <div className="mt-8 px-2">

          {/* PROFILE CARD */}

          <div className="group flex items-center gap-4 rounded-3xl border border-[#1A1A1A]/10 bg-white px-4 py-4 shadow-sm hover:border-[#ff6b35]/40 transition-all duration-300 mb-4">

            {/* AVATAR */}

            <div className="relative">

              <div className="absolute inset-0 rounded-full bg-[#ff6b35]/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative flex h-12 w-12 overflow-hidden items-center justify-center rounded-full bg-[#FDF8F5] border-2 border-[#ff6b35] text-sm font-black text-[#ff6b35] shadow-sm">

                {profile?.avatarUrl ? (

                  <img
                    key={
                      profile.avatarUrl
                    }
                    src={`${profile.avatarUrl}?t=${Date.now()}`}
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

              {/* ONLINE DOT */}

              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>

            </div>

            {/* USER DETAILS */}

            <div className="flex flex-col overflow-hidden">

              <p className="text-sm font-black uppercase tracking-[0.08em] text-[#1A1A1A] leading-none truncate">

                {profile?.name ||
                  "Player"}

              </p>

              <p className="text-xs text-slate-500 mt-1 tracking-wide truncate">

                {profile?.email ||
                  "player@jksarena.com"}

              </p>

            </div>

          </div>

          {/* LOGOUT BUTTON */}

          <button
            onClick={handleLogout}
            className="group relative w-full overflow-hidden rounded-2xl border border-[#ff6b35]/30 bg-white px-4 py-3.5 text-[#ff6b35] shadow-sm transition-all duration-300 hover:bg-[#ff6b35] hover:text-white hover:border-[#ff6b35]"
          >

            <span className="relative z-10 flex items-center justify-center gap-3 text-[12px] font-black uppercase tracking-[0.25em]">

              <LogoutIcon className="w-5 h-5 transition-colors" />

              Logout

            </span>

          </button>

        </div>

      </div>

    </>

  );

}

// Icons

function DashboardIcon(props: any) {
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
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  );
}

function CalendarIcon(props: any) {
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
        y="4"
        width="18"
        height="18"
        rx="2"
        ry="2"
      ></rect>

      <line
        x1="16"
        y1="2"
        x2="16"
        y2="6"
      ></line>

      <line
        x1="8"
        y1="2"
        x2="8"
        y2="6"
      ></line>

      <line
        x1="3"
        y1="10"
        x2="21"
        y2="10"
      ></line>

    </svg>
  );
}

function SessionsIcon(props: any) {
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
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>

      <polyline points="12 6 12 12 16 14"></polyline>

    </svg>
  );
}

function GamepadIcon(props: any) {
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
      <line
        x1="6"
        y1="12"
        x2="10"
        y2="12"
      ></line>

      <line
        x1="8"
        y1="10"
        x2="8"
        y2="14"
      ></line>

      <line
        x1="15"
        y1="13"
        x2="15.01"
        y2="13"
      ></line>

      <line
        x1="18"
        y1="11"
        x2="18.01"
        y2="11"
      ></line>

      <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"></path>

    </svg>
  );
}

function SettingsIcon(props: any) {
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
      <circle
        cx="12"
        cy="12"
        r="3"
      ></circle>

      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>

    </svg>
  );
}

function HelpIcon(props: any) {
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
      <circle
        cx="12"
        cy="12"
        r="10"
      ></circle>

      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>

      <line
        x1="12"
        y1="17"
        x2="12.01"
        y2="17"
      ></line>

    </svg>
  );
}

function LogoutIcon(props: any) {
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
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>

      <polyline points="16 17 21 12 16 7"></polyline>

      <line
        x1="21"
        y1="12"
        x2="9"
        y2="12"
      ></line>

    </svg>
  );
}