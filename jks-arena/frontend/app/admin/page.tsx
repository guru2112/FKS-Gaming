"use client";

import { useState } from "react";
import Link from "next/link";
import { useAdmin } from "../hooks/useAdmin";

import UsersTab from "@/components/UserTab";
import BookingsTab from "@/components/BookingsTab";
import CombosTab from "@/components/CombosTab";
import MediaTab from "@/components/MediaTab";
import ScannerTab from "@/components/ScannerTab"; 
import LiveTab from "@/components/LiveTab"; 
import NotificationsTab from "@/components/NotificationsTab";
import AnalyticsTab from "@/components/AnalyticsTab";

type Tab = "overview" | "scanner" | "live" | "users" | "bookings" | "combos" | "media" | "notifications" | "analytics";

function Card({ title, value }: { title: string, value: number }) {
  return (
    <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-lg border border-black/5 flex flex-col justify-center relative overflow-hidden group hover:border-[#ff6b35]/30 transition-colors">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff6b35]/10 blur-2xl rounded-full pointer-events-none group-hover:bg-[#ff6b35]/15 transition-all"></div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff6b35] mb-1 relative z-10">Total Count</p>
      <p className="text-xs font-bold uppercase tracking-widest text-slate-600 relative z-10">{title}</p>
      <h2 className="text-5xl font-display text-[#1A1A1A] mt-3 relative z-10 drop-shadow-sm">{value}</h2>
    </div>
  );
}

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { overview, users, bookings, combos, media, refresh } = useAdmin();

  const navItems: Array<{ key: Tab; label: string }> = [
    { key: "overview", label: "Overview" },
    { key: "scanner", label: "Scanner" },
    { key: "live", label: "Live" },
    { key: "users", label: "Users" },
    { key: "bookings", label: "Bookings" },
    { key: "combos", label: "Combos" },
    { key: "media", label: "Media" },
    { key: "notifications", label: "Broadcasts" },
    { key: "analytics", label: "Analytics" },
  ];

  const handleLogout = () => {
    localStorage.clear(); 
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-[#F3EFEC] text-[#1A1A1A] p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 selection:bg-[#ff6b35] selection:text-white">

      <div className="max-w-[1400px] mx-auto">
        <div className={`grid grid-cols-1 ${tab === "analytics" || tab === "live" ? "" : "lg:grid-cols-[280px_1fr]"} gap-6`}>

          {/* ================= SIDEBAR ================= */}
          <aside className={`${tab === "analytics" || tab === "live" ? "hidden" : "hidden lg:flex"} flex-col rounded-3xl border border-black/5 bg-[#F3EFEC] shadow-lg overflow-hidden sticky top-6 h-[calc(100vh-3rem)] self-start`}>
            <div className="px-6 pt-10 pb-6">
              <Link href="/admin" className="font-display flex flex-col">
                <div className="text-3xl font-black italic tracking-wider drop-shadow-sm">
                  <span className="text-[#1A1A1A]">JKS </span>
                  <span className="text-[#ff6b35]">ARENA</span>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500 mt-1 pl-0.5">Admin Panel</span>
              </Link>
            </div>

            <nav className="px-4 pb-6 space-y-1.5 flex-1 overflow-y-auto min-h-0">
              {navItems.map((item) => {
                const active = tab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setTab(item.key)}
                    className={`w-full flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                      active
                        ? "bg-[#ff6b35] text-white shadow-[0_4px_15px_rgba(255,107,53,0.25)]"
                        : "text-slate-600 hover:bg-[#ff6b35]/5 hover:text-[#ff6b35]"
                    }`}
                  >
                    <span className={`text-[13px] font-bold tracking-wide ${active ? "text-white" : ""}`}>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="p-6 bg-white/50 border-t border-black/5">
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-3 w-full px-4 py-3.5 rounded-xl text-[13px] font-black uppercase tracking-widest transition-all duration-300 bg-white border border-[#ff6b35]/30 text-[#ff6b35] shadow-sm hover:bg-[#ff6b35] hover:text-white"
              >
                Logout
              </button>
            </div>
          </aside>

          {/* ================= MAIN ================= */}
          <div className="space-y-6">

            {/* ================= HEADER ================= */}
            {tab !== "analytics" && tab !== "live" && (
            <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div className="flex items-start justify-between w-full sm:w-auto">
                <div>
                  <h1 className="text-4xl font-display font-black text-[#1A1A1A] mt-1 uppercase tracking-tight">Admin Command Center</h1>
                </div>
                {/* Mobile Menu Toggle (Alternative to bottom nav "Menu" button, kept for redundancy) */}
                <button 
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="lg:hidden w-10 h-10 bg-white rounded-xl border border-black/10 flex flex-col items-center justify-center gap-1 shadow-sm mt-1"
                >
                  <div className="w-4 h-[2px] bg-[#1A1A1A] rounded-full"></div>
                  <div className="w-4 h-[2px] bg-[#1A1A1A] rounded-full"></div>
                  <div className="w-4 h-[2px] bg-[#1A1A1A] rounded-full"></div>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => refresh(true)}
                  className="w-full sm:w-auto bg-white/70 border border-black/5 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-[#ff6b35] hover:border-[#ff6b35]/20 transition-all shadow-sm"
                >
                  ↻ Refresh
                </button>
              </div>
            </header>
            )}

            {/* ================= TAB CONTENT ================= */}
            <main className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {tab === "overview" && (
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl font-black uppercase text-[#1A1A1A] tracking-wide">System Overview</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                <Card title="Registered Users" value={overview.users || 0} />
                <Card title="Total Bookings" value={overview.bookings || 0} />
                <Card title="Active Combos" value={overview.combos || 0} />
                <Card title="Total Emails" value={(overview as any).emails || 0} />
                <Card title="Media Assets" value={media?.length || 0} />
              </div>
            </div>
          )}

          {tab === "scanner" && <ScannerTab bookings={bookings} onRefresh={refresh} />}
          {tab === "live" && <LiveTab onBack={() => setTab("overview")} />} 
          {tab === "users" && <UsersTab users={users} onRefresh={refresh} />}
          {tab === "bookings" && <BookingsTab bookings={bookings} onRefresh={refresh} />}
          {tab === "combos" && <CombosTab combos={combos} />} 
          {tab === "media" && <MediaTab />}
          {tab === "notifications" && <NotificationsTab />}
          {tab === "analytics" && <AnalyticsTab bookings={bookings} users={users} onBack={() => setTab("overview")} />}
        </main>

          </div>
        </div>
      </div>

      {/* ================= MOBILE MENU OVERLAY ================= */}
      <div
        onClick={() => setIsMobileMenuOpen(false)}
        className={`fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      <div
        className={`fixed top-0 right-0 z-[100] w-72 h-full bg-[#F3EFEC] border-l border-[#1A1A1A]/10 shadow-2xl flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center px-5 pt-6 pb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#ff6b35]">Menu</p>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-8 h-8 rounded-full bg-white border border-[#1A1A1A]/10 flex items-center justify-center text-slate-500 hover:text-[#ff6b35] transition-colors"
          >
            <span className="text-lg leading-none">×</span>
          </button>
        </div>
        
        <div className="px-5 pb-6">
          <div className="font-display flex flex-col">
            <div className="text-2xl font-black italic tracking-wider drop-shadow-sm leading-none">
              <span className="text-[#1A1A1A]">JKS </span>
              <span className="text-[#ff6b35]">ARENA</span>
            </div>
            <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-slate-500 mt-1 pl-0.5">Admin Panel</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 space-y-2 pb-4">
          {navItems.map((item) => {
            const active = tab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => { setTab(item.key); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center px-4 py-3.5 rounded-xl transition-all duration-300 ${
                  active
                    ? "bg-[#ff6b35] text-white"
                    : "text-[#1A1A1A] hover:bg-[#ff6b35]/10"
                }`}
              >
                <span className="text-[13px] font-bold tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-[#1A1A1A]/10 bg-white/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-white border border-[#ff6b35]/30 text-[#ff6b35] text-[11px] font-black uppercase tracking-widest hover:bg-[#ff6b35] hover:text-white transition-colors shadow-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* ================= BOTTOM NAV (MOBILE) ================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-[80] bg-white/90 backdrop-blur-xl border-t border-[#1A1A1A]/8 lg:hidden pb-safe">
        <div className="flex items-center justify-around h-16 px-2 max-w-md mx-auto">
          {[
            { key: "overview", label: "Home", icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
            { key: "scanner", label: "Scan", icon: "M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10M12 7v10" },
            { key: "live", label: "Live", icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8z" },
            { key: "bookings", label: "Bookings", icon: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" },
            { key: "menu", label: "Menu", icon: "M4 6h16M4 12h16M4 18h16" },
          ].map((item) => {
            const active = item.key === "menu" ? isMobileMenuOpen : tab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  if (item.key === "menu") {
                    setIsMobileMenuOpen(true);
                  } else {
                    setTab(item.key as Tab);
                  }
                }}
                className={`flex flex-col items-center justify-center gap-1 w-16 py-2 rounded-xl transition-all duration-200 ${
                  active ? "text-[#ff6b35]" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                </svg>
                <span className={`text-[9px] font-bold tracking-wide ${active ? "text-[#ff6b35]" : ""}`}>
                  {item.label}
                </span>
                {active && <div className="w-1 h-1 rounded-full bg-[#ff6b35] -mt-0.5" />}
              </button>
            );
          })}
        </div>
      </nav>

    </div>
  );
}