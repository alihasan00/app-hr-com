"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { getFirstIncompleteOnboardingPath } from "@/lib/auth/onboarding";
import { useAuthStore } from "@/lib/store";

/**
 * Dashboard gate: renders children only when the user is fully onboarded.
 * Reads from the Zustand store populated at app boot by `AuthBootstrap` —
 * no network call here. If the session is invalid, the axios interceptor
 * (on any API call made by the dashboard) will 401 → refresh → redirect.
 */
export function DashboardOnboardingGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isReady = useAuthStore((s) => s.isReady);

  useEffect(() => {
    if (!isReady) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    const next = getFirstIncompleteOnboardingPath(user);
    if (next) {
      router.replace(next);
    }
  }, [isReady, user, router]);

  const ready = isReady && user && !getFirstIncompleteOnboardingPath(user);
  if (!ready) {
    return null;
  }

  return <>{children}</>;
}
