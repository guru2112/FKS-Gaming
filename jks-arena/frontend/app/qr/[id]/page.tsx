"use client";

import { QRCodeCanvas } from "qrcode.react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

export default function GuestQRPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#151520] via-[#0a0a12] to-[#050505] flex flex-col items-center justify-center p-4 selection:bg-[#ff6b35] selection:text-white">

      {/* Subtle glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#ff6b35]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-sm w-full">

        {/* Card */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)]">

          {/* Top accent bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#ff6b35] via-[#ff6b35]/60 to-transparent" />

          <div className="p-8 flex flex-col items-center text-center">

            {/* Branding */}
            <div className="mb-6">
              <div className="text-3xl font-black italic tracking-tighter drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
                <span className="text-white">JKS </span>
                <span className="text-[#ff6b35] drop-shadow-[0_0_20px_rgba(255,107,53,0.3)]">ARENA</span>
              </div>
              <div className="mt-2">
                <span className="text-[8px] font-black uppercase tracking-[0.5em] text-slate-400 block">
                  PASS
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />

            {/* QR Code */}
            <div className="bg-white p-5 rounded-xl inline-block mb-6 shadow-[0_0_30px_rgba(255,107,53,0.1)] ring-2 ring-[#ff6b35]/20">
              {id && <QRCodeCanvas value={String(id)} size={200} level="H" fgColor="#0A0A0A" />}
            </div>

            {/* Instructions */}
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-6">
              SCAN THIS CODE AT THE ARENA DESK
            </p>

            {/* Details */}
            <div className="w-full bg-white/5 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40">PASS ID</span>
                <span className="text-[10px] font-bold tracking-wider text-[#ff6b35] font-mono">{id}</span>
              </div>
              <div className="h-[1px] bg-white/5" />
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40">TYPE</span>
                <span className="text-[10px] font-bold tracking-wider text-white/70">GUEST ENTRY</span>
              </div>
              <div className="h-[1px] bg-white/5" />
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40">VALIDITY</span>
                <span className="text-[10px] font-bold tracking-wider text-green-400">ACTIVE</span>
              </div>
            </div>

            {/* Bottom tagline */}
            <p className="mt-6 text-[8px] font-bold uppercase tracking-[0.4em] text-white/20">
              EAT. SLEEP. GAME. REPEAT.
            </p>
          </div>
        </div>

        {/* Footer link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/")}
            className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30 hover:text-[#ff6b35] transition-colors"
          >
            VISIT JKSARENA.COM
          </button>
        </div>
      </div>
    </div>
  );
}
