"use client";

import { motion } from "framer-motion";

export default function LocationSection() {

  const mapEmbedUrl =
    "https://maps.google.com/maps?q=JKS%20Arena,%20Ashok%20Nagar,%20Vikhroli%20East,%20Mumbai&t=&z=16&ie=UTF8&iwloc=&output=embed";

  const mapRedirectUrl =
    "https://www.google.com/maps/search/?api=1&query=JKS+Arena,+Ashok+Nagar,+Vikhroli+East,+Mumbai";

  return (
    <section
      id="location"
      className="py-24 relative overflow-hidden bg-[#151520]/40 backdrop-blur-sm border-t border-b border-white/8"
    >

      {/* BACKGROUND GLOWS */}
   

      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#ff6b35]/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#ff6b35]/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">

        {/* HEADER */}

        <div className="mb-12 text-center lg:text-left">

          <p className="text-xs uppercase tracking-[0.4em] text-[#ff6b35] font-black mb-2">
            Tactical Location
          </p>

          <h2 className="font-display text-5xl md:text-7xl font-black text-white leading-tight uppercase tracking-tighter">
            JOIN THE{" "}
            <span className="text-[#ff6b35] drop-shadow-[0_0_40px_rgba(255,107,53,0.5)]">
              BATTLEFIELD
            </span>
          </h2>

        </div>

        {/* GRID */}

        <div className="grid lg:grid-cols-2 gap-12 items-stretch min-h-[450px]">

          {/* LEFT CARD */}

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex h-full w-full"
          >

            <div className="relative w-full p-8 md:p-12 rounded-[42px] border border-white/15 bg-black/25 backdrop-blur-3xl hover:border-[#ff6b35]/50 transition-all duration-500 flex flex-col justify-between overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5)] group">

              {/* FACILITIES STYLE BACKGROUND */}

              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-[#ff6b35]/[0.03] pointer-events-none"></div>

              <div className="absolute inset-0 backdrop-blur-[2px] pointer-events-none"></div>

              {/* TOP LINE */}

              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#ff6b35] to-transparent opacity-80"></div>

              {/* ORANGE GLOW */}

              <div className="absolute -top-24 -right-24 w-56 h-56 bg-[#ff6b35]/18 blur-[90px] rounded-full pointer-events-none"></div>

              {/* GRID PATTERN */}

              {/* CONTENT */}

              <div className="relative z-10">

                {/* TITLE */}

                <h3 className="font-display text-4xl md:text-5xl font-black uppercase tracking-tight mb-8 leading-none">
                  <span className="text-white">
                    JKS
                  </span>{" "}
                  <span className="text-[#ff6b35]">
                    ARENA
                  </span>
                </h3>

                {/* ADDRESS */}

                <div className="space-y-3">

                  <p className="text-white text-3xl md:text-5xl leading-[1.1] font-black tracking-tight">
                    Opposite Bldg 10,
                  </p>

                  <p className="text-white/90 text-2xl md:text-4xl font-bold">
                    Ashok Nagar
                  </p>

                  <p className="text-white/70 text-xl md:text-3xl font-semibold">
                    Vikhroli East
                  </p>

                  <p className="text-[#ff6b35] text-2xl md:text-4xl font-black tracking-wide">
                    Mumbai 83
                  </p>

                </div>

              </div>

              {/* BOTTOM */}

              <div className="relative z-10 mt-14">

                {/* DIVIDER */}

                <div className="flex items-center gap-4 mb-8 opacity-60">

                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white"></div>

                  <span className="text-[10px] font-black uppercase tracking-[0.35em] text-white whitespace-nowrap">
                    Tactical Gaming Zone
                  </span>

                  <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white"></div>

                </div>

                {/* BUTTON */}

                <a
                  href={mapRedirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/btn flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-[#ff6b35] hover:bg-[#ff814f] text-white text-xs font-black uppercase tracking-[0.3em] transition-all duration-300 shadow-[0_0_25px_rgba(255,107,53,0.35)]"
                >

                  Open Navigation

                  <span className="group-hover/btn:translate-x-1 transition-transform duration-300">
                    →
                  </span>

                </a>

              </div>

            </div>

          </motion.div>

          {/* RIGHT MAP */}

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex h-full w-full min-h-[450px]"
          >

            <a
              href={mapRedirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-full min-h-[450px] rounded-[40px] overflow-hidden border border-white/15 bg-black/30 group relative shadow-2xl block cursor-pointer"
            >

              {/* MAP */}

              <iframe
                src={mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-700 group-hover:scale-105"
              />

              {/* OVERLAY */}

              <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_60px_rgba(0,0,0,0.8)] ring-[8px] ring-inset ring-[#050505] rounded-[40px]"></div>

              {/* HOVER BUTTON */}

              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30 backdrop-blur-[2px]">

                <span className="bg-[#ff6b35] text-white px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-widest shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">

                  Open in Google Maps →

                </span>

              </div>

            </a>

          </motion.div>

        </div>

      </div>

    </section>
  );
}