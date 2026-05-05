"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { sanitizeInviteToken } from "@/lib/auth/invite";
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
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = sanitizeInviteToken(searchParams.get("invite_token"));
  const setSession = useAuthStore((s) => s.setSession);
  const [formError, setFormError] = useState<string | null>(null);

  useRedirectIfAuthenticatedWithOnboarding();

  const [serverFieldErrors, setServerFieldErrors] = useState<
    Partial<Record<keyof LoginFormValues, string>>
  >({});

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
      if (Object.keys(fieldErrors).length) {
        setServerFieldErrors({
          email: fieldErrors.email,
          password: fieldErrors.password,
        });
      } else {
        setFormError(parseApiError(error));
      }
    },
  });

  const form = useForm({
    defaultValues: { email: "", password: "" } as LoginFormValues,
    validators: { onSubmit: loginSchema },
    onSubmit: ({ value }) => {
      setFormError(null);
      setServerFieldErrors({});
      mutate(value);
    },
  });

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

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    void form.handleSubmit();
                  }}
                  className="flex flex-col gap-4"
                >
                  {formError ? (
                    <div className={authFormErrorBoxClassName} role="alert">
                      {formError}
                    </div>
                  ) : null}

                  <form.Field name="email">
                    {(field) => (
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
                          name={field.name}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                        />
                        <FieldError
                          message={
                            serverFieldErrors.email ??
                            field.state.meta.errors[0]?.message
                          }
                        />
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="password">
                    {(field) => (
                      <div>
                        <label htmlFor="login-password" className={authLabelClassName}>
                          Password
                        </label>
                        <AuthPasswordField
                          id="login-password"
                          autoComplete="current-password"
                          placeholder="••••••••"
                          icon={<Lock className="h-4 w-4" strokeWidth={2} aria-hidden />}
                          name={field.name}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                        />
                        <FieldError
                          message={
                            serverFieldErrors.password ??
                            field.state.meta.errors[0]?.message
                          }
                        />
                        <div className={authForgotRowClassName}>
                          <Link href="/forgot-password" className={authForgotLinkClassName}>
                            Forgot password?
                          </Link>
                        </div>
                      </div>
                    )}
                  </form.Field>

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
