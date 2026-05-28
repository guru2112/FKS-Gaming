"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Profile } from "@/lib/auth";

interface SidebarProps {
  profile: Profile | null;
  getInitials: (name?: string) => string;
  handleLogout: () => void;
  bgUrl?: string;
}

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: DashboardIcon },
  { name: 'Book Slot', href: '/book', icon: CalendarIcon },
  { name: 'My Sessions', href: '/history', icon: SessionsIcon },
  { name: 'Games Library', href: '/games', icon: GamepadIcon },
  { name: 'Settings', href: '/settings', icon: SettingsIcon },
  { name: 'Help & Support', href: '/help-support', icon: HelpIcon },
];

export default function Sidebar({ profile, getInitials, handleLogout, bgUrl }: SidebarProps) {
  const pathname = usePathname();
  const [activeHash, setActiveHash] = useState(() =>
    typeof window === "undefined" ? "" : window.location.hash
  );

  useEffect(() => {
    const handleHashChange = () => setActiveHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const isActive = (href: string) => {
    if (href.startsWith('#')) return activeHash === href;
    if (href === '/dashboard') return pathname === '/dashboard' && activeHash === '';
    return pathname === href;
  };

  return (
    <aside className="flex flex-col w-full h-full bg-[#F3EFEC] relative overflow-hidden text-white">
      {bgUrl && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image src={bgUrl} alt="Sidebar BG" fill sizes="300px" className="object-cover opacity-95" />
          <div className="absolute inset-0 bg-[#1A1A1A]/15" />
        </div>
      )}
      <div className="shrink-0 px-6 pt-10 mb-8 relative z-10">
        <Link href="/dashboard" onClick={() => setActiveHash('')} className="font-display flex flex-col">
          <div className="text-3xl font-black italic tracking-wider drop-shadow-sm">
            <span className="text-white">JKS </span>
            <span className="text-[#ff6b35]">ARENA</span>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/70 mt-1 pl-0.5">Gaming Cafe</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 space-y-1.5 custom-scrollbar pb-4 relative z-10">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => {
                if (item.href.startsWith('#')) setActiveHash(item.href);
                if (item.href === '/dashboard') setActiveHash('');
              }}
              className={`flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                active
                  ? 'bg-[#ff6b35] text-white shadow-[0_4px_15px_rgba(255,107,53,0.3)]'
                  : 'text-white/80 hover:bg-[#ff6b35]/15 hover:text-[#ff6b35]'
              }`}
            >
              <div className="flex items-center gap-4">
                <item.icon className={`w-5 h-5 transition-colors ${active ? 'text-white' : 'text-white/60 group-hover:text-[#ff6b35]'}`} />
                <span className={`text-[13px] font-bold tracking-wide ${active ? 'text-white' : 'text-white/90'}`}>
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 p-6 bg-black/20 border-t border-white/10 relative z-10">
        <div className="flex items-center gap-4 mb-6 px-1">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-lg font-black text-[#ff6b35] shadow-[0_2px_10px_rgba(0,0,0,0.05)] ring-2 ring-[#ff6b35] p-0.5">
            <div className="w-full h-full overflow-hidden bg-white rounded-full flex items-center justify-center text-[#ff6b35] relative">
              {profile?.avatarUrl ? (
                <Image
                  key={profile?.avatarUrl || "default-avatar"}
                  src={profile?.avatarUrl}
                  alt="Avatar"
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              ) : (
                getInitials(profile?.name)
              )}
            </div>
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white truncate">{profile?.name || "Player"}</p>
            <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest truncate">
              Gamer
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-3 w-full px-4 py-3.5 rounded-xl text-[13px] font-black uppercase tracking-widest transition-all duration-300 bg-white border border-[#ff6b35]/30 text-[#ff6b35] shadow-sm hover:bg-[#ff6b35] hover:text-white group"
        >
          <LogoutIcon className="w-5 h-5 transition-colors" />
          <span>Logout</span>
        </button>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #DED5D0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #C5B8B0; }
      `}</style>
    </aside>
  );
}

function DashboardIcon(props: any) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>; }
function CalendarIcon(props: any) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>; }
function SessionsIcon(props: any) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><polyline points="12 6 12 12 16 14"></polyline></svg>; }
function GamepadIcon(props: any) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="6" y1="12" x2="10" y2="12"></line><line x1="8" y1="10" x2="8" y2="14"></line><line x1="15" y1="13" x2="15.01" y2="13"></line><line x1="18" y1="11" x2="18.01" y2="11"></line><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"></path></svg>; }
function SettingsIcon(props: any) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>; }
function HelpIcon(props: any) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>; }
function LogoutIcon(props: any) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>; }
