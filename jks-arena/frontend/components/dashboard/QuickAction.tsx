import Link from "next/link";

export default function QuickActions() {
  const clipPathStyle = {
    clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)"
  };

  return (
    <section className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
      {/* Ready to Play Banner */}
      <div className="relative rounded-3xl border border-[#ff6b35]/30 bg-gradient-to-br from-[#0A0A0A] to-[#ff6b35]/10 p-8 shadow-[0_0_30px_rgba(255,107,53,0.1)] flex flex-col justify-center items-start overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff6b35]/20 blur-3xl rounded-full pointer-events-none"></div>
        <h2 className="font-display text-3xl font-black uppercase text-white tracking-wider">Ready to play?</h2>
        <p className="mt-2 text-xs font-medium text-slate-300 leading-relaxed max-w-sm">
          PS Standard: ₹60 per head/hr <br/>
          Simulator: ₹100 per head/hr <br/>
          <span className="text-[#ff6b35] font-bold">Max 5 players per rig.</span>
        </p>
        <Link href="/book" className="mt-6">
          <button style={clipPathStyle} className="bg-[#ff6b35] px-8 py-4 text-xs font-black uppercase tracking-widest text-[#050505] shadow-[0_0_20px_rgba(255,107,53,0.4)] transition hover:bg-[#ff8c3a] hover:scale-105">
            Book a Slot Now
          </button>
        </Link>
      </div>

      {/* Arena Notes Banner */}
      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-8 flex flex-col justify-center">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6b35]">Arena Notes</p>
        <ul className="mt-4 space-y-3 text-xs text-slate-300 font-bold uppercase tracking-wider">
          <li className="flex items-start gap-3"><span className="text-[#ff6b35] text-lg leading-none">•</span> <span>Arrive 5-10 mins early.</span></li>
          <li className="flex items-start gap-3"><span className="text-[#ff6b35] text-lg leading-none">•</span> <span>20-min gap enforced.</span></li>
          <li className="flex items-start gap-3"><span className="text-[#ff6b35] text-lg leading-none">•</span> <span>Keep QR code ready.</span></li>
        </ul>
      </div>
    </section>
  );
}