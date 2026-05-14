"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/auth"; // Assume you want to use the global base URL

const DEVICES = ["PS1", "PS2", "PS3", "SIM1"];

export default function LiveTab() {
  const [liveBookings, setLiveBookings] = useState<any[]>([]);
  const [now, setNow] = useState(new Date().getTime());

  const fetchLiveRigs = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${API_BASE_URL}/api/admin/live`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.liveBookings) setLiveBookings(data.liveBookings);
    } catch (err) {
      console.error("Failed to fetch live rigs:", err);
    }
  };

  useEffect(() => {
    fetchLiveRigs();
    const interval = setInterval(fetchLiveRigs, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date().getTime()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleEndSession = async (id: string) => {
    if (!confirm("Are you sure you want to end this session?")) return;
    try {
      const token = localStorage.getItem("auth_token");
      await fetch(`${API_BASE_URL}/api/admin/end-session/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchLiveRigs();
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

              <button 
                onClick={() => handleEndSession(activeSession._id)}
                style={clipPathStyle}
                className={`mt-6 w-full py-4 text-xs font-black uppercase tracking-widest transition-all ${
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
    </div>
  );
}