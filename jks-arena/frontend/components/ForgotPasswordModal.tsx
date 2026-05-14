"use client";

import { useState } from "react";
import { API_BASE_URL } from "@/lib/auth";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Pass
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    // Reset state when closing so it opens fresh next time
    setStep(1);
    setEmail("");
    setOtp("");
    setPassword("");
    setMessage("");
    onClose();
  };

  // STEP 1: Request OTP
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) setStep(2);
      else setMessage("Email not found.");
    } finally { setLoading(false); }
  };

  // STEP 2: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      if (res.ok) setStep(3);
      else setMessage("Invalid OTP.");
    } finally { setLoading(false); }
  };

  // STEP 3: Final Reset
  const handleFinalReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password }),
      });
      if (res.ok) {
        setMessage("Success! Closing...");
        setTimeout(() => handleClose(), 2000);
      } else {
        setMessage("Reset failed.");
      }
    } finally { setLoading(false); }
  };

  const clipPathStyle = { clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)" };

  return (
    // 🔥 FIX: Added bulletproof inline style={{ zIndex: 99999 }} to force it to the very front
    // I also darkened the background blur slightly (bg-black/80) so it hides the login form better
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      style={{ zIndex: 99999 }}
    >
      
      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 p-10 shadow-[0_0_100px_rgba(0,0,0,1)]" style={clipPathStyle}>
        
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-6 right-6 text-white/40 hover:text-[#ff6b35] transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-black text-white uppercase mb-2 tracking-tighter">
          {step === 1 && "RECOVER "} 
          {step === 2 && "VERIFY "} 
          {step === 3 && "RESET "}
          <span className="text-[#ff6b35]">ACCESS</span>
        </h2>
        <p className="text-[9px] font-bold tracking-widest text-slate-400 uppercase mb-8">
          {step === 1 && "Enter your registered email"}
          {step === 2 && "Enter the 6-digit code sent to your email"}
          {step === 3 && "Create a new secure password"}
        </p>

        {step === 1 && (
          <form onSubmit={handleRequestOTP} className="space-y-6">
            <div style={clipPathStyle} className="bg-[#ff6b35] p-[1.5px]">
              <input type="email" required placeholder="EMAIL ADDRESS" className="w-full bg-[#0A0A0A] px-5 py-3 text-xs font-bold tracking-widest text-white outline-none" style={clipPathStyle} value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-[#ff6b35] py-4 text-xs font-black text-white uppercase tracking-widest hover:bg-[#e05928] disabled:opacity-60 shadow-[0_0_20px_rgba(255,107,53,0.3)]" style={clipPathStyle}>
              {loading ? "SENDING..." : "SEND OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div style={clipPathStyle} className="bg-[#ff6b35] p-[1.5px]">
              <input type="text" required placeholder="ENTER 6-DIGIT OTP" className="w-full bg-[#0A0A0A] px-5 py-3 text-xs text-white text-center font-black tracking-widest outline-none" style={clipPathStyle} value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-[#ff6b35] py-4 text-xs font-black text-white uppercase tracking-widest hover:bg-[#e05928] disabled:opacity-60 shadow-[0_0_20px_rgba(255,107,53,0.3)]" style={clipPathStyle}>
              {loading ? "VERIFYING..." : "VERIFY CODE"}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleFinalReset} className="space-y-6">
            <div style={clipPathStyle} className="bg-[#ff6b35] p-[1.5px]">
              <input type="password" required placeholder="CREATE NEW PASSWORD" className="w-full bg-[#0A0A0A] px-5 py-3 text-xs font-bold tracking-widest text-white outline-none" style={clipPathStyle} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-[#ff6b35] py-4 text-xs font-black text-white uppercase tracking-widest hover:bg-[#e05928] disabled:opacity-60 shadow-[0_0_20px_rgba(255,107,53,0.3)]" style={clipPathStyle}>
              {loading ? "RESETTING..." : "RESET PASSWORD"}
            </button>
          </form>
        )}

        {message && <p className="text-[10px] text-center font-bold text-[#ff6b35] mt-6 uppercase tracking-widest">{message}</p>}
      </div>
    </div>
  );
}