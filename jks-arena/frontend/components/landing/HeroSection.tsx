"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section
      id="home"
      className="relative h-[100dvh] w-full overflow-hidden"
    >

      {/* =============================================
          DIRECTIONAL CINEMATIC OVERLAY
          Dark on left (text), transparent on right (image)
          ============================================= */}

      {/* LAYER 1 — Directional gradient: left dark → right transparent */}
      <div className="absolute inset-0 z-[1] pointer-events-none"
        style={{ background: 'linear-gradient(to right, rgba(5,5,5,0.95) 0%, rgba(5,5,5,0.45) 25%, rgba(10,10,10,0.10) 50%, transparent 70%)' }}
      />

      {/* LAYER 1b — Mobile: vertical gradient (top dark → bottom transparent) */}
      <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-b from-black/75 via-black/35 to-transparent md:hidden" />

      {/* LAYER 2 — Orange ambient glow (left-center, behind content) */}
      <div className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 40% 50% at 20% 50%, rgba(255,106,0,0.08) 0%, transparent 65%)'
        }}
      />

      {/* LAYER 3 — Top/bottom edge fade */}
      <div className="absolute inset-0 z-[3] pointer-events-none bg-gradient-to-b from-black/35 via-transparent to-black/25" />

      {/* TOP CENTER LABEL */}
      <div className="absolute top-16 md:top-24 left-1/2 -translate-x-1/2 z-40 flex items-center gap-5 w-full justify-center px-4">
        <div className="h-[2px] w-18 md:w-28 bg-gradient-to-r from-transparent to-[#ff6b35]"></div>
        <p className="text-[14px] md:text-xs uppercase tracking-[0.38em] text-[#ff6b35] font-black whitespace-nowrap">
          Level Up Your Game
        </p>
        <div className="h-[2px] w-18 md:w-28 bg-gradient-to-l from-transparent to-[#ff6b35]"></div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-30 flex h-full items-center">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="w-full px-[22px] sm:px-5 md:pl-14 lg:pl-20 xl:pl-40 md:pr-20 lg:pr-28 -mt-48 md:mt-0"
        >
          {/* CONTENT WRAPPER — 88% mobile, 42% desktop */}
          <div className="w-[88%] sm:w-full md:w-[42%] mt-[28px] sm:mt-[16px] md:mt-0">

            {/* MAIN HEADING */}
            <h1 className="font-display text-[2.7rem] sm:text-7xl md:text-7xl lg:text-[7.5rem] font-black text-white tracking-tight leading-[0.95] sm:leading-[0.92] uppercase drop-shadow-[0_8px_20px_rgba(0,0,0,0.7)]">
              EAT. SLEEP.
              <br />
              <span className="text-[#ff6b35] drop-shadow-[0_0_35px_rgba(255,107,53,0.85)]">
                PLAY. REPEAT.
              </span>
            </h1>

            {/* DESCRIPTION — 34px from heading */}
            <div className="max-w-2xl mt-[30px] md:mt-[34px]">
              <p className="text-sm sm:text-lg md:text-xl text-white/90 leading-relaxed font-medium drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
                Enter a premium gaming experience featuring
                high-end PS5 setups, immersive racing simulators,
                cinematic vibes, and the perfect atmosphere for
                every gamer to chill, compete, and dominate.
              </p>
            </div>

            {/* ============================= */}
            {/* CTA BUTTONS — 42px from para  */}
            {/* ============================= */}
            <div className="flex flex-col md:flex-row items-stretch md:items-start gap-[16px] md:gap-5 mt-[38px] md:mt-[42px]">

              {/* ====== JOIN ARENA ====== */}
              <Link
                href="/login"
                className="btn-cta-primary w-full md:w-[320px] h-[64px] md:h-[76px] rounded-[16px] md:rounded-[18px] px-6 md:px-8 text-xs md:text-sm group"
              >
                <span className="ambient-glow"></span>
                <span className="shine-sweep"></span>
                <span className="relative z-10 flex items-center gap-[14px]">
                  <svg className="w-[18px] h-[18px] md:w-5 md:h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                  </svg>
                  <span className="whitespace-nowrap">JOIN ARENA</span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                </span>
              </Link>

              {/* ====== EXPLORE GAMES ====== */}
              <a
                href="#games"
                className="btn-cta-secondary w-full md:w-[320px] h-[64px] md:h-[76px] rounded-[16px] md:rounded-[18px] px-6 md:px-8 text-xs md:text-sm group"
              >
                <span className="shine-sweep"></span>
                {/* 4 corner accents */}
                <span className="corner-h" style={{top:'8px',left:'8px'}}></span>
                <span className="corner-v" style={{top:'8px',left:'8px'}}></span>
                <span className="corner-h" style={{bottom:'8px',right:'8px'}}></span>
                <span className="corner-v" style={{bottom:'8px',right:'8px'}}></span>
                <span className="relative z-10 flex items-center gap-[14px]">
                  <svg className="w-[18px] h-[18px] md:w-5 md:h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 12h.01M10 12h.01M14 12h.01M18 12h.01"/>
                    <rect x="2" y="6" width="20" height="12" rx="4"/>
                    <line x1="6" y1="10" x2="6" y2="14"/>
                    <line x1="18" y1="10" x2="18" y2="14"/>
                    <circle cx="12" cy="12" r="1"/>
                  </svg>
                  <span className="whitespace-nowrap">EXPLORE GAMES</span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                </span>
              </a>

            </div>

            {/* SOCIAL LINKS */}
            <div className="flex items-center gap-4 mt-6 md:mt-8">
              <a href="https://www.instagram.com/jksgaming.arena?igsh=aTBpZTd2M3cweDYz" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-white/5 hover:bg-[#ff6b35] text-white transition-all duration-300 shadow-sm hover:shadow-[#ff6b35]/20 hover:scale-110">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="https://wa.me/919326464645" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-white/5 hover:bg-[#25D366] text-white transition-all duration-300 shadow-sm hover:shadow-[#25D366]/20 hover:scale-110">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.245 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.347-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
              </a>
            </div>

          </div>
        </motion.div>
      </div>

      {/* ============================================= */}
      {/* STATS BAR — Desktop: horizontal strip         */}
      {/* ============================================= */}
      <div className="hidden md:block absolute bottom-6 left-1/2 -translate-x-1/2 z-40 w-[78%]">
        <div className="stats-bar rounded-[24px] h-[100px]">

          {/* Top accent line */}
          <div className="accent-line"></div>

          {/* Stats items */}
          <div className="flex items-center justify-around h-[calc(100%-2px)] px-8 relative">

            {[
              { icon: "⭐", value: "4.8 / 5", label: "Google Rating" },
              { icon: "🎮", value: "10+", label: "Premium Games" },
              {
                icon: (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="6" y1="12" x2="10" y2="12" />
                    <line x1="8" y1="10" x2="8" y2="14" />
                    <line x1="15" y1="13" x2="15.01" y2="13" />
                    <line x1="18" y1="11" x2="18.01" y2="11" />
                    <rect x="2" y="6" width="20" height="12" rx="2" />
                  </svg>
                ),
                value: "Premium", label: "PS5 Setups"
              },
              {
                icon: (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 2v7" />
                    <path d="M21.5 15.5 14.5 13" />
                    <path d="M2.5 15.5 9.5 13" />
                  </svg>
                ),
                value: "Driving",
                label: "Simulators",
              },
            ].map((item, i, arr) => (
              <div key={i} className="stat-item flex-1 justify-center px-5">
                <span className="stat-icon">
                  {typeof item.icon === "string" ? item.icon : <span className="text-[#ff6b35]">{item.icon}</span>}
                </span>
                <div className="flex flex-col">
                  <span className="stat-value text-sm">{item.value}</span>
                  <span className="stat-label">{item.label}</span>
                </div>
                {i < arr.length - 1 && <div className="stat-separator"></div>}
              </div>
            ))}

          </div>

          {/* Bottom accent line */}
          <div className="accent-line-dim"></div>

        </div>
      </div>

      {/* ============================================= */}
      {/* STATS — Mobile 2x2 Grid                       */}
      {/* ============================================= */}
      <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 z-40 w-[88%]">
        <div className="grid grid-cols-2 gap-[14px]">
          {[
            { icon: "⭐", value: "4.8 / 5", label: "Google Rating" },
            { icon: "🎮", value: "10+", label: "Premium Games" },
            {
              icon: (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="6" y1="12" x2="10" y2="12" />
                  <line x1="8" y1="10" x2="8" y2="14" />
                  <line x1="15" y1="13" x2="15.01" y2="13" />
                  <line x1="18" y1="11" x2="18.01" y2="11" />
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                </svg>
              ),
              value: "Premium", label: "PS5 Setups"
            },
            {
              icon: (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v7" />
                  <path d="M21.5 15.5 14.5 13" />
                  <path d="M2.5 15.5 9.5 13" />
                </svg>
              ),
              value: "Driving",
              label: "Simulators",
            },
          ].map((item, i) => (
            <div key={i} className="stat-card h-[105px] p-[16px]">
              {/* Corner accents */}
              <span className="corner-accent corner-accent-h corner-tl"></span>
              <span className="corner-accent corner-accent-v corner-tl"></span>
              <span className="corner-accent corner-accent-h corner-bl"></span>
              <span className="corner-accent corner-accent-v corner-bl"></span>
              <span className="stat-icon text-2xl">
                {typeof item.icon === "string" ? item.icon : <span className="text-[#ff6b35]">{item.icon}</span>}
              </span>
              <div className="flex flex-col items-center">
                <span className="stat-value text-xs">{item.value}</span>
                <span className="stat-label text-[9px]">{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
