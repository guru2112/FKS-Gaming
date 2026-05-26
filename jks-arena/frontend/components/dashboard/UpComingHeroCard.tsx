"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";

interface UpcomingHeroCardProps {
  booking?: any;
  onCancel?: (bookingId: string) => void;
  isCancelling?: boolean;
  timerBgUrl?: string;
  detailsBgUrl?: string;
  themeBg?: string;
}

export default function UpcomingHeroCard({ booking, onCancel, isCancelling, timerBgUrl, detailsBgUrl, themeBg }: UpcomingHeroCardProps) {
  const [timeLeft, setTimeLeft] = useState({ hrs: '00', mins: '00', secs: '00' });
  const [showModal, setShowModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const mounted = typeof window !== "undefined";

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
      <div
        className="flex flex-col items-center justify-center backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.06)] h-full min-h-[250px]"
        style={themeBg ? { backgroundColor: `${themeBg}99` } : { backgroundColor: "rgba(255,255,255,0.4)" }}
      >
        <div className="w-16 h-16 rounded-2xl bg-[#F3EFEC] flex items-center justify-center mb-4 shadow-sm">
          <svg className="w-8 h-8 text-[#ff6b35]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        </div>
        <h3 className="text-base font-display text-[#1A1A1A] uppercase tracking-tight mb-1">No Upcoming Sessions</h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-5 text-center">Book a slot to see your countdown here</p>
        <a
          href="/book"
          className="bg-[#ff6b35] text-white rounded-xl px-6 py-3 text-[11px] font-black uppercase tracking-widest hover:bg-[#e05928] transition-colors shadow-[0_0_15px_rgba(255,107,53,0.2)]"
        >
          Book Now
        </a>
      </div>
    );
  }

  const bookerName = booking.userName || 'Player';

  return (
    <>
      <div
        className="relative flex flex-col backdrop-blur-xl border border-white/50 rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.06)] h-full overflow-hidden group"
        style={themeBg ? { backgroundColor: `${themeBg}99` } : { backgroundColor: "rgba(255,255,255,0.4)" }}
      >
        {/* Decorative Orange Dot */}
        <div className="absolute top-10 right-10 w-2 h-2 rounded-full bg-[#ff6b35] shadow-[0_0_20px_rgba(255,107,53,0.6)] z-10"></div>

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

            <div className={`mt-auto rounded-2xl px-6 py-5 w-fit shadow-md relative overflow-hidden ${timerBgUrl ? 'bg-[#111] border border-white/10' : 'bg-white border border-[#1A1A1A]/10'}`}>
              {timerBgUrl && (
                <div className="absolute inset-0">
                  <Image src={timerBgUrl} alt="Timer BG" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover opacity-90" />
                  <div className="absolute inset-0 bg-black/20" />
                </div>
              )}
              <div className="relative z-10 flex items-center gap-6">
                <div className="flex flex-col items-start">
                  <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#ff6b35] drop-shadow-md">Starts</span>
                  <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#ff6b35] drop-shadow-md">In</span>
                </div>
                <div className="h-10 w-[1px] bg-white/20" />
                <div className="flex items-center gap-1 font-display">
                  <div className="flex flex-col items-center min-w-[36px]">
                    <span className="text-[1.75rem] font-black leading-none text-white tabular-nums drop-shadow-lg">{timeLeft.hrs}</span>
                    <span className="text-[7px] font-sans font-black tracking-[0.3em] text-white/50 uppercase mt-1.5">Hrs</span>
                  </div>
                  <span className="text-2xl font-bold text-white/40 -mt-2 mx-0.5">:</span>
                  <div className="flex flex-col items-center min-w-[36px]">
                    <span className="text-[1.75rem] font-black leading-none text-white tabular-nums drop-shadow-lg">{timeLeft.mins}</span>
                    <span className="text-[7px] font-sans font-black tracking-[0.3em] text-white/50 uppercase mt-1.5">Mins</span>
                  </div>
                  <span className="text-2xl font-bold text-white/40 -mt-2 mx-0.5">:</span>
                  <div className="flex flex-col items-center min-w-[36px]">
                    <span className="text-[1.75rem] font-black leading-none text-white tabular-nums drop-shadow-lg">{timeLeft.secs}</span>
                    <span className="text-[7px] font-sans font-black tracking-[0.3em] text-white/50 uppercase mt-1.5">Secs</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Quick Snapshot */}
          <div className={`flex flex-col gap-5 border rounded-3xl p-6 shrink-0 min-w-[200px] justify-center relative overflow-hidden ${detailsBgUrl ? 'bg-[#111] border-white/10' : 'bg-[#FDF8F5] border-[#1A1A1A]/10'}`}>
            {detailsBgUrl && (
              <div className="absolute inset-0">
                <Image src={detailsBgUrl} alt="Details BG" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover opacity-90" />
                <div className="absolute inset-0 bg-[#FDF8F5]/10" />
              </div>
            )}
            <div className="relative z-10">
              <p className="text-[10px] text-white/60 uppercase tracking-widest font-bold mb-1">Booked By</p>
              <p className="text-base text-white font-black truncate drop-shadow-md">{bookerName}</p>
            </div>
            <div className="relative z-10">
              <p className="text-[10px] text-white/60 uppercase tracking-widest font-bold mb-1">Contact No.</p>
              <p className="text-base text-white font-black drop-shadow-md">{booking.contactNumber || 'N/A'}</p>
            </div>
            <div className="relative z-10">
              <p className="text-[10px] text-white/60 uppercase tracking-widest font-bold mb-1">Total Players</p>
              <p className="text-base text-white font-black drop-shadow-md">{booking.players || 1} {booking.players > 1 ? 'Players' : 'Player'}</p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex gap-4 mt-8 relative z-10 pt-6">
          <button
            onClick={() => setShowModal(true)}
            className="flex-1 bg-[#F3EFEC] border border-[#1A1A1A]/10 text-[#1A1A1A] rounded-xl py-3.5 text-[11px] font-black uppercase tracking-widest hover:bg-[#DED5D0] transition-colors"
          >
            View Details
          </button>
          {onCancel && (
            <button
              onClick={() => setShowCancelConfirm(true)}
              disabled={isCancelling}
              className="flex-1 bg-white border border-[#ff6b35] text-[#ff6b35] rounded-xl py-3.5 text-[11px] font-black uppercase tracking-widest hover:bg-[#ff6b35] hover:text-white transition-colors disabled:opacity-50"
            >
              {isCancelling ? "Cancelling..." : "Cancel Booking"}
            </button>
          )}
        </div>

        {/* CANCEL CONFIRMATION MODAL */}
        {showCancelConfirm && mounted && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
              <div className="p-6 pb-2">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h3 className="text-lg font-black text-[#1A1A1A] mb-1">Cancel Booking?</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Are you sure you want to cancel? This action cannot be undone and you&apos;ll need to re-book a new slot.</p>
              </div>
              <div className="flex border-t border-slate-100">
                <button onClick={() => setShowCancelConfirm(false)} className="flex-1 py-3.5 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors">Go Back</button>
                <button onClick={() => { onCancel?.(booking._id); setShowCancelConfirm(false); }} disabled={isCancelling} className="flex-1 py-3.5 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors border-l border-slate-100 disabled:opacity-50">{isCancelling ? "Cancelling..." : "Confirm Cancel"}</button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* DETAILS MODAL */}
        {showModal && mounted && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-[6px] animate-in fade-in duration-200">
            <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
              <div className="flex justify-between items-center p-6 pb-4">
                <h3 className="text-lg font-display text-[#1A1A1A] uppercase tracking-tight">Booking Details</h3>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-[#F3EFEC] hover:bg-[#DED5D0] flex items-center justify-center text-slate-500 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="px-6 pb-4 space-y-3">
                <DetailRow label="Slot" value={booking.device} />
                <DetailRow label="Date" value={new Date(booking.slotStart).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} />
                <DetailRow label="Start Time" value={new Date(booking.slotStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
                <DetailRow label="Duration" value={`${booking.durationHours} Hour${booking.durationHours > 1 ? 's' : ''}`} />
                <DetailRow label="End Time" value={new Date(new Date(booking.slotStart).getTime() + booking.durationHours * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
                <DetailRow label="Status" value={booking.status || 'active'} />
                <DetailRow label="Booked By" value={bookerName} />
                <DetailRow label="Contact" value={booking.contactNumber || 'N/A'} />
                <DetailRow label="Players" value={`${booking.players || 1} ${(booking.players || 1) > 1 ? 'Players' : 'Player'}`} />
                {booking.companions && booking.companions.length > 0 && (
                  <div className="pt-3 border-t border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">Companions</p>
                    <div className="space-y-1.5">
                      {booking.companions.map((c: any, i: number) => (
                        <div key={i} className="flex justify-between bg-[#FDF8F5] rounded-xl px-4 py-2">
                          <p className="text-xs font-bold text-[#1A1A1A]">{c.name || 'N/A'}</p>
                          <p className="text-xs font-medium text-slate-500">{c.phone || 'N/A'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="p-6 pt-4 border-t border-slate-100">
                <button onClick={() => setShowModal(false)} className="w-full bg-[#ff6b35] text-white rounded-xl py-3 text-xs font-black uppercase tracking-widest hover:bg-[#eb5d2a] transition-colors shadow-md">Got It</button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center bg-[#FDF8F5] rounded-xl px-4 py-3">
      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{label}</p>
      <p className="text-sm text-[#1A1A1A] font-bold">{value}</p>
    </div>
  );
}
