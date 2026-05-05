import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

import type { ApiEnvelope, AuthEnvelopeData } from "@/lib/auth/types";
import { getPublicApiBaseUrl } from "@/lib/config/env";
import { AUTH_API_PATHS } from "@/lib/api/auth-endpoints";
import { queryClient } from "@/lib/query/query-client";
import { useLoaderStore } from "@/stores/loader-store";

/** Same as Angular `skip-loading` header on HttpRequest. */
export const SKIP_LOADING_HEADER = "skip-loading";

function shouldSkipLoading(config: InternalAxiosRequestConfig): boolean {
  const headers = config.headers;
  if (!headers) return false;
  const v = headers.get?.(SKIP_LOADING_HEADER) ?? headers[SKIP_LOADING_HEADER];
  return v === "true" || v === true;
}

function onClient(fn: () => void) {
  if (typeof window !== "undefined") fn();
}

/**
 * Bare client for the refresh call only — avoids the interceptor refresh loop.
 * `withCredentials` lets the browser attach / receive the httpOnly auth cookies.
 */
const refreshHttp = axios.create({
  baseURL: getPublicApiBaseUrl(),
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

async function redirectToLogin() {
  queryClient.clear();
  const { useAuthStore } = await import("@/lib/store/auth.store");
  useAuthStore.getState().clearAuth();
  // Best-effort: drop the server-side session too, but don't block on the response.
  try {
    await refreshHttp.post(AUTH_API_PATHS.logout, null, {
      headers: { [SKIP_LOADING_HEADER]: "true" },
    });
  } catch {
    /* ignore */
  }
  if (typeof window !== "undefined") {
    const path = window.location.pathname;
    if (!path.startsWith("/login")) {
      window.location.assign("/login");
    }
  }
}

function isAuthLoginUrl(url: string | undefined): boolean {
  if (!url) return false;
  return url.includes("auth/login") && !url.includes("refresh");
}

function isRefreshUrl(url: string | undefined): boolean {
  if (!url) return false;
  return url.includes("auth/refresh");
}

function isAuthApiPath(url: string | undefined): boolean {
  if (!url) return false;
  return url.includes("/auth/") || url.includes("auth/");
}

import { ONBOARDING_ROUTE_PREFIXES } from "@/lib/auth/onboarding";

function isOnboardingRoute(path: string): boolean {
  return ONBOARDING_ROUTE_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
}

/**
 * Accept only same-origin, single-slash paths. Rejects protocol-relative
 * (`//evil.com`), absolute URLs, and anything with control characters so a
 * compromised helper can't turn a 403 redirect into an open redirect.
 */
function isSafeInternalPath(path: string | null | undefined): path is string {
  if (!path) return false;
  if (!path.startsWith("/")) return false;
  if (path.startsWith("//")) return false;
  if (path.startsWith("/\\")) return false;
  for (let i = 0; i < path.length; i++) {
    const c = path.charCodeAt(i);
    if (c < 0x20 || c === 0x7f) return false;
  }
  return true;
}

/** After 403 from a protected HR endpoint, sync session and send user to the right onboarding step. */
function scheduleOnboardingRedirectAfter403(requestUrl: string | undefined) {
  if (isAuthApiPath(requestUrl)) {
    return;
  }
  onClient(() => {
    const path = window.location.pathname;
    if (isOnboardingRoute(path)) {
      return;
    }
    void (async () => {
      const { authApi } = await import("@/lib/api/auth");
      const { useAuthStore } = await import("@/lib/store/auth.store");
      const { getFirstIncompleteOnboardingPath } = await import("@/lib/auth/onboarding");
      try {
        const me = await authApi.getMe();
        useAuthStore.getState().setUser(me.data);
        const next = getFirstIncompleteOnboardingPath(me.data);
        if (isSafeInternalPath(next)) {
          window.location.assign(next);
        }
      } catch {
        /* leave user on page; they may retry */
      }
    })();
  });
}

/** Single in-flight refresh so parallel 401s share one rotation. */
let refreshPromise: Promise<void> | null = null;

function refreshAccessToken(): Promise<void> {
  if (!refreshPromise) {
    const p = (async () => {
      // Cookies carry the refresh token; the server rotates them on this call.
      const { data: envelope } = await refreshHttp.post<ApiEnvelope<AuthEnvelopeData>>(
        AUTH_API_PATHS.refresh,
        null,
        { headers: { [SKIP_LOADING_HEADER]: "true" } },
      );
      if (!envelope) {
        throw new Error("Session expired");
      }
      // The refresh response includes the fresh user profile; sync it so any
      // admin-triggered changes (approval, role updates) propagate without a
      // separate /auth/me round trip.
      const user = envelope.data?.user;
      if (user) {
        const { useAuthStore } = await import("@/lib/store/auth.store");
        useAuthStore.getState().setUser(user);
      }
    })();
    refreshPromise = p.finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

/**
 * Shared axios instance. Tokens live in httpOnly cookies so requests authenticate
 * themselves as long as `withCredentials: true` and CORS permit credentials.
 */
export const apiClient = axios.create({
  baseURL: getPublicApiBaseUrl(),
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    if (!shouldSkipLoading(config)) {
      onClient(() => useLoaderStore.getState().show());
    }
    return config;
  },
  (error) => {
    onClient(() => useLoaderStore.getState().hide());
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => {
    const config = response.config;
    if (!shouldSkipLoading(config)) {
      onClient(() => useLoaderStore.getState().hide());
    }
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (config && !shouldSkipLoading(config)) {
      onClient(() => useLoaderStore.getState().hide());
    }

    const status = error.response?.status;

    if (status === 403 && config) {
      scheduleOnboardingRedirectAfter403(config.url);
    }

    if (!error.response || status !== 401 || !config) {
      return Promise.reject(error);
    }

    const url = config.url ?? "";
    if (isAuthLoginUrl(url) || isRefreshUrl(url)) {
      return Promise.reject(error);
    }

    if (config._retry) {
      await redirectToLogin();
      return Promise.reject(error);
    }

    config._retry = true;

    try {
      await refreshAccessToken();
    } catch {
      await redirectToLogin();
      return Promise.reject(error);
    }

    return apiClient(config);
  },
);

export function parseApiError(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : "An unexpected error occurred.";
  }

  const raw = error.response?.data as
    | ApiEnvelope<unknown>
    | { detail?: string | { message?: string } }
    | undefined;

  if (raw && typeof raw === "object" && "detail" in raw) {
    const d = raw.detail;
    if (typeof d === "string") {
      return d;
    }
    if (d && typeof d === "object" && "message" in d && typeof (d as { message: string }).message === "string") {
      return (d as { message: string }).message;
    }
  }

  const body = error.response?.data as ApiEnvelope<unknown> | undefined;
  if (body?.message) {
    return body.message;
  }

  const err = body?.error;
  if (typeof err === "string") {
    return err;
  }
  if (err && typeof err === "object" && "detail" in err) {
    const d = (err as { detail?: unknown }).detail;
    if (typeof d === "string") {
      return d;
    }
    if (Array.isArray(d) && d[0] && typeof d[0] === "object" && "message" in (d[0] as object)) {
      return String((d[0] as { message: string }).message);
    }
  }

  return error.message || "An unexpected error occurred.";
}

export function parseFieldErrors(error: unknown): Record<string, string> {
  if (!axios.isAxiosError(error)) return {};
  const body = error.response?.data as ApiEnvelope<unknown> | undefined;
  const err = body?.error;
  if (!err || typeof err !== "object" || Array.isArray(err)) {
    return {};
  }
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(err as Record<string, unknown>)) {
    if (k === "detail") continue;
    if (Array.isArray(v) && v[0] != null) {
      out[k] = String(v[0]);
    } else if (typeof v === "string") {
      out[k] = v;
    }
  }
  return out;
}
