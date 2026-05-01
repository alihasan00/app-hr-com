"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  authCardClassName,
  authCardEyebrowClassName,
  authCardHeaderClassName,
  authCardHeaderLineClassName,
  authCardInnerClassName,
  authCardSubtitleClassName,
  authCardTitleClassName,
  authFormErrorBoxClassName,
  authLabelClassName,
  authSubmitButtonClassName,
  authSignInLinkClassName,
  authSignInTextClassName,
} from "@/app/(auth)/auth-tokens";
import AuthFooter from "@/app/(auth)/components/AuthFooter";
import { AuthInputField } from "@/app/(auth)/components/AuthInputField";
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
import axios from "axios";
import { authApi, parseApiError } from "@/lib/api";
import { cn } from "@/lib/ui/cn";
import { useAuthStore } from "@/lib/store";
import { getFirstIncompleteOnboardingPath } from "@/lib/auth/onboarding";
import { useOnboardingStepGuard } from "@/lib/auth/use-onboarding-step-guard";

const verifyEmailSchema = z.object({
  code: z
    .string()
    .trim()
    .min(6, "Code must be 6 digits")
    .max(6, "Code must be 6 digits"),
});

type VerifyEmailFormValues = z.infer<typeof verifyEmailSchema>;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-[14px] text-[var(--error-color)]">{message}</p>;
}

export default function VerifyEmailPage() {
  const router = useRouter();
  const stepOk = useOnboardingStepGuard("verify");
  const [formError, setFormError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyEmailFormValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { code: "" },
  });

  useEffect(() => {
    if (stepOk) {
      setCountdown(60);
    }
  }, [stepOk]);

  useEffect(() => {
    if (!stepOk) {
      return;
    }
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, stepOk]);

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: VerifyEmailFormValues) => authApi.verifyEmail(payload.code),
    onSuccess: (response) => {
      const me = response.data;
      setUser(me);
      const next = getFirstIncompleteOnboardingPath(me);
      router.replace(next ? next : "/interviews");
    },
    onError: (error) => {
      setFormError(parseApiError(error));
    },
  });

  const onSubmit = (values: VerifyEmailFormValues) => {
    setFormError(null);
    mutate(values);
  };

  const handleResend = async () => {
    if (isResending || countdown > 0) return;
    setIsResending(true);
    setFormError(null);
    try {
      await authApi.resendVerification();
      setCountdown(60);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        const msg: string = (error.response.data as { message?: string })?.message ?? "";
        const match = msg.match(/wait (\d+) seconds/);
        setCountdown(match ? parseInt(match[1], 10) : 60);
      }
      setFormError(parseApiError(error));
    } finally {
      setIsResending(false);
    }
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
                <header className={authCardHeaderClassName}>
                  <div className={authCardHeaderLineClassName} />
                  <p className={authCardEyebrowClassName}>Security</p>
                  <h2 className={authCardTitleClassName}>Verify your email</h2>
                  <p className={authCardSubtitleClassName}>
                    Enter the 6-digit code we sent to your inbox. It expires in a few minutes.
                  </p>
                </header>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  {formError && (
                    <div className={authFormErrorBoxClassName} role="alert">
                      {formError}
                    </div>
                  )}

                  <div className="space-y-[8px]">
                    <label htmlFor="code" className={authLabelClassName}>
                      Code
                    </label>
                    <AuthInputField
                      id="code"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      placeholder="000000"
                      icon={<Lock className="text-[var(--text-muted)]" size={20} />}
                      {...register("code")}
                      aria-invalid={!!errors.code}
                    />
                    <FieldError message={errors.code?.message} />
                  </div>

                  <button
                    type="submit"
                    className={authSubmitButtonClassName}
                    disabled={isPending}
                  >
                    {isPending ? "Verifying..." : "Verify"}
                  </button>

                  <div className="text-center text-[14px]">
                    <span className="text-[var(--text-muted)] mr-2">Didn&apos;t receive a code?</span>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={isResending || countdown > 0}
                      className={cn(
                        "text-[var(--brand-color)] font-medium hover:underline",
                        (isResending || countdown > 0) && "opacity-50 cursor-not-allowed no-underline"
                      )}
                    >
                      {isResending ? "Sending..." : countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}
                    </button>
                  </div>
                </form>

                <div className="mt-[32px] text-center">
                  <span className={authSignInTextClassName}>Wrong account? </span>
                  <Link href="/login" className={authSignInLinkClassName}>
                    Sign in
                  </Link>
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
