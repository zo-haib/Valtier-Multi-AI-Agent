import { apiFetch, ApiRequestError } from "./client";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: "user" | "admin";
}

// Raw shape returned by the backend (see app/schemas/user.py::UserRead)
interface UserReadResponse {
  id: string;
  email: string;
  full_name: string;
  role: "user" | "admin";
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

function mapUser(raw: UserReadResponse): AuthUser {
  return { id: raw.id, email: raw.email, fullName: raw.full_name, role: raw.role };
}

// POST /api/v1/auth/signup
// The response body includes the tokens too (for non-browser API
// clients), but the browser never reads or stores them — the backend
// already set them as httpOnly cookies, which `credentials: "include"`
// (see client.ts) sends automatically on every subsequent request.
export async function signup(fullName: string, email: string, password: string): Promise<void> {
  await apiFetch<unknown>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password, full_name: fullName }),
  });
}

// POST /api/v1/auth/login
export async function login(email: string, password: string): Promise<void> {
  await apiFetch<unknown>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// GET /api/v1/auth/me — also doubles as the session-validity check,
// since there's no client-readable token to inspect anymore.
export async function getCurrentUser(): Promise<AuthUser> {
  const raw = await apiFetch<UserReadResponse>("/auth/me");
  return mapUser(raw);
}

// POST /api/v1/auth/logout — the backend clears the cookies.
export async function logout(): Promise<void> {
  await apiFetch<void>("/auth/logout", { method: "POST" });
}

/**
 * Checks whether the current session is valid by asking the backend
 * (there's no local token to inspect — that's the point). Used by
 * RequireAuth. Any non-401 failure is treated as "not authenticated"
 * so a network hiccup doesn't get misread as a valid session; only a
 * genuine 401 is guaranteed to mean "not logged in," but failing closed
 * either way is the safer default for a route guard.
 */
export async function checkSession(): Promise<AuthUser | null> {
  try {
    return await getCurrentUser();
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 401) return null;
    return null;
  }
}
