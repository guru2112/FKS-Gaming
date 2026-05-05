"use client";
import { useState } from "react";
import { API_BASE_URL } from "@/lib/auth";

export default function BookingPage() {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    device: "PS1",
    duration: 1,
    dateTime: ""
  });
  const [playerCount, setPlayerCount] = useState(1);
  const [additionalPlayers, setAdditionalPlayers] = useState<{ name: string; phone: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count);
    const additionalCount = Math.max(0, count - 1);
    const newPlayers = Array.from({ length: additionalCount }, () => ({ name: "", phone: "" }));
    setAdditionalPlayers(newPlayers);
  };

  const updateCompanion = (index: number, field: "name" | "phone", value: string) => {
    const updated = [...additionalPlayers];
    updated[index][field] = value;
    setAdditionalPlayers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const bookingPayload = {
      device: formData.device,
      slotStart: formData.dateTime,
      durationHours: Number(formData.duration),
      players: playerCount,
      contactNumber: formData.contact,
      userName: formData.name,
      companions: additionalPlayers // Array of { name, phone }
    };

    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(bookingPayload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Booking failed");

      alert("Booking successful! Check your email for the QR code.");
      window.location.href = "/dashboard";
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#ffe9d6,#ffffff_55%)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-orange-500">Booking</p>
            <h1 className="font-display text-4xl text-slate-900 sm:text-5xl">Reserve your gaming slot</h1>
            <p className="mt-3 text-slate-500">
              Enter the session details and add every player name and contact number.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Select PS Console</label>
                  <select
                    value={formData.device}
                    onChange={(e) => setFormData({ ...formData, device: e.target.value })}
                    className="w-full rounded-2xl border-slate-200 bg-slate-50 p-3 outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="PS1">PS1 (Standard)</option>
                    <option value="PS2">PS2 (Pro)</option>
                    <option value="PS3">PS3 (VIP)</option>
                    <option value="SIM1">Racing Simulator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Duration (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                    className="w-full rounded-2xl border-slate-200 bg-slate-50 p-3 outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.dateTime}
                    onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                    className="w-full rounded-2xl border-slate-200 bg-slate-50 p-3 outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Total Players</label>
                  <select
                    value={playerCount}
                    onChange={(e) => handlePlayerCountChange(parseInt(e.target.value))}
                    className="w-full rounded-2xl border-slate-200 bg-slate-50 p-3 outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="1">1 Player (Solo)</option>
                    <option value="2">2 Players</option>
                    <option value="3">3 Players</option>
                    <option value="4">4 Players</option>
                    <option value="5">5 Players</option>
                  </select>
                  <p className="mt-2 text-xs text-slate-500">Every player must have a name and contact number.</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-orange-500 py-4 font-bold uppercase tracking-widest text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600 disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Confirm Booking"}
                </button>
              </div>

              <div className="space-y-6">
                <div className="rounded-[24px] border border-orange-100 bg-orange-50/60 p-6">
                  <h2 className="font-display text-2xl text-slate-900">Primary player</h2>
                  <p className="mt-2 text-sm text-slate-500">This is the main contact for the booking.</p>
                  <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Your Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full rounded-2xl border-slate-200 bg-white p-3 outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Kamlesh Solaskar"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Contact Number</label>
                      <input
                        type="tel"
                        required
                        value={formData.contact}
                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                        className="w-full rounded-2xl border-slate-200 bg-white p-3 outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="+91 ..."
                      />
                    </div>
                  </div>
                </div>

                {additionalPlayers.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-display text-2xl text-slate-900">Additional players</h3>
                    {additionalPlayers.map((player, index) => (
                      <div key={index} className="rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-orange-600">Player {index + 2}</p>
                        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                          <input
                            type="text"
                            required
                            placeholder="Name"
                            value={player.name}
                            onChange={(e) => updateCompanion(index, "name", e.target.value)}
                            className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:ring-2 focus:ring-orange-500"
                          />
                          <input
                            type="tel"
                            required
                            placeholder="Contact Number"
                            value={player.phone}
                            onChange={(e) => updateCompanion(index, "phone", e.target.value)}
                            className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </form>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-display text-2xl text-slate-900">What you get</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li>Private screen time on your chosen console.</li>
                <li>QR entry pass sent to your email.</li>
                <li>Friendly staff support throughout the session.</li>
              </ul>
            </div>
            <div className="rounded-[28px] border border-orange-100 bg-orange-50/70 p-6">
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-orange-600">Need help?</p>
              <p className="mt-3 text-sm text-slate-600">
                Call us after booking if you want to add snacks, drinks, or equipment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}