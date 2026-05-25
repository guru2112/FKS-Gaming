// =========================================================
// 🔥 PRODUCTION API CLIENT
// Single source of truth for ALL API calls
// =========================================================

// ✅ Always read from env — never hardcode
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://fks-gaming.onrender.com";

// =========================================================
// 🔥 STORAGE KEYS — ONE PLACE, NEVER DUPLICATED
// =========================================================

export const STORAGE_KEYS = {
  TOKEN: "auth_token",
  ROLE: "auth_role",
  PROFILE: "profile",
} as const;

// =========================================================
// 🔥 GET TOKEN FROM LOCALSTORAGE
// =========================================================

export function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(STORAGE_KEYS.TOKEN) || "";
}

// =========================================================
// 🔥 GET ROLE FROM LOCALSTORAGE
// =========================================================

export function getRole(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(STORAGE_KEYS.ROLE) || "";
}

// =========================================================
// 🔥 SAVE SESSION (called after any login)
// =========================================================

export function saveSession(data: {
  token: string;
  role: string;
  user: object;
}) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
  localStorage.setItem(STORAGE_KEYS.ROLE, data.role);
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(data.user));
}

// =========================================================
// 🔥 CLEAR SESSION (called on logout)
// =========================================================

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.ROLE);
  localStorage.removeItem(STORAGE_KEYS.PROFILE);
}

// =========================================================
// 🔥 REDIRECT TO LOGIN
// =========================================================

export function redirectToLogin() {
  if (typeof window === "undefined") return;
  clearSession();
  window.location.href = "/login";
}

// =========================================================
// 🔥 API ERROR CLASS
// =========================================================

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

// =========================================================
// 🔥 UNIVERSAL FETCH WRAPPER
// Handles: auth headers, JSON parsing, error codes,
//          401 redirect, network errors
// =========================================================

interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: object;
  token?: string;
  // Don't auto-redirect on 401 (useful for auth routes)
  noRedirectOn401?: boolean;
}

export async function apiRequest<T = unknown>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const {
    method = "GET",
    body,
    token,
    noRedirectOn401 = false,
  } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  };

  // Attach JWT if provided or available in storage
  const authToken = token || getToken();
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
  } catch (networkError) {
    // Network failure (no internet, server down, CORS flight failed)
    throw new ApiError(
      "Network error — could not connect to server. Please check your connection.",
      0
    );
  }

  // Parse JSON safely
  let data: T & { message?: string };
  try {
    data = (await response.json()) as T & { message?: string };
  } catch {
    throw new ApiError(
      `Server returned non-JSON response (${response.status})`,
      response.status
    );
  }

  // Handle HTTP error codes
  if (!response.ok) {
    const message =
      (data as { message?: string }).message ||
      getDefaultErrorMessage(response.status);

    if (response.status === 401 && !noRedirectOn401) {
      // Token expired or invalid — force re-login
      redirectToLogin();
    }

    throw new ApiError(message, response.status);
  }

  return data;
}

// =========================================================
// 🔥 DEFAULT ERROR MESSAGES BY STATUS
// =========================================================

function getDefaultErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return "Bad request — please check your input.";
    case 401:
      return "Session expired. Please log in again.";
    case 403:
      return "Access denied. You do not have permission.";
    case 404:
      return "Resource not found.";
    case 500:
      return "Server error — please try again later.";
    default:
      return "Something went wrong. Please try again.";
  }
}

// =========================================================
// 🔥 CONVENIENCE WRAPPERS
// =========================================================

export const api = {
  get: <T>(path: string, options?: Omit<ApiRequestOptions, "method" | "body">) =>
    apiRequest<T>(path, { ...options, method: "GET" }),

  post: <T>(path: string, body?: object, options?: Omit<ApiRequestOptions, "method" | "body">) =>
    apiRequest<T>(path, { ...options, method: "POST", body }),

  put: <T>(path: string, body?: object, options?: Omit<ApiRequestOptions, "method" | "body">) =>
    apiRequest<T>(path, { ...options, method: "PUT", body }),

  patch: <T>(path: string, body?: object, options?: Omit<ApiRequestOptions, "method" | "body">) =>
    apiRequest<T>(path, { ...options, method: "PATCH", body }),

  delete: <T>(path: string, options?: Omit<ApiRequestOptions, "method" | "body">) =>
    apiRequest<T>(path, { ...options, method: "DELETE" }),
};
