"use client";
import { useState } from "react";
import { api } from "@/lib/apiClient";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import DurationPicker from "@/components/DurationPicker";

interface EditLiveSessionModalProps {
  session: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditLiveSessionModal({ session, onClose, onSuccess }: EditLiveSessionModalProps) {
  const [durationHours, setDurationHours] = useState(session?.durationHours || 1);
  const [players, setPlayers] = useState(session?.players || 1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rate = session.perHeadRate || 50;
  const calculatedCost = Math.round(players * rate * durationHours);

  const handleSave = async () => {
    if (!durationHours || durationHours <= 0) {
      toast.error("Please select a valid duration.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.patch(`/api/admin/sessions/${session._id}/edit`, { 
        durationHours,
        players
      });
      toast.success("Session updated successfully!");
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to update session.");
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
                <h2 className="text-xl font-bold text-white mt-1 uppercase tracking-wider">Edit Session</h2>
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

            {/* Duration */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Total Duration</label>
              <DurationPicker 
                value={durationHours} 
                onChange={setDurationHours} 
                theme="dark" 
              />
            </div>

            <div className="p-4 rounded-xl bg-[#ff6b35]/10 border border-[#ff6b35]/20 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#ff6b35]">Total Cost</p>
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
              onClick={handleSave}
              disabled={isSubmitting || durationHours <= 0}
              className="w-full bg-[#ff6b35] hover:bg-white text-black font-black uppercase tracking-widest text-sm py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
