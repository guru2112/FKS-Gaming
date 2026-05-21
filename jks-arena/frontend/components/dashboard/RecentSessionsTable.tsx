"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createPortal } from "react-dom";

interface RecentSessionsTableProps {
  bookings: any[];
}

export default function RecentSessionsTable({ bookings }: RecentSessionsTableProps) {
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [arenaFilter, setArenaFilter] = useState("All Arenas");
  const [viewBooking, setViewBooking] = useState<any | null>(null);
  const mounted = typeof window !== "undefined";

  const filteredBookings = bookings.filter((b) => {
    const matchStatus = statusFilter === "All Status" || b.status.toLowerCase() === statusFilter.toLowerCase();
    const matchArena = arenaFilter === "All Arenas" || 
                       (arenaFilter === "PS5 Arena" && b.device.startsWith("PS")) ||
                       (arenaFilter === "Simulator" && b.device.startsWith("SIM"));
    return matchStatus && matchArena;
  });

  return (
    <section className="bg-white border-2 border-black rounded-[2rem] shadow-sm overflow-hidden flex flex-col w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-black/10 gap-4">
        <h2 className="text-sm font-black uppercase tracking-widest text-[#ff6b35]">Recent Sessions</h2>
        
        <div className="flex gap-3">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#FDF8F5] border border-black/20 rounded-lg px-4 py-2 text-xs font-bold text-black outline-none focus:border-[#ff6b35] transition-colors cursor-pointer"
          >
            <option>All Status</option>
            <option>Completed</option>
            <option>Upcoming</option>
            <option>Cancelled</option>
            <option>No-Show</option>
          </select>
          <select 
            value={arenaFilter}
            onChange={(e) => setArenaFilter(e.target.value)}
            className="bg-[#FDF8F5] border border-black/20 rounded-lg px-4 py-2 text-xs font-bold text-black outline-none focus:border-[#ff6b35] transition-colors cursor-pointer"
          >
            <option>All Arenas</option>
            <option>PS5 Arena</option>
            <option>Simulator</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {/* 🔥 The wrapper handles horizontal scrolling smoothly without breaking the card layout */}
      <div className="w-full overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            {/* 🔥 Removed background color and made text black */}
            <tr className="border-b-2 border-black text-[10px] font-black uppercase tracking-widest text-black">
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Arena</th>
              <th className="px-6 py-4">Game</th>
              <th className="px-6 py-4">Duration</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="text-xs font-bold text-black">
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-[#F3EFEC] flex items-center justify-center mb-4 shadow-sm">
                      <svg className="w-7 h-7 text-[#ff6b35]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h3 className="text-sm font-display text-[#1A1A1A] uppercase tracking-tight mb-1">No Sessions Found</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      {statusFilter !== "All Status" || arenaFilter !== "All Arenas"
                        ? "Try changing your filters"
                        : "Your gaming history will appear here"}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking, idx) => (
                <tr key={booking._id || idx} className="border-b border-black/10 hover:bg-[#FDF8F5] transition-colors group">
                  <td className="px-6 py-5 whitespace-nowrap">
                    {new Date(booking.slotStart).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-5">
                    {booking.device.includes('SIM') ? 'Simulator' : 'PS5 Arena'} – {booking.device}
                  </td>
                  <td className="px-6 py-5 text-slate-500">
                    {booking.game || "General Session"}
                  </td>
                  <td className="px-6 py-5">
                    {booking.durationHours} Hour{booking.durationHours > 1 ? 's' : ''}
                  </td>
                  <td className="px-6 py-5">
                    ₹{booking.totalPrice?.toFixed(2) || "0.00"}
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md border shadow-sm ${
                      booking.status.toLowerCase() === 'completed' ? 'bg-green-50 text-green-600 border-green-200' :
                      booking.status.toLowerCase() === 'cancelled' ? 'bg-red-50 text-red-500 border-red-200' :
                      booking.status.toLowerCase() === 'no-show' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                      booking.status.toLowerCase() === 'upcoming' ? 'bg-orange-50 text-[#ff6b35] border-[#ff6b35]/30' :
                      booking.status.toLowerCase() === 'active' ? 'bg-black text-white border-black' :
                      'bg-slate-50 text-slate-500 border-slate-200'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-2 opacity-100 sm:opacity-50 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setViewBooking(booking)}
                        className="p-2 bg-white border border-black/20 rounded-lg text-slate-500 hover:text-[#ff6b35] hover:border-black shadow-sm transition-all"
                        title="View Details"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </button>
                      <button
                        onClick={() => toast.info("Receipt download coming soon!", { duration: 2000 })}
                        className="p-2 bg-white border border-black/20 rounded-lg text-slate-500 hover:text-[#ff6b35] hover:border-black shadow-sm transition-all"
                        title="Download Receipt"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Footer */}
      {bookings.length > 0 && (
        <div className="p-4 border-t border-black/10 text-center bg-[#FDF8F5]">
          <a
            href="/history"
            className="text-[10px] font-black uppercase tracking-widest text-[#ff6b35] hover:text-black transition-colors"
          >
            View All Sessions
          </a>
        </div>
      )}

      {/* Details Modal */}
      {mounted && viewBooking && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setViewBooking(null)}
        >
          <div
            className="bg-white rounded-[2rem] border-2 border-black shadow-xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Accent */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#ff6b35] via-[#ff6b35]/60 to-transparent" />

            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-display text-[#1A1A1A] uppercase tracking-tight">
                  Session <span className="text-[#ff6b35]">Details</span>
                </h3>
                <button
                  onClick={() => setViewBooking(null)}
                  className="p-2 rounded-full bg-[#FDF8F5] border border-black/10 text-slate-500 hover:text-[#ff6b35] hover:border-[#ff6b35]/30 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Details */}
              <div className="space-y-4 text-sm">
                {[
                  { label: "Date", value: new Date(viewBooking.slotStart).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', weekday: 'short' }) },
                  { label: "Time", value: `${new Date(viewBooking.slotStart).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${new Date(viewBooking.slotEnd).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}` },
                  { label: "Arena", value: viewBooking.device },
                  { label: "Duration", value: `${viewBooking.durationHours} hour(s)` },
                  { label: "Players", value: viewBooking.players },
                  ...(viewBooking.game ? [{ label: "Game", value: viewBooking.game }] : []),
                  { label: "Amount", value: `₹${viewBooking.totalPrice?.toFixed(2) || '0.00'}` },
                  { label: "Status", value: viewBooking.status },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-2 border-b border-black/5 last:border-0">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{row.label}</span>
                    <span className="text-sm font-bold text-[#1A1A1A]">{String(row.value)}</span>
                  </div>
                ))}
              </div>

              {/* Close */}
              <button
                onClick={() => setViewBooking(null)}
                className="mt-6 w-full bg-[#ff6b35] text-white rounded-xl py-3 text-[11px] font-black uppercase tracking-widest hover:bg-[#e05928] transition-colors shadow-[0_0_15px_rgba(255,107,53,0.2)]"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1A1A1A; border-radius: 10px; }
      `}</style>
    </section>
  );
}