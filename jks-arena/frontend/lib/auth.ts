// =========================================================
// 🔥 auth.ts — PRODUCTION-READY AUTH LIBRARY
// All API calls use apiClient. All keys are standardized.
// =========================================================

export {
  API_BASE_URL,
  STORAGE_KEYS,
  getToken,
  getRole,
  saveSession,
  clearSession,
  redirectToLogin,
  ApiError,
  apiRequest,
  api,
} from "./apiClient";

import { api, saveSession, clearSession, getToken } from "./apiClient";

// =========================================================
// 🔥 AUTH TYPES
// =========================================================

export type AuthResponse = {
  token: string;
  role: "user" | "admin";
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    topbarUrl?: string;
  };
  message?: string;
};

// =========================================================
// 🔥 PLAN TYPE
// =========================================================

export type Plan = {
  _id: string;
  name: string;
  priceMonthly: number;
  perks: string[];
};

// =========================================================
// 🔥 PROFILE TYPE
// =========================================================

export type Profile = {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  avatarUrl?: string;
  topbarUrl?: string;
  phone?: string;
  isPhoneVerified?: boolean;
  currentPlan?: Plan | null;
  notifications?: {
    bookingUpdates?: boolean;
    reminders?: boolean;
    promotions?: boolean;
  };
};

// =========================================================
// 🔥 NOTIFICATION TYPE
// =========================================================

export type NotificationItem = {
  _id: string;
  title: string;
  message: string;
  type: "booking" | "reminder" | "announcement" | "games";
  isRead: boolean;
  createdAt: string;
  link?: string;
};

// =========================================================
// 🔥 BOOKING TYPE
// =========================================================

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
  status: "upcoming" | "completed" | "cancelled" | "active" | "no-show";
  source?: "online" | "offline";
  sessionStatus?: "scheduled" | "active" | "completed" | "cancelled";
  walkInCustomer?: boolean;
  inTime?: string;
  outTime?: string;
  paymentMethod?: "cash" | "online";
  amountPaid?: number;
  paymentStatus?: "paid" | "partial";
};

// =========================================================
// 🔥 COMBO TYPE
// =========================================================

export type Combo = {
  _id: string;
  name: string;
  items: string[];
  price: number;
  durationHours: number;
  description: string;
  isActive: boolean;
};

// =========================================================
// 🔥 MEDIA TYPES
// =========================================================

export type MediaCategory =
  | "Games"
  | "Food"
  | "Drinks"
  | "Application"
  | "Profile"
  | "Facilities"
  | "Dashboard";

export type MediaItem = {
  _id: string;
  title?: string;
  name?: string;
  description?: string;
  category: MediaCategory;
  price?: string;
  flavor?: string;
  packSize?: string;
  itemType?: string;
  profileImageType?: "Avatar";
  facilityType?: "Screen" | "PS" | "Seating" | "Simulator" | "Multiplayer";
  dashboardType?: "Sidebar" | "Timer Card" | "Mobile Menu" | "Details Card" | "Topbar" | "PS" | "Simulator";
  imageUrl?: string;
  secure_url?: string;
  publicId?: string;
  public_id?: string;
  createdAt?: string;
  updatedAt?: string;
};

// =========================================================
// 🔥 ADMIN TYPES
// =========================================================

export type AdminUser = {
  _id: string;
  name: string;
  email: string;
  planId?: string | null;
  createdAt?: string;
};

export type AdminBooking = Booking & {
  userId?: { _id: string; name: string; email: string };
};

export type AdminOverview = {
  users: number;
  bookings: number;
  combos: number;
};

// =========================================================
// 🔥 REGISTER
// =========================================================

export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
}) {
  const data = await api.post<AuthResponse>("/api/auth/register", payload, {
    noRedirectOn401: true,
  });

  // ✅ Save using standardized keys
  saveSession(data);

  return data;
}

// =========================================================
// 🔥 LOGIN
// =========================================================

export async function loginUser(payload: {
  email: string;
  password: string;
}) {
  const data = await api.post<AuthResponse>("/api/auth/login", payload, {
    noRedirectOn401: true,
  });

  // ✅ Save using standardized keys
  saveSession(data);

  return {
    ...data,
    user: {
      id: data.user?.id || "",
      name: data.user?.name || "",
      email: data.user?.email || "",
      avatarUrl: data.user?.avatarUrl || "",
      topbarUrl: data.user?.topbarUrl || "",
    },
  };
}

// =========================================================
// 🔥 LOGOUT
// =========================================================

export function logoutUser() {
  clearSession();
}

// =========================================================
// 🔥 GOOGLE AUTH
// =========================================================

