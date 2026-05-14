"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/auth";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { token } = useParams();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      setMessage(data.message);
      if (res.ok) setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const clipPathStyle = { clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)" };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#0A0A0A] border border-white/10 p-10 rounded-2xl shadow-2xl">
        <h1 className="text-2xl font-black text-white uppercase mb-6 tracking-tighter">NEW <span className="text-[#ff6b35]">PASSWORD</span></h1>
        <form onSubmit={handleReset} className="space-y-6">
          <div style={clipPathStyle} className="bg-[#ff6b35] p-[1.5px]">
            <input 
              type="password" 
              required 
              placeholder="ENTER NEW PASSWORD" 
              className="w-full bg-[#0A0A0A] px-5 py-3 text-xs text-white outline-none" 
              style={clipPathStyle}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#ff6b35] py-4 text-xs font-black text-white uppercase tracking-widest hover:bg-[#e05928]" 
            style={clipPathStyle}
          >
            {loading ? "UPDATING..." : "UPDATE PASSWORD"}
          </button>
        </form>
        {message && <p className="text-[10px] text-center font-bold text-[#ff6b35] mt-6 uppercase tracking-widest">{message}</p>}
      </div>
    </div>
  );
}