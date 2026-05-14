import { Profile } from "@/lib/auth";

interface BookingModalProps {
  selectedBooking: any;
  setSelectedBooking: (
    booking: any | null
  ) => void;
  profile: Profile | null;
}

export default function BookingModal({
  selectedBooking,
  setSelectedBooking,
  profile,
}: BookingModalProps) {

  if (!selectedBooking)
    return null;

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4">

      {/* MODAL */}

      <div className="relative w-full max-w-lg overflow-hidden rounded-[32px] border border-white/10 bg-[#0A0A0A] shadow-[0_0_60px_rgba(0,0,0,0.7)]">

        {/* TOP GLOW */}

        <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-[#ff6b35] to-transparent"></div>

        {/* CLOSE BUTTON */}

        <button
          onClick={() =>
            setSelectedBooking(null)
          }
          className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition-all duration-300 hover:border-[#ff6b35]/40 hover:bg-[#ff6b35]/10 hover:text-[#ff6b35]"
        >

          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >

            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />

          </svg>

        </button>

        {/* CONTENT */}

        <div className="p-6 sm:p-8">

          {/* HEADER */}

          <div className="mb-8">

            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#ff6b35]">

              Session Details

            </p>

            <h2 className="mt-3 font-display text-3xl uppercase tracking-tight text-white">

              {selectedBooking.device}

            </h2>

            <p className="mt-2 text-sm text-slate-400">

              {selectedBooking.game ||
                "General Gaming Session"}

            </p>

          </div>

          {/* SESSION CARD */}

          <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-xl">

            <div className="grid grid-cols-2 gap-4">

              {/* DATE */}

              <div className="rounded-2xl border border-white/5 bg-black/20 p-4">

                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">

                  Date

                </p>

                <p className="mt-2 text-sm font-bold text-white">

                  {new Date(
                    selectedBooking.slotStart
                  ).toLocaleDateString(
                    "en-GB",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }
                  )}

                </p>

              </div>

              {/* TIME */}

              <div className="rounded-2xl border border-white/5 bg-black/20 p-4">

                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">

                  Time

                </p>

                <p className="mt-2 text-sm font-bold text-white">

                  {new Date(
                    selectedBooking.slotStart
                  ).toLocaleTimeString(
                    [],
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}

                </p>

              </div>

              {/* DURATION */}

              <div className="rounded-2xl border border-white/5 bg-black/20 p-4">

                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">

                  Duration

                </p>

                <p className="mt-2 text-sm font-bold text-white">

                  {
                    selectedBooking.durationHours
                  }{" "}
                  Hour
                  {selectedBooking.durationHours >
                  1
                    ? "s"
                    : ""}

                </p>

              </div>

              {/* PLAYERS */}

              <div className="rounded-2xl border border-white/5 bg-black/20 p-4">

                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">

                  Players

                </p>

                <p className="mt-2 text-sm font-bold text-white">

                  {
                    selectedBooking.players
                  }{" "}
                  Player
                  {selectedBooking.players >
                  1
                    ? "s"
                    : ""}

                </p>

              </div>

            </div>

            {/* HOST */}

            <div className="mt-5 rounded-2xl border border-[#ff6b35]/20 bg-[#ff6b35]/5 p-5">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-[9px] font-black uppercase tracking-widest text-[#ff6b35]">

                    Host Player

                  </p>

                  <p className="mt-2 text-sm font-bold text-white">

                    {selectedBooking.userName ||
                      profile?.name ||
                      "Primary Player"}

                  </p>

                </div>

                <p className="text-xs font-bold text-slate-300">

                  {selectedBooking.contactNumber ||
                    "N/A"}

                </p>

              </div>

            </div>

            {/* COMPANIONS */}

            {selectedBooking.companions &&
              selectedBooking
                .companions.length >
                0 && (

                <div className="mt-5">

                  <p className="mb-3 text-[9px] font-black uppercase tracking-widest text-slate-500">

                    Party Members

                  </p>

                  <div className="space-y-3">

                    {selectedBooking.companions.map(
                      (
                        comp: any,
                        idx: number
                      ) => (

                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/20 px-4 py-3"
                        >

                          <div>

                            <p className="text-xs font-bold text-white">

                              {comp.name ||
                                `Player ${
                                  idx + 2
                                }`}

                            </p>

                            <p className="mt-1 text-[10px] uppercase tracking-widest text-slate-500">

                              Companion

                            </p>

                          </div>

                          <p className="text-xs font-bold text-slate-400">

                            {comp.phone}

                          </p>

                        </div>

                      )
                    )}

                  </div>

                </div>

              )}

            {/* STATUS + PRICE */}

            <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-5">

              {/* STATUS */}

              <span
                className={`rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-widest ${
                  selectedBooking.status ===
                  "upcoming"

                    ? "border-green-500/30 bg-green-500/10 text-green-400"

                    : selectedBooking.status ===
                      "active"

                    ? "border-[#ff6b35]/30 bg-[#ff6b35]/10 text-[#ff6b35]"

                    : selectedBooking.status ===
                      "cancelled"

                    ? "border-red-500/30 bg-red-500/10 text-red-400"

                    : "border-white/10 bg-white/5 text-slate-400"
                }`}
              >

                {
                  selectedBooking.status
                }

              </span>

              {/* PRICE */}

              <div className="text-right">

                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">

                  Total Price

                </p>

                <p className="mt-1 text-3xl font-black text-[#ff6b35]">

                  ₹
                  {
                    selectedBooking.totalPrice
                  }

                </p>

              </div>

            </div>

          </div>

          {/* FOOTER */}

          <button
            onClick={() =>
              setSelectedBooking(null)
            }
            className="mt-8 w-full rounded-2xl border border-[#ff6b35]/40 bg-[#ff6b35] px-6 py-4 text-[11px] font-black uppercase tracking-[0.25em] text-[#050505] shadow-[0_0_20px_rgba(255,107,53,0.3)] transition-all duration-300 hover:bg-white hover:text-black"
          >

            Close Details

          </button>

        </div>

      </div>

    </div>

  );

}