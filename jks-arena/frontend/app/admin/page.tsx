"use client";

import { useState } from "react";
import { useAdmin } from "../hooks/useAdmin";

import UsersTab from "@/components/UserTab";
import BookingsTab from "@/components/BookingsTab";
import CombosTab from "@/components/CombosTab";
import MediaTab from "@/components/MediaTab";

type Tab = "overview" | "users" | "bookings" | "combos" | "media";

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("overview");

  const { users, bookings, combos, media } = useAdmin();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        {["overview", "users", "bookings", "combos", "media"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as Tab)}
            className={`px-4 py-2 rounded ${
              tab === t ? "bg-orange-500 text-white" : "bg-gray-200"
            }`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="grid grid-cols-3 gap-4">
          <Card title="Users" value={users.length} />
          <Card title="Bookings" value={bookings.length} />
          <Card title="Combos" value={combos.length} />
        </div>
      )}

      {tab === "users" && <UsersTab users={users} />}
      {tab === "bookings" && <BookingsTab bookings={bookings} />}
      {tab === "combos" && <CombosTab combos={combos} />}
      {tab === "media" && <MediaTab />}
    </div>
  );
}

function Card({ title, value }: any) {
  return (
    <div className="bg-white p-5 rounded shadow">
      <p className="text-gray-500">{title}</p>
      <h2 className="text-2xl font-bold">{value}</h2>
    </div>
  );
}