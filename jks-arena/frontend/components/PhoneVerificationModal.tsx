"use client";

import { useState, useEffect } from "react";
import { api, getToken } from "@/lib/apiClient";
import { toast } from "sonner";

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onSuccess: (updatedUser: any) => void;
  defaultName?: string;
  defaultPhone?: string;
}

export default function PhoneVerificationModal({ isOpen, onSuccess, defaultName = "", defaultPhone = "" }: PhoneVerificationModalProps) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState(defaultPhone);
  const [name, setName] = useState(defaultName);
  const [otp, setOtp] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName(defaultName);
      setPhone(defaultPhone);
    }
  }, [isOpen, defaultName, defaultPhone]);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!phone || phone.length < 10) {
      setError("Please enter a valid phone number.");
      return;
    }
    
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    setIsLoading(true);
    try {
      const token = getToken();
      if (!token) throw new Error("Authentication required");

      await api.post("/api/user/send-whatsapp-otp", { phone }, { token });
      
      setStep("otp");
      toast.success("WhatsApp OTP sent!");
    } catch (err: any) {
      setError(err?.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!otp || otp.length < 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setIsLoading(true);
    try {
      const token = getToken();
      if (!token) throw new Error("Authentication required");

      const res = await api.put("/api/user/verify-phone", { phone, name, otpCode: otp }, { token }) as any;
      
      toast.success("Verification successful!");
      onSuccess(res.user);
    } catch (err: any) {
      setError(err?.message || "Invalid OTP code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        
        {/* Header styling */}
        <div className="bg-[#ff6b35] p-6 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl -ml-8 -mb-8"></div>
          
          <div className="w-16 h-16 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg relative z-10 rotate-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#ff6b35] -rotate-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-wider relative z-10">Verify Your Profile</h2>
          <p className="text-white/90 text-xs font-medium mt-2 max-w-[250px] mx-auto relative z-10 leading-relaxed">
            Please verify your phone number via WhatsApp to continue.
          </p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-xs font-bold animate-in slide-in-from-top-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {step === "phone" ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#ff6b35] focus:ring-4 focus:ring-[#ff6b35]/10 transition-all placeholder:text-slate-400 placeholder:font-medium"
                  placeholder="Enter your name"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">WhatsApp Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl px-5 py-4 font-bold outline-none focus:border-[#ff6b35] focus:ring-4 focus:ring-[#ff6b35]/10 transition-all placeholder:text-slate-400 placeholder:font-medium text-lg tracking-wide"
                  placeholder="+91 9876543210"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1A1A1A] hover:bg-[#ff6b35] text-white rounded-2xl py-4 font-black uppercase tracking-widest text-sm transition-all duration-300 shadow-lg shadow-black/10 hover:shadow-[#ff6b35]/30 hover:-translate-y-1 mt-2 disabled:opacity-50 disabled:pointer-events-none disabled:transform-none flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Send WhatsApp OTP"
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 text-center block">Enter WhatsApp OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl px-5 py-4 font-black text-2xl tracking-[0.5em] text-center outline-none focus:border-[#ff6b35] focus:ring-4 focus:ring-[#ff6b35]/10 transition-all placeholder:text-slate-300 placeholder:font-medium placeholder:tracking-normal"
                  placeholder="000000"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#ff6b35] hover:bg-[#e85a25] text-white rounded-2xl py-4 font-black uppercase tracking-widest text-sm transition-all duration-300 shadow-lg shadow-[#ff6b35]/30 hover:shadow-[#ff6b35]/40 hover:-translate-y-1 disabled:opacity-50 disabled:pointer-events-none disabled:transform-none flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Verify OTP"
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep("phone")}
                disabled={isLoading}
                className="w-full bg-transparent text-slate-500 hover:text-slate-800 rounded-2xl py-3 font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                Change Phone Number
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
