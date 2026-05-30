"use client";

import { useMemo, useState } from "react";
import { api } from "@/lib/apiClient";
import { formatDuration } from "@/lib/utils/formatDuration";


interface BookingsTabProps {
  bookings: any[];
  onRefresh?: () => void;
}

type View = "bookings" | "payments";

const DEVICES = ["ALL", "PS1", "PS2", "PS3", "SIM1"];
const STATUSES = ["ALL", "upcoming", "active", "completed", "cancelled"];

const TABLE_VISIBLE_ROWS = 8;
const TABLE_ROW_HEIGHT_PX = 56;
const TABLE_HEADER_HEIGHT_PX = 56;

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
}

import AdminAddBookingModal from "@/components/dashboard/AdminAddBookingModal";
import EditPaymentModal from "@/components/dashboard/EditPaymentModal";

export default function BookingsTab({ bookings, onRefresh }: BookingsTabProps) {
  const [view, setView] = useState<View>("bookings");
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [addBookingModalOpen, setAddBookingModalOpen] = useState(false);
  const [editPaymentBooking, setEditPaymentBooking] = useState<any | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deviceFilter, setDeviceFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");

  // Add Payment modal
  const [addPaymentBooking, setAddPaymentBooking] = useState<any | null>(null);
  const [payMethod, setPayMethod] = useState<"cash" | "online">("cash");
  const [payAmount, setPayAmount] = useState<number | string>(0);
  const [paying, setPaying] = useState(false);

  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    return bookings.filter((booking) => {
      const matchStatus = statusFilter === "ALL" || booking.status === statusFilter;
      const matchDevice = deviceFilter === "ALL" || booking.device === deviceFilter;
      const bookingDate = new Date(booking.slotStart).toLocaleDateString("en-CA");
      const matchDate = !dateFilter || bookingDate === dateFilter;
      const searchLower = searchQuery.toLowerCase().trim();
      const matchSearch = !searchQuery ||
        (booking.userName && booking.userName.toLowerCase().includes(searchLower)) ||
        (booking.userContact && booking.userContact.includes(searchLower));
      return matchStatus && matchDevice && matchDate && matchSearch;
    });
  }, [bookings, statusFilter, deviceFilter, dateFilter, searchQuery]);

  const sortedBookings = useMemo(() => {
    return [...filteredBookings].sort((a, b) => {
      const aStart = new Date(a.inTime || a.slotStart).getTime();
      const bStart = new Date(b.inTime || b.slotStart).getTime();
      return (Number.isFinite(bStart) ? bStart : 0) - (Number.isFinite(aStart) ? aStart : 0);
    });
  }, [filteredBookings]);

  const dailySummary = useMemo(() => {
    let totalCash = 0;
    let totalOnline = 0;
    filteredBookings.forEach(b => {
      const payments = b.payments || [];
      totalCash += payments.filter((p: any) => p.method === "cash").reduce((s: number, p: any) => s + (p.amount || 0), 0);
      totalOnline += payments.filter((p: any) => p.method === "online").reduce((s: number, p: any) => s + (p.amount || 0), 0);
      
      if (payments.length === 0 && b.amountPaid > 0) {
        if (b.paymentMethod === "online") totalOnline += b.amountPaid;
        else totalCash += b.amountPaid;
      }
    });
    return { totalCash, totalOnline, totalRevenue: totalCash + totalOnline };
  }, [filteredBookings]);

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setDeviceFilter("ALL");
    setDateFilter("");
  };

  const tableMaxHeight = TABLE_HEADER_HEIGHT_PX + TABLE_VISIBLE_ROWS * TABLE_ROW_HEIGHT_PX;
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
      // Update modal with fresh data so remaining reflects new payment
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
    <div className="space-y-6">
      {/* Header with view toggle */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-black uppercase text-[#1A1A1A] tracking-wide">
          {view === "bookings" ? "All Bookings" : "Payments"}
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setView("bookings")}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                view === "bookings" ? "bg-[#ff6b35] text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Bookings
            </button>
            <button
              onClick={() => setView("payments")}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                view === "payments" ? "bg-[#ff6b35] text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Payments
            </button>
          </div>
          {onRefresh && (
            <button onClick={onRefresh} className="text-[10px] font-black text-slate-600 hover:text-[#ff6b35] uppercase tracking-widest flex items-center gap-2 transition-colors">
              <span>↻ Refresh</span>
            </button>
          )}
          <button
            onClick={() => setAddBookingModalOpen(true)}
            className="ml-2 bg-[#1A1A1A] hover:bg-[#ff6b35] text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm transition-all flex items-center gap-2"
          >
            <span>+ New Booking</span>
          </button>
        </div>
      </div>

      {actionError && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-xs font-bold uppercase tracking-widest text-red-600">
          {actionError}
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-black/5 shadow-lg">
        <div className="col-span-2 lg:col-span-2">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2 px-1">Player Name or Phone</label>
          <div className="relative group">
            <input
              type="text"
              placeholder="e.g. Kamlesh or 9876543210"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 hover:border-[#ff6b35]/40 rounded-xl pl-10 pr-4 py-3 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#ff6b35] transition-all"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>
        </div>
        <div className="col-span-1">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2 px-1">Status</label>
          <div className="relative group">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full appearance-none bg-white border border-slate-200 hover:border-[#ff6b35]/40 rounded-xl pl-4 pr-10 py-3 text-xs font-bold uppercase tracking-wider text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#ff6b35] transition-all cursor-pointer">
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-[#ff6b35]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
        <div className="col-span-1">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2 px-1">Console</label>
          <div className="relative group">
            <select value={deviceFilter} onChange={(e) => setDeviceFilter(e.target.value)} className="w-full appearance-none bg-white border border-slate-200 hover:border-[#ff6b35]/40 rounded-xl pl-4 pr-10 py-3 text-xs font-bold uppercase tracking-wider text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#ff6b35] transition-all cursor-pointer">
              {DEVICES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-[#ff6b35]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
        <div className="col-span-2 lg:col-span-2 flex gap-3">
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2 px-1">Date</label>
            <div className="flex items-center gap-2">
              <button onClick={() => {
                const d = new Date(dateFilter || new Date());
                d.setDate(d.getDate() - 1);
                setDateFilter(d.toLocaleDateString("en-CA"));
              }} className="h-[42px] px-3 shrink-0 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:border-[#ff6b35]/40 hover:text-[#ff6b35] transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-full min-w-0 bg-white border border-slate-200 hover:border-[#ff6b35]/40 rounded-xl px-2 py-3 text-xs font-bold uppercase tracking-wider text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#ff6b35] transition-all cursor-pointer [color-scheme:light]" />
              <button onClick={() => {
                const d = new Date(dateFilter || new Date());
                d.setDate(d.getDate() + 1);
                setDateFilter(d.toLocaleDateString("en-CA"));
              }} className="h-[42px] px-3 shrink-0 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:border-[#ff6b35]/40 hover:text-[#ff6b35] transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
          <div className="flex items-end">
            <button onClick={clearFilters} className="h-[42px] shrink-0 px-4 rounded-xl border border-black/5 bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-[#ff6b35] hover:text-white transition-colors">Clear</button>
          </div>
        </div>
      </div>

      {/* ===== DAILY SUMMARY ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-black/5 flex flex-col justify-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Total Daily Revenue</p>
          <h3 className="text-2xl font-black text-[#1A1A1A]">₹{dailySummary.totalRevenue}</h3>
        </div>
        <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-black/5 flex flex-col justify-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-green-600 mb-1">Cash Collected</p>
          <h3 className="text-2xl font-black text-green-700">₹{dailySummary.totalCash}</h3>
        </div>
        <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-black/5 flex flex-col justify-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-1">Online Collected</p>
          <h3 className="text-2xl font-black text-blue-700">₹{dailySummary.totalOnline}</h3>
        </div>
      </div>

      {/* ===== BOOKINGS TABLE ===== */}
      {view === "bookings" && (
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-black/5 shadow-lg overflow-hidden">
          <div className="overflow-auto" style={{ maxHeight: tableMaxHeight }}>
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-black/5 text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-50">
                  <th className="px-6 py-5 font-black">Customer</th>
                  <th className="px-6 py-5 font-black">Date</th>
                  <th className="px-6 py-5 font-black">Timing</th>
                  <th className="px-6 py-5 font-black">Console</th>
                  <th className="px-6 py-5 font-black">Source</th>
                  <th className="px-6 py-5 font-black">Status</th>
                  <th className="px-6 py-5 font-black text-right">Total</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-700">
                {!bookings || bookings.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-16 text-center text-slate-500 font-bold uppercase tracking-widest text-xs border-b border-black/5">No bookings yet.</td></tr>
                ) : filteredBookings.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-16 text-center text-slate-500 font-bold uppercase tracking-widest text-xs border-b border-black/5">No bookings match filters.</td></tr>
                ) : (
                  sortedBookings.map((b) => {
                    const inTime = b.inTime || b.slotStart;
                    const outTime = b.outTime || b.slotEnd;

                    return (
                      <tr key={b._id} onClick={() => setSelectedBooking(b)} className="border-b border-black/5 hover:bg-slate-50/70 transition-colors cursor-pointer group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-bold text-slate-900 group-hover:text-[#ff6b35] transition-colors">{b.userName}</p>
                          <p className="text-[10px] font-bold text-slate-500 mt-0.5">{b.userContact}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-xs font-bold text-slate-700">{formatDate(inTime)}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-xs font-bold text-[#ff6b35]">{formatTime(inTime)} → {formatTime(outTime)}</p>
                          <p className="text-[10px] font-bold text-slate-500 mt-0.5">{formatDuration(b.durationHours)} • {b.players} Px</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-800 shadow-sm border border-black/5 group-hover:border-[#ff6b35]/30">
                            <span className="font-black text-[10px] uppercase">{b.device}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md border ${
                            b.source === "offline" ? "bg-amber-50 text-amber-700 border-amber-500/30" : "bg-blue-50 text-blue-700 border-blue-500/30"
                          }`}>
                            {b.source === "offline" ? "Walk-In" : "Online"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md border ${
                            b.status === "upcoming" ? "bg-green-500/10 text-green-700 border-green-500/30" :
                            b.status === "active" ? "bg-[#ff6b35]/10 text-[#ff6b35] border-[#ff6b35]/30" :
                            b.status === "cancelled" ? "bg-red-500/10 text-red-700 border-red-500/30" :
                            "bg-slate-100 text-slate-700 border-black/5"
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-sm font-black text-slate-900">₹{b.totalPrice}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== PAYMENTS TABLE ===== */}
      {view === "payments" && (
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-black/5 shadow-lg overflow-hidden">
          <div className="overflow-auto" style={{ maxHeight: tableMaxHeight }}>
            <table className="w-full table-fixed text-left border-collapse">
              <colgroup>
                <col className="w-[18%]" />
                <col className="w-[10%]" />
                <col className="w-[14%]" />
                <col className="w-[7%]" />
                <col className="w-[8%]" />
                <col className="w-[8%]" />
                <col className="w-[8%]" />
                <col className="w-[9%]" />
                <col className="w-[8%]" />
                <col className="w-[10%]" />
              </colgroup>
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-black/5 text-[9px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50">
                  <th className="px-3 py-4 font-black">Customer</th>
                  <th className="px-3 py-4 font-black">Date</th>
                  <th className="px-3 py-4 font-black">Session</th>
                  <th className="px-3 py-4 font-black">Console</th>
                  <th className="px-3 py-4 font-black text-right">Total</th>
                  <th className="px-3 py-4 font-black text-right">Cash</th>
                  <th className="px-3 py-4 font-black text-right">Online</th>
                  <th className="px-3 py-4 font-black text-right">Due</th>
                  <th className="px-3 py-4 font-black">Status</th>
                  <th className="px-3 py-4 font-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-700">
                {!bookings || bookings.length === 0 ? (
                  <tr><td colSpan={10} className="px-6 py-16 text-center text-slate-500 font-bold uppercase tracking-widest text-xs border-b border-black/5">No bookings yet.</td></tr>
                ) : filteredBookings.length === 0 ? (
                  <tr><td colSpan={10} className="px-6 py-16 text-center text-slate-500 font-bold uppercase tracking-widest text-xs border-b border-black/5">No bookings match filters.</td></tr>
                ) : (
                  sortedBookings.map((b) => {
                    const payments: Array<{ method: string; amount: number }> = b.payments || [];
                    let cashTotal = payments.filter((p) => p.method === "cash").reduce((s, p) => s + (p.amount || 0), 0);
                    let onlineTotal = payments.filter((p) => p.method === "online").reduce((s, p) => s + (p.amount || 0), 0);

                    // Fallback to legacy fields if payments array doesn't exist
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
                        <td className="px-3 py-3 whitespace-nowrap overflow-hidden">
                          <p className="truncate text-xs font-bold text-slate-900" title={b.userName}>{b.userName}</p>
                          <p className="truncate text-[9px] font-bold text-slate-500 mt-0.5" title={b.userContact}>{b.userContact}</p>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <p className="text-[11px] font-bold text-slate-700">{formatDate(inTime)}</p>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap overflow-hidden">
                          <p className="truncate text-[11px] font-bold text-[#ff6b35]">{formatTime(inTime)} → {formatTime(outTime)}</p>
                          <p className="text-[9px] font-bold text-slate-500 mt-0.5">{formatDuration(b.durationHours)}</p>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 text-slate-800 shadow-sm border border-black/5">
                            <span className="font-black text-[9px] uppercase">{b.device}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-right">
                          <span className="text-xs font-black text-slate-900">₹{b.totalPrice}</span>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-right">
                          <span className={`text-xs font-bold ${cashTotal > 0 ? "text-green-600" : "text-slate-300"}`}>
                            {cashTotal > 0 ? `₹${cashTotal}` : "—"}
                          </span>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-right">
                          <span className={`text-xs font-bold ${onlineTotal > 0 ? "text-blue-600" : "text-slate-300"}`}>
                            {onlineTotal > 0 ? `₹${onlineTotal}` : "—"}
                          </span>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-right">
                          <span className={`text-xs font-bold ${remaining > 0 ? "text-red-600" : "text-slate-400"}`}>
                            ₹{remaining}
                          </span>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <button
                            onClick={() => handleTogglePayment(b._id, isPaid ? "partial" : "paid")}
                            disabled={updatingId === b._id || (b.status !== "active" && b.status !== "completed")}
                            className={`px-2 py-1.5 text-[8px] font-black uppercase tracking-wide rounded-md border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                              isPaid
                                ? "bg-green-500/10 text-green-700 border-green-500/30 hover:bg-green-500/20"
                                : "bg-red-500/10 text-red-700 border-red-500/30 hover:bg-red-500/20"
                            }`}
                          >
                            {isPaid ? "Paid" : "Unpaid"}
                          </button>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-right flex items-center justify-end gap-1">
                          {remaining > 0 && (b.status === "active" || b.status === "completed") && (
                            <button
                              onClick={() => openAddPayment(b)}
                              className="max-w-full px-2 py-1.5 text-[8px] font-black uppercase tracking-wide rounded-md bg-[#ff6b35]/10 text-[#ff6b35] border border-[#ff6b35]/30 hover:bg-[#ff6b35] hover:text-white transition-all"
                              title="Add Payment"
                            >
                              + Payment
                            </button>
                          )}
                          {(b.payments?.length > 0 || b.amountPaid > 0) && (
                            <button
                              onClick={() => setEditPaymentBooking(b)}
                              className="p-1 text-slate-400 hover:text-[#ff6b35] bg-slate-50 hover:bg-[#ff6b35]/10 rounded-md transition-colors"
                              title="Edit Payment"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
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
        </div>
      )}

      {/* ===== ADD PAYMENT MODAL ===== */}
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

            {/* Method toggle */}
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

            {/* Amount */}
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

      {/* ===== BOOKING DETAIL MODAL ===== */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,0.25)] relative border border-black/5 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff6b35] to-transparent"></div>
            <button onClick={() => setSelectedBooking(null)} className="absolute top-6 right-6 text-slate-400 hover:text-[#ff6b35] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <p className="text-[10px] font-bold uppercase tracking-widest text-[#ff6b35] mb-1">Booking Detail</p>
            <h3 className="font-display text-2xl text-slate-900 mb-6 uppercase tracking-tight">{selectedBooking.device} - {selectedBooking.game || "General Gaming"}</h3>

            <div className="space-y-4 text-xs font-bold uppercase tracking-wider text-slate-700">
              <div className="flex justify-between border-b border-black/5 pb-3">
                <span className="text-slate-500">Customer</span>
                <span className="text-slate-900 text-right">{selectedBooking.userName}<br /><span className="text-slate-600">{selectedBooking.userContact}</span></span>
              </div>
              <div className="flex justify-between border-b border-black/5 pb-3">
                <span className="text-slate-500">Schedule</span>
                <span className="text-slate-900 text-right">
                  {formatDate(selectedBooking.inTime || selectedBooking.slotStart)}<br />
                  <span className="text-[#ff6b35]">{formatTime(selectedBooking.inTime || selectedBooking.slotStart)} → {formatTime(selectedBooking.outTime || selectedBooking.slotEnd)}</span>
                  <br /><span className="text-slate-600">({formatDuration(selectedBooking.durationHours)})</span>
                </span>
              </div>
              <div className="flex justify-between border-b border-black/5 pb-3">
                <span className="text-slate-500">Source</span>
                <span className="text-slate-900">{selectedBooking.source === "offline" ? "Walk-In" : "Online"}</span>
              </div>

              {/* Payment entries */}
              {selectedBooking.payments && selectedBooking.payments.length > 0 && (
                <div className="border-b border-black/5 pb-3">
                  <span className="text-slate-500 block mb-2">Payment Entries</span>
                  {selectedBooking.payments.map((p: any, i: number) => (
                    <div key={i} className="flex justify-between text-[11px] py-1">
                      <span className="text-slate-600">{p.method === "cash" ? "Cash" : "Online"}</span>
                      <span className="text-slate-900 font-black">₹{p.amount}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500">Total</span>
                <span className="font-black text-2xl text-[#ff6b35]">₹{selectedBooking.totalPrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Collected</span>
                <span className="font-bold text-green-600">₹{selectedBooking.amountPaid || 0}</span>
              </div>
            </div>

            <div className="mt-8">
              <button onClick={() => setSelectedBooking(null)} style={clipPathStyle} className="w-full bg-slate-100 text-slate-800 py-4 text-xs font-black uppercase tracking-widest hover:bg-[#ff6b35] hover:text-white transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      {addBookingModalOpen && (
        <AdminAddBookingModal
          onClose={() => setAddBookingModalOpen(false)}
          onSuccess={() => {
            setAddBookingModalOpen(false);
            if (onRefresh) onRefresh();
          }}
        />
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
    </div>
  );
}
