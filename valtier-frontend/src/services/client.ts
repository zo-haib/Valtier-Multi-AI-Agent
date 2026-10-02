/**
 * Shared API client — talks to the real Valtier FastAPI backend.
 *
 * Auth tokens are delivered as httpOnly cookies (see the backend's
 * core/security.py), so the browser attaches them automatically on
 * every request that includes `credentials: "include"` — this file
 * never reads, stores, or attaches a token itself. That's deliberate:
 * a token any JS on this page can read is a token an XSS payload can
 * read too, which is why this app moved away from localStorage.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

export function delay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export class ApiRequestError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiRequestError";
  }
}

async function parseErrorDetail(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body?.detail === "string") return body.detail;
    if (Array.isArray(body?.detail)) {
      // FastAPI validation error shape: [{ loc, msg, type }, ...]
      return body.detail.map((e: { msg?: string }) => e.msg).filter(Boolean).join("; ") || response.statusText;
    }
    return response.statusText;
  } catch {
    return response.statusText;
  }
}

/** JSON request helper. Used for every endpoint except file upload. */
export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include", // send/receive the httpOnly auth cookies
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new ApiRequestError(await parseErrorDetail(response), response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

/** multipart/form-data helper — used for document upload. Never set Content-Type manually; the browser adds the boundary. */
export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    throw new ApiRequestError(await parseErrorDetail(response), response.status);
  }
  return response.json() as Promise<T>;
}
