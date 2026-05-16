"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
          ? "bg-[#0a0a12]/75 backdrop-blur-2xl border-b border-white/15 shadow-[0_10px_40px_rgba(0,0,0,0.35)]"
          : "bg-transparent"
        }`}
    >

      {/* TOP GLOW LINE */}

      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#ff6b35]/80 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex items-center justify-between h-20">

          {/* LOGO */}

          <div className="flex-shrink-0 group relative">

            <Link
              href="#home"
              className="font-display text-3xl font-black tracking-[0.12em] relative inline-flex items-center"
            >

              <span className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                JKS
              </span>

              <span className="text-[#ff6b35] drop-shadow-[0_0_12px_rgba(255,107,53,0.55)]">
                &nbsp;ARENA
              </span>

            </Link>

          </div>

          {/* DESKTOP MENU */}

          <div className="hidden md:flex items-center gap-10">

            {["Home", "Facilities", "Games", "About Us"].map((item) => {

              const href =
                item === "Home"
                  ? "#home"
                  : item === "Facilities"
                    ? "#facilities"
                    : item === "Games"
                      ? "#games"
                      : "#about";

              return (
                <Link
                  key={item}
                  href={href}
                  className="relative text-sm font-black uppercase tracking-[0.25em] text-slate-300 hover:text-[#ff6b35] transition-all duration-300 group"
                >

                  {item}

                  <span className="absolute -bottom-2 left-0 h-[2px] w-0 bg-[#ff6b35] transition-all duration-300 group-hover:w-full shadow-[0_0_12px_rgba(255,107,53,0.7)]"></span>

                </Link>
              );
            })}

          </div>

          {/* RIGHT SIDE */}

          <div className="flex items-center gap-4">

            {/* LOGIN BUTTON */}

            <Link
              href="/login"
              className="group relative overflow-hidden px-7 py-3 rounded-2xl border border-[#ff6b35]/50 bg-black/30 backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-[#ff6b35]"
            >

              <span className="relative z-10 text-[#ff6b35] group-hover:text-white text-xs font-black uppercase tracking-[0.3em] transition-colors duration-300">

                Login

              </span>

              <div className="absolute inset-0 bg-[#ff6b35]/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            </Link>

            {/* MOBILE MENU BUTTON */}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden relative w-11 h-11 rounded-xl border border-white/10 bg-black/30 backdrop-blur-xl flex items-center justify-center text-slate-300 hover:text-[#ff6b35] hover:border-[#ff6b35]/40 transition-all duration-300"
            >

              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >

                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}

              </svg>

            </button>

          </div>

        </div>

      </div>

      {/* MOBILE MENU */}

      <div
        className={`md:hidden absolute top-full left-0 w-full transition-all duration-500 overflow-hidden ${isMobileMenuOpen
            ? "max-h-[400px] opacity-100"
            : "max-h-0 opacity-0"
          }`}
      >

        <div className="bg-[#050505]/95 backdrop-blur-2xl border-b border-white/10 px-5 pt-4 pb-6">

          <div className="space-y-3">

            {["Home", "Facilities", "Games", "About Us"].map((item) => {

              const href =
                item === "Home"
                  ? "#home"
                  : item === "Facilities"
                    ? "#facilities"
                    : item === "Games"
                      ? "#games"
                      : "#about";

              return (
                <Link
                  key={item}
                  href={href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="group flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] px-5 py-4 text-sm font-black uppercase tracking-[0.25em] text-slate-300 hover:border-[#ff6b35]/30 hover:bg-[#ff6b35]/10 hover:text-white transition-all duration-300"
                >

                  <span>{item}</span>

                  <span className="text-[#ff6b35] group-hover:translate-x-1 transition-transform duration-300">
                    →
                  </span>

                </Link>
              );
            })}

          </div>

        </div>

      </div>

    </nav>
  );
}