"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/auth";

export function useAdmin() {
  const [overview, setOverview] = useState({ users: 0, bookings: 0, combos: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [combos, setCombos] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);

  async function fetchData() {
    // USE auth_token to match login
    const token = localStorage.getItem("auth_token");

    if (!token) {
      console.log("❌ No token → cannot fetch admin data");
      return;
    }

    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const [overviewRes, usersRes, bookingsRes, combosRes, mediaRes] =
        await Promise.all([
          fetch(`${API_BASE_URL}/api/admin/overview`, { headers }),
          fetch(`${API_BASE_URL}/api/admin/users`, { headers }),
          fetch(`${API_BASE_URL}/api/admin/bookings`, { headers }),
          fetch(`${API_BASE_URL}/api/admin/combos`, { headers }),
          fetch(`${API_BASE_URL}/api/admin/media`, { headers }),
        ]);

      if (usersRes.status === 401) {
        localStorage.removeItem("auth_token");
        window.location.href = "/login";
        return;
      }

      const overviewData = await overviewRes.json();
      const usersData = await usersRes.json();
      const bookingsData = await bookingsRes.json();
      const combosData = await combosRes.json();
      const mediaData = await mediaRes.json();

      setOverview(overviewData || { users: 0, bookings: 0, combos: 0 });
      setUsers(usersData.users || []);
      setBookings(bookingsData.bookings || []);
      setCombos(combosData.combos || []);
      setMedia(mediaData.items || []);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return {
    overview,
    users,
    bookings,
    combos,
    media,
    refresh: fetchData,
  };
}