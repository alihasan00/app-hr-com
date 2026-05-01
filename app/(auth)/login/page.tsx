"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  authCardClassName,
  authCardHeaderClassName,
  authCardHeaderLineClassName,
  authCardInnerClassName,
  authCardSubtitleClassName,
  authCardTitleClassName,
  authForgotLinkClassName,
  authForgotRowClassName,
  authFormErrorBoxClassName,
  authLabelClassName,
  authSignInLinkClassName,
  authSignInTextClassName,
  authSubmitButtonClassName,
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
import { AuthPasswordField } from "@/app/(auth)/components/AuthPasswordField";
import { AuthWordmark } from "@/app/(auth)/components/AuthWordmark";
import { loginSchema, type LoginFormValues } from "@/lib/auth/auth-schemas";
import { authApi, orgsApi, parseApiError, parseFieldErrors } from "@/lib/api";
import { useRedirectIfAuthenticatedWithOnboarding } from "@/lib/auth/use-redirect-if-authenticated-with-onboarding";
import { getFirstIncompleteOnboardingPath } from "@/lib/auth/onboarding";
import { useAuthStore } from "@/lib/store";
import type { LoginPayload } from "@/lib/auth/types";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-[14px] text-[var(--error-color)]">{message}</p>;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite_token") ?? "";
  const setSession = useAuthStore((s) => s.setSession);
  const [formError, setFormError] = useState<string | null>(null);

  useRedirectIfAuthenticatedWithOnboarding();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const loginRes = await authApi.login(payload.email, payload.password);
      if (inviteToken && loginRes.data?.user) {
        try {
          await orgsApi.acceptInvitation(inviteToken);
          const refreshed = await authApi.getMe();
          if (refreshed.data) {
            loginRes.data.user = refreshed.data;
          }
        } catch {
          /* non-fatal — email mismatch or expired token */
        }
      }
      return loginRes;
    },
    onSuccess: (loginRes) => {
      const user = loginRes.data?.user;
      if (user) {
        setSession(user);
        const path = getFirstIncompleteOnboardingPath(user);
        router.replace(path ? path : "/interviews");
      } else {
        router.replace("/interviews");
      }
    },
    onError: (error) => {
      const fieldErrors = parseFieldErrors(error);
      if (fieldErrors.email) {
        setError("email", { message: fieldErrors.email });
      }
      if (fieldErrors.password) {
        setError("password", { message: fieldErrors.password });
      }
      if (!Object.keys(fieldErrors).length) {
        setFormError(parseApiError(error));
      }
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    setFormError(null);
    mutate(values);
  };

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
                  <h2 className={authCardTitleClassName}>Welcome back</h2>
                  <p className={authCardSubtitleClassName}>Sign in to your workspace.</p>
                </header>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  {formError ? (
                    <div className={authFormErrorBoxClassName} role="alert">
                      {formError}
                    </div>
                  ) : null}

                  <div>
                    <label htmlFor="login-email" className={authLabelClassName}>
                      Email
                    </label>
                    <AuthInputField
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      placeholder="jane@company.com"
                      icon={<Mail className="h-4 w-4" strokeWidth={2} aria-hidden />}
                      {...register("email")}
                    />
                    <FieldError message={errors.email?.message} />
                  </div>

                  <div>
                    <label htmlFor="login-password" className={authLabelClassName}>
                      Password
                    </label>
                    <AuthPasswordField
                      id="login-password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      icon={<Lock className="h-4 w-4" strokeWidth={2} aria-hidden />}
                      {...register("password")}
                    />
                    <FieldError message={errors.password?.message} />
                    <div className={authForgotRowClassName}>
                      <Link href="/forgot-password" className={authForgotLinkClassName}>
                        Forgot password?
                      </Link>
                    </div>
                  </div>

                  <button type="submit" disabled={isPending} className={authSubmitButtonClassName}>
                    {isPending ? "Signing in…" : "Sign In"}
                  </button>
                </form>
              </div>
            </div>

            <p className={authSignInTextClassName}>
              Don&apos;t have an account?{" "}
              <Link href="/signup" className={authSignInLinkClassName}>
                Create one free
              </Link>
            </p>
          </AuthFormStack>
        </AuthRightMain>

        <AuthFooterSlot>
          <AuthFooter />
        </AuthFooterSlot>
      </AuthRightColumn>
    </AuthPageRoot>
  );
}
