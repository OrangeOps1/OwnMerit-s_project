"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

import { AuthState, getAuthState } from "@/lib/auth";

export function useRequireAuth(requiredRole?: "user" | "admin") {
  const router = useRouter();
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const auth = useMemo<AuthState | null>(
    () => (hydrated ? getAuthState() : null),
    [hydrated]
  );
  const isAuthorized =
    !!auth && (!requiredRole || auth.user.role === requiredRole);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    if (!auth) {
      router.replace("/login");
      return;
    }
    if (!isAuthorized) {
      router.replace(auth.user.role === "admin" ? "/admin" : "/");
      return;
    }
  }, [auth, hydrated, isAuthorized, router]);

  return { auth: isAuthorized ? auth : null, checking: !hydrated || !isAuthorized };
}
