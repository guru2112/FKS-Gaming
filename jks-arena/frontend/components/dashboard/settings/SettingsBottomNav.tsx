"use client";

interface SettingsBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
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
    icon: LockIcon,
  },
  {
    id: "notifications",
    label: "Alerts",
    icon: BellIcon,
  },
];

export default function SettingsBottomNav({
  activeTab,
  setActiveTab,
}: SettingsBottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[80] bg-white/90 backdrop-blur-xl border-t border-[#1A1A1A]/8 md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 w-20 py-2 rounded-xl transition-all duration-200 ${
                active
                  ? "text-[#ff6b35]"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <tab.icon
                className="w-5 h-5"
                strokeWidth={active ? 2.4 : 1.8}
              />
              <span
                className={`text-[9px] font-bold tracking-wide ${
                  active ? "text-[#ff6b35]" : ""
                }`}
              >
                {tab.label}
              </span>
              {active && (
                <div className="w-1 h-1 rounded-full bg-[#ff6b35] -mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5.121 17.804A9 9 0 1118.88 17.8" />
      <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function LockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

function BellIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
}
