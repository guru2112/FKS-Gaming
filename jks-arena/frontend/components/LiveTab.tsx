"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import QuickStartWalkIn from "@/components/QuickStartWalkIn";

const DEVICES = ["PS1", "PS2", "PS3", "SIM1"];

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });
}

const EXTEND_OPTIONS = [
  { label: "+30 min", minutes: 30 },
  { label: "+1 hour", minutes: 60 },
  { label: "+2 hours", minutes: 120 },
];

export default function LiveTab() {
  const [liveBookings, setLiveBookings] = useState<any[]>([]);
  const [todayBookings, setTodayBookings] = useState<any[]>([]);
  const [now, setNow] = useState(new Date().getTime());
  const [extendOpen, setExtendOpen] = useState<string | null>(null);
  const [extending, setExtending] = useState(false);

  const fetchLiveRigs = useCallback(async () => {
    try {
      const data = await api.get("/api/admin/live") as { liveBookings: any[] };
      if (data.liveBookings) setLiveBookings(data.liveBookings);
    } catch (err) {
      console.error("Failed to fetch live rigs:", err);
    }
  }, []);

  const fetchTodayBookings = useCallback(async () => {
    try {
      const data = await api.get("/api/admin/today-bookings") as { bookings: any[] };
      if (data.bookings) setTodayBookings(data.bookings);
    } catch (err) {
      console.error("Failed to fetch today's bookings:", err);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void fetchLiveRigs();
      void fetchTodayBookings();
    }, 0);
    const interval = setInterval(() => {
      void fetchLiveRigs();
      void fetchTodayBookings();
    }, 30000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [fetchLiveRigs, fetchTodayBookings]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date().getTime()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleEndSession = async (id: string) => {
    if (!confirm("Are you sure you want to end this session?")) return;
    try {
      await api.post(`/api/admin/end-session/${id}`, {});
      void fetchLiveRigs();
    } catch (err) {
      console.error("Failed to end session:", err);
    }
  };

  const handleExtend = async (id: string, minutes: number) => {
    setExtending(true);
    try {
      await api.patch(`/api/admin/extend-session/${id}`, { extraMinutes: minutes });
      setExtendOpen(null);
      void fetchLiveRigs();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to extend session.";
      alert(msg);
    } finally {
      setExtending(false);
    }
  };

  const getRemainingTime = (slotEnd: string) => {
    const endTime = new Date(slotEnd).getTime();
    const diff = endTime - now;

    if (diff <= 0) return { text: "00:00:00", isExpired: true, minutesLeft: 0 };

    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    return {
      text: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`,
      isExpired: false,
      minutesLeft: Math.floor(diff / (1000 * 60)),
    };
  };

  const clipPathStyle = { clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)" };

  const occupiedDevices = liveBookings.map((b) => b.device);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-black uppercase text-[#1A1A1A] tracking-wide">Live Arena Monitor</h2>
        <button onClick={fetchLiveRigs} className="text-[10px] font-black text-slate-600 hover:text-[#ff6b35] uppercase tracking-widest flex items-center gap-2 transition-colors">
          <span>↻ Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {DEVICES.map((device) => {
          const activeSession = liveBookings.find((b) => b.device === device);

          if (!activeSession) {
            // Rig is Empty (Dark Theme)
            return (
              <div key={device} className="rounded-3xl border border-dashed border-slate-200 bg-white/70 backdrop-blur-sm p-6 flex flex-col items-center justify-center min-h-[250px] shadow-sm">
                <p className="text-xl font-black text-slate-700 uppercase tracking-widest">{device}</p>
                <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mt-2">Available</p>
              </div>
            );
          }

          // Rig is Active
          const time = getRemainingTime(activeSession.slotEnd);
          const isDropdownOpen = extendOpen === activeSession._id;
          const rate = activeSession.perHeadRate || 60;

          let cardColor = "bg-white/80 border-black/5";
          let timerColor = "text-[#1A1A1A]";
          let ringColor = "bg-green-500";
          let ringGlow = "bg-green-400";

          if (time.isExpired) {
            cardColor = "bg-red-500/10 border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.10)]";
            timerColor = "text-red-600";
            ringColor = "bg-red-500";
            ringGlow = "bg-red-400";
          } else if (time.minutesLeft <= 5) {
            cardColor = "bg-[#ff6b35]/10 border-[#ff6b35]/30 shadow-[0_0_30px_rgba(255,107,53,0.10)]";
            timerColor = "text-[#ff6b35]";
            ringColor = "bg-[#ff6b35]";
            ringGlow = "bg-[#ff6b35]";
          }

          return (
            <div key={device} className={`rounded-3xl border p-6 flex flex-col justify-between min-h-[250px] transition-colors shadow-sm ${cardColor}`}>
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-black/5 text-slate-700 text-[10px] font-black uppercase tracking-widest rounded-lg">
                    {device}
                  </span>
                  <span className="flex h-3 w-3 relative">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${ringGlow}`}></span>
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${ringColor}`}></span>
                  </span>
                </div>

                <h3 className="font-bold text-[#1A1A1A] text-lg line-clamp-1">{activeSession.userName}</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mt-1">{activeSession.players} Player{activeSession.players > 1 ? 's' : ''} • {activeSession.durationHours} Hr Session</p>
              </div>

              <div className="mt-6 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-1">
                  {time.isExpired ? "Time Up!" : "Time Remaining"}
                </p>
                <p className={`font-display text-4xl tabular-nums tracking-tight drop-shadow-md ${timerColor}`}>
                  {time.text}
                </p>
              </div>

              {/* Extend Time Section */}
              <div className="mt-4 relative">
                <button
                  onClick={() => setExtendOpen(isDropdownOpen ? null : activeSession._id)}
                  style={clipPathStyle}
                  className="w-full py-3 text-[10px] font-black uppercase tracking-widest bg-slate-800 text-white hover:bg-slate-900 transition-all shadow-[0_0_10px_rgba(0,0,0,0.15)]"
                >
                  Extend Time
                </button>

                {isDropdownOpen && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white/95 backdrop-blur-sm border border-black/10 rounded-2xl p-2 shadow-lg z-10">
                    {EXTEND_OPTIONS.map((opt) => {
                      const cost = Math.round(activeSession.players * rate * (opt.minutes / 60));
                      return (
                        <button
                          key={opt.minutes}
                          disabled={extending}
                          onClick={() => handleExtend(activeSession._id, opt.minutes)}
                          className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-slate-700 hover:bg-[#ff6b35]/10 hover:text-[#ff6b35] rounded-xl transition-colors disabled:opacity-50"
                        >
                          <span className="uppercase tracking-wider">{opt.label}</span>
                          <span className="font-display text-sm">₹{cost}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                onClick={() => handleEndSession(activeSession._id)}
                style={clipPathStyle}
                className={`mt-2 w-full py-4 text-xs font-black uppercase tracking-widest transition-all ${
                  time.isExpired
                    ? "bg-red-600 text-white hover:bg-red-700 shadow-[0_0_15px_rgba(239,68,68,0.25)]"
                    : "bg-[#ff6b35] text-white hover:brightness-95 shadow-[0_0_15px_rgba(255,107,53,0.20)]"
                }`}
              >
                End Session
              </button>
            </div>
          );
        })}
      </div>

      {/* Walk-In Form + Today's Slots side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Quick Walk-In Form */}
        <div className="lg:col-span-2">
          <QuickStartWalkIn occupiedDevices={occupiedDevices} onStarted={() => { fetchLiveRigs(); fetchTodayBookings(); }} />
        </div>

        {/* Today's Slots Table */}
        <div className="lg:col-span-3 bg-white/80 backdrop-blur-md rounded-3xl border border-black/5 shadow-lg overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between shrink-0">
            <div>
              <h3 className="font-display text-lg font-black uppercase text-[#1A1A1A] tracking-wide">Today&apos;s Slots</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-0.5">{todayBookings.length} booking{todayBookings.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <div className="overflow-auto flex-1" style={{ maxHeight: 460 }}>
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-black/5 text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-50">
                  <th className="px-3 py-3 font-black text-center w-[60px]">PS1</th>
                  <th className="px-3 py-3 font-black text-center w-[60px]">PS2</th>
                  <th className="px-3 py-3 font-black text-center w-[60px]">PS3</th>
                  <th className="px-3 py-3 font-black text-center w-[60px]">SIM</th>
                  <th className="px-4 py-3 font-black">Customer</th>
                  <th className="px-4 py-3 font-black">Phone</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-700">
                {todayBookings.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-16 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">No bookings today.</td></tr>
                ) : (
                  todayBookings.map((b) => {
                    const isActive = b.status === "active";
                    const isCompleted = b.status === "completed";
                    return (
                      <tr key={b._id} className="border-b border-black/5 hover:bg-slate-50/70 transition-colors">
                        {DEVICES.map((d) => (
                          <td key={d} className="px-3 py-3 text-center">
                            {b.device === d ? (
                              <div className={`inline-flex items-center justify-center rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-widest border ${
                                isActive ? "bg-[#ff6b35]/10 text-[#ff6b35] border-[#ff6b35]/30" :
                                isCompleted ? "bg-slate-100 text-slate-600 border-black/5" :
                                "bg-green-500/10 text-green-700 border-green-500/30"
                              }`}>
                                {formatTime(b.slotStart)}
                              </div>
                            ) : null}
                          </td>
                        ))}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="text-sm font-bold text-slate-900">{b.userName}</p>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="text-xs font-bold text-slate-600">{b.userContact}</p>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
