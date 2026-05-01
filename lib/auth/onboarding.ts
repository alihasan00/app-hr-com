import type { AuthMeUser } from "@/lib/auth/types";

/** First path to send the user, or `null` if they can use the app (interviews). */
export function getFirstIncompleteOnboardingPath(user: AuthMeUser): string | null {
  if (!user.email_verified) {
    return '/verify-email';
  }
  if (!user.company_profile_completed || !user.org_id) {
    return '/company-setup';
  }
  if (!user.account_approved) {
    return '/pending-approval';
  }
  return null;
}
