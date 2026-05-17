"use client";

import { useEffect, useState } from "react";
import { api, getToken, redirectToLogin } from "@/lib/apiClient";

export function useAdmin() {
  const [overview, setOverview] = useState({ users: 0, bookings: 0, combos: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [combos, setCombos] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchData() {
    const token = getToken();

    if (!token) {
      console.log("❌ No token → redirecting to login");
      redirectToLogin();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [overviewData, usersData, bookingsData, combosData, mediaData] =
        await Promise.all([
          api.get<{ users: number; bookings: number; combos: number }>(
            "/api/admin/overview",
            { token }
          ),
          api.get<{ users: any[] }>("/api/admin/users", { token }),
          api.get<{ bookings: any[] }>("/api/admin/bookings", { token }),
          api.get<{ combos: any[] }>("/api/admin/combos", { token }),
          api.get<{ items: any[] }>("/api/admin/media", { token }),
        ]);

      setOverview(overviewData || { users: 0, bookings: 0, combos: 0 });
      setUsers(usersData.users || []);
      setBookings(bookingsData.bookings || []);
      setCombos(combosData.combos || []);
      setMedia(mediaData.items || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load admin data";
      console.error("Admin fetch error:", msg);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    overview,
    users,
    bookings,
    combos,
    media,
    isLoading,
    error,
    refresh: fetchData,
  };
}