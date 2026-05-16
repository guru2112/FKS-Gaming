"use client";

import { motion } from "framer-motion";

export default function AboutSection() {
  return (
    <section
      id="about"
      className="py-28 relative overflow-hidden bg-[#0a0a12]/50 backdrop-blur-md border-t border-b border-white/8"
    >

      {/* BACKGROUND EFFECTS */}

      <div className="absolute inset-0 pointer-events-none overflow-hidden">

        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,rgba(255,107,53,0.20),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(255,107,53,0.14),transparent_40%)]"></div>

        <div className="absolute top-[-120px] right-[-120px] w-[400px] h-[400px] bg-[#ff6b35]/18 blur-[120px] rounded-full"></div>

        <div className="absolute bottom-[-120px] left-[-120px] w-[400px] h-[400px] bg-[#ff6b35]/18 blur-[120px] rounded-full"></div>



      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="grid lg:grid-cols-2 gap-14 items-center"
        >

          {/* LEFT SIDE */}

          <div>

            {/* TOP LABEL */}

            <div className="flex items-center gap-4 mb-6">

              <div className="h-[2px] w-16 bg-gradient-to-r from-[#ff6b35] to-transparent"></div>

              <p className="text-sm uppercase tracking-[0.4em] text-[#ff6b35] font-black">
                About JKS Arena
              </p>

            </div>

            {/* HEADING */}

            <h2 className="font-display text-5xl md:text-7xl font-black text-white leading-[0.95] uppercase tracking-tight mb-8">

              Built For
              <br />

              <span className="text-[#ff6b35] drop-shadow-[0_0_35px_rgba(255,107,53,0.5)]">
                Gamers.
              </span>

              <br />

              By Gamers.

            </h2>

            {/* DESCRIPTION */}

            <div className="space-y-6">

              <p className="text-lg md:text-xl text-slate-100 leading-relaxed font-medium">
                Welcome to{" "}
                <span className="text-white font-bold">
                  JKS Arena
                </span>
                . More than just a gaming café, we are a premium battleground built for esports enthusiasts, casual gamers, and simulator racing fans across Mumbai.
              </p>

              <p className="text-lg md:text-xl text-slate-200 leading-relaxed font-medium">
                Equipped with top-tier PS5 consoles, immersive racing simulators, ultra-fast fiber internet, and cinematic gaming ambience — we provide the ultimate setup so you can focus on one thing:
              </p>

            </div>

            {/* WINNING TEXT */}

            <div className="mt-8 inline-flex items-center gap-4 rounded-2xl border border-[#ff6b35]/30 bg-[#ff6b35]/15 px-6 py-4 backdrop-blur-xl shadow-[0_0_40px_rgba(255,107,53,0.2)]">

              <div className="w-3 h-3 rounded-full bg-[#ff6b35] animate-pulse"></div>

              <span className="text-white text-xl md:text-2xl font-black uppercase tracking-[0.25em]">
                Winning.
              </span>

            </div>

          </div>

          {/* RIGHT SIDE CARD */}

<motion.div
  initial={{ opacity: 0, x: 40 }}
  whileInView={{ opacity: 1, x: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.8 }}
  className="relative"
>

  {/* SLOGAN */}

  <div className="flex justify-center lg:justify-start gap-4 mb-6 text-sm md:text-base font-black uppercase tracking-[0.35em]">

    <span className="text-white">
      Eat
    </span>

    <span className="text-white">
      Sleep
    </span>

    <span className="text-[#ff6b35]">
      Game
    </span>

    <span className="text-white">
      Repeat
    </span>

  </div>

  <div className="relative rounded-[40px] border border-white/15 bg-black/25 backdrop-blur-3xl p-8 md:p-10 overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5)]">

    {/* GLOW */}

    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#ff6b35] to-transparent opacity-80"></div>

    <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#ff6b35]/10 blur-[100px] rounded-full"></div>

    {/* STATS */}

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">

      <div className="rounded-3xl border border-white/15 bg-white/[0.05] p-6 text-center backdrop-blur-xl hover:border-[#ff6b35]/40 hover:shadow-[0_0_25px_rgba(255,107,53,0.12)] transition-all duration-300">

        <h3 className="text-4xl font-black text-[#ff6b35] mb-2">
          PS5
        </h3>

        <p className="text-sm uppercase tracking-[0.25em] text-white font-bold">
          Gaming Setup
        </p>

      </div>

      <div className="rounded-3xl border border-white/15 bg-white/[0.05] p-6 text-center backdrop-blur-xl hover:border-[#ff6b35]/40 hover:shadow-[0_0_25px_rgba(255,107,53,0.12)] transition-all duration-300">

        <h3 className="text-4xl font-black text-[#ff6b35] mb-2">
          SIM
        </h3>

        <p className="text-sm uppercase tracking-[0.25em] text-white font-bold">
          Racing Arena
        </p>

      </div>

      <div className="rounded-3xl border border-white/15 bg-white/[0.05] p-6 text-center backdrop-blur-xl hover:border-[#ff6b35]/40 hover:shadow-[0_0_25px_rgba(255,107,53,0.12)] transition-all duration-300">

        <h3 className="text-4xl font-black text-[#ff6b35] mb-2">
          VIP
        </h3>

        <p className="text-sm uppercase tracking-[0.25em] text-white font-bold">
          Lounge Seating
        </p>

      </div>

    </div>

    {/* DIVIDER */}

    <div className="my-10 h-[1px] w-full bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

    {/* FEATURES */}

    <div className="space-y-5 relative z-10">

      {[
        "Immersive Gaming Atmosphere",
        "High-Speed Internet Connection",
        "Premium Racing Simulators",
        "Comfortable Sofa Seating",
        "Competitive Multiplayer Battles",
      ].map((item, idx) => (
        <div
          key={idx}
          className="flex items-center gap-4 text-white/90"
        >

          <div className="w-3 h-3 rounded-full bg-[#ff6b35] shadow-[0_0_12px_rgba(255,107,53,0.8)]"></div>

          <p className="text-base md:text-lg font-semibold tracking-wide">
            {item}
          </p>

        </div>
      ))}

    </div>

  </div>

</motion.div>

        </motion.div>

      </div>
    </section>
  );
}