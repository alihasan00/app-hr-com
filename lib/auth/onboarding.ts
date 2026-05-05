import type { AuthMeUser } from "@/lib/auth/types";

export const ONBOARDING_ROUTES = {
  verifyEmail: "/verify-email",
  companySetup: "/company-setup",
  pendingApproval: "/pending-approval",
} as const;

export const ONBOARDING_ROUTE_PREFIXES: readonly string[] = [
  ONBOARDING_ROUTES.verifyEmail,
  ONBOARDING_ROUTES.companySetup,
  ONBOARDING_ROUTES.pendingApproval,
];

/** First path to send the user, or `null` if they can use the app (interviews). */
export function getFirstIncompleteOnboardingPath(user: AuthMeUser): string | null {
  if (!user.email_verified) {
    return ONBOARDING_ROUTES.verifyEmail;
  }
  if (!user.company_profile_completed || !user.org_id) {
    return ONBOARDING_ROUTES.companySetup;
  }
  if (!user.account_approved) {
    return ONBOARDING_ROUTES.pendingApproval;
  }
  return null;
}
