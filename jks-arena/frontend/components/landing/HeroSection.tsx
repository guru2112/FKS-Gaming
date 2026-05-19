"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section
      id="home"
      className="relative h-[100dvh] w-full overflow-hidden"
    >

      {/* CINEMATIC OVERLAYS */}

      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a12]/30 via-transparent to-[#0a0a12]/20 z-0 pointer-events-none"></div>

      {/* GRID EFFECT */}

      {/* TOP CENTER LABEL */}

      <div className="absolute top-24 md:top-24 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 md:gap-5 w-full justify-center px-4">

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
          className="w-full max-w-7xl mx-auto px-6 md:px-20 lg:px-28"
        >

          {/* CONTENT WRAPPER */}

          <div className="max-w-4xl pt-0 md:pt-0 mt-6 md:-mt-6">

            {/* MAIN HEADING */}

            <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-[8rem] font-black text-white mb-6 md:mb-8 tracking-tight leading-[0.92] uppercase drop-shadow-[0_8px_20px_rgba(0,0,0,0.7)]">

              EAT. SLEEP.
              <br />

              <span className="text-[#ff6b35] drop-shadow-[0_0_35px_rgba(255,107,53,0.85)]">
                PLAY. REPEAT.
              </span>

            </h1>

            {/* DESCRIPTION */}

            <div className="max-w-3xl">

              <p className="text-sm sm:text-lg md:text-2xl text-slate-100 leading-relaxed font-medium drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
                Enter a premium gaming experience featuring
                high-end PS5 setups, immersive racing simulators,
                cinematic vibes, and the perfect atmosphere for
                every gamer to chill, compete, and dominate.
              </p>

            </div>

            {/* BUTTON */}

            <div className="mt-28 md:mt-12">

              <Link
                href="/signup"
                className="group relative inline-flex overflow-hidden px-10 md:px-12 py-4 md:py-5 rounded-2xl bg-[#ff6b35] text-[#050505] font-black uppercase tracking-[0.3em] text-xs md:text-base shadow-[0_0_50px_rgba(255,107,53,0.55)] hover:shadow-[0_0_70px_rgba(255,107,53,0.7)] hover:scale-105 transition-all duration-300"
              >

                <span className="relative z-10 flex items-center gap-3">

                  JOIN ARENA

                  <span className="group-hover:translate-x-1 transition-transform duration-300">
                    →
                  </span>

                </span>

                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>

              </Link>

            </div>

          </div>

        </motion.div>

      </div>

    </section>
  );
}
