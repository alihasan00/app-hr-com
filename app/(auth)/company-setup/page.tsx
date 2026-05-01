"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Building, Globe, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { authApi, parseApiError } from "@/lib/api";
import { isPersonalEmail } from "@/lib/company-email-policy";
import { cn } from "@/lib/ui/cn";
import { useAuthStore } from "@/lib/store";
import { getFirstIncompleteOnboardingPath } from "@/lib/auth/onboarding";
import { useOnboardingStepGuard } from "@/lib/auth/use-onboarding-step-guard";

const companySetupSchema = z.object({
  company_name: z
    .string()
    .trim()
    .min(2, "Company name is required (at least 2 characters)")
    .max(255, "Company name is too long"),
  company_email: z
    .string()
    .trim()
    .min(1, "Company email is required")
    .email("Enter a valid email")
    .transform((s) => s.toLowerCase())
    .refine((s) => !isPersonalEmail(s), {
      message:
        "Use a work email, not a personal provider (Gmail, Outlook, Yahoo, iCloud, etc.)",
    }),
  company_website: z
    .string()
    .trim()
    .min(1, "Company website is required")
    .transform((s) => (s.startsWith("http://") || s.startsWith("https://") ? s : `https://${s}`))
    .refine((s) => z.string().url().safeParse(s).success, {
      message: "Enter a valid website URL",
    }),
  intended_use: z
    .string()
    .trim()
    .min(3, "Please tell us a bit more")
    .max(2000, "Maximum 2000 characters"),
});

type CompanySetupFormValues = z.infer<typeof companySetupSchema>;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-[14px] text-[var(--error-color)]">{message}</p>;
}

export default function CompanySetupPage() {
  const router = useRouter();
  const stepOk = useOnboardingStepGuard("setup");
  const [formError, setFormError] = useState<string | null>(null);
  const setUser = useAuthStore((s) => s.setUser);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanySetupFormValues>({
    resolver: zodResolver(companySetupSchema),
    defaultValues: {
      company_name: "",
      company_email: "",
      company_website: "",
      intended_use: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: CompanySetupFormValues) =>
      authApi.completeCompanyProfile({
        company_name: payload.company_name.trim(),
        company_email: payload.company_email,
        company_website: payload.company_website,
        intended_use: payload.intended_use,
      }),
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

  const onSubmit = (values: CompanySetupFormValues) => {
    setFormError(null);
    mutate(values);
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
                  <p className={authCardEyebrowClassName}>Profile</p>
                  <h2 className={authCardTitleClassName}>Company details</h2>
                  <p className={authCardSubtitleClassName}>
                    All fields are required. Use a work email (not Gmail, Outlook, or other personal
                    inboxes) so we can review your request.
                  </p>
                </header>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  {formError && (
                    <div className={authFormErrorBoxClassName} role="alert">
                      {formError}
                    </div>
                  )}

                  <div className="space-y-[8px]">
                    <label htmlFor="company_name" className={authLabelClassName}>
                      Company name
                    </label>
                    <AuthInputField
                      id="company_name"
                      type="text"
                      placeholder="Acme Inc."
                      icon={<Building className="text-[var(--text-muted)]" size={20} />}
                      {...register("company_name")}
                      aria-invalid={!!errors.company_name}
                    />
                    <FieldError message={errors.company_name?.message} />
                  </div>

                  <div className="space-y-[8px]">
                    <label htmlFor="company_email" className={authLabelClassName}>
                      Company / work email
                    </label>
                    <AuthInputField
                      id="company_email"
                      type="email"
                      autoComplete="email"
                      placeholder="work@company.com"
                      icon={<Mail className="text-[var(--text-muted)]" size={20} />}
                      {...register("company_email")}
                      aria-invalid={!!errors.company_email}
                    />
                    <FieldError message={errors.company_email?.message} />
                  </div>

                  <div className="space-y-[8px]">
                    <label htmlFor="company_website" className={authLabelClassName}>
                      Company website
                    </label>
                    <AuthInputField
                      id="company_website"
                      type="url"
                      placeholder="https://example.com"
                      icon={<Globe className="text-[var(--text-muted)]" size={20} />}
                      {...register("company_website")}
                      aria-invalid={!!errors.company_website}
                    />
                    <FieldError message={errors.company_website?.message} />
                  </div>

                  <div className="space-y-[8px]">
                    <label htmlFor="intended_use" className={authLabelClassName}>
                      What roles are you hiring for right now?
                    </label>
                    <div className="relative">
                      <textarea
                        id="intended_use"
                        rows={4}
                        placeholder="A few sentences is enough..."
                        className={cn(
                          "flex w-full rounded-[var(--radius)] border bg-[var(--input-bg)] text-[14px]",
                          "px-3 py-3 ring-offset-background transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                          "disabled:cursor-not-allowed disabled:opacity-50",
                          errors.intended_use
                            ? "border-[var(--error-color)]"
                            : "border-[var(--input-border)] placeholder:text-[var(--text-muted)]"
                        )}
                        {...register("intended_use")}
                        aria-invalid={!!errors.intended_use}
                      />
                    </div>
                    <FieldError message={errors.intended_use?.message} />
                  </div>

                  <button
                    type="submit"
                    className={authSubmitButtonClassName}
                    disabled={isPending}
                  >
                    {isPending ? "Saving..." : "Continue"}
                  </button>
                </form>
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
