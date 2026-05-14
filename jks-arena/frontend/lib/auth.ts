export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000";

// =========================================================
// 🔥 AUTH TYPES
// =========================================================

export type AuthResponse = {

  token: string;

  user: {

    id: string;

    name: string;

    email: string;

    avatarUrl?: string;

  };

  role: "user" | "admin";

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

  currentPlan?: Plan | null;

  notifications?: {

    bookingUpdates?: boolean;

    sessionReminders?: boolean;

    newGames?: boolean;

  };

};

// =========================================================
// 🔥 NOTIFICATION TYPE
// =========================================================

export type NotificationItem = {

  _id: string;

  title: string;

  message: string;

  type:
    | "booking"
    | "reminder"
    | "announcement"
    | "games";

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

  device:
    | "PS1"
    | "PS2"
    | "PS3"
    | "SIM1";

  slotStart: string;

  slotEnd: string;

  durationHours: number;

  players: number;

  contactNumber?: string;

  companions?: Array<{
    name: string;
    phone: string;
  }>;

  perHeadRate: number;

  totalPrice: number;

  status:
    | "upcoming"
    | "completed"
    | "cancelled"
    | "active";

  // Unified sessions (optional for backward compatibility)
  source?: "online" | "offline";
  sessionStatus?: "scheduled" | "active" | "completed" | "cancelled";
  walkInCustomer?: boolean;

  // Unified timing + payments (optional)
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
  | "Facilities";

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

  profileImageType?:
    | "Avatar";

  facilityType?:
    | "Screen"
    | "PS"
    | "Seating"
    | "Simulator"
    | "Multiplayer";

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

export type AdminBooking =
  Booking & {

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

// =========================================================
// 🔥 AUTH REQUEST HELPER
// =========================================================

async function requestAuth(
  path: string,
  payload: Record<string, string>
) {

  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {

      method: "POST",

      headers: {

        "Content-Type":
          "application/json",

      },

      body: JSON.stringify(
        payload
      ),

    }
  );

  const data =
    (await response.json()) as {

      message?: string;

    } & AuthResponse;

  if (!response.ok) {

    throw new Error(
      data.message ||
        "Request failed"
    );

  }

  return data;

}

// =========================================================
// 🔥 REGISTER
// =========================================================

export function registerUser(
  payload: {

    name: string;

    email: string;

    password: string;

  }
) {

  return requestAuth(
    "/api/auth/register",
    payload
  );

}

// =========================================================
// 🔥 LOGIN
// =========================================================

export async function loginUser(
  payload: {

    email: string;

    password: string;

  }
) {

  const data =
    await requestAuth(
      "/api/auth/login",
      payload
    );

  // =====================================================
  // 🔥 SAVE LOGIN DATA
  // =====================================================

  if (typeof window !== "undefined") {

    // 🔥 SAVE PROFILE
    localStorage.setItem(
      "profile",
      JSON.stringify(
        data.user
      )
    );

    // 🔥 SAVE JWT TOKEN
    localStorage.setItem(
      "token",
      data.token
    );

    // 🔥 SAVE ROLE
    localStorage.setItem(
      "role",
      data.role
    );

  }

  return {

    ...data,

    user: {

      id:
        data.user?.id || "",

      name:
        data.user?.name || "",

      email:
        data.user?.email || "",

      avatarUrl:
        data.user?.avatarUrl || "",

    },

  };

}

// =========================================================
// 🔥 LOGOUT
// =========================================================

export function logoutUser() {

  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(
    "token"
  );

  localStorage.removeItem(
    "profile"
  );

  localStorage.removeItem(
    "role"
  );

}

// =========================================================
// 🔥 TOKEN REQUEST HELPER
// =========================================================

async function requestWithToken<T>(
  path: string,
  token: string
) {

  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {

      method: "GET",

      headers: {

        Authorization:
          `Bearer ${token}`,

        "Cache-Control":
          "no-cache, no-store, must-revalidate",

        Pragma:
          "no-cache",

        Expires:
          "0",

      },

      cache: "no-store",

    }
  );

  const data =
    (await response.json()) as {

      message?: string;

    } & T;

  if (!response.ok) {

    throw new Error(
      data.message ||
        "Request failed"
    );

  }

  return data;

}

// =========================================================
// 🔥 FETCH PROFILE
// =========================================================

export async function fetchProfile(
  token: string
): Promise<Profile> {

  const data =
    await requestWithToken<any>(
      "/api/user/me",
      token
    );

  // 🔥 SAVE PROFILE

  if (typeof window !== "undefined") {

    localStorage.setItem(
      "profile",
      JSON.stringify(data)
    );

  }

  return {

    id:
      data._id ||
      data.id ||
      "",

    _id:
      data._id ||
      data.id ||
      "",

    name:
      data.name || "",

    email:
      data.email || "",

    avatarUrl:
      data.avatarUrl || "",

    currentPlan:
      data.currentPlan || null,

    notifications:
      data.notifications || {

        bookingUpdates: true,

        sessionReminders: true,

        newGames: true,

      },

  };

}

