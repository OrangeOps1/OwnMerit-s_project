"use client";

const AUTH_STORAGE_KEY = "ownmerit_auth";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  group: string;
  created_at: string;
}

export interface AuthState {
  access_token: string;
  token_type: "bearer";
  expires_at: string;
  user: AuthUser;
}

export function getApiBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.VITE_API_BASE_URL ||
    "http://127.0.0.1:8000/api"
  );
}

export function getAuthState(): AuthState | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as AuthState;
    return parsed;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function setAuthState(state: AuthState): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
}

export function clearAuthState(): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getAuthHeader(): Record<string, string> {
  const state = getAuthState();
  if (!state?.access_token) {
    return {};
  }
  return { Authorization: `Bearer ${state.access_token}` };
}
