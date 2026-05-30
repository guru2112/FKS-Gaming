"use client";
import { useState } from "react";
import { api } from "@/lib/apiClient";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface EditPaymentModalProps {
  booking: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditPaymentModal({ booking, onClose, onSuccess }: EditPaymentModalProps) {
  // Compute initial cash and online values
  const payments: Array<{ method: string; amount: number }> = booking.payments || [];
  let initialCash = payments.filter((p) => p.method === "cash").reduce((s, p) => s + (p.amount || 0), 0);
  let initialOnline = payments.filter((p) => p.method === "online").reduce((s, p) => s + (p.amount || 0), 0);

  if (payments.length === 0 && booking.amountPaid > 0) {
    if (booking.paymentMethod === "online") initialOnline = booking.amountPaid;
    else initialCash = booking.amountPaid;
  }

  const [cashAmount, setCashAmount] = useState<string>(initialCash.toString());
  const [onlineAmount, setOnlineAmount] = useState<string>(initialOnline.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await api.patch(`/api/admin/bookings/${booking._id}/payments/edit`, { 
        cashAmount: Number(cashAmount) || 0,
        onlineAmount: Number(onlineAmount) || 0
      });
      toast.success("Payment details updated successfully!");
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to update payment.");
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
          className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-black/5 bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="p-6 border-b border-black/5 bg-slate-50/50">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff6b35]">Admin Action</p>
                <h2 className="text-xl font-bold text-slate-800 mt-1 uppercase tracking-wider">Edit Payment</h2>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 text-slate-500 transition-colors">
                ✕
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-black/5">
              <div className="flex-1">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Customer</p>
                <p className="text-sm text-slate-800 font-medium">{booking.userName}</p>
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Total Bill</p>
                <p className="text-sm text-[#ff6b35] font-black">₹{booking.totalPrice || 0}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Cash Amount</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate-400 font-bold">₹</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:border-[#ff6b35] focus:ring-1 focus:ring-[#ff6b35]"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Online Amount</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate-400 font-bold">₹</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={onlineAmount}
                    onChange={(e) => setOnlineAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:border-[#ff6b35] focus:ring-1 focus:ring-[#ff6b35]"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#ff6b35]/10 border border-[#ff6b35]/20 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#ff6b35]">New Total Paid</p>
              </div>
              <div className="text-2xl font-black text-[#ff6b35]">
                ₹{(Number(cashAmount) || 0) + (Number(onlineAmount) || 0)}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-black/5 bg-slate-50/50">
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="w-full bg-[#ff6b35] hover:bg-[#e65a29] text-white font-black uppercase tracking-widest text-sm py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
