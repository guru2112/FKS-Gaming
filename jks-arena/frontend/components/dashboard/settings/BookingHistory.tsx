import { Dispatch, SetStateAction } from "react";

// Assuming you have exported LocalBooking from the main page or a types file
// type LocalBooking = ...

interface BookingHistoryProps {
  bookings: any[]; 
  filteredBookings: any[];
  statusFilter: string;
  setStatusFilter: Dispatch<SetStateAction<string>>;
  deviceFilter: string;
  setDeviceFilter: Dispatch<SetStateAction<string>>;
  dateFilter: string;
  setDateFilter: Dispatch<SetStateAction<string>>;
  clearFilters: () => void;
  setSelectedBooking: (booking: any) => void;
}

const DEVICES = ["ALL", "PS1", "PS2", "PS3", "SIM1"];
const STATUSES = ["ALL", "upcoming", "active", "completed", "cancelled"];

export default function BookingHistory({
  bookings,
  filteredBookings,
  statusFilter,
  setStatusFilter,
  deviceFilter,
  setDeviceFilter,
  dateFilter,
  setDateFilter,
  clearFilters,
  setSelectedBooking
}: BookingHistoryProps) {
  return (
    <section id="history" className="space-y-6 pt-8 border-t border-[#1A1A1A]/10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <h2 className="font-display text-3xl font-black uppercase text-[#1A1A1A] tracking-tight">
          Booking History
        </h2>
      </div>

      {/* FILTER BAR UI */}
      {/* 🔥 Updated to use the black border aesthetic */}
      <div className="grid grid-cols-2 md:flex md:flex-row gap-4 bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-[#1A1A1A]/20 shadow-sm">
        
        {/* STATUS */}
        <div className="col-span-1 md:flex-1">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 px-1">Status</label>
          <div className="relative group">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none bg-[#FDF8F5] border border-[#1A1A1A]/20 hover:border-[#1A1A1A]/50 rounded-xl pl-4 pr-10 py-3 text-xs font-bold uppercase tracking-wider text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/50 transition-all cursor-pointer shadow-sm"
            >
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[#1A1A1A]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        {/* CONSOLE */}
        <div className="col-span-1 md:flex-1">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 px-1">Console</label>
          <div className="relative group">
            <select 
              value={deviceFilter} 
              onChange={(e) => setDeviceFilter(e.target.value)}
              className="w-full appearance-none bg-[#FDF8F5] border border-[#1A1A1A]/20 hover:border-[#1A1A1A]/50 rounded-xl pl-4 pr-10 py-3 text-xs font-bold uppercase tracking-wider text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/50 transition-all cursor-pointer shadow-sm"
            >
              {DEVICES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[#1A1A1A]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        {/* DATE */}
        <div className="col-span-2 sm:col-span-1 md:flex-1">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 px-1">Date</label>
          <input 
            type="date" 
            value={dateFilter} 
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full bg-[#FDF8F5] border border-[#1A1A1A]/20 hover:border-[#1A1A1A]/50 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/50 transition-all cursor-pointer shadow-sm"
          />
        </div>

        {/* CLEAR BUTTON */}
        <div className="col-span-2 sm:col-span-1 flex items-end">
          <button 
            onClick={clearFilters}
            className="w-full h-[42px] px-6 rounded-xl border border-[#1A1A1A]/20 bg-white text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] hover:bg-[#1A1A1A] hover:border-[#1A1A1A] hover:text-white transition-all shadow-sm"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {bookings.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-dashed border-[#1A1A1A]/20 p-12 text-center bg-white/50 backdrop-blur-sm">
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No sessions recorded. Reserve your first slot above!</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-dashed border-[#1A1A1A]/20 p-12 text-center bg-white/50 backdrop-blur-sm">
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No bookings match your current filters.</p>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div 
              key={booking._id} 
              onClick={() => setSelectedBooking(booking)}
              // 🔥 Subtle black border that turns solid black on hover
              className="group flex flex-col rounded-3xl border border-[#1A1A1A]/20 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer hover:border-[#1A1A1A] relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-[#ff6b35]/0 to-[#ff6b35]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDF8F5] text-[#1A1A1A] group-hover:bg-[#1A1A1A] group-hover:text-white transition-colors shadow-sm border border-[#1A1A1A]/10">
                   <span className="font-black text-xs uppercase">{booking.device}</span>
                </div>
                
                {/* Status Badges Adjusted for Light Theme */}
                <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border shadow-sm ${
                  booking.status === 'upcoming' ? 'bg-green-50 text-green-600 border-green-200' : 
                  booking.status === 'active' ? 'bg-orange-50 text-[#ff6b35] border-[#ff6b35]/30' :
                  booking.status === 'cancelled' ? 'bg-red-50 text-red-500 border-red-200' :
                  'bg-slate-50 text-slate-500 border-slate-200'
                }`}>
                  {booking.status}
                </span>
              </div>
              
              <div className="flex-1 relative z-10">
                <p className="font-black text-[#1A1A1A] text-lg line-clamp-1 uppercase tracking-tight">
                  {booking.game || "General Session"}
                </p>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-2">
                  {new Date(booking.slotStart).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} • {new Date(booking.slotStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-[#1A1A1A]/10 flex justify-between items-center relative z-10">
                <p className="text-[10px] font-bold text-[#ff6b35] uppercase tracking-widest">
                  {booking.players} Player{booking.players > 1 ? 's' : ''}
                </p>
                <p className="text-lg font-black text-[#1A1A1A]">₹{booking.totalPrice}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}