export async function googleAuth(accessToken: string) {
  const data = await api.post<AuthResponse>(
    "/api/auth/google",
    { token: accessToken },
    { noRedirectOn401: true }
  );

  // ✅ Save using standardized keys
  saveSession(data);

  return data;
}

// =========================================================
// 🔥 FETCH PROFILE
// =========================================================

export async function fetchProfile(token?: string): Promise<Profile> {
  const data = await api.get<Profile & { _id?: string }>("/api/user/me", {
    token,
  });

  // ✅ Save updated profile
  if (typeof window !== "undefined") {
    localStorage.setItem("profile", JSON.stringify(data));
  }

  return {
    id: data._id || data.id || "",
    _id: data._id || data.id || "",
    name: data.name || "",
    email: data.email || "",
    phone: (data as any).phone || "",
    isPhoneVerified: (data as any).isPhoneVerified || false,
    avatarUrl: data.avatarUrl || "",
    currentPlan: data.currentPlan || null,
    notifications: data.notifications || {
      bookingUpdates: true,
      reminders: true,
      promotions: true,
    },
  };
}

// =========================================================
// 🔥 FETCH PLANS
// =========================================================

export async function fetchPlans(token?: string) {
  const response = await api.get<{ plans: Plan[] }>("/api/plans", { token });
  return response.plans;
}

// =========================================================
// 🔥 FETCH BOOKINGS
// =========================================================

export async function fetchBookings(token?: string) {
  const response = await api.get<{ bookings: Booking[] }>("/api/bookings", {
    token,
  });
  return response.bookings;
}

// =========================================================
// 🔥 FETCH NOTIFICATIONS
// =========================================================

export async function fetchNotifications(token?: string) {
  const response = await api.get<{ notifications: NotificationItem[] }>(
    "/api/notifications",
    { token }
  );
  return response.notifications;
}

// =========================================================
// 🔥 MARK NOTIFICATION READ
// =========================================================

export async function markNotificationRead(
  notificationId: string,
  token?: string
) {
  return api.patch(
    `/api/notifications/${notificationId}/read`,
    undefined,
    { token }
  );
}

// =========================================================
// 🔥 MARK ALL NOTIFICATIONS READ
// =========================================================

export async function markAllNotificationsRead(token?: string) {
  return api.patch("/api/notifications/read-all", undefined, { token });
}

// =========================================================
// 🔥 CREATE BOOKING
// =========================================================

export async function createBooking(
  payload: {
    userName: string;
    device: "PS1" | "PS2" | "PS3" | "SIM1";
    slotStart: string;
    durationHours: number;
    players: number;
    contactNumber: string;
    companions: Array<{ name: string; phone: string }>;
    game?: string;
  },
  token?: string
) {
  const response = await api.post<{ booking: Booking; message?: string }>(
    "/api/bookings",
    payload,
    { token }
  );

  if (!response.booking) {
    throw new Error(response.message || "Failed to create booking");
  }

  // Refresh notification bell immediately after booking
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("refresh-notifications"));
  }

  return response.booking;
}

// =========================================================
// 🔥 CANCEL BOOKING (user)
// =========================================================

export async function cancelBooking(bookingId: string, token?: string) {
  const response = await api.patch<{ booking: Booking; message: string }>(
    `/api/bookings/${bookingId}/cancel`,
    {},
    { token }
  );
  return response;
}

// =========================================================
// 🔥 UPDATE PROFILE
// =========================================================

export async function updateProfile(
  payload: {
    name?: string;
    email?: string;
    phone?: string;
    avatarUrl?: string;
    topbarUrl?: string;
    notifications?: {
      bookingUpdates?: boolean;
      reminders?: boolean;
      promotions?: boolean;
    };
  },
  token?: string
) {
  const data = await api.put("/api/user/profile", payload, { token });

  // ✅ Save updated profile
  if (typeof window !== "undefined") {
    localStorage.setItem(
      "profile",
      JSON.stringify((data as { user?: object; [key: string]: unknown }).user || data)
    );
  }

  return data;
}

// =========================================================
// 🔥 SAVE PUSH TOKEN
// =========================================================

export async function savePushToken(pushToken: string, token?: string) {
  return api.post("/api/push/register", { token: pushToken }, { token });
}

// =========================================================
// 🔥 PUBLIC MEDIA
// =========================================================

export async function fetchPublicMedia(category?: MediaCategory) {
  const params = category
    ? `?category=${encodeURIComponent(category)}`
    : "";

  const data = await api.get<{ items?: MediaItem[]; message?: string }>(
    `/api/media${params}`,
    { noRedirectOn401: true }
  );

  if (!data.items) {
    throw new Error(data.message || "Failed to fetch media items");
  }

  return data.items;
}