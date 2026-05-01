"use client";

import axios from "axios";
import { useEffect, useRef } from "react";

import { AUTH_API_PATHS } from "@/lib/api/auth-endpoints";
import type { ApiEnvelope, AuthMeUser } from "@/lib/auth/types";
import { getPublicApiBaseUrl } from "@/lib/config/env";
import { useAuthStore } from "@/lib/store/auth.store";
import { useLoaderStore } from "@/stores/loader-store";

/**
 * Bare client used ONLY for the boot probe. We deliberately skip the shared
 * `apiClient` interceptor because a 401 here just means "anonymous visitor" —
 * not "session expired, bounce to /login".
 */
const probe = axios.create({
  baseURL: getPublicApiBaseUrl(),
  withCredentials: true,
  headers: { Accept: "application/json" },
});

/**
 * Runs once on app mount. Calls `/auth/me`, hydrates the Zustand store, and
 * flips `isReady` so every guard can become a pure read. Replaces the
 * per-page `/auth/me` calls that used to happen in the dashboard gate and
 * each onboarding step guard.
 *
 * Intentionally renders nothing — sits inside the providers in the root layout.
 */
export function AuthBootstrap() {
  const setUser = useAuthStore((s) => s.setUser);
  const setReady = useAuthStore((s) => s.setReady);
  const hasBooted = useRef(false);

  useEffect(() => {
    if (hasBooted.current) return;
    hasBooted.current = true;

    let cancelled = false;
    const loader = useLoaderStore.getState();
    loader.show();
    (async () => {
      try {
        const { data: envelope } = await probe.get<ApiEnvelope<AuthMeUser>>(
          AUTH_API_PATHS.me,
        );
        if (cancelled) return;
        setUser(envelope?.data ?? null);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        loader.hide();
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [setUser, setReady]);

  return null;
}
