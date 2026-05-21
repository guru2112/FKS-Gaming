"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { type Booking } from "@/lib/auth";
import { api } from "@/lib/apiClient";

const DEVICES: Array<"PS1" | "PS2" | "PS3" | "SIM1"> = ["PS1", "PS2", "PS3", "SIM1"];

const DEVICE_RATES: Record<"PS1" | "PS2" | "PS3" | "SIM1", number> = {
  PS1: 60,
  PS2: 60,
  PS3: 60,
  SIM1: 100,
};

const initialNow = Date.now();

type Session = Booking & {
  slotStart: string;
  slotEnd: string;
  userName?: string;
  userContact?: string;
  device: "PS1" | "PS2" | "PS3" | "SIM1";
};

function mapSessionStatus(session: Session) {
  if (session.sessionStatus) return session.sessionStatus;
  if (session.status === "upcoming") return "scheduled";
  return session.status;
}

function formatTime(iso: string) {
  const dt = new Date(iso);
  return dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });
}

function formatDateTime(iso: string) {
  const dt = new Date(iso);
  return dt.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

function msToHuman(ms: number) {
  const clamped = Math.max(0, ms);
  const totalMinutes = Math.floor(clamped / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

export default function AdminSessionsPage() {

  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(initialNow);

  const [form, setForm] = useState({
    customerName: "",
    phoneNumber: "",
    device: "PS1" as "PS1" | "PS2" | "PS3" | "SIM1",
    game: "",
    players: 1,
    inTime: "",
    outTime: "",
    companions: [] as Array<{ name: string; phone: string }>,
    paymentMethod: "cash" as "cash" | "online",
    amountPaid: 0,
  });

  const computed = useMemo(() => {
    const rate = DEVICE_RATES[form.device];
    const inDt = form.inTime ? new Date(form.inTime) : null;
    const outDt = form.outTime ? new Date(form.outTime) : null;

    const ms =
      inDt && outDt && !Number.isNaN(inDt.getTime()) && !Number.isNaN(outDt.getTime())
        ? outDt.getTime() - inDt.getTime()
        : 0;

    const safeMs = Math.max(0, ms);
    const minutes = safeMs / 60000;
    const hours = minutes / 60;
    const rawTotal = Number(form.players || 1) * rate * hours;
    const total = Math.round(rawTotal);
    const paid = Number(form.amountPaid || 0);
    const paymentStatus = paid >= total ? "Fully Paid" : "Partial Payment";

    return {
      rate,
      totalTimePlayed: safeMs > 0 ? msToHuman(safeMs) : "–",
      totalAmount: Number.isFinite(total) ? total : 0,
      paymentStatus,
    };
  }, [form.amountPaid, form.device, form.inTime, form.outTime, form.players]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setForm((f) => {
        const desired = Math.max(0, Number(f.players || 1) - 1);
        const current = Array.isArray(f.companions) ? f.companions : [];
        if (current.length === desired) return f;
        const next = current.slice(0, desired);
        while (next.length < desired) next.push({ name: "", phone: "" });
        return { ...f, companions: next };
      });
    }, 0);

    return () => clearTimeout(timeout);
  }, [form.players]);

  const fetchSessions = useCallback(async () => {
    try {
      setError(null);
      const data = await api.get<{ sessions: Session[] }>("/api/admin/sessions");
      setSessions(Array.isArray(data.sessions) ? data.sessions : []);
    } catch (e: any) {
      setError(e?.message || "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void fetchSessions();
    }, 0);
    const interval = setInterval(() => {
      void fetchSessions();
    }, 30000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [fetchSessions]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const deviceCards = useMemo(() => {
    return DEVICES.map((device) => {
      const active = sessions
        .filter((s) => s.device === device)
        .find((s) => (s.sessionStatus || s.status) === "active");

      if (active) {
        const end = new Date(active.slotEnd).getTime();
        return {
          device,
          state: "Occupied" as const,
          sub: `Ends in ${msToHuman(end - now)}`,
        };
      }

      const upcoming = sessions
        .filter((s) => s.device === device)
        .filter((s) => (s.sessionStatus || s.status) === "scheduled" || s.status === "upcoming")
        .filter((s) => new Date(s.slotStart).getTime() > now)
        .sort((a, b) => new Date(a.slotStart).getTime() - new Date(b.slotStart).getTime())[0];

      if (upcoming) {
        return {
          device,
          state: "Reserved" as const,
          sub: `Reserved at ${formatTime(upcoming.slotStart)}`,
        };
      }

      return {
        device,
        state: "Available" as const,
        sub: "Ready",
      };
    });
  }, [sessions, now]);

  async function startSession() {
    try {
      setError(null);

      if (!form.outTime) {
        throw new Error("Out time is required.");
      }

      const inDt = form.inTime ? new Date(form.inTime) : new Date();
      const outDt = new Date(form.outTime);
      if (Number.isNaN(inDt.getTime())) throw new Error("Invalid in time.");
      if (Number.isNaN(outDt.getTime())) throw new Error("Invalid out time.");
      if (outDt.getTime() <= inDt.getTime()) throw new Error("Out time must be after in time.");

      const payload = {
        customerName: form.customerName,
        phoneNumber: form.phoneNumber,
        device: form.device,
        game: form.game,
        players: form.players,
        companions: form.companions,
        inTime: inDt.toISOString(),
        outTime: outDt.toISOString(),
        paymentMethod: form.paymentMethod,
        amountPaid: form.amountPaid,
      };

      await api.post("/api/admin/sessions/start", payload);

      setForm((f) => ({
        ...f,
        customerName: "",
        phoneNumber: "",
        game: "",
        players: 1,
        inTime: "",
        outTime: "",
        companions: [],
        paymentMethod: "cash",
        amountPaid: 0,
      }));

      await fetchSessions();
    } catch (e: any) {
      setError(e?.message || "Failed to start session");
    }
  }

  const todaysSessions = useMemo(() => {
    return [...sessions].sort((a, b) => new Date(a.slotStart).getTime() - new Date(b.slotStart).getTime());
  }, [sessions]);

  return (
    <div className="min-h-screen bg-[#050505] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-black uppercase tracking-wide">Sessions</h1>
          <button
            onClick={fetchSessions}
            className="text-[10px] font-black text-slate-400 hover:text-[#ff6b35] uppercase tracking-widest transition-colors"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="border border-red-500/30 bg-red-500/10 rounded-xl px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* TOP: Live device status cards */}
        <section className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Live Device Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {deviceCards.map((c) => {
              const border =
                c.state === "Occupied"
                  ? "border-[#ff6b35]/50"
                  : c.state === "Reserved"
                    ? "border-white/20"
                    : "border-dashed border-white/20";

              const badge =
                c.state === "Occupied"
                  ? "bg-[#ff6b35]/15 text-[#ff6b35] border-[#ff6b35]/30"
                  : c.state === "Reserved"
                    ? "bg-white/5 text-slate-200 border-white/10"
                    : "bg-green-500/10 text-green-400 border-green-500/20";

              return (
                <div key={c.device} className={`rounded-3xl border ${border} bg-white/5 backdrop-blur-sm p-6 min-h-42.5 flex flex-col justify-between`}>
                  <div>
                    <p className="text-xl font-black uppercase tracking-widest text-white">{c.device}</p>
                    <p className="mt-2 text-xs text-slate-400 font-bold uppercase tracking-wider">{c.sub}</p>
                  </div>

                  <div>
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${badge}`}>
                      {c.state}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* MIDDLE: Walk-in start form */}
        <section className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Walk-In Customer</h2>
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Customer name</label>
                <input
                  value={form.customerName}
                  onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                  className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#ff6b35]"
                  placeholder="Name"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Phone number</label>
                <input
                  value={form.phoneNumber}
                  onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                  className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#ff6b35]"
                  placeholder="Phone"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Device</label>
                <select
                  value={form.device}
                  onChange={(e) => setForm((f) => ({ ...f, device: e.target.value as any }))}
                  className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#ff6b35]"
                >
                  {DEVICES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Game</label>
                <input
                  value={form.game}
                  onChange={(e) => setForm((f) => ({ ...f, game: e.target.value }))}
                  className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#ff6b35]"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Players</label>
                <input
                  type="number"
                  min={1}
                  value={form.players}
                  onChange={(e) => setForm((f) => ({ ...f, players: Number(e.target.value) }))}
                  className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#ff6b35]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">In time</label>
                <input
                  type="datetime-local"
                  value={form.inTime}
                  onChange={(e) => setForm((f) => ({ ...f, inTime: e.target.value }))}
                  className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#ff6b35]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Out time</label>
                <input
                  type="datetime-local"
                  value={form.outTime}
                  onChange={(e) => setForm((f) => ({ ...f, outTime: e.target.value }))}
                  className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#ff6b35]"
                />
                <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Required (locks device for this window).</p>
              </div>
            </div>

            {/* PLAYER DETAILS */}
            {form.players > 1 && (
              <div className="mt-8 space-y-3">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Player Details</h3>
                <div className="grid grid-cols-1 gap-3">
                  {form.companions.map((p, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        value={p.name}
                        onChange={(e) =>
                          setForm((f) => {
                            const next = [...f.companions];
                            next[idx] = { ...next[idx], name: e.target.value };
                            return { ...f, companions: next };
                          })
                        }
                        className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#ff6b35]"
                        placeholder={`Player ${idx + 2} name`}
                      />
                      <input
                        value={p.phone}
                        onChange={(e) =>
                          setForm((f) => {
                            const next = [...f.companions];
                            next[idx] = { ...next[idx], phone: e.target.value };
                            return { ...f, companions: next };
                          })
                        }
                        className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#ff6b35]"
                        placeholder={`Player ${idx + 2} contact`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PAYMENT */}
            <div className="mt-8 space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payment</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Method</label>
                  <select
                    value={form.paymentMethod}
                    onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value as any }))}
                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#ff6b35]"
                  >
                    <option value="cash">Cash</option>
                    <option value="online">Online</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Amount paid</label>
                  <input
                    type="number"
                    min={0}
                    value={form.amountPaid}
                    onChange={(e) => setForm((f) => ({ ...f, amountPaid: Number(e.target.value) }))}
                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#ff6b35]"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Status</label>
                  <div className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white">
                    {computed.paymentStatus}
                  </div>
                </div>
              </div>
            </div>

            {/* BILLING SUMMARY */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rate</div>
                <div className="mt-1 text-lg font-black">₹{computed.rate}/hr/player</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Time Played</div>
                <div className="mt-1 text-lg font-black">{computed.totalTimePlayed}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Amount</div>
                <div className="mt-1 text-lg font-black">₹{computed.totalAmount}</div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end">
              <button
                onClick={startSession}
                className="px-6 py-3 rounded-xl bg-[#ff6b35] text-black text-xs font-black uppercase tracking-widest hover:bg-[#ff6b35]/90 transition-colors"
              >
                Save Session
              </button>
            </div>
          </div>
        </section>

        {/* BOTTOM: Today's sessions table */}
        <section className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Today’s Sessions</h2>
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Customer</th>
                    <th className="text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Source</th>
                    <th className="text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Device</th>
                    <th className="text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">In Time</th>
                    <th className="text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Out Time</th>
                    <th className="text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Total Time Played</th>
                    <th className="text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                    <th className="text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Payment</th>
                    <th className="text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="px-5 py-8 text-slate-400">
                        Loading…
                      </td>
                    </tr>
                  ) : todaysSessions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-5 py-8 text-slate-400">
                        No sessions found.
                      </td>
                    </tr>
                  ) : (
                    todaysSessions.map((s) => {
                      const status = mapSessionStatus(s);
                      const source = s.source || "online";

                      const inIso = s.inTime || s.slotStart;
                      const outIso = s.outTime || s.slotEnd;
                      const totalPlayed = msToHuman(new Date(outIso).getTime() - new Date(inIso).getTime());

                      const paymentText =
                        s.paymentMethod && typeof s.amountPaid === "number"
                          ? `${s.paymentMethod.toUpperCase()} • ₹${s.amountPaid} • ${s.paymentStatus === "paid" ? "Fully Paid" : "Partial"}`
                          : "—";

                      const badge =
                        status === "active"
                          ? "bg-[#ff6b35]/10 text-[#ff6b35] border-[#ff6b35]/30"
                          : status === "scheduled"
                            ? "bg-white/5 text-slate-200 border-white/10"
                            : status === "completed"
                              ? "bg-green-500/10 text-green-400 border-green-500/20"
                              : "bg-red-500/10 text-red-400 border-red-500/20";

                      return (
                        <tr key={s._id} className="border-t border-white/5">
                          <td className="px-5 py-4">
                            <div className="text-white font-bold">{s.userName || "Player"}</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{s.userContact || s.contactNumber || ""}</div>
                          </td>
                          <td className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-300">{source}</td>
                          <td className="px-5 py-4 font-black uppercase tracking-widest">{s.device}</td>
                          <td className="px-5 py-4 text-slate-200">{formatDateTime(inIso)}</td>
                          <td className="px-5 py-4 text-slate-200">{formatDateTime(outIso)}</td>
                          <td className="px-5 py-4 text-slate-200">{Number.isFinite(new Date(outIso).getTime() - new Date(inIso).getTime()) ? totalPlayed : "–"}</td>
                          <td className="px-5 py-4 text-slate-200 font-bold">₹{s.totalPrice}</td>
                          <td className="px-5 py-4 text-slate-200 text-[10px] font-black uppercase tracking-widest">{paymentText}</td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-md border text-[10px] font-black uppercase tracking-widest ${badge}`}>
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
