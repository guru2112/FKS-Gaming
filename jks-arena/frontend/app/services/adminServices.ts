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

async function requestJson(url: string, token: string, method: string, body: unknown) {
  const res = await fetch(`${API_BASE_URL}${url}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
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

  async getSessions(token: string, date?: string) {
    const qs = date ? `?date=${encodeURIComponent(date)}` : "";
    const data = await request(`/api/admin/sessions${qs}`, token);
    return data.sessions;
  },

  async startWalkInSession(
    token: string,
    payload: {
      customerName: string;
      phoneNumber: string;
      device: "PS1" | "PS2" | "PS3" | "SIM1";
      game?: string;
      players: number;
      companions?: Array<{ name: string; phone: string }>;
      inTime?: string;
      outTime: string;
      paymentMethod?: "cash" | "online";
      amountPaid?: number;
    }
  ) {
    const data = await requestJson("/api/admin/sessions/start", token, "POST", payload);
    return data.session;
  },
};