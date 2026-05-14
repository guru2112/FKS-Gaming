"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { API_BASE_URL } from "@/lib/auth";

const DEVICES = ["PS1", "PS2", "PS3", "SIM1"];

interface Companion {
  name: string;
  phone: string;
}

interface ScheduleItem {
  device: string;
  slotStart: string;
  slotEnd: string;
}

export default function BookSlotPage() {
  const router = useRouter();
  
  // -- UI States --
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // -- Background Slider States --
  const [desktopImages, setDesktopImages] = useState<string[]>([]);
  const [mobileImages, setMobileImages] = useState<string[]>([]);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  // -- Schedule State --
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  // -- Form Data State --
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    device: "PS1",
    durationHours: 1,
    players: 1,
    userName: "",
    userPhone: "",
    companions: [] as Companion[],
  });

  // 🔥 Fetch images from DB and filter by Desktop/Mobile Views
  useEffect(() => {
    async function fetchBackgrounds() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/media`);
        const data = await res.json();
        
        if (data.items) {
          const desktop = data.items
            .filter((item: any) => item.category === "Application" && item.view === "Desktop")
            .map((item: any) => item.secure_url);
            
          const mobile = data.items
            .filter((item: any) => item.category === "Application" && item.view === "Mobile")
            .map((item: any) => item.secure_url);

          setDesktopImages(desktop.length > 0 ? desktop : ["https://res.cloudinary.com/dle9e8kwq/image/upload/v1778053508/Photos/Application/b2sroykaouke7ydut1ce.jpg"]);
          setMobileImages(mobile.length > 0 ? mobile : ["https://res.cloudinary.com/dle9e8kwq/image/upload/v1778053392/Photos/Application/vnuoihogngfcbrxvxfzm.jpg"]);
        }
      } catch (err) {
        console.error("Failed to load hero backgrounds:", err);
      }
    }
    fetchBackgrounds();
  }, []);

  // 🔥 Slider Logic
  useEffect(() => {
    const maxLen = Math.max(desktopImages.length, mobileImages.length);
    if (maxLen <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % maxLen);
    }, 5000); 
    return () => clearInterval(interval);
  }, [desktopImages.length, mobileImages.length]);

  // -- Fetch Schedule Logic --
  useEffect(() => {
    if (step === 2 && formData.date) {
      fetchSchedule(formData.date);
    }
  }, [step, formData.date]);

  async function fetchSchedule(dateStr: string) {
    setLoadingSchedule(true);
    setError(null);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${API_BASE_URL}/api/bookings/schedule?date=${dateStr}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setSchedule(data.bookings || []);
      } else {
        setError(data.message || "Failed to load schedule");
      }
    } catch (err) {
      setError("Network error: Could not connect to the server.");
    } finally {
      setLoadingSchedule(false);
    }
  }

  const checkAvailability = () => {
    const selectedStart = new Date(`${formData.date}T${formData.time}`).getTime();
    const selectedEnd = selectedStart + (formData.durationHours * 60 * 60 * 1000);
    const buffer = 20 * 60 * 1000; // 20-minute gap buffer

    const deviceBookings = schedule.filter((b) => b.device === formData.device);

    for (const booking of deviceBookings) {
      const existingStart = new Date(booking.slotStart).getTime();
      const existingEnd = new Date(booking.slotEnd).getTime();

      const isOverlapping = (
        (selectedStart >= (existingStart - buffer) && selectedStart < (existingEnd + buffer)) ||
        (selectedEnd > (existingStart - buffer) && selectedEnd <= (existingEnd + buffer)) ||
        (selectedStart <= existingStart && selectedEnd >= existingEnd)
      );

      if (isOverlapping) {
        setError(
          `Slot not available for booking. Please check the arena availability in the previous step and choose a different time.`
        );
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    setError(null);
    if (step === 1 && !formData.date) return setError("Please select a date.");
    if (step === 3) {
      if (!formData.time) return setError("Please select a start time.");
      if (!checkAvailability()) return; 
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep((prev) => prev - 1);
  };

  const handlePlayersChange = (count: number) => {
    const companionCount = count - 1;
    const newCompanions = Array(companionCount).fill({ name: "", phone: "" });
    setFormData({ ...formData, players: count, companions: newCompanions });
  };

  const handleCompanionChange = (index: number, field: keyof Companion, value: string) => {
    const updated = [...formData.companions];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, companions: updated });
  };

  const handleSubmit = async () => {
    setError(null);
    if (!formData.userName || !formData.userPhone) return setError("Provide your name and contact.");
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const startDateTime = new Date(`${formData.date}T${formData.time}`);
      const payload = {
        device: formData.device,
        slotStart: startDateTime.toISOString(),
        durationHours: formData.durationHours,
        players: formData.players,
        userName: formData.userName,
        contactNumber: formData.userPhone,
        companions: formData.companions,
      };

      const res = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Booking failed");
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    // 🔥 Reduced top padding (pt-4) to pull everything up
    <div className="min-h-screen relative overflow-hidden font-sans text-white pt-4 md:pt-6 pb-24 px-4 sm:px-6 selection:bg-[#ff6b35] selection:text-[#050505]">
      
      {/* Slow Pan Animation CSS */}
      <style>{`
        @keyframes pan-image {
          0% { transform: scale(1.05) translateX(1%); }
          100% { transform: scale(1.05) translateX(-1%); }
        }
        .animate-pan {
          animation: pan-image 20s ease-in-out infinite alternate;
        }
      `}</style>

      {/* =========================================================
          🔥 GLOBAL FIXED DYNAMIC BACKGROUND
      ========================================================= */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        
        {/* DESKTOP VIEW */}
        <div className="hidden md:block w-full h-full relative">
          {desktopImages.map((src, idx) => (
            <div 
              key={`desktop-${idx}`}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                idx === currentBgIndex ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <div className="absolute inset-0 w-full h-full animate-pan">
                <Image src={src} alt="Desktop Background" fill priority={idx === 0} className="object-cover opacity-100" />
              </div>
            </div>
          ))}
        </div>

        {/* MOBILE VIEW */}
        <div className="block md:hidden w-full h-full relative">
          {mobileImages.map((src, idx) => (
            <div 
              key={`mobile-${idx}`}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                idx === currentBgIndex ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <div className="absolute inset-0 w-full h-full animate-pan">
                <Image src={src} alt="Mobile Background" fill priority={idx === 0} className="object-cover opacity-100" />
              </div>
            </div>
          ))}
        </div>

        {/* Dark Overlay to make the form readable over the moving images */}
        <div className="absolute inset-0 bg-[#050505]/40 z-20"></div>

        {/* Intense Background Glows */}
        <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] bg-gradient-to-bl from-[#ff6b35]/30 via-[#ff4500]/10 to-transparent blur-[140px] rounded-full pointer-events-none z-30"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-gradient-to-tr from-[#ff6b35]/20 via-[#ff4500]/5 to-transparent blur-[120px] rounded-full pointer-events-none z-30"></div>
      </div>
      
      {/* =========================================================
          🔥 MAIN CONTENT
      ========================================================= */}
      <div className="max-w-[850px] mx-auto relative z-10">
        
        {/* Header Bar - Reduced bottom margin (mb-4) */}
        <div className="flex flex-col mb-4 md:mb-5">
          <span className="font-display font-black text-xl md:text-2xl italic tracking-wider leading-none text-slate-300">JKS ARENA</span>
          <span className="text-[8px] font-bold tracking-[0.25em] text-[#ff6b35] mt-1">GAMING CAFE</span>
        </div>

        {/* Main Title Area - Reduced bottom margin (mb-4) */}
        <div className="mb-4 md:mb-6">
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-black italic uppercase tracking-tight leading-[0.9] drop-shadow-lg flex items-center whitespace-nowrap">
            <span className="text-white mr-4">Reserve</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b35] to-[#ff4500]">A Rig</span>
          </h1>
          <p className="mt-2 md:mt-3 text-xs sm:text-sm text-slate-300 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
            Book your favorite console and enjoy the ultimate gaming experience.
          </p>
        </div>

        {/* Main Booking Form Card - Reduced top padding (pt-12) */}
        <div className="bg-[#111111]/60 backdrop-blur-xs border border-white/5 rounded-[2rem] p-6 md:p-12 pt-12 md:pt-14 relative shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          
          {/* Cancel Button Moved ONTO the Card */}
          <Link href="/dashboard" className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-4 py-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all text-slate-300 hover:text-white z-20">
            <svg className="w-3 h-3 text-[#ff6b35]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            Cancel Booking
          </Link>

          {/* Custom Stepper */}
          <div className="flex items-center justify-between relative mb-10 md:mb-14 mt-4 md:mt-0 max-w-[600px] mx-auto">
            {/* Background Line */}
            <div className="absolute top-5 md:top-6 left-0 w-full h-[2px] bg-white/10 -translate-y-1/2 z-0"></div>
            {/* Active Line */}
            <div className="absolute top-5 md:top-6 left-0 h-[2px] bg-gradient-to-r from-[#ff6b35] to-[#ff4500] -translate-y-1/2 z-0 transition-all duration-500 shadow-[0_0_10px_rgba(255,107,53,0.8)]" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>

            {[1, 2, 3, 4].map(i => (
              <div key={i} className="relative z-10 flex flex-col items-center gap-3">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm font-black border-2 transition-all duration-300 ${
                  step >= i 
                    ? 'bg-[#ff6b35] border-[#ff6b35] text-black shadow-[0_0_15px_rgba(255,107,53,0.6)]' 
                    : 'bg-[#1a1a1a] border-white/10 text-slate-500'
                }`}>
                  {i}
                </div>
                <span className={`text-[8px] md:text-[9px] uppercase tracking-widest font-bold absolute -bottom-6 md:-bottom-8 whitespace-nowrap transition-colors ${step === i ? 'text-[#ff6b35]' : 'text-slate-500'}`}>
                  {i === 1 ? 'Select Date' : i === 2 ? 'Arena Availability' : i === 3 ? 'Rig & Time' : 'Player Details'}
                </span>
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold tracking-wide flex items-start gap-3">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <span>{error}</span>
            </div>
          )}

          {/* Form Sections */}
          <div className="min-h-[250px]">
            
            {/* STEP 1 */}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                    <svg className="w-6 h-6 text-[#ff6b35]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-bold uppercase tracking-wider text-white">Select Date</h2>
                    <p className="text-xs text-slate-400">Pick your session date to see rig availability.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Choose Date</label>
                  <input 
                    type="date" 
                    min={new Date().toISOString().split("T")[0]}
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-white/10 focus:border-[#ff6b35] rounded-xl px-5 py-4 text-white font-bold focus:outline-none focus:ring-1 focus:ring-[#ff6b35] transition-all [color-scheme:dark]"
                  />
                </div>

                <div className="mt-6 flex items-center gap-4 p-4 rounded-xl border border-[#ff6b35]/30 bg-[#ff6b35]/5">
                  <svg className="w-6 h-6 text-[#ff6b35] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">You will be able to view arena availability for the selected date in the next step.</p>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                    <svg className="w-6 h-6 text-[#ff6b35]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-bold uppercase tracking-wider text-white">Arena Availability</h2>
                    <p className="text-xs text-slate-400">Booked slots for <span className="text-[#ff6b35] font-bold">{formData.date}</span></p>
                  </div>
                </div>

                {loadingSchedule ? (
                  <div className="py-16 flex justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ff6b35]/20 border-t-[#ff6b35]"></div></div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {DEVICES.map(device => {
                      const deviceBookings = schedule.filter(b => b.device === device);
                      return (
                        <div key={device} className="border border-white/10 hover:border-[#ff6b35]/50 transition-colors rounded-xl p-5 bg-[#1a1a1a]">
                          <div className="flex justify-between items-center mb-4">
                            <span className="font-black text-sm text-white uppercase tracking-wider">{device}</span>
                            <span className="text-[9px] font-black uppercase text-slate-400 bg-[#050505] border border-white/5 px-2 py-1 rounded-md">{deviceBookings.length} Booked</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {deviceBookings.length > 0 ? deviceBookings.map((b, idx) => (
                              <span key={idx} className="bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] font-black tracking-widest px-2.5 py-1.5 rounded-lg">
                                {new Date(b.slotStart).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })} - {new Date(b.slotEnd).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                              </span>
                            )) : <span className="text-[10px] text-green-400 border border-green-500/30 bg-green-500/10 px-3 py-1.5 rounded-lg font-black uppercase">Free All Day</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                    <svg className="w-6 h-6 text-[#ff6b35]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-bold uppercase tracking-wider text-white">Rig & Time</h2>
                    <p className="text-xs text-slate-400">Pick your console, duration, and start time.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div className="relative">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#ff6b35] mb-2 px-1">Console</label>
                    <select value={formData.device} onChange={(e) => setFormData({ ...formData, device: e.target.value })} className="w-full appearance-none bg-[#1a1a1a] border border-white/10 focus:border-[#ff6b35] rounded-xl px-5 py-4 text-white font-bold focus:outline-none focus:ring-1 focus:ring-[#ff6b35] transition-all cursor-pointer">
                      {DEVICES.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#ff6b35] mb-2 px-1">Duration</label>
                    <select value={formData.durationHours} onChange={(e) => setFormData({ ...formData, durationHours: Number(e.target.value) })} className="w-full appearance-none bg-[#1a1a1a] border border-white/10 focus:border-[#ff6b35] rounded-xl px-5 py-4 text-white font-bold focus:outline-none focus:ring-1 focus:ring-[#ff6b35] transition-all cursor-pointer">
                      {[1, 2, 3, 4, 5].map(h => <option key={h} value={h}>{h} Hour{h > 1 ? 's' : ''}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#ff6b35] mb-2 px-1">Start Time</label>
                  <input type="time" required value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="w-full bg-[#1a1a1a] border border-white/10 focus:border-[#ff6b35] rounded-xl px-5 py-4 text-white font-bold focus:outline-none focus:ring-1 focus:ring-[#ff6b35] transition-all [color-scheme:dark]" />
                </div>
              </div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                    <svg className="w-6 h-6 text-[#ff6b35]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-bold uppercase tracking-wider text-white">Player Details</h2>
                    <p className="text-xs text-slate-400">Add details for everyone attending the session.</p>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Players</label>
                  <select value={formData.players} onChange={(e) => handlePlayersChange(Number(e.target.value))} className="w-full appearance-none bg-[#1a1a1a] border border-white/10 focus:border-[#ff6b35] rounded-xl px-5 py-4 text-white font-bold focus:outline-none focus:ring-1 focus:ring-[#ff6b35] transition-all cursor-pointer">
                    {[1, 2, 3, 4, 5].map(p => <option key={p} value={p}>{p} Player{p > 1 ? 's' : ''}</option>)}
                  </select>
                </div>

                <div className="space-y-4">
                  {/* Host */}
                  <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#ff6b35] to-[#ff4500]"></div>
                    <p className="text-[10px] font-black uppercase text-[#ff6b35] mb-4 tracking-widest">Primary Booker (Host)</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input type="text" placeholder="Full Name" value={formData.userName} onChange={(e) => setFormData({ ...formData, userName: e.target.value })} className="w-full bg-[#050505] border border-white/10 focus:border-[#ff6b35] rounded-xl px-4 py-3 text-sm text-white font-medium focus:outline-none transition-colors" />
                      <input type="tel" placeholder="Phone Number" value={formData.userPhone} onChange={(e) => setFormData({ ...formData, userPhone: e.target.value })} className="w-full bg-[#050505] border border-white/10 focus:border-[#ff6b35] rounded-xl px-4 py-3 text-sm text-white font-medium focus:outline-none transition-colors" />
                    </div>
                  </div>

                  {/* Companions */}
                  {formData.companions.map((comp, idx) => (
                    <div key={idx} className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-black uppercase text-slate-500 mb-4 tracking-widest">Player {idx + 2}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input type="text" placeholder="Name" value={comp.name} onChange={(e) => handleCompanionChange(idx, "name", e.target.value)} className="w-full bg-[#050505] border border-white/5 focus:border-white/30 rounded-xl px-4 py-3 text-sm text-white font-medium focus:outline-none transition-colors" />
                        <input type="tel" placeholder="Phone" value={comp.phone} onChange={(e) => handleCompanionChange(idx, "phone", e.target.value)} className="w-full bg-[#050505] border border-white/5 focus:border-white/30 rounded-xl px-4 py-3 text-sm text-white font-medium focus:outline-none transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="mt-8 md:mt-12 flex items-center justify-between border-t border-white/10 pt-8">
            <button 
              onClick={handleBack} 
              disabled={step === 1 || isLoading} 
              className={`text-[10px] font-black uppercase tracking-widest px-6 py-4 rounded-xl transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-400 bg-white/5 hover:bg-white/10 hover:text-white border border-white/5'}`}
            >
              ← Back
            </button>

            {step < 4 ? (
              <button onClick={handleNext} className="bg-gradient-to-r from-[#ff6b35] to-[#ff4500] text-black text-[11px] font-black uppercase tracking-widest px-8 py-4 rounded-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,107,53,0.4)] flex items-center gap-2">
                Next Step →
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={isLoading} className="bg-gradient-to-r from-green-500 to-emerald-600 text-black text-[11px] font-black uppercase tracking-widest px-10 py-4 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2">
                {isLoading ? "Confirming..." : "Confirm Booking ✓"}
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Footer Badges styled like the reference image - FORCED TO 3 CARDS SIDE BY SIDE */}
      <div className="flex flex-col md:flex-row w-full gap-4 max-w-[800px] mx-auto relative z-10 mt-6 md:mt-8">
        
        <div className="flex-1 flex items-center gap-4 bg-[#111111]/90 backdrop-blur-md border border-white/5 rounded-2xl p-5 shadow-lg hover:border-white/10 transition-colors">
          <div className="w-10 h-10 rounded-full bg-[#ff6b35]/10 border border-[#ff6b35]/30 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-[#ff6b35]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-white">Secure Booking</p>
            <p className="text-[10px] text-slate-500 mt-0.5">100% Safe & Secure</p>
          </div>
        </div>
        
        <div className="flex-1 flex items-center gap-4 bg-[#111111]/90 backdrop-blur-md border border-white/5 rounded-2xl p-5 shadow-lg hover:border-white/10 transition-colors">
          <div className="w-10 h-10 rounded-full bg-[#ff6b35]/10 border border-[#ff6b35]/30 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-[#ff6b35]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-white">Instant Confirm</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Quick & Easy Booking</p>
          </div>
        </div>

        <div className="flex-1 flex items-center gap-4 bg-[#111111]/90 backdrop-blur-md border border-white/5 rounded-2xl p-5 shadow-lg hover:border-white/10 transition-colors">
          <div className="w-10 h-10 rounded-full bg-[#ff6b35]/10 border border-[#ff6b35]/30 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-[#ff6b35]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-white">24/7 Support</p>
            <p className="text-[10px] text-slate-500 mt-0.5">We&apos;re Here to Help</p>
          </div>
        </div>

      </div>
    </div>
  );
}