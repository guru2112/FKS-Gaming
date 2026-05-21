"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/apiClient";

const DEVICES: Array<"PS1" | "PS2" | "PS3" | "SIM1"> = ["PS1", "PS2", "PS3", "SIM1"];

const DEVICE_RATES: Record<"PS1" | "PS2" | "PS3" | "SIM1", number> = {
  PS1: 60,
  PS2: 60,
  PS3: 60,
  SIM1: 100,
};

function msToHuman(ms: number) {
  const clamped = Math.max(0, ms);
  const totalMinutes = Math.floor(clamped / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

export default function AdminWalkInsPage() {
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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

    return {
      rate,
      totalTimePlayed: safeMs > 0 ? msToHuman(safeMs) : "–",
      totalAmount: Number.isFinite(total) ? total : 0,
      paymentStatus: paid >= (Number.isFinite(total) ? total : 0) ? "Fully Paid" : "Partial Payment",
    };
  }, [form.amountPaid, form.device, form.inTime, form.outTime, form.players]);

  async function saveWalkIn() {
    try {
      setError(null);
      setSuccess(null);
      setSaving(true);

      if (!form.customerName.trim() || !form.phoneNumber.trim()) {
        throw new Error("Customer name and phone number are required.");
      }

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

      setSuccess("Walk-in session saved successfully.");
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
    } catch (e: any) {
      setError(e?.message || "Failed to save walk-in session");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 sm:p-6 lg:p-8 selection:bg-[#ff6b35] selection:text-[#050505] relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 left-1/4 h-[500px] w-[500px] rounded-full bg-[#ff6b35]/5 blur-[150px]" />
        <div className="absolute top-1/2 right-[-100px] h-[400px] w-[400px] rounded-full bg-neo-cyan/5 blur-[150px]" />
      </div>

      <div className="max-w-[1100px] mx-auto relative z-10 space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#ff6b35] drop-shadow-md">Admin</p>
            <h1 className="text-3xl sm:text-4xl font-display font-black text-white mt-1 uppercase tracking-tight">Walk-In Entry</h1>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Save offline sessions without changing the online schedule.
            </p>
          </div>
          <button
            onClick={() => router.push("/admin")}
            className="bg-white/5 border border-white/10 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-all shadow-sm"
          >
            Back to Admin
          </button>
        </header>

        {(error || success) && (
          <div
            className={`rounded-2xl border px-5 py-4 text-xs font-bold uppercase tracking-widest ${
              error
                ? "border-red-500/30 bg-red-500/10 text-red-200"
                : "border-green-500/30 bg-green-500/10 text-green-200"
            }`}
          >
            {error || success}
          </div>
        )}

        <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Walk-In Customer</h2>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Customer name</label>
              <input
                value={form.customerName}
                onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#ff6b35]"
                placeholder="Customer Name"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Phone number</label>
              <input
                value={form.phoneNumber}
                onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#ff6b35]"
                placeholder="Contact Number"
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
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Game (optional)</label>
              <input
                value={form.game}
                onChange={(e) => setForm((f) => ({ ...f, game: e.target.value }))}
                className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#ff6b35]"
                placeholder="FIFA / Cricket / etc"
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
              <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Leave empty to use now.</p>
            </div>

            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Out time</label>
              <input
                type="datetime-local"
                value={form.outTime}
                onChange={(e) => setForm((f) => ({ ...f, outTime: e.target.value }))}
                className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#ff6b35]"
              />
              <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Required.</p>
            </div>
          </div>

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

          <div className="mt-8 flex items-center justify-end">
            <button
              onClick={saveWalkIn}
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-[#ff6b35] text-black text-xs font-black uppercase tracking-widest hover:bg-[#ff6b35]/90 transition-colors disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Walk-In"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
