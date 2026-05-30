"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/apiClient";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import DurationPicker from "@/components/DurationPicker";

interface RescheduleModalProps {
  booking: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RescheduleModal({ booking, onClose, onSuccess }: RescheduleModalProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [durationHours, setDurationHours] = useState(booking?.durationHours || 1);
  const [players, setPlayers] = useState(booking?.players || 1);
  const [selectedDevice, setSelectedDevice] = useState(booking?.device);
  
  const [deviceStatus, setDeviceStatus] = useState<Record<string, string>>({});
  const [checking, setChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize date/time from booking
  useEffect(() => {
    if (booking.slotStart) {
      const d = new Date(booking.slotStart);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      setDate(`${year}-${month}-${day}`);

      const hours = String(d.getHours()).padStart(2, "0");
      const mins = String(d.getMinutes()).padStart(2, "0");
      setTime(`${hours}:${mins}`);
    }
  }, [booking]);

  const checkAvailability = async () => {
    if (!date || !time || !durationHours) return;
    setChecking(true);
    try {
      const startIso = new Date(`${date}T${time}`).toISOString();
      const query = new URLSearchParams({
        slotStart: startIso,
        durationHours: durationHours.toString(),
        excludeBookingId: booking._id
      }).toString();
      
      const res = await api.get(`/api/admin/availability-check?${query}`) as { devices: Record<string, string> };
      setDeviceStatus(res.devices);
      
      // If currently selected device becomes busy, unselect it (or try to select a free one)
      if (res.devices[selectedDevice] === "busy") {
        const firstFree = Object.keys(res.devices).find(k => res.devices[k] === "available");
        if (firstFree) setSelectedDevice(firstFree);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to check availability");
    } finally {
      setChecking(false);
    }
  };

  // Auto-check when dependencies change
  useEffect(() => {
    const timer = setTimeout(() => {
      checkAvailability();
    }, 500);
    return () => clearTimeout(timer);
  }, [date, time, durationHours]);

  const handleReschedule = async () => {
    if (deviceStatus[selectedDevice] === "busy") {
      toast.error("Selected console is busy at this time.");
      return;
    }

    setIsSubmitting(true);
    try {
      const startIso = new Date(`${date}T${time}`).toISOString();
      await api.patch(`/api/admin/bookings/${booking._id}/reschedule`, {
        slotStart: startIso,
        durationHours,
        players,
        device: selectedDevice
      });
      toast.success("Booking rescheduled successfully!");
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to reschedule.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const shiftTime = (mins: number) => {
    if (!date || !time) return;
    const d = new Date(`${date}T${time}`);
    d.setMinutes(d.getMinutes() + mins);
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    setDate(`${year}-${month}-${day}`);

    const hours = String(d.getHours()).padStart(2, "0");
    const newMins = String(d.getMinutes()).padStart(2, "0");
    setTime(`${hours}:${newMins}`);
  };

  if (!booking) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl overflow-hidden rounded-[32px] border border-white/10 bg-[#0A0A0A] shadow-2xl"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/5 bg-white/[0.02]">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff6b35]">Admin Action</p>
                <h2 className="text-xl font-bold text-white mt-1 uppercase tracking-wider">Reschedule Session</h2>
              </div>
              <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors">
                ✕
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            
            {/* Original Details */}
            <div className="flex gap-4 p-4 rounded-2xl bg-black/40 border border-white/5">
              <div className="flex-1">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Customer</p>
                <p className="text-sm text-white font-medium">{booking.userName}</p>
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Original Time</p>
                <p className="text-sm text-white font-medium">
                  {new Date(booking.slotStart).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
            </div>

            {/* Time Shift Controls */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">1. Adjust Start Time</label>
              
              <div className="flex gap-2 mb-4">
                <button onClick={() => shiftTime(-15)} className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white font-medium transition-all">-15m Early</button>
                <button onClick={() => shiftTime(15)} className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white font-medium transition-all">+15m Delay</button>
                <button onClick={() => shiftTime(30)} className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white font-medium transition-all">+30m Delay</button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="date" 
                  value={date} 
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff6b35]"
                />
                <input 
                  type="time" 
                  value={time} 
                  onChange={e => setTime(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff6b35]"
                />
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">2. New Duration</label>
              <DurationPicker 
                value={durationHours} 
                onChange={setDurationHours} 
                theme="dark" 
              />
            </div>

            {/* Players */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Players</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPlayers(Math.max(1, players - 1))}
                  className="w-10 h-10 shrink-0 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-lg transition-all"
                >
                  −
                </button>
                <span className="font-display text-xl font-bold text-white tabular-nums w-8 text-center">{players}</span>
                <button
                  onClick={() => setPlayers(Math.min(4, players + 1))}
                  className="w-10 h-10 shrink-0 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-lg transition-all"
                >
                  +
                </button>
              </div>
            </div>

            {/* Device Selection */}
            <div>
              <div className="flex justify-between items-end mb-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">3. Select Console</label>
                {checking && <span className="text-[10px] text-[#ff6b35] animate-pulse">Checking live availability...</span>}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {["PS1", "PS2", "PS3", "SIM1"].map(dev => {
                  const isAvailable = deviceStatus[dev] === "available";
                  const isBusy = deviceStatus[dev] === "busy";
                  const isSelected = selectedDevice === dev;
                  
                  return (
                    <button
                      key={dev}
                      disabled={isBusy}
                      onClick={() => setSelectedDevice(dev)}
                      className={`relative p-4 text-left rounded-2xl border transition-all ${
                        isBusy 
                          ? "opacity-50 cursor-not-allowed border-red-500/20 bg-red-500/5"
                          : isSelected
                            ? "border-[#ff6b35] bg-[#ff6b35]/10 shadow-[0_0_15px_rgba(255,107,53,0.2)]"
                            : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <p className={`text-sm font-black tracking-wider ${isSelected ? "text-[#ff6b35]" : "text-white"}`}>{dev}</p>
                      <p className={`text-[10px] uppercase font-bold mt-1 ${isBusy ? "text-red-400" : isAvailable ? "text-green-400" : "text-slate-500"}`}>
                        {isBusy ? "Busy / Booked" : isAvailable ? "Available" : "Checking..."}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/5 bg-black/40">
            <button
              onClick={handleReschedule}
              disabled={isSubmitting || deviceStatus[selectedDevice] === "busy"}
              className="w-full bg-[#ff6b35] hover:bg-white text-black font-black uppercase tracking-widest text-sm py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Updating..." : "Confirm Reschedule"}
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
