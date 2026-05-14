"use client";

interface SettingsMobileMenuProps {

  isOpen: boolean;

  setIsOpen: (
    isOpen: boolean
  ) => void;

  activeTab: string;

  setActiveTab: (
    tab: string
  ) => void;

  profile?: any;

  getInitials?: (
    name?: string
  ) => string;

}

const menuItems = [

  {
    id: "account",
    label: "Account",
    desc: "Profile & avatar",
    icon: AccountIcon,
  },

  {
    id: "security",
    label: "Security",
    desc: "Password & login",
    icon: SecurityIcon,
  },

  {
    id: "notifications",
    label: "Notifications",
    desc: "Alerts & reminders",
    icon: BellIcon,
  },

];

export default function SettingsMobileMenu({

  isOpen,

  setIsOpen,

  activeTab,

  setActiveTab,

  profile,

  getInitials,

}: SettingsMobileMenuProps) {

  return (

    <>
  {/* OVERLAY */}
  <div
    onClick={() => setIsOpen(false)}
    className={`fixed inset-0 z-[90] bg-[#1A1A1A]/60 backdrop-blur-sm transition-all duration-300 md:hidden ${
      isOpen
        ? "opacity-100 pointer-events-auto"
        : "opacity-0 pointer-events-none"
    }`}
  />

  {/* MENU CONTAINER */}
  {/* MENU CONTAINER */}

<div
  className={`fixed top-0 right-0 z-[100] w-72 h-full bg-[#F3EFEC] border-l border-[#1A1A1A]/10 pt-6 pb-6 px-4 shadow-2xl flex flex-col justify-between transform transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden ${
    isOpen
      ? "translate-x-0 opacity-100"
      : "translate-x-full opacity-0"
  }`}
>

    {/* TOP SECTION */}

    <div>

      {/* HEADER */}

      <div className="flex justify-between items-center mb-8 px-2">

        <div>

          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ff6b35]">
            Account Center
          </p>

          <h2 className="mt-2 text-2xl font-black italic tracking-tight">
            <span className="text-[#1A1A1A]">
              SETTINGS
            </span>
          </h2>

        </div>

        {/* CLOSE */}

        <button
          onClick={() => setIsOpen(false)}
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
            activeTab === item.id;

          return (

            <button
              key={item.id}
              onClick={() => {

                setActiveTab(item.id);

                setTimeout(
                  () => setIsOpen(false),
                  150
                );

              }}
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

                <div className="flex flex-col items-start">

                  <span
                    className={`text-[13px] font-bold tracking-wide ${
                      active ? "text-white" : ""
                    }`}
                  >

                    {item.label}

                  </span>

                  <span
                    className={`text-[10px] mt-0.5 ${
                      active
                        ? "text-white/70"
                        : "text-slate-400"
                    }`}
                  >

                    {item.desc}

                  </span>

                </div>

              </div>

            </button>

          );

        })}

      </nav>

    </div>

    {/* PROFILE */}

    <div className="mt-8 px-2">

      <div className="group flex items-center gap-4 rounded-3xl border border-[#1A1A1A]/10 bg-white px-4 py-4 shadow-sm hover:border-[#ff6b35]/40 transition-all duration-300">

        {/* AVATAR */}

        <div className="relative">

          <div className="absolute inset-0 rounded-full bg-[#ff6b35]/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <div className="relative flex h-12 w-12 overflow-hidden items-center justify-center rounded-full bg-[#FDF8F5] border-2 border-[#ff6b35] text-sm font-black text-[#ff6b35] shadow-sm">

            {profile?.avatarUrl ? (

              <img
                key={profile.avatarUrl}
                src={`${profile.avatarUrl}?t=${Date.now()}`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />

            ) : (

              <span className="text-lg">

                {getInitials?.(profile?.name)}

              </span>

            )}

          </div>

          {/* ONLINE DOT */}

          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>

        </div>

        {/* USER DETAILS */}

        <div className="flex flex-col overflow-hidden">

          <p className="text-sm font-black uppercase tracking-[0.08em] text-[#1A1A1A] leading-none truncate">

            {profile?.name || "Player"}

          </p>

          <p className="text-xs text-slate-500 mt-1 tracking-wide truncate">

            {profile?.email || "player@jksarena.com"}

          </p>

        </div>

      </div>

    </div>

  </div>
</>

  );

}

// =========================================================
// ICONS
// =========================================================

function AccountIcon(props: any) {

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

      <path d="M5.121 17.804A9 9 0 1118.88 17.8"></path>

      <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>

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
        ry="2"
      ></rect>

      <path d="M7 11V7a5 5 0 0110 0v4"></path>

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

      <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path>

      <path d="M13.73 21a2 2 0 01-3.46 0"></path>

    </svg>

  );

}