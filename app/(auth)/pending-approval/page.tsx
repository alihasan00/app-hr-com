"use client";

import { Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  authCardClassName,
  authCardEyebrowClassName,
  authCardHeaderClassName,
  authCardHeaderLineClassName,
  authCardInnerClassName,
  authCardSubtitleClassName,
  authCardTitleClassName,
  authSubmitButtonClassName,
} from "@/app/(auth)/auth-tokens";
import AuthFooter from "@/app/(auth)/components/AuthFooter";
import AuthLeftPanel from "@/app/(auth)/components/AuthLeftPanel";
import {
  AuthFooterSlot,
  AuthFormStack,
  AuthMobileLogoRow,
  AuthPageRoot,
  AuthRightColumn,
  AuthRightMain,
} from "@/app/(auth)/components/auth-page-layout";
import { AuthWordmark } from "@/app/(auth)/components/AuthWordmark";
import { useAuthStore } from "@/lib/store";
import { useOnboardingStepGuard } from "@/lib/auth/use-onboarding-step-guard";

export default function PendingApprovalPage() {
  const router = useRouter();
  const stepOk = useOnboardingStepGuard("pending");
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const user = useAuthStore((s) => s.user);

  const handleSignOut = async () => {
    try {
      const { authApi } = await import("@/lib/api");
      await authApi.logout();
    } catch {
      /* best effort */
    }
    clearAuth();
    router.replace("/login");
  };

  if (!stepOk) {
    return null;
  }

  return (
    <AuthPageRoot>
      <AuthLeftPanel />

      <AuthRightColumn>
        <AuthRightMain>
          <AuthFormStack>
            <AuthMobileLogoRow>
              <AuthWordmark href="/" />
            </AuthMobileLogoRow>

            <div className={authCardClassName}>
              <div className={authCardInnerClassName}>
                <div className="flex justify-center mb-[24px]">
                  <div className="flex items-center justify-center w-[56px] h-[56px] rounded-full bg-[var(--brand-color)] bg-opacity-10">
                    <Clock className="text-[var(--brand-color)]" size={28} />
                  </div>
                </div>

                <header className={authCardHeaderClassName}>
                  <div className={authCardHeaderLineClassName} />
                  <p className={authCardEyebrowClassName}>Review</p>
                  <h2 className={authCardTitleClassName}>Account under review</h2>
                  <p className={authCardSubtitleClassName}>
                    Please wait while an administrator reviews and approves your access. We&apos;ll notify you
                    at the email below when you can use the full product.
                  </p>
                  {user?.email && (
                    <p className="mt-[16px] text-[14px] text-[var(--text-foreground)] font-medium text-center">
                      {user.email}
                    </p>
                  )}
                </header>

                <div className="mt-[32px] space-y-[16px]">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className={authSubmitButtonClassName}
                  >
                    Sign out
                  </button>

                  <div className="text-center">
                    <Link href="/" className="text-[14px] text-[var(--text-muted)] hover:text-[var(--text-foreground)] transition-colors">
                      Back to home
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </AuthFormStack>
        </AuthRightMain>

        <AuthFooterSlot>
          <AuthFooter />
        </AuthFooterSlot>
      </AuthRightColumn>
    </AuthPageRoot>
  );
}
