"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/apiClient";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import DurationPicker from "@/components/DurationPicker";

interface UserRescheduleModalProps {
  booking: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserRescheduleModal({ booking, onClose, onSuccess }: UserRescheduleModalProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [durationHours, setDurationHours] = useState(booking?.durationHours || 1);
  const [selectedDevice, setSelectedDevice] = useState(booking?.device);
  
  const [deviceStatus, setDeviceStatus] = useState<Record<string, string>>({});
  const [checking, setChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      
      const res = await api.get(`/api/bookings/availability-check?${query}`) as { devices: Record<string, string> };
      setDeviceStatus(res.devices);
      
      if (res.devices[selectedDevice] === "busy") {
        const firstFree = Object.keys(res.devices).find(k => res.devices[k] === "available");
        if (firstFree) setSelectedDevice(firstFree);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setChecking(false);
    }
  };

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
      await api.patch(`/api/bookings/${booking._id}/reschedule`, {
        slotStart: startIso,
        durationHours,
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
          className="relative w-full max-w-xl overflow-hidden rounded-[32px] border border-white/10 bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="p-6 border-b border-[#1A1A1A]/10 bg-[#FDF8F5]">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff6b35]">Your Session</p>
                <h2 className="text-xl font-black text-[#1A1A1A] mt-1 uppercase tracking-wider">Reschedule Session</h2>
              </div>
              <button onClick={onClose} className="p-2 rounded-full bg-[#1A1A1A]/5 hover:bg-[#1A1A1A]/10 text-[#1A1A1A] transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Original Details */}
            <div className="flex gap-4 p-4 rounded-2xl bg-[#FDF8F5] border border-[#ff6b35]/10">
              <div className="flex-1">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Original Date</p>
                <p className="text-sm text-[#1A1A1A] font-black">{new Date(booking.slotStart).toLocaleDateString()}</p>
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Original Time</p>
                <p className="text-sm text-[#1A1A1A] font-black">
                  {new Date(booking.slotStart).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
            </div>

            {/* Time Shift Controls */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">1. Adjust Start Time</label>
              
              <div className="flex gap-2 mb-4">
                <button onClick={() => shiftTime(-15)} className="flex-1 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs text-slate-600 font-bold transition-all shadow-sm">-15m</button>
                <button onClick={() => shiftTime(15)} className="flex-1 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs text-slate-600 font-bold transition-all shadow-sm">+15m</button>
                <button onClick={() => shiftTime(30)} className="flex-1 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs text-slate-600 font-bold transition-all shadow-sm">+30m</button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="date" 
                  value={date} 
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#1A1A1A] font-bold focus:outline-none focus:border-[#ff6b35] shadow-sm"
                />
                <input 
                  type="time" 
                  value={time} 
                  onChange={e => setTime(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#1A1A1A] font-bold focus:outline-none focus:border-[#ff6b35] shadow-sm"
                />
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">2. New Duration</label>
              <DurationPicker 
                value={durationHours} 
                onChange={setDurationHours} 
                theme="light" 
              />
            </div>

            {/* Device Selection */}
            <div>
              <div className="flex justify-between items-end mb-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">3. Select Console</label>
                {checking && <span className="text-[10px] text-[#ff6b35] animate-pulse font-bold">Checking availability...</span>}
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
                          ? "opacity-50 cursor-not-allowed border-red-500/20 bg-red-50"
                          : isSelected
                            ? "border-[#ff6b35] bg-[#ff6b35]/10 shadow-[0_0_15px_rgba(255,107,53,0.15)]"
                            : "border-slate-200 bg-white hover:border-slate-300 shadow-sm"
                      }`}
                    >
                      <p className={`text-sm font-black tracking-wider ${isSelected ? "text-[#ff6b35]" : "text-[#1A1A1A]"}`}>{dev}</p>
                      <p className={`text-[10px] uppercase font-bold mt-1 ${isBusy ? "text-red-500" : isAvailable ? "text-green-500" : "text-slate-400"}`}>
                        {isBusy ? "Busy / Booked" : isAvailable ? "Available" : "Checking..."}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-100 bg-slate-50">
            <button
              onClick={handleReschedule}
              disabled={isSubmitting || deviceStatus[selectedDevice] === "busy"}
              className="w-full bg-[#1A1A1A] hover:bg-[#ff6b35] text-white font-black uppercase tracking-widest text-sm py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(0,0,0,0.1)] hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Updating..." : "Confirm Reschedule"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
