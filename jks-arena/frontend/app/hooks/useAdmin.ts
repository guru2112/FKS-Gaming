"use client";

import { useEffect, useState } from "react";

export function useAdmin() {
  const [users, setUsers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [combos, setCombos] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);

  async function fetchData() {
    const token = localStorage.getItem("token");

    // 🚨 HARD STOP if token missing
    if (!token) {
      console.log("❌ No token → cannot fetch admin data");
      return;
    }

    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ MUST MATCH BACKEND
      };

      const [usersRes, bookingsRes, combosRes, mediaRes] =
        await Promise.all([
          fetch("http://localhost:5000/api/admin/users", { headers }),
          fetch("http://localhost:5000/api/admin/bookings", { headers }),
          fetch("http://localhost:5000/api/admin/combos", { headers }),
          fetch("http://localhost:5000/api/admin/media", { headers }),
        ]);

      // 🔥 DEBUG (VERY IMPORTANT)
      console.log("STATUS USERS:", usersRes.status);
      console.log("STATUS BOOKINGS:", bookingsRes.status);

      if (usersRes.status === 401) {
        console.log("❌ Unauthorized → invalid token");
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      const usersData = await usersRes.json();
      const bookingsData = await bookingsRes.json();
      const combosData = await combosRes.json();
      const mediaData = await mediaRes.json();

      console.log("USERS DATA:", usersData);
      console.log("BOOKINGS DATA:", bookingsData);

      setUsers(usersData.users || []);
      setBookings(bookingsData.bookings || []);
      setCombos(combosData.combos || []);
      setMedia(mediaData.items || []);
    } catch (err) {
      console.error("❌ Fetch error:", err);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return {
    users,
    bookings,
    combos,
    media,
    refresh: fetchData,
  };
}