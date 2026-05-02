"use client";

import axios from "axios";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { AUTH_API_PATHS } from "@/lib/api/auth-endpoints";
import { SKIP_LOADING_HEADER } from "@/lib/api/client";
import type { ApiEnvelope, AuthEnvelopeData, AuthMeUser } from "@/lib/auth/types";
import { getPublicApiBaseUrl } from "@/lib/config/env";
import { useAuthStore } from "@/lib/store/auth.store";
import { useLoaderStore } from "@/stores/loader-store";

// Public candidate routes — share links, live interview page. Never
// authenticated, so skip the boot probe to avoid a pointless 401 round-trip
// (and, for the live agent page, unnecessary latency before the WS opens).
const PUBLIC_CANDIDATE_PREFIXES = ["/interviews/agent", "/interviews/vapi-agent"];

/**
 * Bare client used ONLY for the boot probe. We deliberately skip the shared
 * `apiClient` interceptor because a 401 here just means "anonymous visitor" —
 * not "session expired, bounce to /login". When the access cookie is expired
 * but the refresh cookie is still valid, we attempt one silent refresh below
 * before giving up (otherwise returning users get kicked to /login on reload).
 */
const probe = axios.create({
  baseURL: getPublicApiBaseUrl(),
  withCredentials: true,
  headers: { Accept: "application/json", "Content-Type": "application/json" },
});

async function tryRefresh(): Promise<boolean> {
  try {
    await probe.post<ApiEnvelope<AuthEnvelopeData>>(
      AUTH_API_PATHS.refresh,
      null,
      { headers: { [SKIP_LOADING_HEADER]: "true" } },
    );
    return true;
  } catch {
    return false;
  }
}

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
  const pathname = usePathname();
  const isPublicCandidateRoute = PUBLIC_CANDIDATE_PREFIXES.some((p) =>
    pathname?.startsWith(p),
  );

  useEffect(() => {
    if (hasBooted.current) return;
    hasBooted.current = true;

    if (isPublicCandidateRoute) {
      setUser(null);
      setReady(true);
      return;
    }

    let cancelled = false;
    const loader = useLoaderStore.getState();
    loader.show();
    (async () => {
      const fetchMe = () =>
        probe.get<ApiEnvelope<AuthMeUser>>(AUTH_API_PATHS.me);
      try {
        const { data: envelope } = await fetchMe();
        if (cancelled) return;
        setUser(envelope?.data ?? null);
      } catch (err) {
        const status = axios.isAxiosError(err) ? err.response?.status : undefined;
        if (status === 401 && (await tryRefresh())) {
          try {
            const { data: envelope } = await fetchMe();
            if (cancelled) return;
            setUser(envelope?.data ?? null);
          } catch {
            if (!cancelled) setUser(null);
          }
        } else if (!cancelled) {
          setUser(null);
        }
      } finally {
        loader.hide();
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [setUser, setReady, isPublicCandidateRoute]);

  return null;
}
