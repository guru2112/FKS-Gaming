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

type Tab = "overview" | "scanner" | "live" | "users" | "bookings" | "combos" | "media"; 

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
  const { overview, users, bookings, combos, media, refresh } = useAdmin();

  const navItems: Array<{ key: Tab; label: string }> = [
    { key: "overview", label: "Overview" },
    { key: "scanner", label: "Scanner" },
    { key: "live", label: "Live" },
    { key: "users", label: "Users" },
    { key: "bookings", label: "Bookings" },
    { key: "combos", label: "Combos" },
    { key: "media", label: "Media" },
  ];

  const handleLogout = () => {
    localStorage.clear(); 
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-[#F3EFEC] text-[#1A1A1A] p-4 sm:p-6 lg:p-8 selection:bg-[#ff6b35] selection:text-white">

      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">

          {/* ================= SIDEBAR ================= */}
          <aside className="rounded-3xl border border-black/5 bg-[#F3EFEC] shadow-lg overflow-hidden lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:self-start flex flex-col">
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

              <div className="pt-3 mt-3 border-t border-black/5" />

              <Link
                href="/admin/walkins"
                className="w-full flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 text-slate-600 hover:bg-[#ff6b35]/5 hover:text-[#ff6b35]"
              >
                <span className="text-[13px] font-bold tracking-wide">Walk-In Entry</span>
              </Link>

              <Link
                href="/admin/sessions"
                className="w-full flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 text-slate-600 hover:bg-[#ff6b35]/5 hover:text-[#ff6b35]"
              >
                <span className="text-[13px] font-bold tracking-wide">Sessions</span>
              </Link>
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
            <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#ff6b35]">Admin Dashboard</p>
                <h1 className="text-4xl font-display font-black text-[#1A1A1A] mt-1 uppercase tracking-tight">Command Center</h1>
                <p className="mt-2 text-xs font-bold tracking-[0.18em] uppercase text-slate-500">
                  <span className="text-[#ff6b35]">JKS Arena</span> • Manage bookings, sessions and media
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/admin/walkins"
                  className="self-start sm:self-auto bg-white border border-[#ff6b35]/30 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#ff6b35] hover:bg-[#ff6b35] hover:text-white transition-all shadow-sm"
                >
                  Walk-In
                </Link>
                <button
                  onClick={refresh}
                  className="self-start sm:self-auto bg-white/70 border border-black/5 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-[#ff6b35] hover:border-[#ff6b35]/20 transition-all shadow-sm"
                >
                  ↻ Refresh
                </button>
              </div>
            </header>

            {/* ================= TAB CONTENT ================= */}
            <main className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {tab === "overview" && (
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl font-black uppercase text-[#1A1A1A] tracking-wide">System Overview</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card title="Registered Users" value={overview.users || 0} />
                <Card title="Total Bookings" value={overview.bookings || 0} />
                <Card title="Active Combos" value={overview.combos || 0} />
                <Card title="Media Assets" value={media?.length || 0} />
              </div>
            </div>
          )}

          {tab === "scanner" && <ScannerTab bookings={bookings} onRefresh={refresh} />}
          {tab === "live" && <LiveTab />} 
          {tab === "users" && <UsersTab users={users} onRefresh={refresh} />}
          {tab === "bookings" && <BookingsTab bookings={bookings} onRefresh={refresh} />}
          {tab === "combos" && <CombosTab combos={combos} />} 
          {tab === "media" && <MediaTab />}
        </main>

          </div>
        </div>
      </div>
    </div>
  );
}