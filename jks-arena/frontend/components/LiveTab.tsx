"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import QuickStartWalkIn from "@/components/QuickStartWalkIn";
import RescheduleModal from "@/components/dashboard/RescheduleModal";
import ExtendSessionModal from "@/components/dashboard/ExtendSessionModal";
import { formatDuration } from "@/lib/utils/formatDuration";


const DEVICES = ["PS1", "PS2", "PS3", "SIM1"];

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });
}

interface LiveTabProps {
  onBack?: () => void;
}

export default function LiveTab({ onBack }: LiveTabProps) {
  const [liveBookings, setLiveBookings] = useState<any[]>([]);
  const [todayBookings, setTodayBookings] = useState<any[]>([]);
  const [now, setNow] = useState(new Date().getTime());
  const [extendSessionModal, setExtendSessionModal] = useState<any | null>(null);
  const [reschedulingBooking, setReschedulingBooking] = useState<any | null>(null);

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
      const data = await api.get("/api/admin/sessions") as { sessions: any[] };
      if (data.sessions) setTodayBookings(data.sessions);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button 
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-black/10 text-slate-600 hover:text-[#ff6b35] hover:border-[#ff6b35]/30 transition-all shadow-sm"
              title="Back to Dashboard"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
          )}
          <h2 className="font-display text-2xl font-black uppercase text-[#1A1A1A] tracking-wide">Live Arena Monitor</h2>
        </div>
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
              <div key={device} className="rounded-2xl border border-dashed border-slate-200 bg-white/70 backdrop-blur-sm p-4 flex flex-col items-center justify-center min-h-[180px] shadow-sm">
                <p className="text-lg font-black text-slate-700 uppercase tracking-widest">{device}</p>
                <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mt-1">Available</p>
              </div>
            );
          }

          // Rig is Active
          const time = getRemainingTime(activeSession.slotEnd);

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
            <div key={device} className={`rounded-2xl border p-4 flex flex-col justify-between min-h-[180px] transition-colors shadow-sm ${cardColor}`}>
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="px-2 py-1 bg-black/5 text-slate-700 text-[9px] font-black uppercase tracking-widest rounded-lg">
                    {device}
                  </span>
                  <span className="flex h-3 w-3 relative">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${ringGlow}`}></span>
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${ringColor}`}></span>
                  </span>
                </div>

                <h3 className="font-bold text-[#1A1A1A] text-base line-clamp-1">{activeSession.userName}</h3>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mt-0.5">{activeSession.players} Player{activeSession.players > 1 ? 's' : ''} • {formatDuration(activeSession.durationHours)} Session</p>
              </div>

              <div className="mt-4 text-center">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mb-1">
                  {time.isExpired ? "Time Up!" : "Time Remaining"}
                </p>
                <p className={`font-display text-3xl tabular-nums tracking-tight drop-shadow-md ${timerColor}`}>
                  {time.text}
                </p>
              </div>

              {/* Extend Time Section */}
              <div className="mt-3 relative">
                <button
                  onClick={() => setExtendSessionModal(activeSession)}
                  style={clipPathStyle}
                  className="w-full py-3 text-[10px] font-black uppercase tracking-widest bg-slate-800 text-white hover:bg-slate-900 transition-all shadow-[0_0_10px_rgba(0,0,0,0.15)]"
                >
                  Extend Time
                </button>
              </div>

              <button
                onClick={() => handleEndSession(activeSession._id)}
                style={clipPathStyle}
                className={`mt-2 w-full py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quick Walk-In Form */}
        <div className="lg:col-span-4">
          <QuickStartWalkIn occupiedDevices={occupiedDevices} onStarted={() => { fetchLiveRigs(); fetchTodayBookings(); }} />
        </div>

        {/* Today's Slots Table */}
        <div className="lg:col-span-8 bg-white/80 backdrop-blur-md rounded-3xl border border-black/5 shadow-lg overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between shrink-0">
            <div>
              <h3 className="font-display text-lg font-black uppercase text-[#1A1A1A] tracking-wide">Today&apos;s Slots</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-0.5">{todayBookings.length} booking{todayBookings.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <div className="overflow-auto scrollbar-hide flex-1" style={{ maxHeight: 460 }}>
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-black/5 text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-50">
                  <th className="px-3 py-3 font-black text-center w-[60px]">PS1</th>
                  <th className="px-3 py-3 font-black text-center w-[60px]">PS2</th>
                  <th className="px-3 py-3 font-black text-center w-[60px]">PS3</th>
                  <th className="px-3 py-3 font-black text-center w-[60px]">SIM</th>
                  <th className="px-4 py-3 font-black">Customer</th>
                  <th className="px-4 py-3 font-black">Phone</th>
                  <th className="px-4 py-3 font-black">Duration</th>
                  <th className="px-4 py-3 font-black text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-700">
                {todayBookings.filter(b => b.status === "upcoming" || b.status === "active").length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-16 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">No active or upcoming bookings.</td></tr>
                ) : (
                  todayBookings
                    .filter(b => b.status === "upcoming" || b.status === "active")
                    .map((b) => {
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
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="text-xs font-bold text-slate-600">{formatDuration(b.durationHours)}</p>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <button
                            onClick={() => setReschedulingBooking(b)}
                            className="bg-[#ff6b35]/10 text-[#ff6b35] hover:bg-[#ff6b35]/20 border border-[#ff6b35]/20 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                          >
                            Reschedule
                          </button>
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
      
      {reschedulingBooking && (
        <RescheduleModal
          booking={reschedulingBooking}
          onClose={() => setReschedulingBooking(null)}
          onSuccess={() => {
            setReschedulingBooking(null);
            fetchTodayBookings();
            fetchLiveRigs();
          }}
        />
      )}

      {extendSessionModal && (
        <ExtendSessionModal
          session={extendSessionModal}
          onClose={() => setExtendSessionModal(null)}
          onSuccess={() => {
            setExtendSessionModal(null);
            fetchLiveRigs();
            fetchTodayBookings();
          }}
        />
      )}
    </div>
  );
}
