"use client";
import { useState } from "react";
import { api } from "@/lib/apiClient";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import DurationPicker from "@/components/DurationPicker";

interface AdminAddBookingModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const DEVICES = ["PS1", "PS2", "PS3", "SIM1"];

export default function AdminAddBookingModal({ onClose, onSuccess }: AdminAddBookingModalProps) {
  const [userName, setUserName] = useState("");
  const [userContact, setUserContact] = useState("");
  
  // Date and Time
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  
  const hours = String(now.getHours()).padStart(2, "0");
  const mins = String(now.getMinutes()).padStart(2, "0");
  
  const [date, setDate] = useState(`${year}-${month}-${day}`);
  const [time, setTime] = useState(`${hours}:${mins}`);
  const [durationHours, setDurationHours] = useState(1);
  const [players, setPlayers] = useState(1);
  const [selectedDevice, setSelectedDevice] = useState(DEVICES[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!userName.trim() || !userContact.trim()) {
      toast.error("Name and contact are required.");
      return;
    }
    if (!date || !time) {
      toast.error("Date and time are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const startIso = new Date(`${date}T${time}`).toISOString();
      await api.post("/api/bookings/offline", {
        userName,
        userContact,
        device: selectedDevice,
        players,
        durationHours,
        slotStart: startIso
      });
      toast.success("Booking created successfully!");
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to create booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-[32px] border border-black/5 bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 p-6 border-b border-black/5 bg-slate-50/90 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff6b35]">Admin Action</p>
                <h2 className="text-xl font-bold text-slate-800 mt-1 uppercase tracking-wider">New Booking</h2>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 text-slate-500 transition-colors">
                ✕
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Customer Details */}
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Customer Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:border-[#ff6b35] focus:ring-1 focus:ring-[#ff6b35]"
                  placeholder="e.g. Kamlesh"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Phone Number</label>
                <input
                  type="tel"
                  value={userContact}
                  onChange={(e) => setUserContact(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:border-[#ff6b35] focus:ring-1 focus:ring-[#ff6b35]"
                  placeholder="e.g. 9876543210"
                />
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:border-[#ff6b35] focus:ring-1 focus:ring-[#ff6b35]"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:border-[#ff6b35] focus:ring-1 focus:ring-[#ff6b35]"
                />
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Duration</label>
              <DurationPicker value={durationHours} onChange={setDurationHours} theme="light" />
            </div>

            {/* Players */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">Players</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPlayers(Math.max(1, players - 1))}
                  className="w-10 h-10 shrink-0 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-lg transition-all"
                >
                  −
                </button>
                <span className="font-display text-xl font-bold text-slate-800 tabular-nums w-8 text-center">{players}</span>
                <button
                  onClick={() => setPlayers(Math.min(4, players + 1))}
                  className="w-10 h-10 shrink-0 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-lg transition-all"
                >
                  +
                </button>
              </div>
            </div>

            {/* Console */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Console</label>
              <div className="grid grid-cols-4 gap-2">
                {DEVICES.map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDevice(d)}
                    className={`py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                      selectedDevice === d
                        ? "bg-[#ff6b35] text-white shadow-md shadow-[#ff6b35]/20"
                        : "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="sticky bottom-0 p-6 border-t border-black/5 bg-slate-50/90 backdrop-blur-sm">
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="w-full bg-[#ff6b35] hover:bg-[#e65a29] text-white font-black uppercase tracking-widest text-sm py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create Booking"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
