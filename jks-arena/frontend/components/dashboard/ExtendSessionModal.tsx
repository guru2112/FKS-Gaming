"use client";
import { useState } from "react";
import { api } from "@/lib/apiClient";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface ExtendSessionModalProps {
  session: any;
  onClose: () => void;
  onSuccess: () => void;
}

const EXTEND_OPTIONS = [
  { label: "+30 min", minutes: 30 },
  { label: "+1 hour", minutes: 60 },
];

export default function ExtendSessionModal({ session, onClose, onSuccess }: ExtendSessionModalProps) {
  const [minutes, setMinutes] = useState<number>(30);
  const [customMinutes, setCustomMinutes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rate = session.perHeadRate || 50;
  const players = session.players || 1;
  const calculatedCost = Math.round(players * rate * (minutes / 60));

  const handleExtend = async () => {
    if (minutes <= 0) {
      toast.error("Please select a valid time.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.patch(`/api/admin/extend-session/${session._id}`, { extraMinutes: minutes });
      toast.success("Session extended successfully!");
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to extend session.");
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
          className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-white/10 bg-[#0A0A0A] shadow-2xl"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/5 bg-white/[0.02]">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff6b35]">Admin Action</p>
                <h2 className="text-xl font-bold text-white mt-1 uppercase tracking-wider">Extend Session</h2>
              </div>
              <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors">
                ✕
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex gap-4 p-4 rounded-2xl bg-black/40 border border-white/5">
              <div className="flex-1">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Customer</p>
                <p className="text-sm text-white font-medium">{session.userName}</p>
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Console</p>
                <p className="text-sm text-[#ff6b35] font-black">{session.device}</p>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">1. Select Extend Time</label>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {EXTEND_OPTIONS.map(opt => (
                  <button
                    key={opt.minutes}
                    onClick={() => {
                      setMinutes(opt.minutes);
                      setCustomMinutes("");
                    }}
                    className={`py-3 rounded-xl border text-sm font-bold uppercase transition-all ${
                      minutes === opt.minutes && !customMinutes
                        ? "border-[#ff6b35] bg-[#ff6b35]/10 text-[#ff6b35]"
                        : "border-white/10 bg-white/5 text-white hover:border-white/20"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Or Custom Time (minutes)</label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 45"
                  value={customMinutes}
                  onChange={(e) => {
                    setCustomMinutes(e.target.value);
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val > 0) {
                      setMinutes(val);
                    } else {
                      setMinutes(0);
                    }
                  }}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff6b35]"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#ff6b35]/10 border border-[#ff6b35]/20 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#ff6b35]">Extra Cost</p>
                <p className="text-xs text-slate-400 font-medium mt-1">Based on ₹{rate}/hr x {players} player(s)</p>
              </div>
              <div className="text-2xl font-black text-[#ff6b35]">
                ₹{calculatedCost}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/5 bg-black/40">
            <button
              onClick={handleExtend}
              disabled={isSubmitting || minutes <= 0}
              className="w-full bg-[#ff6b35] hover:bg-white text-black font-black uppercase tracking-widest text-sm py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Extending..." : "Confirm Extension"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
