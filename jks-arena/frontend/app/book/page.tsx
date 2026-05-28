"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL, api, fetchProfile, type Profile } from "@/lib/auth";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import DurationPicker from "@/components/DurationPicker";

const DEVICES = ["PS1", "PS2", "PS3", "SIM1"];
const DEVICE_LABELS: Record<string, string> = { PS1: "Console 1", PS2: "Console 2", PS3: "Console 3", SIM1: "Simulator" };

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

function BookSlotContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [stepDir, setStepDir] = useState(1); // 1 = forward, -1 = back
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [tempPhone, setTempPhone] = useState("");
  const [savingPhone, setSavingPhone] = useState(false);

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

  // Auto-set initial date/time from URL if present
  useEffect(() => {
    const d = searchParams.get("date");
    const t = searchParams.get("time");
    if (d) setFormData((prev) => ({ ...prev, date: d }));
    if (t) setFormData((prev) => ({ ...prev, time: t }));
  }, [searchParams]);

  // Fetch Profile to pre-fill Name and Phone
  useEffect(() => {
    const token = localStorage.getItem("auth_token") || "";
    if (token) {
      fetchProfile(token).then((data) => {
        setProfile(data);
        setFormData(prev => ({
          ...prev,
          userName: data.name || prev.userName,
          userPhone: data.phone || prev.userPhone
        }));
        if (!data.phone) {
          setShowPhoneModal(true);
        }
      }).catch(console.error);
    }
  }, []);

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
      const data = await api.get(`/api/bookings/schedule?date=${dateStr}`) as { bookings: ScheduleItem[] };
      setSchedule(data.bookings || []);
    } catch (err: any) {
      setError(err.message || "Failed to load schedule");
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
    setFormData({ ...formData, players: count });
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
      const startDateTime = new Date(`${formData.date}T${formData.time}`);
      const payload = {
        device: formData.device,
        slotStart: startDateTime.toISOString(),
        durationHours: formData.durationHours,
        players: formData.players,
        userName: formData.userName,
        contactNumber: formData.userPhone,
      };
      await api.post("/api/bookings", payload);
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
    <div className="min-h-screen relative overflow-hidden font-sans text-[#1A1A1A] pt-4 md:pt-6 pb-24 px-4 sm:px-6 selection:bg-[#ff6b35] selection:text-[#050505]">

      {/* ═══════════════════════════════════════════════════════════════
          CSS EFFECTS
      ═══════════════════════════════════════════════════════════════ */}
      <style>{`
        @keyframes pan-image {
          0%   { transform: scale(1.05) translateX(1%); }
          100% { transform: scale(1.05) translateX(-1%); }
        }
        .animate-pan { animation: pan-image 20s ease-in-out infinite alternate; }

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
      `}</style>

      {/* ═══════════════════════════════════════════════════════════════
          MOVING BACKGROUND
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
        <div className="absolute inset-0 bg-[#FFF4E6]/85 z-20"></div>
        <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] bg-gradient-to-bl from-[#ff6b35]/15 via-[#ff4500]/5 to-transparent blur-[140px] rounded-full pointer-events-none z-30"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-gradient-to-tr from-[#ff6b35]/10 via-[#ff4500]/3 to-transparent blur-[120px] rounded-full pointer-events-none z-30"></div>
      </div>

      {/* PHONE NUMBER MODAL */}
      <AnimatePresence>
        {showPhoneModal && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl relative"
            >
              <button onClick={() => setShowPhoneModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-black">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <div className="w-12 h-12 rounded-xl bg-[#ff6b35]/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#ff6b35]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              </div>
              <h3 className="text-xl font-black uppercase text-[#1A1A1A] mb-2">Phone Required</h3>
              <p className="text-xs text-slate-500 mb-6 font-medium leading-relaxed">Please save your WhatsApp number to your profile before booking. This helps us send you your booking QR pass.</p>
              
              <input 
                type="tel" 
                placeholder="+91 9876543210" 
                value={tempPhone}
                onChange={(e) => setTempPhone(e.target.value)}
                className="w-full bg-[#FDF8F5] border border-[#1A1A1A]/15 rounded-xl px-4 py-3 text-sm text-[#1A1A1A] font-black focus:outline-none focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 mb-4 transition-all" 
              />
              <button 
                onClick={async () => {
                  if (!tempPhone) return;
                  setSavingPhone(true);
                  try {
                    const token = localStorage.getItem("auth_token");
                    if (token && profile) {
                      const { updateProfile } = await import("@/lib/auth");
                      const res = (await updateProfile({ ...profile, phone: tempPhone }, token)) as any;
                      setProfile(res.user);
                      setFormData(prev => ({ ...prev, userPhone: tempPhone }));
                      setShowPhoneModal(false);
                    }
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setSavingPhone(false);
                  }
                }}
                disabled={savingPhone || !tempPhone}
                className="w-full py-3 rounded-xl bg-[#ff6b35] text-white text-[11px] font-black uppercase tracking-widest hover:bg-[#e55a2b] transition-all duration-300 disabled:opacity-50 shadow-[0_4px_15px_rgba(255,107,53,0.3)] hover:shadow-[0_6px_20px_rgba(255,107,53,0.4)]"
              >
                {savingPhone ? "Saving..." : "Save Number"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════
          CONFETTI PARTICLES
      ═══════════════════════════════════════════════════════════════ */}
      {showConfetti && (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          {Array.from({ length: 40 }).map((_, i) => {
            const colors = ["#ff6b35", "#00f0ff", "#ff4500", "#22c55e", "#a855f7", "#facc15"];
            const pseudoRandom = (seed: number) => {
              const value = Math.sin(seed) * 10000;
              return value - Math.floor(value);
            };
            const left = pseudoRandom(i * 11 + 1) * 100;
            const delay = pseudoRandom(i * 11 + 2) * 0.5;
            const duration = 1 + pseudoRandom(i * 11 + 3) * 1.5;
            const size = 4 + pseudoRandom(i * 11 + 4) * 8;
            const heightScale = pseudoRandom(i * 11 + 5) > 0.5 ? 1 : 0.6;
            const color = colors[i % colors.length];
            const shape = pseudoRandom(i * 11 + 6) > 0.5 ? "rounded-full" : "rounded-sm";
            return (
              <div
                key={i}
                className={`confetti-particle ${shape}`}
                style={{
                  left: `${left}%`,
                  width: `${size}px`,
                  height: `${size * heightScale}px`,
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
          <span className="font-display font-black text-xl md:text-2xl italic tracking-wider leading-none text-[#1A1A1A]">JKS ARENA</span>
          <span className="text-[8px] font-bold tracking-[0.25em] text-[#ff6b35] mt-1">GAMING CAFE</span>
        </div>

        {/* Title with glitch */}
        <div className="mb-4 md:mb-6">
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-black italic uppercase tracking-tight leading-[0.9] flex items-center flex-wrap">
            <span className="text-[#1A1A1A] mr-3 md:mr-4 glitch-text mb-1 md:mb-0">BOOK YOUR</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b35] to-[#ff4500]">SESSION</span>
          </h1>
          <p className="mt-2 md:mt-3 text-xs sm:text-sm text-[#1A1A1A]/60 font-medium overflow-hidden text-ellipsis">
            Book your favorite console and enjoy the ultimate gaming experience.
          </p>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            MAIN CARD
        ═══════════════════════════════════════════════════════════ */}
        <div className="bg-white/70 backdrop-blur-xl border border-[#1A1A1A]/10 rounded-[2rem] p-6 md:p-12 pt-12 md:pt-14 relative shadow-[0_8px_32px_rgba(0,0,0,0.06)] overflow-hidden">

          {/* Cancel button */}
          <Link href="/dashboard" className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-2 bg-[#1A1A1A]/5 hover:bg-[#1A1A1A]/10 border border-[#1A1A1A]/10 rounded-full px-4 py-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all text-[#1A1A1A]/60 hover:text-[#1A1A1A] z-20">
            <svg className="w-3 h-3 text-[#ff6b35]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            Cancel Booking
          </Link>

          {/* Glowing stepper */}
          <div className="flex items-center justify-between relative mb-10 md:mb-14 mt-4 md:mt-0 max-w-[600px] mx-auto">
            <div className="absolute top-5 md:top-6 left-0 w-full h-[2px] bg-[#1A1A1A]/10 -translate-y-1/2 z-0" />
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
                        ? "bg-green-500/20 border-green-500/60 text-green-500"
                        : isActive
                        ? "bg-[#ff6b35] border-[#ff6b35] text-black neon-pulse"
                        : "bg-white border-[#1A1A1A]/10 text-[#1A1A1A]/40"
                    }`}
                    animate={isActive ? { scale: [1, 1.08, 1] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {isDone ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    ) : i}
                  </motion.div>
                  <span className={`text-[8px] md:text-[9px] uppercase tracking-widest font-bold absolute -bottom-6 md:-bottom-8 whitespace-nowrap transition-colors ${isActive ? "text-[#ff6b35]" : isDone ? "text-green-500/70" : "text-[#1A1A1A]/40"}`}>
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
                className="error-glitch mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 text-xs font-bold tracking-wide flex items-start gap-3"
              >
                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

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
                {step === 1 && (
                  <div>
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 rounded-xl bg-[#ff6b35]/10 border border-[#ff6b35]/20 flex items-center justify-center">
                        <svg className="w-6 h-6 text-[#ff6b35]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                      </div>
                      <div>
                        <h2 className="text-xl font-display font-bold uppercase tracking-wider text-[#1A1A1A]">Select Date</h2>
                        <p className="text-xs text-[#1A1A1A]/50">Pick your session date to see rig availability.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#ff6b35]/80">Choose Date</label>
                      <input
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full bg-white/80 border border-[#1A1A1A]/10 focus:border-[#ff6b35] focus:shadow-[0_0_20px_rgba(255,107,53,0.25)] rounded-xl px-5 py-4 text-[#1A1A1A] font-bold focus:outline-none transition-all duration-300"
                      />
                    </div>
                      <motion.div
                        className="mt-6 flex items-center gap-4 p-4 rounded-xl border border-[#ff6b35]/20 bg-[#ff6b35]/5"
                        initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <svg className="w-6 h-6 text-[#ff6b35] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                      <p className="text-xs text-[#1A1A1A]/60 font-medium leading-relaxed">You will be able to view arena availability for the selected date in the next step.</p>
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
                        <h2 className="text-xl font-display font-bold uppercase tracking-wider text-[#1A1A1A]">Arena Availability</h2>
                        <p className="text-xs text-[#1A1A1A]/50">Booked slots for <span className="text-[#ff6b35] font-bold">{formData.date}</span></p>
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
                              className="border border-[#1A1A1A]/10 hover:border-[#ff6b35]/40 transition-all duration-300 rounded-xl p-5 bg-white/60 hover:shadow-[0_0_20px_rgba(255,107,53,0.1)] group"
                            >
                              <div className="flex justify-between items-center mb-4">
                                <span className="font-black text-sm text-[#1A1A1A] uppercase tracking-wider">{DEVICE_LABELS[device] || device}</span>
                                <span className="text-[9px] font-black uppercase text-[#1A1A1A]/50 bg-[#1A1A1A]/5 border border-[#1A1A1A]/10 px-2 py-1 rounded-md">{deviceBookings.length} Booked</span>
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
                        <h2 className="text-xl font-display font-bold uppercase tracking-wider text-[#1A1A1A]">Rig & Time</h2>
                        <p className="text-xs text-[#1A1A1A]/50">Pick your console, duration, and start time.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-[#ff6b35]/80 mb-2 px-1">Console</label>
                        <select value={formData.device} onChange={(e) => setFormData({ ...formData, device: e.target.value })} className="w-full appearance-none bg-white/80 border border-[#1A1A1A]/10 focus:border-[#ff6b35] focus:shadow-[0_0_20px_rgba(255,107,53,0.25)] rounded-xl px-5 py-4 text-[#1A1A1A] font-bold focus:outline-none transition-all duration-300 cursor-pointer">
                          {DEVICES.map((d) => <option key={d} value={d}>{DEVICE_LABELS[d] || d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-[#ff6b35]/80 mb-2 px-1">Duration</label>
                        <DurationPicker 
                          value={formData.durationHours} 
                          onChange={(val) => setFormData({ ...formData, durationHours: val })} 
                          theme="light" 
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#ff6b35]/80 mb-2 px-1">Start Time</label>
                      <input type="time" required value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="w-full bg-white/80 border border-[#1A1A1A]/10 focus:border-[#ff6b35] focus:shadow-[0_0_20px_rgba(255,107,53,0.25)] rounded-xl px-5 py-4 text-[#1A1A1A] font-bold focus:outline-none transition-all duration-300" />
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
                        <h2 className="text-xl font-display font-bold uppercase tracking-wider text-[#1A1A1A]">Player Details</h2>
                        <p className="text-xs text-[#1A1A1A]/50">Add details for everyone attending the session.</p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-8">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/50">Total Players</label>
                      <select value={formData.players} onChange={(e) => handlePlayersChange(Number(e.target.value))} className="w-full appearance-none bg-white/80 border border-[#1A1A1A]/10 focus:border-[#ff6b35] focus:shadow-[0_0_20px_rgba(255,107,53,0.25)] rounded-xl px-5 py-4 text-[#1A1A1A] font-bold focus:outline-none transition-all duration-300 cursor-pointer">
                        {[1, 2, 3, 4].map((p) => <option key={p} value={p}>{p} Player{p > 1 ? "s" : ""}</option>)}
                      </select>
                      <p className="text-[10px] text-[#ff6b35] font-bold mt-1">
                        Note: For a single console you can only select up to 4 players.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Host */}
                      <motion.div
                        className="bg-white/60 p-6 rounded-2xl border border-[#ff6b35]/20 relative overflow-hidden"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 }}
                      >
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#ff6b35] to-[#00f0ff]" />
                        <p className="text-[10px] font-black uppercase text-[#ff6b35] mb-4 tracking-widest">Primary Booker (Host)</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <input type="text" placeholder="Full Name" value={formData.userName} onChange={(e) => setFormData({ ...formData, userName: e.target.value })} className="w-full bg-white/80 border border-[#1A1A1A]/10 focus:border-[#ff6b35] focus:shadow-[0_0_15px_rgba(255,107,53,0.2)] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] font-medium focus:outline-none transition-all duration-300" />
                          <input type="tel" placeholder="Phone Number" value={formData.userPhone} onChange={(e) => setFormData({ ...formData, userPhone: e.target.value })} className="w-full bg-white/80 border border-[#1A1A1A]/10 focus:border-[#ff6b35] focus:shadow-[0_0_15px_rgba(255,107,53,0.2)] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] font-medium focus:outline-none transition-all duration-300" />
                        </div>
                      </motion.div>

                      {/* Companions Removed as per request */}
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              NAVIGATION BUTTONS
          ═══════════════════════════════════════════════════════════ */}
          <div className="mt-8 md:mt-12 flex items-center justify-between border-t border-[#1A1A1A]/10 pt-8">
            <motion.button
              onClick={handleBack}
              disabled={step === 1 || isLoading}
              whileHover={step > 1 ? { scale: 1.04 } : {}}
              whileTap={step > 1 ? { scale: 0.97 } : {}}
              className={`text-[10px] font-black uppercase tracking-widest px-6 py-4 rounded-xl transition-all duration-300 ${step === 1 ? "opacity-0 pointer-events-none" : "text-[#1A1A1A]/60 bg-[#1A1A1A]/5 hover:bg-[#1A1A1A]/10 hover:text-[#1A1A1A] border border-[#1A1A1A]/10 hover:border-[#1A1A1A]/20"}`}
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
          { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", label: "Instant Confirmation", sub: "Book and play immediately" },
          { icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", label: "Secure Payments", sub: "100% safe transactions" },
          { icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z", label: "Flexible Rescheduling", sub: "Change your slot anytime" },
        ].map((badge, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="flex-1 flex items-center gap-4 bg-white/70 backdrop-blur-md border border-[#1A1A1A]/10 rounded-2xl p-5 shadow-lg hover:border-[#ff6b35]/20 transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-full bg-[#ff6b35]/10 border border-[#ff6b35]/20 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-[#ff6b35]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={badge.icon} /></svg>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]">{badge.label}</p>
              <p className="text-[10px] text-[#1A1A1A]/50 mt-0.5">{badge.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function BookSlotPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#ff6b35] font-display font-black text-2xl uppercase tracking-widest">Loading...</div>}>
      <BookSlotContent />
    </Suspense>
  );
}
