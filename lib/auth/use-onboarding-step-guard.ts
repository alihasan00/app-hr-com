"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { getFirstIncompleteOnboardingPath } from "@/lib/auth/onboarding";
import { useAuthStore } from "@/lib/store";

export type OnboardingStepName = "verify" | "setup" | "pending";

/**
 * Checks that the current page matches the user's actual onboarding step,
 * redirecting if they've already completed it or haven't reached it yet.
 * Pure store read — no network call. Boot-time `/auth/me` populates the
 * store, and mutation responses keep it fresh.
 *
 * Returns `true` once the guard has decided the user belongs on this page.
 */
export function useOnboardingStepGuard(step: OnboardingStepName): boolean {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isReady = useAuthStore((s) => s.isReady);

  useEffect(() => {
    if (!isReady) return;
    if (!user) {
      router.replace("/login");
      return;
    }

    if (step === "verify") {
      if (user.email_verified) {
        router.replace(getFirstIncompleteOnboardingPath(user) ?? "/interviews");
      }
    } else if (step === "setup") {
      if (!user.email_verified) {
        router.replace("/verify-email");
        return;
      }
      if (user.company_profile_completed && user.org_id) {
        router.replace(getFirstIncompleteOnboardingPath(user) ?? "/interviews");
      }
    } else {
      if (!user.email_verified) {
        router.replace("/verify-email");
        return;
      }
      if (!user.company_profile_completed) {
        router.replace("/company-setup");
        return;
      }
      if (user.account_approved) {
        router.replace("/interviews");
      }
    }
  }, [isReady, user, step, router]);

  if (!isReady || !user) return false;

  if (step === "verify") return !user.email_verified;
  if (step === "setup")
    return (
      user.email_verified &&
      (!user.company_profile_completed || !user.org_id)
    );
  // "pending"
  return (
    user.email_verified && user.company_profile_completed && !user.account_approved
  );
}
