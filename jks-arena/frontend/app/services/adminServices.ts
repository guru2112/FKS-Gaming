import { API_BASE_URL } from "@/lib/auth";

async function request(url: string, token: string) {
  const res = await fetch(`${API_BASE_URL}${url}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message || "Request failed");

  return data;
}

export const adminService = {
  async getOverview(token: string) {
    return request("/api/admin/overview", token);
  },

  async getUsers(token: string) {
    const data = await request("/api/admin/users", token);
    return data.users; // ✅ FIX
  },

  async getBookings(token: string) {
    const data = await request("/api/admin/bookings", token);
    return data.bookings; // ✅ FIX
  },

  async getCombos(token: string) {
    const data = await request("/api/admin/combos", token);
    return data.combos; // ✅ FIX
  },

  async getMedia(token: string) {
    const data = await request("/api/admin/media", token);
    return data.items; // ✅ FIX
  },
};