// =========================================================
// 🔥 FETCH PLANS
// =========================================================

export async function fetchPlans(
  token: string
) {

  const response =
    await requestWithToken<{

      plans: Plan[];

    }>(
      "/api/plans",
      token
    );

  return response.plans;

}

// =========================================================
// 🔥 FETCH BOOKINGS
// =========================================================

export async function fetchBookings(
  token: string
) {

  const response =
    await requestWithToken<{

      bookings: Booking[];

    }>(
      "/api/bookings",
      token
    );

  return response.bookings;

}

// =========================================================
// 🔥 FETCH NOTIFICATIONS
// =========================================================

export async function fetchNotifications(
  token: string
) {

  const response =
    await requestWithToken<{

      notifications:
        NotificationItem[];

    }>(
      "/api/notifications",
      token
    );

  return response.notifications;

}

// =========================================================
// 🔥 MARK NOTIFICATION READ
// =========================================================

export async function markNotificationRead(

  token: string,

  notificationId: string

) {

  const response = await fetch(
    `${API_BASE_URL}/api/notifications/${notificationId}/read`,
    {

      method: "PATCH",

      headers: {

        Authorization:
          `Bearer ${token}`,

      },

    }
  );

  const data =
    await response.json();

  if (!response.ok) {

    throw new Error(
      data.message ||
        "Failed to update notification"
    );

  }

  return data;

}

// =========================================================
// 🔥 MARK ALL NOTIFICATIONS READ
// =========================================================

export async function markAllNotificationsRead(
  token: string
) {

  const response = await fetch(
    `${API_BASE_URL}/api/notifications/read-all`,
    {

      method: "PATCH",

      headers: {

        Authorization:
          `Bearer ${token}`,

      },

    }
  );

  const data =
    await response.json();

  if (!response.ok) {

    throw new Error(
      data.message ||
        "Failed to mark all notifications"
    );

  }

  return data;

}

// =========================================================
// 🔥 CREATE BOOKING
// =========================================================

export async function createBooking(

  token: string,

  payload: {

    userName: string;

    device:
      | "PS1"
      | "PS2"
      | "PS3"
      | "SIM1";

    slotStart: string;

    durationHours: number;

    players: number;

    contactNumber: string;

    companions: Array<{
      name: string;
      phone: string;
    }>;

    game?: string;

  }

) {

  const response = await fetch(
    `${API_BASE_URL}/api/bookings`,
    {

      method: "POST",

      headers: {

        "Content-Type":
          "application/json",

        Authorization:
          `Bearer ${token}`,

      },

      body: JSON.stringify(
        payload
      ),

    }
  );

  const data =
    (await response.json()) as {

      message?: string;

      booking?: Booking;

    };

  if (
    !response.ok ||
    !data.booking
  ) {

    throw new Error(
      data.message ||
        "Failed to create booking"
    );

  }

  return data.booking;

}

// =========================================================
// 🔥 UPDATE PROFILE
// =========================================================

export async function updateProfile(

  token: string,

  payload: {

    name?: string;

    email?: string;

    avatarUrl?: string;

    notifications?: {

      bookingUpdates?: boolean;

      sessionReminders?: boolean;

      newGames?: boolean;

    };

  }

) {

  const response = await fetch(
    `${API_BASE_URL}/api/user/profile`,
    {

      method: "PUT",

      headers: {

        "Content-Type":
          "application/json",

        Authorization:
          `Bearer ${token}`,

      },

      body: JSON.stringify(
        payload
      ),

    }
  );

  const data =
    await response.json();

  if (!response.ok) {

    throw new Error(
      data.message ||
        "Failed to update profile"
    );

  }

  // 🔥 SAVE UPDATED PROFILE

  if (
    typeof window !==
    "undefined"
  ) {

    localStorage.setItem(
      "profile",
      JSON.stringify(
        data.user || data
      )
    );

  }

  return data;

}

// =========================================================
// 🔥 SAVE PUSH TOKEN
// =========================================================

export async function savePushToken(
  authToken: string,
  pushToken: string
) {

  const response = await fetch(
    `${API_BASE_URL}/api/push/register`,
    {

      method: "POST",

      headers: {

        "Content-Type":
          "application/json",

        Authorization:
          `Bearer ${authToken}`,

      },

      body: JSON.stringify({

        token:
          pushToken,

      }),

    }
  );

  const data =
    await response.json();

  if (!response.ok) {

    throw new Error(
      data.message ||
      "Failed to save push token"
    );

  }

  return data;

}
// =========================================================
// 🔥 PUBLIC MEDIA
// =========================================================

export async function fetchPublicMedia(
  category?: MediaCategory
) {

  const params =
    category
      ? `?category=${encodeURIComponent(
          category
        )}`
      : "";

  const response = await fetch(
    `${API_BASE_URL}/api/media${params}`
  );

  const data =
    (await response.json()) as {

      message?: string;

      items?: MediaItem[];

    };

  if (
    !response.ok ||
    !data.items
  ) {

    throw new Error(
      data.message ||
        "Failed to fetch media items"
    );

  }

  return data.items;

}