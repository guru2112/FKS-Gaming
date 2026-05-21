"use client";

import { useMemo, useState } from "react";
import { api } from "@/lib/apiClient";

interface BookingsTabProps {
  bookings: any[];
  onRefresh?: () => void;
}

const DEVICES = ["ALL", "PS1", "PS2", "PS3", "SIM1"];
const STATUSES = ["ALL", "upcoming", "active", "completed", "cancelled"];

const TABLE_VISIBLE_ROWS = 15;
const TABLE_ROW_HEIGHT_PX = 56;
const TABLE_HEADER_HEIGHT_PX = 56;

export default function BookingsTab({ bookings, onRefresh }: BookingsTabProps) {
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState(""); 
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deviceFilter, setDeviceFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");

  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    
    return bookings.filter((booking) => {
      const matchStatus = statusFilter === "ALL" || booking.status === statusFilter;
      const matchDevice = deviceFilter === "ALL" || booking.device === deviceFilter;
      
      const bookingDate = new Date(booking.slotStart).toLocaleDateString('en-CA'); 
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
      const safeA = Number.isFinite(aStart) ? aStart : 0;
      const safeB = Number.isFinite(bStart) ? bStart : 0;
      return safeB - safeA;
    });
  }, [filteredBookings]);

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setDeviceFilter("ALL");
    setDateFilter("");
  };

  const tableMaxHeight = TABLE_HEADER_HEIGHT_PX + TABLE_VISIBLE_ROWS * TABLE_ROW_HEIGHT_PX;

  const clipPathStyle = { clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)" };

  const updatePaymentMethod = async (bookingId: string, paymentMethod: "cash" | "online" | "") => {
    try {
      setActionError(null);
      setUpdatingId(bookingId);

      await api.patch(`/api/admin/bookings/${bookingId}/payment`, { paymentMethod: paymentMethod || null });

      onRefresh?.();
    } catch (e: any) {
      setActionError(e?.message || "Failed to update payment method");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-black uppercase text-[#1A1A1A] tracking-wide">All Master Bookings</h2>
        {onRefresh && (
          <button onClick={onRefresh} className="text-[10px] font-black text-slate-600 hover:text-[#ff6b35] uppercase tracking-widest flex items-center gap-2 transition-colors">
            <span>↻ Refresh Data</span>
          </button>
        )}
      </div>

      {actionError && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-xs font-bold uppercase tracking-widest text-red-200">
          {actionError}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-black/5 shadow-lg">
        
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
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none bg-white border border-slate-200 hover:border-[#ff6b35]/40 rounded-xl pl-4 pr-10 py-3 text-xs font-bold uppercase tracking-wider text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#ff6b35] transition-all cursor-pointer"
            >
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-[#ff6b35]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        <div className="col-span-1">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2 px-1">Console</label>
          <div className="relative group">
            <select 
              value={deviceFilter} 
              onChange={(e) => setDeviceFilter(e.target.value)}
              className="w-full appearance-none bg-white border border-slate-200 hover:border-[#ff6b35]/40 rounded-xl pl-4 pr-10 py-3 text-xs font-bold uppercase tracking-wider text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#ff6b35] transition-all cursor-pointer"
            >
              {DEVICES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-[#ff6b35]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        <div className="col-span-2 lg:col-span-1 flex gap-3">
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2 px-1">Date</label>
            <input 
              type="date" 
              value={dateFilter} 
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full min-w-0 bg-white border border-slate-200 hover:border-[#ff6b35]/40 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#ff6b35] transition-all cursor-pointer [color-scheme:light]"
            />
          </div>
          <div className="flex items-end">
             <button onClick={clearFilters} className="h-[42px] shrink-0 px-5 rounded-xl border border-black/5 bg-white text-[10px] font-black uppercase tracking-widest text-slate-700 hover:bg-[#ff6b35] hover:text-white transition-colors">
                Clear
             </button>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-black/5 shadow-lg overflow-hidden">
        <div className="overflow-auto" style={{ maxHeight: tableMaxHeight }}>
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-black/5 text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-50">
                <th className="px-6 py-5 font-black">Player</th>
                <th className="px-6 py-5 font-black">Console</th>
                <th className="px-6 py-5 font-black">Schedule</th>
                <th className="px-6 py-5 font-black">Details</th>
                <th className="px-6 py-5 font-black">Payment</th>
                <th className="px-6 py-5 font-black">Status</th>
                <th className="px-6 py-5 font-black text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-700">
              {!bookings || bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-slate-500 font-bold uppercase tracking-widest text-xs border-b border-black/5">
                    The system has no bookings yet.
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-slate-500 font-bold uppercase tracking-widest text-xs border-b border-black/5">
                    No bookings match the current admin filters.
                  </td>
                </tr>
              ) : (
                sortedBookings.map((booking) => (
                  <tr 
                    key={booking._id} 
                    onClick={() => setSelectedBooking(booking)}
                    className="border-b border-black/5 hover:bg-slate-50/70 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-[#ff6b35] transition-colors">{booking.userName}</p>
                        <p className="text-[10px] font-bold text-slate-500 mt-0.5">{booking.userContact}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-800 shadow-sm border border-black/5 group-hover:border-[#ff6b35]/30">
                          <span className="font-black text-[10px] uppercase">{booking.device}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-xs font-bold text-slate-700">
                        {new Date(booking.inTime || booking.slotStart).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })}
                      </p>
                      <p className="text-[10px] font-black text-[#ff6b35] mt-0.5 tracking-wider">
                        {new Date(booking.inTime || booking.slotStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })}
                        {" "}→{" "}
                        {new Date(booking.outTime || booking.slotEnd || booking.slotStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-xs font-bold text-slate-700">{booking.game || "General Gaming"}</p>
                      <p className="text-[10px] font-bold text-slate-500 mt-0.5 uppercase tracking-wider">
                        {booking.durationHours} Hr • {booking.players} Px
                      </p>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={(booking.paymentMethod || "") as string}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation();
                          updatePaymentMethod(booking._id, e.target.value as any);
                        }}
                        disabled={updatingId === booking._id}
                        className="appearance-none bg-white border border-slate-200 hover:border-[#ff6b35]/40 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#ff6b35] transition-all cursor-pointer disabled:opacity-60"
                      >
                        <option value="">—</option>
                        <option value="cash">Cash</option>
                        <option value="online">Online</option>
                      </select>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md border ${
                        booking.status === 'upcoming' ? 'bg-green-500/10 text-green-700 border-green-500/30' : 
                        booking.status === 'active' ? 'bg-[#ff6b35]/10 text-[#ff6b35] border-[#ff6b35]/30' :
                        booking.status === 'cancelled' ? 'bg-red-500/10 text-red-700 border-red-500/30' :
                        'bg-slate-100 text-slate-700 border-black/5'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-black text-slate-900">₹{booking.totalPrice}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,0.25)] relative border border-black/5 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff6b35] to-transparent"></div>
            <button onClick={() => setSelectedBooking(null)} className="absolute top-6 right-6 text-slate-400 hover:text-[#ff6b35] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#ff6b35] mb-1">Admin Pass Detail</p>
            <h3 className="font-display text-2xl text-slate-900 mb-6 uppercase tracking-tight">{selectedBooking.device} - {selectedBooking.game || "General Gaming"}</h3>
            
            <div className="space-y-4 text-xs font-bold uppercase tracking-wider text-slate-700">
              <div className="flex justify-between border-b border-black/5 pb-3">
                <span className="text-slate-500">QR / Pass ID</span>
                <span className="font-mono text-[9px] text-[#ff6b35] break-all pl-4 text-right">{selectedBooking.qrId || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b border-black/5 pb-3">
                <span className="text-slate-500">Primary Contact</span>
                <span className="text-slate-900 text-right">{selectedBooking.userName} <br/> <span className="text-slate-600">{selectedBooking.userContact}</span></span>
              </div>
              <div className="flex justify-between border-b border-black/5 pb-3">
                <span className="text-slate-500">Schedule</span>
                <span className="text-slate-900 text-right">
                  {new Date(selectedBooking.inTime || selectedBooking.slotStart).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })}
                  {" "}→{" "}
                  {new Date(selectedBooking.outTime || selectedBooking.slotEnd || selectedBooking.slotStart).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })}
                  <br/>
                  <span className="text-slate-600">({selectedBooking.durationHours} Hours)</span>
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500">Revenue</span>
                <span className="font-black text-2xl text-[#ff6b35]">₹{selectedBooking.totalPrice}</span>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button onClick={() => setSelectedBooking(null)} style={clipPathStyle} className="w-full bg-slate-100 text-slate-800 py-4 text-xs font-black uppercase tracking-widest hover:bg-[#ff6b35] hover:text-white transition-colors">
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}