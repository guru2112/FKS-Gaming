"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import DurationPicker from "@/components/DurationPicker";
import { api } from "@/lib/apiClient";

const DEVICES = ["PS1", "PS2", "PS3", "SIM1"] as const;

const DEVICE_RATES: Record<string, number> = {
  PS1: 60,
  PS2: 60,
  PS3: 60,
  SIM1: 100,
};

const DURATION_OPTIONS = [
  { label: "1 Hr", hours: 1 },
  { label: "1.5 Hr", hours: 1.5 },
  { label: "2 Hr", hours: 2 },
  { label: "2.5 Hr", hours: 2.5 },
  { label: "3 Hr", hours: 3 },
  { label: "3.5 Hr", hours: 3.5 },
  { label: "4 Hr", hours: 4 },
  { label: "4.5 Hr", hours: 4.5 },
  { label: "5 Hr", hours: 5 },
];

interface QuickStartWalkInProps {
  occupiedDevices: string[];
  onStarted: () => void;
}

export default function QuickStartWalkIn({ occupiedDevices, onStarted }: QuickStartWalkInProps) {
  const [device, setDevice] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [players, setPlayers] = useState(1);
  const [duration, setDuration] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedRate = device ? DEVICE_RATES[device] || 60 : 60;
  const effectiveHours = duration === 0 ? 1 : (duration || 0);
  const estimatedCost = players * selectedRate * effectiveHours;

  async function handleStart() {
    setError(null);

    if (!device) { setError("Select a device."); return; }
    if (!name.trim()) { setError("Customer name is required."); return; }
    if (!phone.trim()) { setError("Phone number is required."); return; }
    if (duration === null) { setError("Duration is required."); return; }

    setSaving(true);
    try {
      const now = new Date();
      const outTime = new Date(now.getTime() + duration * 60 * 60 * 1000);

      await api.post("/api/admin/sessions/start", {
        customerName: name.trim(),
        phoneNumber: phone.trim(),
        device,
        game: "",
        players,
        companions: [],
        inTime: now.toISOString(),
        outTime: outTime.toISOString(),
        paymentMethod: "cash",
        amountPaid: 0,
      });

      // Reset form
      setDevice(null);
      setName("");
      setPhone("");
      setPlayers(1);
      setDuration(1);
      setError(null);
      onStarted();
    } catch (e: any) {
      setError(e?.message || "Failed to start session.");
    } finally {
      setSaving(false);
    }
  }

  const clipPathStyle = { clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" };

  return (
    <div className="rounded-3xl border border-black/5 bg-white/80 backdrop-blur-sm p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display text-lg font-black uppercase text-[#1A1A1A] tracking-wide">Quick Walk-In</h3>
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#ff6b35]">Start Now</span>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600">
          {error}
        </div>
      )}

      {/* Device Selection */}
      <div className="mb-5">
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2.5">Select Device</label>
        <div className="grid grid-cols-4 gap-3">
          {DEVICES.map((d) => {
            const isOccupied = occupiedDevices.includes(d);
            const isSelected = device === d;
            return (
              <button
                key={d}
                disabled={isOccupied}
                onClick={() => setDevice(d)}
                style={clipPathStyle}
                className={`py-3.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                  isOccupied
                    ? "bg-slate-100 text-slate-400 border border-dashed border-slate-200 cursor-not-allowed"
                    : isSelected
                      ? "bg-[#ff6b35] text-white shadow-[0_0_15px_rgba(255,107,53,0.25)]"
                      : "bg-slate-50 text-slate-700 border border-black/5 hover:border-[#ff6b35]/30 hover:text-[#ff6b35]"
                }`}
              >
                {d}
                {isOccupied && <span className="block text-[8px] mt-0.5">Busy</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Name + Phone */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white border border-black/5 rounded-xl px-4 py-3 text-sm text-[#1A1A1A] outline-none focus:border-[#ff6b35] placeholder:text-slate-300"
            placeholder="Customer name"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Phone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-white border border-black/5 rounded-xl px-4 py-3 text-sm text-[#1A1A1A] outline-none focus:border-[#ff6b35] placeholder:text-slate-300"
            placeholder="Phone number"
          />
        </div>
      </div>

      {/* Players + Duration */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Players</label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPlayers(Math.max(1, players - 1))}
              className="w-10 h-10 rounded-xl bg-slate-50 border border-black/5 text-slate-700 font-bold text-lg hover:bg-slate-100 transition-colors"
            >
              −
            </button>
            <span className="font-display text-2xl font-black text-[#1A1A1A] tabular-nums w-8 text-center">{players}</span>
            <button
              onClick={() => setPlayers(Math.min(4, players + 1))}
              className="w-10 h-10 rounded-xl bg-slate-50 border border-black/5 text-slate-700 font-bold text-lg hover:bg-slate-100 transition-colors"
            >
              +
            </button>
          </div>
          <div className="mt-2 text-[9px] text-[#ff6b35] font-bold">
            Note: For a single console you can only select up to 4 players.
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Duration</label>
          <DurationPicker 
            value={duration ?? 1} 
            onChange={setDuration} 
            theme="light" 
          />
        </div>
      </div>

      {/* Price Estimate */}
      {device && (
        <div className="mb-5 rounded-2xl bg-[#ff6b35]/5 border border-[#ff6b35]/15 px-4 py-3 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            {players} player{players > 1 ? "s" : ""} × ₹{selectedRate}/hr × {duration}hr
          </span>
          <span className="font-display text-xl font-black text-[#ff6b35]">₹{estimatedCost}</span>
        </div>
      )}

      {device && duration === 0 && (
        <div className="mb-5 rounded-2xl bg-[#ff6b35]/5 border border-[#ff6b35]/15 px-4 py-3 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Open-ended • ₹{selectedRate}/hr/player
          </span>
          <span className="font-display text-sm font-bold text-slate-500">Bill on end</span>
        </div>
      )}

      {/* Start Button */}
      <button
        onClick={handleStart}
        disabled={saving}
        style={clipPathStyle}
        className="w-full py-4 text-sm font-black uppercase tracking-widest bg-[#1A1A1A] text-white hover:bg-[#ff6b35] transition-all shadow-[0_0_15px_rgba(0,0,0,0.10)] hover:shadow-[0_0_20px_rgba(255,107,53,0.25)] disabled:opacity-60"
      >
        {saving ? "Starting…" : "▶ Start Now"}
      </button>
    </div>
  );
}
