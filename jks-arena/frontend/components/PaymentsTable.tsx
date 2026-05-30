"use client";

import { useState, useMemo } from "react";
import { api } from "@/lib/apiClient";
import { formatDuration } from "@/lib/utils/formatDuration";
import EditPaymentModal from "@/components/dashboard/EditPaymentModal";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
}

interface PaymentsTableProps {
  bookings: any[];
  onRefresh?: () => void;
  maxHeight?: number;
  showDateColumn?: boolean;
}

export default function PaymentsTable({ bookings, onRefresh, maxHeight = 600, showDateColumn = true }: PaymentsTableProps) {
  const [actionError, setActionError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Edit Payment modal
  const [editPaymentBooking, setEditPaymentBooking] = useState<any | null>(null);

  // Add Payment modal
  const [addPaymentBooking, setAddPaymentBooking] = useState<any | null>(null);
  const [payMethod, setPayMethod] = useState<"cash" | "online">("cash");
  const [payAmount, setPayAmount] = useState<number | string>(0);
  const [paying, setPaying] = useState(false);

  const sortedBookings = useMemo(() => {
    if (!bookings) return [];
    return [...bookings].sort((a, b) => {
      const aStart = new Date(a.inTime || a.slotStart).getTime();
      const bStart = new Date(b.inTime || b.slotStart).getTime();
      return (Number.isFinite(bStart) ? bStart : 0) - (Number.isFinite(aStart) ? aStart : 0);
    });
  }, [bookings]);

  const clipPathStyle = { clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)" };

  const handleAddPayment = async () => {
    const amountNum = Number(payAmount);
    if (!addPaymentBooking || amountNum <= 0) return;
    setPaying(true);
    setActionError(null);
    try {
      const res = await api.post(`/api/admin/bookings/${addPaymentBooking._id}/payments/add`, {
        method: payMethod,
        amount: amountNum,
      }) as { booking?: any };
      if (res?.booking) {
        setAddPaymentBooking(res.booking);
        const collected = res.booking.amountPaid || 0;
        const remaining = Math.max(0, (res.booking.totalPrice || 0) - collected);
        setPayAmount(remaining);
        setPayMethod("cash");
      }
      onRefresh?.();
    } catch (e: any) {
      setActionError(e?.message || "Failed to add payment.");
    } finally {
      setPaying(false);
    }
  };

  const handleTogglePayment = async (bookingId: string, newStatus: string) => {
    setActionError(null);
    setUpdatingId(bookingId);
    try {
      await api.patch(`/api/admin/bookings/${bookingId}/payments/toggle`, {
        paymentStatus: newStatus,
      });
      onRefresh?.();
    } catch (e: any) {
      setActionError(e?.message || "Failed to update payment status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const openAddPayment = (booking: any) => {
    const collected = booking.amountPaid || 0;
    const remaining = Math.max(0, (booking.totalPrice || 0) - collected);
    setAddPaymentBooking(booking);
    setPayAmount(remaining);
    setPayMethod("cash");
  };

  return (
    <>
      {actionError && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-xs font-bold uppercase tracking-widest text-red-600 mb-4">
          {actionError}
        </div>
      )}
      <div className="overflow-auto" style={{ maxHeight }}>
        <table className="w-full table-fixed text-left border-collapse min-w-[800px]">
          <colgroup>
            <col className={showDateColumn ? "w-[16%]" : "w-[20%]"} />
            {showDateColumn && <col className="w-[10%]" />}
            <col className={showDateColumn ? "w-[14%]" : "w-[18%]"} />
            <col className={showDateColumn ? "w-[7%]" : "w-[7%]"} />
            <col className={showDateColumn ? "w-[7%]" : "w-[7%]"} />
            <col className={showDateColumn ? "w-[8%]" : "w-[8%]"} />
            <col className={showDateColumn ? "w-[8%]" : "w-[8%]"} />
            <col className={showDateColumn ? "w-[7%]" : "w-[7%]"} />
            <col className={showDateColumn ? "w-[9%]" : "w-[10%]"} />
            <col className={showDateColumn ? "w-[14%]" : "w-[15%]"} />
          </colgroup>
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-black/5 text-[9px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50">
              <th className="px-2 py-3 font-black">Customer</th>
              {showDateColumn && <th className="px-2 py-3 font-black">Date</th>}
              <th className="px-2 py-3 font-black">Session</th>
              <th className="px-2 py-3 font-black text-center">Console</th>
              <th className="px-2 py-3 font-black text-center">Total</th>
              <th className="px-2 py-3 font-black text-center">Cash</th>
              <th className="px-2 py-3 font-black text-center">Online</th>
              <th className="px-2 py-3 font-black text-center">Due</th>
              <th className="px-2 py-3 font-black text-center">Status</th>
              <th className="px-2 py-3 font-black text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-[10px] text-slate-700">
            {!bookings || bookings.length === 0 ? (
              <tr><td colSpan={10} className="px-4 py-8 text-center text-slate-500 font-bold uppercase tracking-widest text-[10px] border-b border-black/5">No bookings.</td></tr>
            ) : (
              sortedBookings.map((b) => {
                const payments: Array<{ method: string; amount: number }> = b.payments || [];
                let cashTotal = payments.filter((p) => p.method === "cash").reduce((s, p) => s + (p.amount || 0), 0);
                let onlineTotal = payments.filter((p) => p.method === "online").reduce((s, p) => s + (p.amount || 0), 0);

                if (payments.length === 0 && b.amountPaid > 0) {
                  if (b.paymentMethod === "online") onlineTotal = b.amountPaid;
                  else cashTotal = b.amountPaid;
                }

                const collected = cashTotal + onlineTotal;
                const remaining = Math.max(0, (b.totalPrice || 0) - collected);
                const isPaid = b.paymentStatus === "paid" || remaining === 0;
                const inTime = b.inTime || b.slotStart;
                const outTime = b.outTime || b.slotEnd;

                return (
                  <tr key={b._id} className="border-b border-black/5 hover:bg-slate-50/70 transition-colors group">
                    <td className="px-2 py-2 whitespace-nowrap overflow-hidden">
                      <p className="truncate font-bold text-slate-900" title={b.userName}>{b.userName}</p>
                      <p className="truncate text-[9px] font-bold text-slate-500 mt-0.5" title={b.userContact}>{b.userContact}</p>
                    </td>
                    {showDateColumn && (
                      <td className="px-2 py-2 whitespace-nowrap">
                        <p className="font-bold text-slate-700">{formatDate(inTime)}</p>
                      </td>
                    )}
                    <td className="px-2 py-2 whitespace-nowrap overflow-hidden">
                      <p className="truncate font-bold text-[#ff6b35]">{formatTime(inTime)} → {formatTime(outTime)}</p>
                      <p className="text-[9px] font-bold text-slate-500 mt-0.5">{formatDuration(b.durationHours)}</p>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-center">
                      <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-md bg-slate-50 text-slate-800 shadow-sm border border-black/5">
                        <span className="font-black text-[9px] uppercase">{b.device}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-center">
                      <span className="font-black text-slate-900">₹{b.totalPrice}</span>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-center">
                      <span className={`font-bold ${cashTotal > 0 ? "text-green-600" : "text-slate-300"}`}>
                        {cashTotal > 0 ? `₹${cashTotal}` : "—"}
                      </span>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-center">
                      <span className={`font-bold ${onlineTotal > 0 ? "text-blue-600" : "text-slate-300"}`}>
                        {onlineTotal > 0 ? `₹${onlineTotal}` : "—"}
                      </span>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-center">
                      <span className={`font-bold ${remaining > 0 ? "text-red-600" : "text-slate-400"}`}>
                        ₹{remaining}
                      </span>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleTogglePayment(b._id, isPaid ? "partial" : "paid")}
                        disabled={updatingId === b._id || (b.status !== "active" && b.status !== "completed")}
                        className={`px-1.5 py-1 text-[8px] font-black uppercase tracking-wide rounded-md border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                          isPaid
                            ? "bg-green-500/10 text-green-700 border-green-500/30 hover:bg-green-500/20"
                            : "bg-red-500/10 text-red-700 border-red-500/30 hover:bg-red-500/20"
                        }`}
                      >
                        {isPaid ? "Paid" : "Unpaid"}
                      </button>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-center flex items-center justify-center gap-1">
                      {remaining > 0 && (b.status === "active" || b.status === "completed") && (
                        <button
                          onClick={() => openAddPayment(b)}
                          className="px-1.5 py-1 text-[8px] font-black uppercase tracking-wide rounded-md bg-[#ff6b35]/10 text-[#ff6b35] border border-[#ff6b35]/30 hover:bg-[#ff6b35] hover:text-white transition-all"
                          title="Add Payment"
                        >
                          + Pay
                        </button>
                      )}
                      {(b.payments?.length > 0 || b.amountPaid > 0) && (
                        <button
                          onClick={() => setEditPaymentBooking(b)}
                          className="p-1 text-slate-400 hover:text-[#ff6b35] bg-slate-50 hover:bg-[#ff6b35]/10 rounded-md transition-colors"
                          title="Edit Payment"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {addPaymentBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-[0_0_50px_rgba(0,0,0,0.25)] relative border border-black/5 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff6b35] to-transparent"></div>
            <button onClick={() => setAddPaymentBooking(null)} className="absolute top-6 right-6 text-slate-400 hover:text-[#ff6b35] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <p className="text-[10px] font-bold uppercase tracking-widest text-[#ff6b35] mb-1">Add Payment</p>
            <h3 className="font-display text-xl text-slate-900 mb-1">{addPaymentBooking.userName}</h3>
            <p className="text-xs font-bold text-slate-500 mb-6">
              Remaining: <span className="text-red-600">₹{Math.max(0, (addPaymentBooking.totalPrice || 0) - (addPaymentBooking.amountPaid || 0))}</span>
            </p>

            <div className="mb-5">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Payment Method</label>
              <div className="flex bg-slate-100 rounded-xl p-1">
                <button
                  onClick={() => setPayMethod("cash")}
                  className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                    payMethod === "cash" ? "bg-[#1A1A1A] text-white shadow-sm" : "text-slate-500"
                  }`}
                >
                  Cash
                </button>
                <button
                  onClick={() => setPayMethod("online")}
                  className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                    payMethod === "online" ? "bg-[#ff6b35] text-white shadow-sm" : "text-slate-500"
                  }`}
                >
                  Online
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Amount</label>
              <input
                type="number"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-lg font-display font-black text-[#1A1A1A] outline-none focus:border-[#ff6b35]"
              />
            </div>

            <button
              onClick={handleAddPayment}
              disabled={paying || Number(payAmount) <= 0}
              style={clipPathStyle}
              className="w-full py-4 text-sm font-black uppercase tracking-widest bg-[#1A1A1A] text-white hover:bg-[#ff6b35] transition-all shadow-[0_0_15px_rgba(0,0,0,0.10)] disabled:opacity-60"
            >
              {paying ? "Collecting…" : `Collect ₹${payAmount} via ${payMethod === "cash" ? "Cash" : "Online"}`}
            </button>
          </div>
        </div>
      )}

      {editPaymentBooking && (
        <EditPaymentModal
          booking={editPaymentBooking}
          onClose={() => setEditPaymentBooking(null)}
          onSuccess={() => {
            setEditPaymentBooking(null);
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </>
  );
}
