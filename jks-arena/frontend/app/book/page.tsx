"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "@/lib/auth";
import { toast } from "sonner";

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

// ── Step slide variants ──────────────────────────────────────────────
const stepVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

export default function BookSlotPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [stepDir, setStepDir] = useState(1); // 1 = forward, -1 = back
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Background
  const [desktopImages, setDesktopImages] = useState<string[]>([]);
  const [mobileImages, setMobileImages] = useState<string[]>([]);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  // Schedule
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  // Form
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

  // ── Fetch backgrounds ─────────────────────────────────────────────
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

  // ── Slider ────────────────────────────────────────────────────────
  useEffect(() => {
    const maxLen = Math.max(desktopImages.length, mobileImages.length);
    if (maxLen <= 1) return;
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % maxLen);
    }, 5000);
    return () => clearInterval(interval);
  }, [desktopImages.length, mobileImages.length]);

  // ── Schedule fetch ────────────────────────────────────────────────
  useEffect(() => {
    if (step === 2 && formData.date) fetchSchedule(formData.date);
  }, [step, formData.date]);

  async function fetchSchedule(dateStr: string) {
    setLoadingSchedule(true);
    setError(null);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${API_BASE_URL}/api/bookings/schedule?date=${dateStr}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setSchedule(data.bookings || []);
      else setError(data.message || "Failed to load schedule");
    } catch {
      setError("Network error: Could not connect to the server.");
    } finally {
      setLoadingSchedule(false);
    }
  }

  // ── Availability check ────────────────────────────────────────────
  const checkAvailability = () => {
    const selectedStart = new Date(`${formData.date}T${formData.time}`).getTime();
    const selectedEnd = selectedStart + formData.durationHours * 3600000;
    const buffer = 20 * 60 * 1000;
    const deviceBookings = schedule.filter((b) => b.device === formData.device);
    for (const booking of deviceBookings) {
      const existingStart = new Date(booking.slotStart).getTime();
      const existingEnd = new Date(booking.slotEnd).getTime();
      if (
        (selectedStart >= existingStart - buffer && selectedStart < existingEnd + buffer) ||
        (selectedEnd > existingStart - buffer && selectedEnd <= existingEnd + buffer) ||
        (selectedStart <= existingStart && selectedEnd >= existingEnd)
      ) {
        setError("Slot not available. Check arena availability and pick a different time.");
        return false;
      }
    }
    return true;
  };

  // ── Navigation ────────────────────────────────────────────────────
  const goStep = (next: number) => {
    setStepDir(next > step ? 1 : -1);
    setStep(next);
  };

  const handleNext = () => {
    setError(null);
    if (step === 1 && !formData.date) return setError("Please select a date.");
    if (step === 3) {
      if (!formData.time) return setError("Please select a start time.");
      if (!checkAvailability()) return;
    }
    goStep(step + 1);
  };

  const handleBack = () => {
    setError(null);
    goStep(step - 1);
  };

  const handlePlayersChange = (count: number) => {
    const companionCount = count - 1;
    const newCompanions = Array(companionCount).fill(null).map(() => ({ name: "", phone: "" }));
    setFormData({ ...formData, players: count, companions: newCompanions });
  };

  const handleCompanionChange = (index: number, field: keyof Companion, value: string) => {
    const updated = [...formData.companions];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, companions: updated });
  };

  // ── Submit ────────────────────────────────────────────────────────
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
      setShowConfetti(true);
      toast.success("Booking confirmed!", { description: "Check your dashboard for your QR pass.", duration: 5000 });
      setTimeout(() => router.push("/dashboard?justBooked=true"), 1200);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const stepLabels = ["Select Date", "Arena Availability", "Rig & Time", "Player Details"];

  return (
    <div className="min-h-screen relative overflow-hidden font-sans text-white pt-4 md:pt-6 pb-24 px-4 sm:px-6 selection:bg-[#ff6b35] selection:text-[#050505]">

      {/* ═══════════════════════════════════════════════════════════════
          CYBERPUNK CSS EFFECTS
      ═══════════════════════════════════════════════════════════════ */}
      <style>{`
        @keyframes pan-image {
          0%   { transform: scale(1.05) translateX(1%); }
          100% { transform: scale(1.05) translateX(-1%); }
        }
        .animate-pan { animation: pan-image 20s ease-in-out infinite alternate; }

        /* Scan lines overlay */
        @keyframes scanlines {
          0%   { background-position: 0 0; }
          100% { background-position: 0 4px; }
        }
        .scanlines::after {
          content: "";
          position: absolute; inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent, transparent 2px,
            rgba(255,255,255,0.015) 2px, rgba(255,255,255,0.015) 4px
          );
          animation: scanlines 0.3s linear infinite;
          pointer-events: none;
          border-radius: inherit;
          z-index: 1;
        }

        /* Glitch text effect */
        @keyframes glitch {
          0%, 90%, 100% { transform: translate(0); text-shadow: none; }
          92%  { transform: translate(-2px, 1px);  text-shadow: 2px 0 #00f0ff, -2px 0 #ff6b35; }
          94%  { transform: translate(2px, -1px); text-shadow: -2px 0 #00f0ff, 2px 0 #ff6b35; }
          96%  { transform: translate(0);         text-shadow: none; }
          97%  { transform: translate(1px, 2px);  text-shadow: 1px 0 #00f0ff, -1px 0 #ff6b35; }
          98%  { transform: translate(0);         text-shadow: none; }
        }
        .glitch-text { animation: glitch 4s ease-in-out infinite; }

        /* Neon pulse on active step */
        @keyframes neon-pulse {
          0%, 100% { box-shadow: 0 0 8px rgba(255,107,53,0.6), 0 0 20px rgba(255,107,53,0.3); }
          50%      { box-shadow: 0 0 16px rgba(255,107,53,0.8), 0 0 40px rgba(255,107,53,0.5); }
        }
        .neon-pulse { animation: neon-pulse 2s ease-in-out infinite; }

        /* Shimmer on progress rail */
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        /* Corner brackets */
        .corner-brackets::before, .corner-brackets::after {
          content: "";
          position: absolute;
          width: 24px; height: 24px;
          border-color: rgba(255,107,53,0.4);
          border-style: solid;
          pointer-events: none;
          z-index: 2;
        }
        .corner-brackets::before {
          top: 12px; left: 12px;
          border-width: 2px 0 0 2px;
        }
        .corner-brackets::after {
          bottom: 12px; right: 12px;
          border-width: 0 2px 2px 0;
        }

        /* Confetti particles */
        @keyframes confetti-fall {
          0%   { transform: translateY(-20vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .confetti-particle {
          position: fixed;
          top: 0;
          width: 8px; height: 8px;
          z-index: 9999;
          pointer-events: none;
        }

        /* Error glitch shake */
        @keyframes glitch-shake {
          0%, 100% { transform: translateX(0); }
          10%  { transform: translateX(-4px); }
          20%  { transform: translateX(4px); }
          30%  { transform: translateX(-3px); }
          40%  { transform: translateX(3px); }
          50%  { transform: translateX(-2px); }
          60%  { transform: translateX(2px); }
          70%  { transform: translateX(-1px); }
        }
        .error-glitch { animation: glitch-shake 0.5s ease-out; }

        /* Green pulse for free badge */
        @keyframes green-pulse {
          0%, 100% { box-shadow: 0 0 6px rgba(34,197,94,0.4); }
          50%      { box-shadow: 0 0 14px rgba(34,197,94,0.7); }
        }
        .green-pulse { animation: green-pulse 2s ease-in-out infinite; }

        /* Cyberpunk loader arc */
        @keyframes cyber-spin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes dash-spin {
          0%   { stroke-dashoffset: 180; }
          50%  { stroke-dashoffset: 45; }
          100% { stroke-dashoffset: 180; }
        }

        /* Hover shimmer on badges */
        .badge-shimmer { position: relative; overflow: hidden; }
        .badge-shimmer::after {
          content: "";
          position: absolute; inset: 0;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%);
          transform: translateX(-100%);
          transition: transform 0.6s ease;
        }
        .badge-shimmer:hover::after { transform: translateX(100%); }
      `}</style>

      {/* ═══════════════════════════════════════════════════════════════
          MOVING BACKGROUND (UNCHANGED)
      ═══════════════════════════════════════════════════════════════ */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="hidden md:block w-full h-full relative">
          {desktopImages.map((src, idx) => (
            <div key={`desktop-${idx}`} className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${idx === currentBgIndex ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
              <div className="absolute inset-0 w-full h-full animate-pan">
                <Image src={src} alt="Desktop Background" fill priority={idx === 0} className="object-cover opacity-100" />
              </div>
            </div>
          ))}
        </div>
        <div className="block md:hidden w-full h-full relative">
          {mobileImages.map((src, idx) => (
            <div key={`mobile-${idx}`} className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${idx === currentBgIndex ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
              <div className="absolute inset-0 w-full h-full animate-pan">
                <Image src={src} alt="Mobile Background" fill priority={idx === 0} className="object-cover opacity-100" />
              </div>
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-[#050505]/40 z-20"></div>
        <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] bg-gradient-to-bl from-[#ff6b35]/30 via-[#ff4500]/10 to-transparent blur-[140px] rounded-full pointer-events-none z-30"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-gradient-to-tr from-[#ff6b35]/20 via-[#ff4500]/5 to-transparent blur-[120px] rounded-full pointer-events-none z-30"></div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          CONFETTI PARTICLES
      ═══════════════════════════════════════════════════════════════ */}
      {showConfetti && (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          {Array.from({ length: 40 }).map((_, i) => {
            const colors = ["#ff6b35", "#00f0ff", "#ff4500", "#22c55e", "#a855f7", "#facc15"];
            const left = Math.random() * 100;
            const delay = Math.random() * 0.5;
            const duration = 1 + Math.random() * 1.5;
            const size = 4 + Math.random() * 8;
            const color = colors[i % colors.length];
            const shape = Math.random() > 0.5 ? "rounded-full" : "rounded-sm";
            return (
              <div
                key={i}
                className={`confetti-particle ${shape}`}
                style={{
                  left: `${left}%`,
                  width: `${size}px`,
                  height: `${size * (Math.random() > 0.5 ? 1 : 0.6)}px`,
                  backgroundColor: color,
                  animation: `confetti-fall ${duration}s ${delay}s ease-in forwards`,
                }}
              />
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════════════════════════════════════ */}
      <div className="max-w-[850px] mx-auto relative z-10">

        {/* Header */}
        <div className="flex flex-col mb-4 md:mb-5">
          <span className="font-display font-black text-xl md:text-2xl italic tracking-wider leading-none text-slate-300">JKS ARENA</span>
          <span className="text-[8px] font-bold tracking-[0.25em] text-[#ff6b35] mt-1">GAMING CAFE</span>
        </div>

        {/* Title with glitch */}
        <div className="mb-4 md:mb-6">
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-black italic uppercase tracking-tight leading-[0.9] flex items-center whitespace-nowrap">
            <span className="text-white mr-4 glitch-text">Reserve</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b35] to-[#ff4500]">A Rig</span>
          </h1>
          <p className="mt-2 md:mt-3 text-xs sm:text-sm text-slate-300 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
            Book your favorite console and enjoy the ultimate gaming experience.
          </p>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            MAIN CARD with scanlines + corner brackets
        ═══════════════════════════════════════════════════════════════ */}
        <div className="scanlines corner-brackets bg-[#111111]/70 backdrop-blur-sm border border-white/[0.06] rounded-[2rem] p-6 md:p-12 pt-12 md:pt-14 relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">

          {/* Cancel button */}
          <Link href="/dashboard" className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-4 py-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all text-slate-300 hover:text-white z-20">
            <svg className="w-3 h-3 text-[#ff6b35]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            Cancel Booking
          </Link>

          {/* ═══════════════════════════════════════════════════════════
              GLOWING STEPPER
          ═══════════════════════════════════════════════════════════ */}
          <div className="flex items-center justify-between relative mb-10 md:mb-14 mt-4 md:mt-0 max-w-[600px] mx-auto">
            {/* Background rail */}
            <div className="absolute top-5 md:top-6 left-0 w-full h-[2px] bg-white/[0.06] -translate-y-1/2 z-0" />

            {/* Animated progress rail with shimmer */}
            <div
              className="absolute top-5 md:top-6 left-0 h-[2px] -translate-y-1/2 z-0 transition-all duration-700 ease-out"
              style={{
                width: `${((step - 1) / 3) * 100}%`,
                backgroundImage: step > 1
                  ? "linear-gradient(90deg, #ff6b35, #ff4500, #ff6b35)"
                  : "linear-gradient(90deg, #ff6b35, #ff4500)",
                backgroundSize: "200% 100%",
                backgroundRepeat: "no-repeat",
                animation: "shimmer 3s linear infinite",
                boxShadow: "0 0 12px rgba(255,107,53,0.6), 0 0 30px rgba(255,107,53,0.2)",
              }}
            />

            {[1, 2, 3, 4].map((i) => {
              const isActive = step === i;
              const isDone = step > i;
              return (
                <div key={i} className="relative z-10 flex flex-col items-center gap-3">
                  <motion.div
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-sm font-black border-2 transition-all duration-300 ${
                      isDone
                        ? "bg-green-500/20 border-green-500/60 text-green-400"
                        : isActive
                        ? "bg-[#ff6b35] border-[#ff6b35] text-black neon-pulse"
                        : "bg-[#1a1a1a] border-white/[0.08] text-slate-600"
                    }`}
                    animate={isActive ? { scale: [1, 1.08, 1] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {isDone ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    ) : i}
                  </motion.div>
                  <span className={`text-[8px] md:text-[9px] uppercase tracking-widest font-bold absolute -bottom-6 md:-bottom-8 whitespace-nowrap transition-colors ${isActive ? "text-[#ff6b35]" : isDone ? "text-green-500/70" : "text-slate-600"}`}>
                    {stepLabels[i - 1]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="error-glitch mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold tracking-wide flex items-start gap-3"
              >
                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ═══════════════════════════════════════════════════════════
              STEP CONTENT with AnimatePresence
          ═══════════════════════════════════════════════════════════ */}
          <div className="min-h-[250px] relative overflow-hidden">
            <AnimatePresence mode="wait" custom={stepDir}>
              <motion.div
                key={step}
                custom={stepDir}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              >

                {/* ── STEP 1: Select Date ──────────────────────────────── */}
                {step === 1 && (
                  <div>
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 rounded-xl bg-[#ff6b35]/10 border border-[#ff6b35]/20 flex items-center justify-center">
                        <svg className="w-6 h-6 text-[#ff6b35]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                      </div>
                      <div>
                        <h2 className="text-xl font-display font-bold uppercase tracking-wider text-white">Select Date</h2>
                        <p className="text-xs text-slate-400">Pick your session date to see rig availability.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#ff6b35]/80">Choose Date</label>
                      <input
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full bg-[#0a0a0a]/80 border border-white/[0.08] focus:border-[#ff6b35] focus:shadow-[0_0_20px_rgba(255,107,53,0.25)] rounded-xl px-5 py-4 text-white font-bold focus:outline-none transition-all duration-300 [color-scheme:dark]"
                      />
                    </div>

                    <motion.div
                      className="mt-6 flex items-center gap-4 p-4 rounded-xl border border-[#ff6b35]/20 bg-[#ff6b35]/5"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <svg className="w-6 h-6 text-[#ff6b35] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                      <p className="text-xs text-slate-300 font-medium leading-relaxed">You will be able to view arena availability for the selected date in the next step.</p>
                    </motion.div>
                  </div>
                )}

                {/* ── STEP 2: Arena Availability ────────────────────────── */}
                {step === 2 && (
                  <div>
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 rounded-xl bg-[#ff6b35]/10 border border-[#ff6b35]/20 flex items-center justify-center">
                        <svg className="w-6 h-6 text-[#ff6b35]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <div>
                        <h2 className="text-xl font-display font-bold uppercase tracking-wider text-white">Arena Availability</h2>
                        <p className="text-xs text-slate-400">Booked slots for <span className="text-[#ff6b35] font-bold">{formData.date}</span></p>
                      </div>
                    </div>

                    {loadingSchedule ? (
                      <div className="py-16 flex justify-center">
                        {/* Cyberpunk loader */}
                        <svg className="w-12 h-12" viewBox="0 0 50 50" style={{ animation: "cyber-spin 1.5s linear infinite" }}>
                          <circle cx="25" cy="25" r="20" fill="none" stroke="rgba(255,107,53,0.15)" strokeWidth="3" />
                          <circle cx="25" cy="25" r="20" fill="none" stroke="#ff6b35" strokeWidth="3" strokeLinecap="round" strokeDasharray="90 45" style={{ animation: "dash-spin 1.5s ease-in-out infinite" }} />
                        </svg>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {DEVICES.map((device, didx) => {
                          const deviceBookings = schedule.filter((b) => b.device === device);
                          return (
                            <motion.div
                              key={device}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: didx * 0.08 }}
                              className="border border-white/[0.08] hover:border-[#ff6b35]/40 transition-all duration-300 rounded-xl p-5 bg-[#0a0a0a]/60 hover:shadow-[0_0_20px_rgba(255,107,53,0.1)] group"
                            >
                              <div className="flex justify-between items-center mb-4">
                                <span className="font-black text-sm text-white uppercase tracking-wider">{device}</span>
                                <span className="text-[9px] font-black uppercase text-slate-400 bg-[#050505] border border-white/5 px-2 py-1 rounded-md">{deviceBookings.length} Booked</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {deviceBookings.length > 0 ? deviceBookings.map((b, idx) => (
                                  <span key={idx} className="bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] font-black tracking-widest px-2.5 py-1.5 rounded-lg">
                                    {new Date(b.slotStart).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - {new Date(b.slotEnd).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                )) : (
                                  <span className="text-[10px] text-green-400 border border-green-500/30 bg-green-500/10 px-3 py-1.5 rounded-lg font-black uppercase green-pulse">Free All Day</span>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ── STEP 3: Rig & Time ────────────────────────────────── */}
                {step === 3 && (
                  <div>
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 rounded-xl bg-[#ff6b35]/10 border border-[#ff6b35]/20 flex items-center justify-center">
                        <svg className="w-6 h-6 text-[#ff6b35]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <div>
                        <h2 className="text-xl font-display font-bold uppercase tracking-wider text-white">Rig & Time</h2>
                        <p className="text-xs text-slate-400">Pick your console, duration, and start time.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-[#ff6b35]/80 mb-2 px-1">Console</label>
                        <select value={formData.device} onChange={(e) => setFormData({ ...formData, device: e.target.value })} className="w-full appearance-none bg-[#0a0a0a]/80 border border-white/[0.08] focus:border-[#ff6b35] focus:shadow-[0_0_20px_rgba(255,107,53,0.25)] rounded-xl px-5 py-4 text-white font-bold focus:outline-none transition-all duration-300 cursor-pointer">
                          {DEVICES.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-[#ff6b35]/80 mb-2 px-1">Duration</label>
                        <select value={formData.durationHours} onChange={(e) => setFormData({ ...formData, durationHours: Number(e.target.value) })} className="w-full appearance-none bg-[#0a0a0a]/80 border border-white/[0.08] focus:border-[#ff6b35] focus:shadow-[0_0_20px_rgba(255,107,53,0.25)] rounded-xl px-5 py-4 text-white font-bold focus:outline-none transition-all duration-300 cursor-pointer">
                          {[1, 2, 3, 4, 5].map((h) => <option key={h} value={h}>{h} Hour{h > 1 ? "s" : ""}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#ff6b35]/80 mb-2 px-1">Start Time</label>
                      <input type="time" required value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="w-full bg-[#0a0a0a]/80 border border-white/[0.08] focus:border-[#ff6b35] focus:shadow-[0_0_20px_rgba(255,107,53,0.25)] rounded-xl px-5 py-4 text-white font-bold focus:outline-none transition-all duration-300 [color-scheme:dark]" />
                    </div>
                  </div>
                )}

                {/* ── STEP 4: Player Details ────────────────────────────── */}
                {step === 4 && (
                  <div>
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 rounded-xl bg-[#ff6b35]/10 border border-[#ff6b35]/20 flex items-center justify-center">
                        <svg className="w-6 h-6 text-[#ff6b35]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                      </div>
                      <div>
                        <h2 className="text-xl font-display font-bold uppercase tracking-wider text-white">Player Details</h2>
                        <p className="text-xs text-slate-400">Add details for everyone attending the session.</p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-8">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Players</label>
                      <select value={formData.players} onChange={(e) => handlePlayersChange(Number(e.target.value))} className="w-full appearance-none bg-[#0a0a0a]/80 border border-white/[0.08] focus:border-[#ff6b35] focus:shadow-[0_0_20px_rgba(255,107,53,0.25)] rounded-xl px-5 py-4 text-white font-bold focus:outline-none transition-all duration-300 cursor-pointer">
                        {[1, 2, 3, 4, 5].map((p) => <option key={p} value={p}>{p} Player{p > 1 ? "s" : ""}</option>)}
                      </select>
                    </div>

                    <div className="space-y-4">
                      {/* Host */}
                      <motion.div
                        className="bg-[#0a0a0a]/60 p-6 rounded-2xl border border-[#ff6b35]/20 relative overflow-hidden"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 }}
                      >
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#ff6b35] to-[#00f0ff]" />
                        <p className="text-[10px] font-black uppercase text-[#ff6b35] mb-4 tracking-widest">Primary Booker (Host)</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <input type="text" placeholder="Full Name" value={formData.userName} onChange={(e) => setFormData({ ...formData, userName: e.target.value })} className="w-full bg-[#050505] border border-white/[0.08] focus:border-[#ff6b35] focus:shadow-[0_0_15px_rgba(255,107,53,0.2)] rounded-xl px-4 py-3 text-sm text-white font-medium focus:outline-none transition-all duration-300" />
                          <input type="tel" placeholder="Phone Number" value={formData.userPhone} onChange={(e) => setFormData({ ...formData, userPhone: e.target.value })} className="w-full bg-[#050505] border border-white/[0.08] focus:border-[#ff6b35] focus:shadow-[0_0_15px_rgba(255,107,53,0.2)] rounded-xl px-4 py-3 text-sm text-white font-medium focus:outline-none transition-all duration-300" />
                        </div>
                      </motion.div>

                      {/* Companions */}
                      {formData.companions.map((comp, idx) => (
                        <motion.div
                          key={idx}
                          className="bg-[#0a0a0a]/60 p-6 rounded-2xl border border-white/[0.05]"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + idx * 0.06 }}
                        >
                          <p className="text-[10px] font-black uppercase text-slate-500 mb-4 tracking-widest">Player {idx + 2}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input type="text" placeholder="Name" value={comp.name} onChange={(e) => handleCompanionChange(idx, "name", e.target.value)} className="w-full bg-[#050505] border border-white/[0.05] focus:border-white/30 rounded-xl px-4 py-3 text-sm text-white font-medium focus:outline-none transition-all duration-300" />
                            <input type="tel" placeholder="Phone" value={comp.phone} onChange={(e) => handleCompanionChange(idx, "phone", e.target.value)} className="w-full bg-[#050505] border border-white/[0.05] focus:border-white/30 rounded-xl px-4 py-3 text-sm text-white font-medium focus:outline-none transition-all duration-300" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              NAVIGATION BUTTONS
          ═══════════════════════════════════════════════════════════ */}
          <div className="mt-8 md:mt-12 flex items-center justify-between border-t border-white/[0.06] pt-8">
            <motion.button
              onClick={handleBack}
              disabled={step === 1 || isLoading}
              whileHover={step > 1 ? { scale: 1.04 } : {}}
              whileTap={step > 1 ? { scale: 0.97 } : {}}
              className={`text-[10px] font-black uppercase tracking-widest px-6 py-4 rounded-xl transition-all duration-300 ${step === 1 ? "opacity-0 pointer-events-none" : "text-slate-400 bg-white/5 hover:bg-white/10 hover:text-white border border-white/[0.08] hover:border-white/20"}`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                Back
              </span>
            </motion.button>

            {step < 4 ? (
              <motion.button
                onClick={handleNext}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                className="relative bg-gradient-to-r from-[#ff6b35] to-[#ff4500] text-black text-[11px] font-black uppercase tracking-widest px-8 py-4 rounded-xl transition-all duration-300 flex items-center gap-2 overflow-hidden group"
                style={{ boxShadow: "0 0 25px rgba(255,107,53,0.35), 0 0 50px rgba(255,107,53,0.1)" }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Next Step
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </span>
                {/* Hover shine */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </motion.button>
            ) : (
              <motion.button
                onClick={handleSubmit}
                disabled={isLoading}
                whileHover={!isLoading ? { scale: 1.05 } : {}}
                whileTap={!isLoading ? { scale: 0.96 } : {}}
                className="relative bg-gradient-to-r from-green-500 to-emerald-600 text-black text-[11px] font-black uppercase tracking-widest px-10 py-4 rounded-xl disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2 overflow-hidden group"
                style={{ boxShadow: "0 0 25px rgba(34,197,94,0.35), 0 0 50px rgba(34,197,94,0.1)" }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {isLoading ? (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 50 50" style={{ animation: "cyber-spin 1s linear infinite" }}>
                        <circle cx="25" cy="25" r="20" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="4" />
                        <circle cx="25" cy="25" r="20" fill="none" stroke="#000" strokeWidth="4" strokeLinecap="round" strokeDasharray="90 45" />
                      </svg>
                      Confirming...
                    </>
                  ) : (
                    <>
                      Confirm Booking
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </motion.button>
            )}
          </div>

        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          FOOTER BADGES with shimmer
      ═══════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col md:flex-row w-full gap-4 max-w-[800px] mx-auto relative z-10 mt-6 md:mt-8">
        {[
          { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", label: "Secure Booking", sub: "100% Safe & Secure" },
          { icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", label: "Instant Confirm", sub: "Quick & Easy Booking" },
          { icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" },
        ].map((badge, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="badge-shimmer flex-1 flex items-center gap-4 bg-[#111111]/90 backdrop-blur-md border border-white/[0.06] rounded-2xl p-5 shadow-lg hover:border-[#ff6b35]/20 transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-full bg-[#ff6b35]/10 border border-[#ff6b35]/20 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-[#ff6b35]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={badge.icon} /></svg>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white">{badge.label}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{badge.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
