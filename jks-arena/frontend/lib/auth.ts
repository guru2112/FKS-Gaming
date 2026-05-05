export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export type AuthResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  role: "user" | "admin";
};

export type Plan = {
  _id: string;
  name: string;
  priceMonthly: number;
  perks: string[];
};

export type Profile = {
  id: string;
  name: string;
  email: string;
  currentPlan: Plan | null;
};

export type Booking = {
  _id: string;
  game?: string;
  device: "PS1" | "PS2" | "PS3" | "SIM1";
  slotStart: string;
  slotEnd: string;
  durationHours: number;
  players: number;
  contactNumber?: string;
  companions?: Array<{ name: string; phone: string }>;
  perHeadRate: number;
  totalPrice: number;
  status: "upcoming" | "completed" | "cancelled";
};

export type Combo = {
  _id: string;
  name: string;
  items: string[];
  price: number;
  durationHours: number;
  description: string;
  isActive: boolean;
};

export type MediaCategory = "Games" | "Food" | "Drinks";

export type MediaItem = {
  _id: string;
  title: string;
  description: string;
  category: MediaCategory;
  price?: string;
  flavor?: string;
  packSize?: string;
  itemType?: string;
  imageUrl: string;
  publicId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminUser = {
  _id: string;
  name: string;
  email: string;
  planId?: string | null;
  createdAt?: string;
};

export type AdminBooking = Booking & {
  userId?: {
    _id: string;
    name: string;
    email: string;
  };
};

export type AdminOverview = {
  users: number;
  bookings: number;
  combos: number;
};

async function requestAuth(path: string, payload: Record<string, string>) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as { message?: string } & AuthResponse;

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export function registerUser(payload: {
  name: string;
  email: string;
  password: string;
}) {
  return requestAuth("/api/auth/register", payload);
}

export function loginUser(payload: { email: string; password: string }) {
  return requestAuth("/api/auth/login", payload);
}

async function requestWithToken<T>(path: string, token: string) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = (await response.json()) as { message?: string } & T;

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export async function fetchProfile(token: string) {
  return requestWithToken<Profile>("/api/me", token);
}

export async function fetchPlans(token: string) {
  const response = await requestWithToken<{ plans: Plan[] }>("/api/plans", token);
  return response.plans;
}

export async function fetchBookings(token: string) {
  const response = await requestWithToken<{ bookings: Booking[] }>(
    "/api/bookings",
    token
  );
  return response.bookings;
}

export async function createBooking(
  token: string,
  payload: {
    userName: string;
    device: "PS1" | "PS2" | "PS3" | "SIM1";
    slotStart: string;
    durationHours: number;
    players: number;
    contactNumber: string;
    companions: Array<{ name: string; phone: string }>;
    game?: string;
  }
) {
  const response = await fetch(`${API_BASE_URL}/api/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as { message?: string; booking?: Booking };

  if (!response.ok || !data.booking) {
    throw new Error(data.message || "Failed to create booking");
  }

  return data.booking;
}

export async function fetchAdminOverview(token: string) {
  return requestWithToken<AdminOverview>("/api/admin/overview", token);
}

export async function fetchAdminUsers(token: string) {
  const response = await requestWithToken<{ users: AdminUser[] }>(
    "/api/admin/users",
    token
  );
  return response.users;
}

export async function fetchAdminBookings(token: string) {
  const response = await requestWithToken<{ bookings: AdminBooking[] }>(
    "/api/admin/bookings",
    token
  );
  return response.bookings;
}

export async function fetchAdminCombos(token: string) {
  const response = await requestWithToken<{ combos: Combo[] }>(
    "/api/admin/combos",
    token
  );
  return response.combos;
}

export async function updateAdminUser(
  token: string,
  id: string,
  payload: { name?: string; email?: string; planId?: string | null }
) {
  const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as { message?: string; user?: AdminUser };

  if (!response.ok || !data.user) {
    throw new Error(data.message || "Failed to update user");
  }

  return data.user;
}

export async function deleteAdminUser(token: string, id: string) {
  const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = (await response.json()) as { message?: string };

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete user");
  }
}

export async function createAdminBooking(
  token: string,
  payload: {
    userId: string;
    game?: string;
    slotStart: string;
    durationHours: number;
    device: "PS1" | "PS2" | "PS3" | "SIM1";
    players: number;
    contactNumber: string;
    companions: Array<{ name: string; phone: string }>;
    status?: "upcoming" | "completed" | "cancelled";
  }
) {
  const response = await fetch(`${API_BASE_URL}/api/admin/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as { message?: string; booking?: AdminBooking };

  if (!response.ok || !data.booking) {
    throw new Error(data.message || "Failed to create booking");
  }

  return data.booking;
}

export async function updateAdminBooking(
  token: string,
  id: string,
  payload: Partial<AdminBooking>
) {
  const response = await fetch(`${API_BASE_URL}/api/admin/bookings/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as { message?: string; booking?: AdminBooking };

  if (!response.ok || !data.booking) {
    throw new Error(data.message || "Failed to update booking");
  }

  return data.booking;
}

export async function deleteAdminBooking(token: string, id: string) {
  const response = await fetch(`${API_BASE_URL}/api/admin/bookings/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = (await response.json()) as { message?: string };

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete booking");
  }
}

export async function createCombo(token: string, payload: Omit<Combo, "_id">) {
  const response = await fetch(`${API_BASE_URL}/api/admin/combos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as { message?: string; combo?: Combo };

  if (!response.ok || !data.combo) {
    throw new Error(data.message || "Failed to create combo");
  }

  return data.combo;
}

export async function updateCombo(token: string, id: string, payload: Partial<Combo>) {
  const response = await fetch(`${API_BASE_URL}/api/admin/combos/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as { message?: string; combo?: Combo };

  if (!response.ok || !data.combo) {
    throw new Error(data.message || "Failed to update combo");
  }

  return data.combo;
}

export async function deleteCombo(token: string, id: string) {
  const response = await fetch(`${API_BASE_URL}/api/admin/combos/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = (await response.json()) as { message?: string };

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete combo");
  }
}

export async function fetchAdminMedia(token: string) {
  const response = await requestWithToken<{ items: MediaItem[] }>(
    "/api/admin/media",
    token
  );
  return response.items;
}

export async function createAdminMedia(token: string, payload: FormData) {
  const response = await fetch(`${API_BASE_URL}/api/admin/media`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: payload,
  });

  const data = (await response.json()) as { message?: string; item?: MediaItem };

  if (!response.ok || !data.item) {
    throw new Error(data.message || "Failed to create media item");
  }

  return data.item;
}

export async function updateAdminMedia(token: string, id: string, payload: FormData) {
  const response = await fetch(`${API_BASE_URL}/api/admin/media/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: payload,
  });

  const data = (await response.json()) as { message?: string; item?: MediaItem };

  if (!response.ok || !data.item) {
    throw new Error(data.message || "Failed to update media item");
  }

  return data.item;
}

export async function deleteAdminMedia(token: string, id: string) {
  const response = await fetch(`${API_BASE_URL}/api/admin/media/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = (await response.json()) as { message?: string };

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete media item");
  }
}

export async function fetchPublicMedia(category?: MediaCategory) {
  const params = category ? `?category=${encodeURIComponent(category)}` : "";
  const response = await fetch(`${API_BASE_URL}/api/media${params}`);

  const data = (await response.json()) as { message?: string; items?: MediaItem[] };

  if (!response.ok || !data.items) {
    throw new Error(data.message || "Failed to fetch media items");
  }

  return data.items;
}
