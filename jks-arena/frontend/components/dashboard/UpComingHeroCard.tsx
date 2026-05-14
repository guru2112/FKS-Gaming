"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export default function UpcomingHeroCard({ booking }: { booking?: any }) {
  const [timeLeft, setTimeLeft] = useState({ hrs: '00', mins: '00', secs: '00' });
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Set mounted state to ensure Portal only runs on the client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!booking) return;

    // Timer logic to update every second
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const startTime = new Date(booking.slotStart).getTime();
      const diff = startTime - now;

      // If the time has passed, lock timer at 00:00:00
      if (diff <= 0) {
        setTimeLeft({ hrs: '00', mins: '00', secs: '00' });
        clearInterval(interval);
        return;
      }

      // Calculate time parts safely
      const hrs = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
      const secs = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');

      setTimeLeft({ hrs, mins, secs });
    }, 1000);

    return () => clearInterval(interval);
  }, [booking]);

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center bg-white border border-[#1A1A1A] rounded-[2rem] p-6 shadow-sm h-full min-h-[250px]">
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No Upcoming Sessions</p>
      </div>
    );
  }

  // Handle nested object structure from the DB
  const bookerName = booking.userName || booking.userId?.name || 'Player';

  return (
    <>
      <div className="relative flex flex-col bg-white border border-[#1A1A1A] rounded-[2rem] p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] h-full overflow-hidden group">
        
        <div className="mb-6 relative z-10">
          <h3 className="text-sm font-black uppercase tracking-widest text-[#ff6b35]">Your Upcoming Session</h3>
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10 flex-1">
          
          {/* Left Side: Title, Date, Time & Timer */}
          <div className="flex flex-col justify-center flex-1">
            <h2 className="text-2xl font-display text-[#1A1A1A] mb-5 uppercase tracking-tight">
              {booking.device.includes('SIM') ? 'Simulator' : 'PS5 Arena'} – Slot {booking.device}
            </h2>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-[#1A1A1A]">
                <svg className="w-5 h-5 text-[#ff6b35]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-base font-black">{new Date(booking.slotStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({booking.durationHours} Hours)</span>
              </div>
              <div className="flex items-center gap-3 text-[#1A1A1A]">
                <svg className="w-5 h-5 text-[#ff6b35]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth={2.5}></rect><line x1="16" y1="2" x2="16" y2="6" strokeWidth={2.5}></line><line x1="8" y1="2" x2="8" y2="6" strokeWidth={2.5}></line><line x1="3" y1="10" x2="21" y2="10" strokeWidth={2.5}></line></svg>
                <span className="text-base font-black">{new Date(booking.slotStart).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-auto bg-[#ff6b35] rounded-2xl px-5 py-3.5 w-fit shadow-md border border-[#ff6b35]/80">
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Starts In</span>
              <div className="flex gap-2 text-[#1A1A1A] font-display text-2xl">
                <div className="flex flex-col items-center">
                  <span className="leading-none text-[#1A1A1A]">{timeLeft.hrs}</span>
                  <span className="text-[9px] font-sans font-black tracking-widest text-white uppercase mt-1">Hrs</span>
                </div>
                <span className="leading-none opacity-70 text-[#1A1A1A]">:</span>
                <div className="flex flex-col items-center">
                  <span className="leading-none text-[#1A1A1A]">{timeLeft.mins}</span>
                  <span className="text-[9px] font-sans font-black tracking-widest text-white uppercase mt-1">Mins</span>
                </div>
                <span className="leading-none opacity-70 text-[#1A1A1A]">:</span>
                <div className="flex flex-col items-center">
                  <span className="leading-none text-[#1A1A1A]">{timeLeft.secs}</span>
                  <span className="text-[9px] font-sans font-black tracking-widest text-white uppercase mt-1">Secs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Quick Snapshot */}
          <div className="flex flex-col gap-5 bg-[#FDF8F5] border border-[#1A1A1A]/10 rounded-3xl p-6 shrink-0 min-w-[200px] justify-center">
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Booked By</p>
              <p className="text-base text-[#1A1A1A] font-black truncate">{bookerName}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Contact No.</p>
              <p className="text-base text-[#1A1A1A] font-black">{booking.contactNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Total Players</p>
              <p className="text-base text-[#1A1A1A] font-black">{booking.players || 1} {booking.players > 1 ? 'Players' : 'Player'}</p>
            </div>
          </div>

        </div>

        <div className="flex gap-4 mt-8 relative z-10 border-t border-[#1A1A1A]/10 pt-6">
          <button 
            onClick={() => setShowModal(true)}
            className="flex-1 bg-[#F3EFEC] border border-[#1A1A1A]/10 text-[#1A1A1A] rounded-xl py-3.5 text-[11px] font-black uppercase tracking-widest hover:bg-[#DED5D0] transition-colors"
          >
            View Details
          </button>
          <button className="flex-1 bg-white border border-[#ff6b35] text-[#ff6b35] rounded-xl py-3.5 text-[11px] font-black uppercase tracking-widest hover:bg-[#ff6b35] hover:text-white transition-colors">
            Cancel Booking
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 🔥 DETAILS MODAL OVERLAY (USING REACT PORTAL) */}
      {/* ========================================================= */}
      {showModal && mounted && createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#1A1A1A]/60 backdrop-blur-md p-4">
          <div className="bg-[#FDF8F5] border border-[#1A1A1A]/20 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            
            {/* Close Button */}
            <button 
              onClick={() => setShowModal(false)} 
              className="absolute top-6 right-6 text-slate-400 hover:text-[#ff6b35] transition-colors bg-white p-2 rounded-full border border-slate-200 shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#ff6b35] mb-1">Session Details</p>
            <h3 className="font-display text-2xl text-[#1A1A1A] mb-6 uppercase tracking-tight">
              {booking.device.includes('SIM') ? 'Simulator' : 'PS5 Arena'} <span className="text-slate-300">|</span> {booking.device}
            </h3>

            <div className="space-y-4">
              
              {/* Timing info */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Date & Time</p>
                  <p className="font-black text-[#1A1A1A] text-sm">{new Date(booking.slotStart).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Duration</p>
                  <p className="font-black text-[#ff6b35] text-sm">{booking.durationHours} Hour(s)</p>
                </div>
              </div>

              {/* Host Info */}
              <div className="bg-white border border-[#ff6b35]/20 rounded-2xl p-4 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#ff6b35] mb-2 flex items-center gap-2">
                  <span>Primary Booker (Host)</span>
                </p>
                <div className="flex justify-between items-center">
                  <p className="font-black text-[#1A1A1A] text-base">{bookerName}</p>
                  <p className="font-bold text-slate-500 text-sm">{booking.contactNumber || 'N/A'}</p>
                </div>
              </div>

              {/* Companions Info */}
              {booking.companions && booking.companions.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 flex justify-between">
                    <span>Additional Players</span>
                    <span>Total: {booking.players}</span>
                  </p>
                  <div className="space-y-3">
                    {booking.companions.map((comp: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center border-b border-slate-100 last:border-0 pb-2 last:pb-0">
                        <span className="font-bold text-sm text-[#1A1A1A]">{comp.name || `Player ${idx + 2}`}</span>
                        <span className="text-sm text-slate-500 font-medium">{comp.phone || 'No Number'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8">
              <button 
                onClick={() => setShowModal(false)}
                className="w-full bg-[#1A1A1A] text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#ff6b35] transition-colors shadow-md"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}
    </>
  );
}