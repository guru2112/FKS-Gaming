import GamesSection from "@/components/GamesSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="relative overflow-hidden">
        {/* Softened ambient glows for Light Theme */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-orange-200/50 blur-[120px]" />
          <div className="absolute right-[-120px] top-32 h-[360px] w-[360px] rounded-full bg-orange-100/40 blur-[140px]" />
          <div className="absolute left-[-80px] bottom-[-120px] h-[320px] w-[320px] rounded-full bg-cyan-100/30 blur-[140px]" />
        </div>

        <header className="relative z-10 px-4 pt-6 sm:px-6 md:px-16">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-white text-sm font-semibold">
                JKS
              </span>
              <div>
                <p className="font-display text-lg sm:text-xl font-bold">JKS ARENA</p>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Gaming Cafe</p>
              </div>
            </div>
            <div className="hidden items-center gap-6 text-sm uppercase tracking-[0.2em] text-slate-600 md:flex">
              <span className="cursor-pointer hover:text-orange-500 transition font-medium">Rigs</span>
              <span className="cursor-pointer hover:text-orange-500 transition font-medium">Tournaments</span>
              <span className="cursor-pointer hover:text-orange-500 transition font-medium">Cafe</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <a
                href="/login"
                className="rounded-full border border-slate-300 px-4 py-2 text-sm uppercase tracking-[0.2em] text-slate-700 transition hover:bg-slate-50"
              >
                Login
              </a>
              <a
                href="/book"
                className="rounded-full bg-orange-500 px-4 py-2 text-sm uppercase tracking-[0.2em] text-white transition hover:bg-orange-600 shadow-lg shadow-orange-200"
              >
                Book Now
              </a>
            </div>
          </nav>
        </header>

        <main className="relative z-10 px-4 pb-16 pt-12 sm:px-6 md:px-16">
          <section className="grid gap-12 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-[0.35em] text-orange-600 font-bold" data-delay="1">
                Gaming cafe for squads
              </p>
              <h1 className="font-display text-4xl leading-[0.95] text-slate-900 sm:text-5xl md:text-7xl" data-delay="2">
                Play louder.
                <span className="block text-orange-500">Compete harder.</span>
                Chill together.
              </h1>
              <p className="max-w-xl text-base text-slate-600 sm:text-lg" data-delay="3">
                Premium rigs, low-latency network, and a cafe menu made for late-night raids.
                Reserve your console, join weekly tournaments, and level up with your crew.
              </p>
              <div className="flex flex-wrap gap-3" data-delay="3">
                <a
                  href="/book"
                  className="glow-ring rounded-full bg-orange-500 px-6 py-3 text-sm uppercase tracking-[0.2em] text-white transition hover:bg-orange-600 shadow-lg shadow-orange-200"
                >
                  Reserve Your PS Slot
                </a>
                <a
                  href="/signup"
                  className="rounded-full border border-slate-300 px-6 py-3 text-sm uppercase tracking-[0.2em] text-slate-700 transition hover:bg-slate-50"
                >
                  Join Membership
                </a>
              </div>
              <div className="grid gap-4 pt-6 text-sm text-slate-600 sm:grid-cols-3">
                <div className="surface-panel rounded-2xl p-4 bg-slate-50 border border-slate-200">
                  <p className="text-2xl font-bold text-slate-900">144Hz</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Esports Monitors</p>
                </div>
                <div className="surface-panel rounded-2xl p-4 bg-slate-50 border border-slate-200">
                  <p className="text-2xl font-bold text-slate-900">0ms</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Lag Vibe</p>
                </div>
                <div className="surface-panel rounded-2xl p-4 bg-slate-50 border border-slate-200">
                  <p className="text-2xl font-bold text-slate-900">24/7</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Open for squads</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[32px] bg-slate-50 border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Live queue</p>
                    <p className="text-3xl font-bold text-slate-900">Tonight</p>
                  </div>
                  <span className="rounded-full bg-orange-100 px-4 py-1 text-xs uppercase tracking-[0.25em] text-orange-700 font-bold">
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
                      className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{title}</p>
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Starts 8:00 PM</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        Join
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="surface-panel rounded-2xl p-5 bg-white border border-slate-200">
                  <p className="text-sm uppercase tracking-[0.25em] text-orange-600 font-bold">Cafe Fuel</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">Signature Nitro Brews</p>
                  <p className="mt-2 text-sm text-slate-500">Refuel with gamer-friendly bites.</p>
                </div>
                <div className="surface-panel rounded-2xl p-5 bg-white border border-slate-200">
                  <p className="text-sm uppercase tracking-[0.25em] text-orange-600 font-bold">Membership</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">Priority Rigs</p>
                  <p className="mt-2 text-sm text-slate-500">Discounted hours and VIP drops.</p>
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
              <div key={item.title} className="surface-panel rounded-3xl p-6 bg-slate-50 border border-slate-200">
                <p className="font-display text-2xl font-bold text-slate-900">{item.title}</p>
                <p className="mt-3 text-sm text-slate-500">{item.desc}</p>
              </div>
            ))}
          </section>

          <GamesSection title="Game nights lineup" />

          <section className="mt-16 rounded-[32px] bg-orange-50 border border-orange-100 p-6 sm:p-8 md:p-12">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-orange-600 font-bold">Ready to play</p>
                <h2 className="font-display text-3xl text-slate-900 sm:text-4xl md:text-5xl font-bold">
                  Book your seat tonight.
                </h2>
              </div>
              <a
                href="/book"
                className="glow-ring inline-flex items-center justify-center rounded-full bg-orange-500 px-8 py-4 text-sm uppercase tracking-[0.2em] text-white transition hover:bg-orange-600 shadow-lg shadow-orange-200"
              >
                Go to Booking
              </a>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}