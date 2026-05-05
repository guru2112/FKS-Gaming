"use client";

import { useEffect, useState } from "react";
import {
  createAdminBooking,
  createAdminMedia,
  createCombo,
  deleteAdminBooking,
  deleteAdminMedia,
  deleteAdminUser,
  deleteCombo,
  fetchAdminBookings,
  fetchAdminMedia,
  fetchAdminCombos,
  fetchAdminOverview,
  fetchAdminUsers,
  updateAdminBooking,
  updateAdminMedia,
  updateAdminUser,
  updateCombo,
  type AdminBooking,
  type AdminOverview,
  type AdminUser,
  type Combo,
  type MediaCategory,
  type MediaItem,
} from "@/lib/auth";

type TabKey = "overview" | "users" | "bookings" | "combos" | "media";

const tabLabels: Record<TabKey, string> = {
  overview: "Overview",
  users: "Users",
  bookings: "Bookings",
  combos: "Combos",
  media: "Media",
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [mediaError, setMediaError] = useState<string | null>(null);
  const [mediaBusy, setMediaBusy] = useState(false);

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
    contactNumber: "",
    companions: [] as Array<{ name: string; phone: string }>,
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

  const [mediaForm, setMediaForm] = useState({
    title: "",
    description: "",
    category: "Games" as MediaCategory,
    price: "",
    flavor: "",
    packSize: "",
    itemType: "",
    imageFile: null as File | null,
  });

  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaEditId, setMediaEditId] = useState<string | null>(null);
  const [mediaEditValues, setMediaEditValues] = useState({
    title: "",
    description: "",
    category: "Games" as MediaCategory,
    price: "",
    flavor: "",
    packSize: "",
    itemType: "",
  });
  const [mediaEditFile, setMediaEditFile] = useState<File | null>(null);

  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    setToken(localStorage.getItem("auth_token"));
    setRole(localStorage.getItem("auth_role"));
    setSessionReady(true);
  }, []);

  useEffect(() => {
    if (!sessionReady) {
      return;
    }

    if (!token || role !== "admin") {
      window.location.href = "/login";
      return;
    }

    async function loadAdmin() {
      try {
        setIsLoading(true);
        const [overviewData, usersData, bookingData, comboData, mediaData] = await Promise.all([
          fetchAdminOverview(token),
          fetchAdminUsers(token),
          fetchAdminBookings(token),
          fetchAdminCombos(token),
          fetchAdminMedia(token),
        ]);
        setOverview(overviewData);
        setUsers(usersData);
        setBookings(bookingData);
        setCombos(comboData);
        setMediaItems(mediaData);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load admin data.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    }

    loadAdmin();
  }, [sessionReady, token, role]);

  useEffect(() => {
    if (!mediaForm.imageFile) {
      setMediaPreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(mediaForm.imageFile);
    setMediaPreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [mediaForm.imageFile]);

  if (isLoading) {
    return (
      <div className="min-h-screen text-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:px-16">
          <p className="text-sm uppercase tracking-[0.3em] text-orange-600">Loading</p>
          <h1 className="font-display mt-4 text-4xl">Admin console loading...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen text-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:px-16">
          <p className="text-sm uppercase tracking-[0.3em] text-orange-600">Error</p>
          <h1 className="font-display mt-4 text-4xl">{error}</h1>
          <a href="/login" className="mt-6 inline-flex text-orange-600">
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

  async function refreshMedia() {
    if (!token) return;
    const data = await fetchAdminMedia(token);
    setMediaItems(data);
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
      contactNumber: bookingForm.contactNumber,
      companions: bookingForm.companions,
      status: bookingForm.status as "upcoming" | "completed" | "cancelled",
    });
    setBookingForm({
      userId: "",
      game: "",
      slotStart: "",
      durationHours: "2",
      device: "PS1",
      players: "1",
      contactNumber: "",
      companions: [],
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

  function resetMediaForm() {
    setMediaForm({
      title: "",
      description: "",
      category: "Games",
      price: "",
      flavor: "",
      packSize: "",
      itemType: "",
      imageFile: null,
    });
  }

  async function handleMediaCreate() {
    if (!token) return;
    setMediaError(null);

    if (!mediaForm.title.trim()) {
      setMediaError("Title is required.");
      return;
    }

    if (!mediaForm.imageFile) {
      setMediaError("Image file is required.");
      return;
    }

    if ((mediaForm.category === "Food" || mediaForm.category === "Drinks") && !mediaForm.price.trim()) {
      setMediaError("Price is required for food and drinks.");
      return;
    }

    const payload = new FormData();
    payload.append("title", mediaForm.title.trim());
    payload.append("description", mediaForm.description.trim());
    payload.append("category", mediaForm.category);
    payload.append("image", mediaForm.imageFile);

    if (mediaForm.price.trim()) {
      payload.append("price", mediaForm.price.trim());
    }
    if (mediaForm.flavor.trim()) {
      payload.append("flavor", mediaForm.flavor.trim());
    }
    if (mediaForm.packSize.trim()) {
      payload.append("packSize", mediaForm.packSize.trim());
    }
    if (mediaForm.itemType.trim()) {
      payload.append("itemType", mediaForm.itemType.trim());
    }

    try {
      setMediaBusy(true);
      await createAdminMedia(token, payload);
      resetMediaForm();
      await refreshMedia();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create media item.";
      setMediaError(message);
    } finally {
      setMediaBusy(false);
    }
  }

  function startMediaEdit(item: MediaItem) {
    setMediaEditId(item._id);
    setMediaEditValues({
      title: item.title,
      description: item.description || "",
      category: item.category,
      price: item.price || "",
      flavor: item.flavor || "",
      packSize: item.packSize || "",
      itemType: item.itemType || "",
    });
    setMediaEditFile(null);
  }

  function cancelMediaEdit() {
    setMediaEditId(null);
    setMediaEditValues({
      title: "",
      description: "",
      category: "Games",
      price: "",
      flavor: "",
      packSize: "",
      itemType: "",
    });
    setMediaEditFile(null);
  }

  async function handleMediaUpdate() {
    if (!token || !mediaEditId) return;
    setMediaError(null);

    if (!mediaEditValues.title.trim()) {
      setMediaError("Title is required.");
      return;
    }

    if ((mediaEditValues.category === "Food" || mediaEditValues.category === "Drinks") && !mediaEditValues.price.trim()) {
      setMediaError("Price is required for food and drinks.");
      return;
    }

    const payload = new FormData();
    payload.append("title", mediaEditValues.title.trim());
    payload.append("description", mediaEditValues.description.trim());
    payload.append("category", mediaEditValues.category);
    payload.append("price", mediaEditValues.price.trim());
    payload.append("flavor", mediaEditValues.flavor.trim());
    payload.append("packSize", mediaEditValues.packSize.trim());
    payload.append("itemType", mediaEditValues.itemType.trim());

    if (mediaEditFile) {
      payload.append("image", mediaEditFile);
    }

    try {
      setMediaBusy(true);
      await updateAdminMedia(token, mediaEditId, payload);
      cancelMediaEdit();
      await refreshMedia();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update media item.";
      setMediaError(message);
    } finally {
      setMediaBusy(false);
    }
  }

  async function handleMediaDelete(id: string) {
    if (!token) return;
    setMediaError(null);
    try {
      setMediaBusy(true);
      await deleteAdminMedia(token, id);
      await refreshMedia();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete media item.";
      setMediaError(message);
    } finally {
      setMediaBusy(false);
    }
  }

  return (
    <div className="min-h-screen text-slate-900">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-80">
          <div className="absolute -top-24 left-1/2 h-90 w-90 -translate-x-1/2 rounded-full bg-orange-300/60 blur-[140px]" />
          <div className="absolute -right-30 top-32 h-80 w-80 rounded-full bg-cyan-300/45 blur-[150px]" />
        </div>

        <main className="relative z-10 mx-auto max-w-6xl px-4 py-12 sm:px-6 md:px-16">
          <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-orange-600">Admin</p>
              <h1 className="font-display text-4xl text-slate-900 sm:text-5xl">
                JKS Arena Control Room
              </h1>
              <p className="mt-3 text-slate-600">
                Manage users, bookings, and combos from one console.
              </p>
            </div>
            <div className="surface-panel rounded-3xl px-6 py-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Access</p>
              <p className="mt-2 text-lg text-slate-900">Administrator</p>
            </div>
          </header>

          <nav className="mt-10 flex flex-wrap gap-3">
            {(Object.keys(tabLabels) as TabKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`rounded-full px-5 py-2 text-xs uppercase tracking-[0.2em] transition ${
                  activeTab === key
                    ? "bg-orange-500 text-white"
                    : "border border-slate-300 text-slate-700"
                }`}
              >
                {tabLabels[key]}
              </button>
            ))}
          </nav>

          {activeTab === "overview" && (
            <section className="mt-10 grid gap-6 md:grid-cols-3">
              <div className="surface-panel rounded-3xl p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Users</p>
                <p className="mt-4 text-4xl font-semibold text-slate-900">{overview?.users ?? 0}</p>
              </div>
              <div className="surface-panel rounded-3xl p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Bookings</p>
                <p className="mt-4 text-4xl font-semibold text-slate-900">
                  {overview?.bookings ?? 0}
                </p>
              </div>
              <div className="surface-panel rounded-3xl p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Combos</p>
                <p className="mt-4 text-4xl font-semibold text-slate-900">{overview?.combos ?? 0}</p>
              </div>
            </section>
          )}

          {activeTab === "users" && (
            <section className="mt-10 grid gap-6">
              <div className="surface-panel rounded-3xl p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Edit user</p>
                <div className="mt-4 grid gap-4 md:grid-cols-4">
                  <input
                    value={userEditId ?? ""}
                    onChange={(event) => setUserEditId(event.target.value)}
                    placeholder="User ID"
                    className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm"
                  />
                  <input
                    value={userEditValues.name}
                    onChange={(event) =>
                      setUserEditValues((prev) => ({ ...prev, name: event.target.value }))
                    }
                    placeholder="Name"
                    className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm"
                  />
                  <input
                    value={userEditValues.email}
                    onChange={(event) =>
                      setUserEditValues((prev) => ({ ...prev, email: event.target.value }))
                    }
                    placeholder="Email"
                    className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm"
                  />
                  <input
                    value={userEditValues.planId}
                    onChange={(event) =>
                      setUserEditValues((prev) => ({ ...prev, planId: event.target.value }))
                    }
                    placeholder="Plan ID"
                    className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm"
                  />
                </div>
                <button
                  onClick={handleUserUpdate}
                  className="mt-4 rounded-full bg-orange-500 px-5 py-2 text-xs uppercase tracking-[0.2em] text-white"
                >
                  Update user
                </button>
              </div>

              <div className="surface-panel rounded-3xl p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">All users</p>
                <div className="mt-4 grid gap-4">
                  {users.map((user) => (
                    <div
                      key={user._id}
                      className="flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-white/70 p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="text-sm text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-700">
                          {user.planId ? "Plan set" : "No plan"}
                        </span>
                        <button
                          onClick={() => handleUserDelete(user._id)}
                          className="rounded-full border border-slate-300 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-700"
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
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Create booking</p>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <input
                    value={bookingForm.userId}
                    onChange={(event) =>
                      setBookingForm((prev) => ({ ...prev, userId: event.target.value }))
                    }
                    placeholder="User ID"
                    className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm"
                  />
                  <input
                    value={bookingForm.game}
                    onChange={(event) =>
                      setBookingForm((prev) => ({ ...prev, game: event.target.value }))
                    }
                    placeholder="Game"
                    className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm"
                  />
                  <input
                    type="datetime-local"
                    value={bookingForm.slotStart}
                    onChange={(event) =>
                      setBookingForm((prev) => ({ ...prev, slotStart: event.target.value }))
                    }
                    className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm"
                  />
                  <input
                    value={bookingForm.durationHours}
                    onChange={(event) =>
                      setBookingForm((prev) => ({ ...prev, durationHours: event.target.value }))
                    }
                    placeholder="Duration"
                    className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm"
                  />
                  <select
                    value={bookingForm.device}
                    onChange={(event) =>
                      setBookingForm((prev) => ({ ...prev, device: event.target.value }))
                    }
                    className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm"
                  >
                    <option value="PS1">PS1</option>
                    <option value="PS2">PS2</option>
                    <option value="PS3">PS3</option>
                    <option value="SIM1">Driving Simulator</option>
                  </select>
                  <input
                    value={bookingForm.players}
                    onChange={(event) =>
                      setBookingForm((prev) => {
                        const nextPlayers = event.target.value;
                        const totalPlayers = Number(nextPlayers);
                        const companionCount = Number.isNaN(totalPlayers)
                          ? 0
                          : Math.max(totalPlayers - 1, 0);
                        const companions = [...prev.companions];
                        while (companions.length < companionCount) {
                          companions.push({ name: "", phone: "" });
                        }
                        if (companions.length > companionCount) {
                          companions.splice(companionCount);
                        }
                        return { ...prev, players: nextPlayers, companions };
                      })
                    }
                    placeholder="Players"
                    className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm"
                  />
                  <input
                    value={bookingForm.contactNumber}
                    onChange={(event) =>
                      setBookingForm((prev) => ({ ...prev, contactNumber: event.target.value }))
                    }
                    placeholder="Contact number"
                    className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm"
                  />
                </div>
                {bookingForm.companions.length > 0 ? (
                  <div className="mt-4 grid gap-3">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                      Companion details
                    </p>
                    {bookingForm.companions.map((companion, index) => (
                      <div key={`admin-companion-${index}`} className="grid gap-4 sm:grid-cols-2">
                        <input
                          value={companion.name}
                          onChange={(event) =>
                            setBookingForm((prev) => {
                              const companions = [...prev.companions];
                              companions[index] = {
                                ...companions[index],
                                name: event.target.value,
                              };
                              return { ...prev, companions };
                            })
                          }
                          placeholder={`Player ${index + 2} name`}
                          className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm"
                        />
                        <input
                          value={companion.phone}
                          onChange={(event) =>
                            setBookingForm((prev) => {
                              const companions = [...prev.companions];
                              companions[index] = {
                                ...companions[index],
                                phone: event.target.value,
                              };
                              return { ...prev, companions };
                            })
                          }
                          placeholder={`Player ${index + 2} phone`}
                          className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                ) : null}
                <button
                  onClick={handleBookingCreate}
                  className="mt-4 rounded-full bg-orange-500 px-5 py-2 text-xs uppercase tracking-[0.2em] text-white"
                >
                  Create booking
                </button>
              </div>

              <div className="surface-panel rounded-3xl p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">All bookings</p>
                <div className="mt-4 grid gap-4">
                  {bookings.map((booking) => (
                    <div
                      key={booking._id}
                      className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white/70 p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                          <p className="text-sm text-slate-900">
                            {booking.device} {booking.game ? `· ${booking.game}` : ""}
                          </p>
                        <p className="text-xs text-slate-500">
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
                          className="rounded-full border border-slate-300 bg-white/80 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-700"
                        >
                          <option value="upcoming">upcoming</option>
                          <option value="completed">completed</option>
                          <option value="cancelled">cancelled</option>
                        </select>
                        <button
                          onClick={() => handleBookingDelete(booking._id)}
                          className="rounded-full border border-slate-300 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-700"
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
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Create combo</p>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <input
                    value={comboForm.name}
                    onChange={(event) =>
                      setComboForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                    placeholder="Combo name"
                    className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm"
                  />
                  <input
                    value={comboForm.items}
                    onChange={(event) =>
                      setComboForm((prev) => ({ ...prev, items: event.target.value }))
                    }
                    placeholder="Items (comma separated)"
                    className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm"
                  />
                  <input
                    value={comboForm.price}
                    onChange={(event) =>
                      setComboForm((prev) => ({ ...prev, price: event.target.value }))
                    }
                    placeholder="Price"
                    className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm"
                  />
                  <input
                    value={comboForm.durationHours}
                    onChange={(event) =>
                      setComboForm((prev) => ({ ...prev, durationHours: event.target.value }))
                    }
                    placeholder="Duration hours"
                    className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm"
                  />
                  <input
                    value={comboForm.description}
                    onChange={(event) =>
                      setComboForm((prev) => ({ ...prev, description: event.target.value }))
                    }
                    placeholder="Description"
                    className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm"
                  />
                </div>
                <button
                  onClick={handleComboCreate}
                  className="mt-4 rounded-full bg-orange-500 px-5 py-2 text-xs uppercase tracking-[0.2em] text-white"
                >
                  Create combo
                </button>
              </div>

              <div className="surface-panel rounded-3xl p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">All combos</p>
                <div className="mt-4 grid gap-4">
                  {combos.map((combo) => (
                    <div
                      key={combo._id}
                      className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/70 p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="text-sm text-slate-900">{combo.name}</p>
                        <p className="text-xs text-slate-500">
                          {combo.items.join(", ") || "No items"}
                        </p>
                        <p className="text-xs text-slate-500">
                          Rs {combo.price} · {combo.durationHours} hours
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleComboToggle(combo)}
                          className="rounded-full border border-slate-300 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-700"
                        >
                          {combo.isActive ? "Disable" : "Enable"}
                        </button>
                        <button
                          onClick={() => handleComboDelete(combo._id)}
                          className="rounded-full border border-slate-300 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-700"
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

          {activeTab === "media" && (
            <section className="mt-10 grid gap-6">
              <div className="surface-panel rounded-3xl p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Upload media</p>
                    <p className="mt-2 text-sm text-slate-600">
                      Add images for Games, Food, and Drinks with metadata.
                    </p>
                  </div>
                  <button
                    onClick={handleMediaCreate}
                    disabled={mediaBusy}
                    className="rounded-full bg-orange-500 px-5 py-2 text-xs uppercase tracking-[0.2em] text-white disabled:opacity-60"
                  >
                    {mediaBusy ? "Saving..." : "Upload"}
                  </button>
                </div>

                {mediaError ? (
                  <p className="mt-4 text-sm text-rose-500">{mediaError}</p>
                ) : null}

                <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="grid gap-4 md:grid-cols-2">
                    <input
                      value={mediaForm.title}
                      onChange={(event) =>
                        setMediaForm((prev) => ({ ...prev, title: event.target.value }))
                      }
                      placeholder="Title"
                      className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm"
                    />
                    <select
                      value={mediaForm.category}
                      onChange={(event) =>
                        setMediaForm((prev) => ({
                          ...prev,
                          category: event.target.value as MediaCategory,
                        }))
                      }
                      className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm"
                    >
                      <option value="Games">Games</option>
                      <option value="Food">Food</option>
                      <option value="Drinks">Drinks</option>
                    </select>
                    <textarea
                      value={mediaForm.description}
                      onChange={(event) =>
                        setMediaForm((prev) => ({ ...prev, description: event.target.value }))
                      }
                      placeholder="Description"
                      className="min-h-27.5 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm md:col-span-2"
                    />

                    {(mediaForm.category === "Food" || mediaForm.category === "Drinks") && (
                      <>
                        <input
                          value={mediaForm.price}
                          onChange={(event) =>
                            setMediaForm((prev) => ({ ...prev, price: event.target.value }))
                          }
                          placeholder="Price (e.g., Rs 20, Rs 40)"
                          className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm"
                        />
                        <input
                          value={mediaForm.flavor}
                          onChange={(event) =>
                            setMediaForm((prev) => ({ ...prev, flavor: event.target.value }))
                          }
                          placeholder="Flavor"
                          className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm"
                        />
                        <input
                          value={mediaForm.packSize}
                          onChange={(event) =>
                            setMediaForm((prev) => ({ ...prev, packSize: event.target.value }))
                          }
                          placeholder="Pack size"
                          className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm"
                        />
                        <input
                          value={mediaForm.itemType}
                          onChange={(event) =>
                            setMediaForm((prev) => ({ ...prev, itemType: event.target.value }))
                          }
                          placeholder="Type (e.g., Chips, Soft Drink)"
                          className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm"
                        />
                      </>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        setMediaForm((prev) => ({
                          ...prev,
                          imageFile: event.target.files?.[0] ?? null,
                        }))
                      }
                      className="rounded-2xl border border-dashed border-slate-200 bg-white/80 px-4 py-3 text-sm md:col-span-2"
                    />
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white/70 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Preview</p>
                    <div className="mt-4 flex min-h-60 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60">
                      {mediaPreview ? (
                        <img
                          src={mediaPreview}
                          alt="Preview"
                          className="max-h-60 w-full rounded-2xl object-cover"
                        />
                      ) : (
                        <p className="text-sm text-slate-400">Select an image to preview</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="surface-panel rounded-3xl p-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">All media</p>
                  <span className="text-xs text-slate-500">{mediaItems.length} items</span>
                </div>

                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {mediaItems.map((item) => (
                    <div
                      key={item._id}
                      className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white/80"
                    >
                      <div className="h-40 w-full overflow-hidden">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col gap-3 p-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-orange-500">
                            {item.category}
                          </p>
                          <p className="mt-2 text-sm font-semibold text-slate-900">
                            {item.title}
                          </p>
                          {item.description ? (
                            <p className="mt-1 text-xs text-slate-500">{item.description}</p>
                          ) : null}
                        </div>

                        {item.price ? (
                          <p className="text-xs text-slate-600">Price: {item.price}</p>
                        ) : null}
                        {item.packSize ? (
                          <p className="text-xs text-slate-600">Pack: {item.packSize}</p>
                        ) : null}
                        {item.flavor ? (
                          <p className="text-xs text-slate-600">Flavor: {item.flavor}</p>
                        ) : null}
                        {item.itemType ? (
                          <p className="text-xs text-slate-600">Type: {item.itemType}</p>
                        ) : null}

                        <div className="mt-auto flex flex-wrap gap-2">
                          <button
                            onClick={() => startMediaEdit(item)}
                            className="rounded-full border border-slate-300 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleMediaDelete(item._id)}
                            className="rounded-full border border-slate-300 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-700"
                          >
                            Delete
                          </button>
                        </div>

                        {mediaEditId === item._id && (
                          <div className="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
                            <input
                              value={mediaEditValues.title}
                              onChange={(event) =>
                                setMediaEditValues((prev) => ({
                                  ...prev,
                                  title: event.target.value,
                                }))
                              }
                              placeholder="Title"
                              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs"
                            />
                            <textarea
                              value={mediaEditValues.description}
                              onChange={(event) =>
                                setMediaEditValues((prev) => ({
                                  ...prev,
                                  description: event.target.value,
                                }))
                              }
                              placeholder="Description"
                              className="min-h-22.5 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs"
                            />
                            <select
                              value={mediaEditValues.category}
                              onChange={(event) =>
                                setMediaEditValues((prev) => ({
                                  ...prev,
                                  category: event.target.value as MediaCategory,
                                }))
                              }
                              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs"
                            >
                              <option value="Games">Games</option>
                              <option value="Food">Food</option>
                              <option value="Drinks">Drinks</option>
                            </select>
                            {(mediaEditValues.category === "Food" || mediaEditValues.category === "Drinks") && (
                              <>
                                <input
                                  value={mediaEditValues.price}
                                  onChange={(event) =>
                                    setMediaEditValues((prev) => ({
                                      ...prev,
                                      price: event.target.value,
                                    }))
                                  }
                                  placeholder="Price"
                                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs"
                                />
                                <input
                                  value={mediaEditValues.flavor}
                                  onChange={(event) =>
                                    setMediaEditValues((prev) => ({
                                      ...prev,
                                      flavor: event.target.value,
                                    }))
                                  }
                                  placeholder="Flavor"
                                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs"
                                />
                                <input
                                  value={mediaEditValues.packSize}
                                  onChange={(event) =>
                                    setMediaEditValues((prev) => ({
                                      ...prev,
                                      packSize: event.target.value,
                                    }))
                                  }
                                  placeholder="Pack size"
                                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs"
                                />
                                <input
                                  value={mediaEditValues.itemType}
                                  onChange={(event) =>
                                    setMediaEditValues((prev) => ({
                                      ...prev,
                                      itemType: event.target.value,
                                    }))
                                  }
                                  placeholder="Type"
                                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs"
                                />
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(event) =>
                                setMediaEditFile(event.target.files?.[0] ?? null)
                              }
                              className="rounded-2xl border border-dashed border-slate-200 bg-white px-3 py-2 text-xs"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={handleMediaUpdate}
                                disabled={mediaBusy}
                                className="rounded-full bg-orange-500 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white disabled:opacity-60"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelMediaEdit}
                                className="rounded-full border border-slate-300 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-700"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
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
