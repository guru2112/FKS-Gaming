"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createAdminBooking,
  createCombo,
  deleteAdminBooking,
  deleteAdminUser,
  deleteCombo,
  fetchAdminBookings,
  fetchAdminCombos,
  fetchAdminOverview,
  fetchAdminUsers,
  updateAdminBooking,
  updateAdminUser,
  updateCombo,
  type AdminBooking,
  type AdminOverview,
  type AdminUser,
  type Combo,
} from "@/lib/auth";

type TabKey = "overview" | "users" | "bookings" | "combos";

const tabLabels: Record<TabKey, string> = {
  overview: "Overview",
  users: "Users",
  bookings: "Bookings",
  combos: "Combos",
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [userEditId, setUserEditId] = useState<string | null>(null);
  const [userEditValues, setUserEditValues] = useState({
    name: "",
    email: "",
    planId: "",
  });

  const [bookingForm, setBookingForm] = useState({
    userId: "",
    game: "",
    slotStart: "",
    durationHours: "2",
    device: "PS1",
    players: "1",
    status: "upcoming",
  });

  const [comboForm, setComboForm] = useState({
    name: "",
    items: "",
    price: "499",
    durationHours: "2",
    description: "",
    isActive: true,
  });

  const token = useMemo(() => localStorage.getItem("auth_token"), []);
  const role = useMemo(() => localStorage.getItem("auth_role"), []);

  useEffect(() => {
    if (!token || role !== "admin") {
      window.location.href = "/login";
      return;
    }

    async function loadAdmin() {
      try {
        setIsLoading(true);
        const [overviewData, usersData, bookingData, comboData] = await Promise.all([
          fetchAdminOverview(token),
          fetchAdminUsers(token),
          fetchAdminBookings(token),
          fetchAdminCombos(token),
        ]);
        setOverview(overviewData);
        setUsers(usersData);
        setBookings(bookingData);
        setCombos(comboData);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load admin data.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    }

    loadAdmin();
  }, [token, role]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:px-16">
          <p className="text-sm uppercase tracking-[0.3em] text-orange-300">Loading</p>
          <h1 className="font-display mt-4 text-4xl">Admin console loading...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:px-16">
          <p className="text-sm uppercase tracking-[0.3em] text-orange-300">Error</p>
          <h1 className="font-display mt-4 text-4xl">{error}</h1>
          <a href="/login" className="mt-6 inline-flex text-orange-200">
            Back to login
          </a>
        </div>
      </div>
    );
  }

  async function refreshUsers() {
    if (!token) return;
    const data = await fetchAdminUsers(token);
    setUsers(data);
  }

  async function refreshBookings() {
    if (!token) return;
    const data = await fetchAdminBookings(token);
    setBookings(data);
  }

  async function refreshCombos() {
    if (!token) return;
    const data = await fetchAdminCombos(token);
    setCombos(data);
  }

  async function handleUserUpdate() {
    if (!token || !userEditId) return;
    await updateAdminUser(token, userEditId, {
      name: userEditValues.name || undefined,
      email: userEditValues.email || undefined,
      planId: userEditValues.planId || null,
    });
    setUserEditId(null);
    setUserEditValues({ name: "", email: "", planId: "" });
    await refreshUsers();
  }

  async function handleUserDelete(id: string) {
    if (!token) return;
    await deleteAdminUser(token, id);
    await refreshUsers();
  }

  async function handleBookingCreate() {
    if (!token) return;
    await createAdminBooking(token, {
      userId: bookingForm.userId,
      game: bookingForm.game || undefined,
      slotStart: bookingForm.slotStart,
      durationHours: Number(bookingForm.durationHours),
      device: bookingForm.device as "PS1" | "PS2" | "PS3" | "SIM1",
      players: Number(bookingForm.players),
      status: bookingForm.status as "upcoming" | "completed" | "cancelled",
    });
    setBookingForm({
      userId: "",
      game: "",
      slotStart: "",
      durationHours: "2",
      device: "PS1",
      players: "1",
      status: "upcoming",
    });
    await refreshBookings();
  }

  async function handleBookingUpdate(id: string, status: AdminBooking["status"]) {
    if (!token) return;
    await updateAdminBooking(token, id, { status });
    await refreshBookings();
  }

  async function handleBookingDelete(id: string) {
    if (!token) return;
    await deleteAdminBooking(token, id);
    await refreshBookings();
  }

  async function handleComboCreate() {
    if (!token) return;
    await createCombo(token, {
      name: comboForm.name,
      items: comboForm.items
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      price: Number(comboForm.price),
      durationHours: Number(comboForm.durationHours),
      description: comboForm.description,
      isActive: comboForm.isActive,
    });
    setComboForm({
      name: "",
      items: "",
      price: "499",
      durationHours: "2",
      description: "",
      isActive: true,
    });
    await refreshCombos();
  }

  async function handleComboToggle(combo: Combo) {
    if (!token) return;
    await updateCombo(token, combo._id, { isActive: !combo.isActive });
    await refreshCombos();
  }

  async function handleComboDelete(id: string) {
    if (!token) return;
    await deleteCombo(token, id);
    await refreshCombos();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-80">
          <div className="absolute -top-24 left-1/2 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-orange-500/30 blur-[120px]" />
          <div className="absolute right-[-120px] top-32 h-[320px] w-[320px] rounded-full bg-pink-500/20 blur-[140px]" />
        </div>

        <main className="relative z-10 mx-auto max-w-6xl px-4 py-12 sm:px-6 md:px-16">
          <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-orange-300">Admin</p>
              <h1 className="font-display text-4xl text-white sm:text-5xl">
                JKS Arena Control Room
              </h1>
              <p className="mt-3 text-slate-300">
                Manage users, bookings, and combos from one console.
              </p>
            </div>
            <div className="surface-panel rounded-3xl px-6 py-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Access</p>
              <p className="mt-2 text-lg text-white">Administrator</p>
            </div>
          </header>

          <nav className="mt-10 flex flex-wrap gap-3">
            {(Object.keys(tabLabels) as TabKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`rounded-full px-5 py-2 text-xs uppercase tracking-[0.2em] transition ${
                  activeTab === key
                    ? "bg-orange-500 text-slate-950"
                    : "border border-slate-700 text-slate-200"
                }`}
              >
                {tabLabels[key]}
              </button>
            ))}
          </nav>

          {activeTab === "overview" && (
            <section className="mt-10 grid gap-6 md:grid-cols-3">
              <div className="surface-panel rounded-3xl p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Users</p>
                <p className="mt-4 text-4xl font-semibold text-white">{overview?.users ?? 0}</p>
              </div>
              <div className="surface-panel rounded-3xl p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Bookings</p>
                <p className="mt-4 text-4xl font-semibold text-white">
                  {overview?.bookings ?? 0}
                </p>
              </div>
              <div className="surface-panel rounded-3xl p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Combos</p>
                <p className="mt-4 text-4xl font-semibold text-white">{overview?.combos ?? 0}</p>
              </div>
            </section>
          )}

          {activeTab === "users" && (
            <section className="mt-10 grid gap-6">
              <div className="surface-panel rounded-3xl p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Edit user</p>
                <div className="mt-4 grid gap-4 md:grid-cols-4">
                  <input
                    value={userEditId ?? ""}
                    onChange={(event) => setUserEditId(event.target.value)}
                    placeholder="User ID"
                    className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm"
                  />
                  <input
                    value={userEditValues.name}
                    onChange={(event) =>
                      setUserEditValues((prev) => ({ ...prev, name: event.target.value }))
                    }
                    placeholder="Name"
                    className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm"
                  />
                  <input
                    value={userEditValues.email}
                    onChange={(event) =>
                      setUserEditValues((prev) => ({ ...prev, email: event.target.value }))
                    }
                    placeholder="Email"
                    className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm"
                  />
                  <input
                    value={userEditValues.planId}
                    onChange={(event) =>
                      setUserEditValues((prev) => ({ ...prev, planId: event.target.value }))
                    }
                    placeholder="Plan ID"
                    className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm"
                  />
                </div>
                <button
                  onClick={handleUserUpdate}
                  className="mt-4 rounded-full bg-orange-500 px-5 py-2 text-xs uppercase tracking-[0.2em] text-slate-950"
                >
                  Update user
                </button>
              </div>

              <div className="surface-panel rounded-3xl p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">All users</p>
                <div className="mt-4 grid gap-4">
                  {users.map((user) => (
                    <div
                      key={user._id}
                      className="flex flex-col gap-2 rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="text-sm text-slate-100">{user.name}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                          {user.planId ? "Plan set" : "No plan"}
                        </span>
                        <button
                          onClick={() => handleUserDelete(user._id)}
                          className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {activeTab === "bookings" && (
            <section className="mt-10 grid gap-6">
              <div className="surface-panel rounded-3xl p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Create booking</p>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <input
                    value={bookingForm.userId}
                    onChange={(event) =>
                      setBookingForm((prev) => ({ ...prev, userId: event.target.value }))
                    }
                    placeholder="User ID"
                    className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm"
                  />
                  <input
                    value={bookingForm.game}
                    onChange={(event) =>
                      setBookingForm((prev) => ({ ...prev, game: event.target.value }))
                    }
                    placeholder="Game"
                    className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm"
                  />
                  <input
                    type="datetime-local"
                    value={bookingForm.slotStart}
                    onChange={(event) =>
                      setBookingForm((prev) => ({ ...prev, slotStart: event.target.value }))
                    }
                    className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm"
                  />
                  <input
                    value={bookingForm.durationHours}
                    onChange={(event) =>
                      setBookingForm((prev) => ({ ...prev, durationHours: event.target.value }))
                    }
                    placeholder="Duration"
                    className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm"
                  />
                  <select
                    value={bookingForm.device}
                    onChange={(event) =>
                      setBookingForm((prev) => ({ ...prev, device: event.target.value }))
                    }
                    className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm"
                  >
                    <option value="PS1">PS1</option>
                    <option value="PS2">PS2</option>
                    <option value="PS3">PS3</option>
                    <option value="SIM1">Driving Simulator</option>
                  </select>
                  <input
                    value={bookingForm.players}
                    onChange={(event) =>
                      setBookingForm((prev) => ({ ...prev, players: event.target.value }))
                    }
                    placeholder="Players"
                    className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm"
                  />
                </div>
                <button
                  onClick={handleBookingCreate}
                  className="mt-4 rounded-full bg-orange-500 px-5 py-2 text-xs uppercase tracking-[0.2em] text-slate-950"
                >
                  Create booking
                </button>
              </div>

              <div className="surface-panel rounded-3xl p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">All bookings</p>
                <div className="mt-4 grid gap-4">
                  {bookings.map((booking) => (
                    <div
                      key={booking._id}
                      className="flex flex-col gap-4 rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                          <p className="text-sm text-slate-100">
                            {booking.device} {booking.game ? `· ${booking.game}` : ""}
                          </p>
                        <p className="text-xs text-slate-400">
                          {booking.userId?.email || "User"} · {new Date(booking.slotStart).toLocaleString()}
                        </p>
                          <p className="text-xs text-slate-500">
                            {booking.players} players · Rs {booking.totalPrice}
                          </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <select
                          value={booking.status}
                          onChange={(event) =>
                            handleBookingUpdate(
                              booking._id,
                              event.target.value as AdminBooking["status"]
                            )
                          }
                          className="rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-200"
                        >
                          <option value="upcoming">upcoming</option>
                          <option value="completed">completed</option>
                          <option value="cancelled">cancelled</option>
                        </select>
                        <button
                          onClick={() => handleBookingDelete(booking._id)}
                          className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {activeTab === "combos" && (
            <section className="mt-10 grid gap-6">
              <div className="surface-panel rounded-3xl p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Create combo</p>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <input
                    value={comboForm.name}
                    onChange={(event) =>
                      setComboForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                    placeholder="Combo name"
                    className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm"
                  />
                  <input
                    value={comboForm.items}
                    onChange={(event) =>
                      setComboForm((prev) => ({ ...prev, items: event.target.value }))
                    }
                    placeholder="Items (comma separated)"
                    className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm"
                  />
                  <input
                    value={comboForm.price}
                    onChange={(event) =>
                      setComboForm((prev) => ({ ...prev, price: event.target.value }))
                    }
                    placeholder="Price"
                    className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm"
                  />
                  <input
                    value={comboForm.durationHours}
                    onChange={(event) =>
                      setComboForm((prev) => ({ ...prev, durationHours: event.target.value }))
                    }
                    placeholder="Duration hours"
                    className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm"
                  />
                  <input
                    value={comboForm.description}
                    onChange={(event) =>
                      setComboForm((prev) => ({ ...prev, description: event.target.value }))
                    }
                    placeholder="Description"
                    className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm"
                  />
                </div>
                <button
                  onClick={handleComboCreate}
                  className="mt-4 rounded-full bg-orange-500 px-5 py-2 text-xs uppercase tracking-[0.2em] text-slate-950"
                >
                  Create combo
                </button>
              </div>

              <div className="surface-panel rounded-3xl p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">All combos</p>
                <div className="mt-4 grid gap-4">
                  {combos.map((combo) => (
                    <div
                      key={combo._id}
                      className="flex flex-col gap-3 rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="text-sm text-slate-100">{combo.name}</p>
                        <p className="text-xs text-slate-400">
                          {combo.items.join(", ") || "No items"}
                        </p>
                        <p className="text-xs text-slate-500">
                          Rs {combo.price} · {combo.durationHours} hours
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleComboToggle(combo)}
                          className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-200"
                        >
                          {combo.isActive ? "Disable" : "Enable"}
                        </button>
                        <button
                          onClick={() => handleComboDelete(combo._id)}
                          className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
