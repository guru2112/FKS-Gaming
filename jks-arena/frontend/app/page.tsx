import GamesSection from "@/components/GamesSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-80">
          <div className="absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-orange-500/30 blur-[120px]" />
          <div className="absolute right-[-120px] top-32 h-[360px] w-[360px] rounded-full bg-pink-500/20 blur-[140px]" />
          <div className="absolute left-[-80px] bottom-[-120px] h-[320px] w-[320px] rounded-full bg-cyan-400/20 blur-[140px]" />
        </div>

        <header className="relative z-10 px-4 pt-6 sm:px-6 md:px-16">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/20 text-sm font-semibold">
                JKS
              </span>
              <div>
                <p className="font-display text-lg sm:text-xl">JKS ARENA</p>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Gaming Cafe</p>
              </div>
            </div>
            <div className="hidden items-center gap-6 text-sm uppercase tracking-[0.2em] text-slate-300 md:flex">
              <span>Rigs</span>
              <span>Tournaments</span>
              <span>Cafe</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <a
                href="/login"
                className="rounded-full border border-slate-600 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-200 transition hover:border-slate-300 sm:px-4 sm:text-sm"
              >
                Login
              </a>
              <a
                href="/signup"
                className="rounded-full bg-orange-500 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-950 transition hover:bg-orange-400 sm:px-4 sm:text-sm"
              >
                Sign Up
              </a>
            </div>
          </nav>
        </header>

        <main className="relative z-10 px-4 pb-16 pt-12 sm:px-6 md:px-16">
          <section className="grid gap-12 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div className="space-y-6">
              <p className="staggered text-xs uppercase tracking-[0.35em] text-orange-300" data-delay="1">
                Gaming cafe for squads
              </p>
              <h1 className="staggered font-display text-4xl leading-[0.95] text-slate-50 sm:text-5xl md:text-7xl" data-delay="2">
                Play louder.
                <span className="block text-orange-400">Compete harder.</span>
                Chill together.
              </h1>
              <p className="staggered max-w-xl text-base text-slate-300 sm:text-lg" data-delay="3">
                Premium rigs, low-latency network, and a cafe menu made for late-night raids.
                Book your seat, join weekly tournaments, and level up with your crew.
              </p>
              <div className="staggered flex flex-wrap gap-3" data-delay="3">
                <a
                  href="/signup"
                  className="glow-ring rounded-full bg-orange-500 px-5 py-3 text-xs uppercase tracking-[0.2em] text-slate-950 transition hover:bg-orange-400 sm:px-6 sm:text-sm"
                >
                  Join the Arena
                </a>
                <a
                  href="/login"
                  className="rounded-full border border-slate-600 px-5 py-3 text-xs uppercase tracking-[0.2em] text-slate-200 transition hover:border-slate-300 sm:px-6 sm:text-sm"
                >
                  Member Login
                </a>
              </div>
              <div className="grid gap-4 pt-6 text-sm text-slate-300 sm:grid-cols-3">
                <div className="surface-panel rounded-2xl p-4">
                  <p className="text-2xl font-semibold text-white">144Hz</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Esports Monitors</p>
                </div>
                <div className="surface-panel rounded-2xl p-4">
                  <p className="text-2xl font-semibold text-white">0ms</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Lag Vibe</p>
                </div>
                <div className="surface-panel rounded-2xl p-4">
                  <p className="text-2xl font-semibold text-white">24/7</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Open for squads</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="gradient-border rounded-[32px]">
                <div className="surface-panel rounded-[32px] p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Live queue</p>
                      <p className="text-3xl font-semibold">Tonight</p>
                    </div>
                    <span className="rounded-full bg-orange-500/20 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-orange-200 sm:px-4 sm:text-xs">
                      12 seats left
                    </span>
                  </div>
                  <div className="mt-6 grid gap-4">
                    {[
                      "Valorant Ranked",
                      "FIFA Pro Clubs",
                      "Apex Legends Scrim",
                    ].map((title) => (
                      <div
                        key={title}
                        className="flex items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-950/50 px-4 py-3"
                      >
                        <div>
                          <p className="text-sm text-slate-100">{title}</p>
                          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Starts 8:00 PM</p>
                        </div>
                        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                          Join
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="surface-panel rounded-2xl p-5">
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Cafe Fuel</p>
                  <p className="mt-2 text-2xl font-semibold text-white">Signature Nitro Brews</p>
                  <p className="mt-2 text-sm text-slate-400">Refuel with gamer-friendly bites.</p>
                </div>
                <div className="surface-panel rounded-2xl p-5">
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Membership</p>
                  <p className="mt-2 text-2xl font-semibold text-white">Priority Rigs</p>
                  <p className="mt-2 text-sm text-slate-400">Discounted hours and VIP drops.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-20 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Pro-grade rigs",
                desc: "RTX GPUs, mechanical keyboards, studio headsets.",
              },
              {
                title: "Squad rooms",
                desc: "Private rooms with stream-ready setups.",
              },
              {
                title: "Weekly events",
                desc: "Tournaments, watch parties, and LAN nights.",
              },
            ].map((item) => (
              <div key={item.title} className="surface-panel rounded-3xl p-6">
                <p className="font-display text-2xl text-slate-50">{item.title}</p>
                <p className="mt-3 text-sm text-slate-400">{item.desc}</p>
              </div>
            ))}
          </section>

          <GamesSection title="Game nights lineup" />

          <section className="mt-16 rounded-[32px] bg-orange-500/10 p-6 sm:p-8 md:p-12">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-orange-200">Ready to play</p>
                <h2 className="font-display text-3xl text-white sm:text-4xl md:text-5xl">
                  Book your seat tonight.
                </h2>
              </div>
              <a
                href="/signup"
                className="glow-ring inline-flex items-center justify-center rounded-full bg-orange-500 px-5 py-3 text-xs uppercase tracking-[0.2em] text-slate-950 transition hover:bg-orange-400 sm:px-6 sm:text-sm"
              >
                Get membership
              </a>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
