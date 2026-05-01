"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  LogIn,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";

import { authApi, orgsApi, parseApiError } from "@/lib/api";
import { SITE_LOGO } from "@/lib/site/marketing-site";
import { useAuthStore } from "@/lib/store/auth.store";

import { Button } from "@/components/ui/button";

export function AcceptInvitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const isReady = useAuthStore((s) => s.isReady);
  const me = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();

  const previewQuery = useQuery({
    queryKey: ["invitation", token],
    queryFn: () => orgsApi.previewInvitation(token),
    enabled: Boolean(token),
    retry: false,
  });

  const acceptMutation = useMutation({
    mutationFn: () => orgsApi.acceptInvitation(token),
    onSuccess: async (res) => {
      if (res.data?.status === "joined") {
        toast.success("Welcome aboard", {
          description: `You're now part of ${res.data.org_name ?? "the organization"}.`,
        });
        // refresh the profile so the dashboard sees the new role + org
        try {
          const refreshed = await authApi.getMe();
          if (refreshed.data) setUser(refreshed.data);
        } catch {
          /* non-fatal */
        }
        queryClient.invalidateQueries({ queryKey: ["org"] });
        queryClient.invalidateQueries({ queryKey: ["interviews"] });
        queryClient.invalidateQueries({ queryKey: ["questionnaires"] });
        router.replace("/interviews");
      } else {
        // signup_required
        router.replace(`/signup?invite_token=${encodeURIComponent(token)}`);
      }
    },
    onError: (error) =>
      toast.error("Couldn't accept invitation", {
        description: parseApiError(error),
      }),
  });

  if (!token) {
    return (
      <Shell>
        <Card
          icon={<AlertTriangle className="h-8 w-8 text-[var(--error-color)]" />}
          title="This invitation link is incomplete"
          body="The link is missing a token. Ask the person who invited you to send it again."
          action={
            <Button asChild variant="outline">
              <Link href="/">Go to homepage</Link>
            </Button>
          }
        />
      </Shell>
    );
  }

  if (previewQuery.isLoading || !isReady) {
    return null;
  }

  if (previewQuery.isError || !previewQuery.data?.data) {
    return (
      <Shell>
        <Card
          icon={<AlertTriangle className="h-8 w-8 text-[var(--error-color)]" />}
          title="We couldn't find this invitation"
          body={
            parseApiError(previewQuery.error) ||
            "The invitation may have expired or been revoked. Ask for a new one."
          }
          action={
            <Button asChild variant="outline">
              <Link href="/">Go to homepage</Link>
            </Button>
          }
        />
      </Shell>
    );
  }

  const preview = previewQuery.data.data;
  const signedIn = Boolean(me);
  const emailMatches =
    signedIn && me!.email.toLowerCase() === preview.email.toLowerCase();

  return (
    <Shell>
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-[var(--surface-2)] text-[var(--text-secondary)]">
          {preview.logo_signed_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview.logo_signed_url}
              alt={preview.org_name ?? "Organization logo"}
              className="h-full w-full object-cover"
            />
          ) : (
            <Building2 className="h-7 w-7" />
          )}
        </div>
        <div>
          <h1 className="text-[22px] font-bold text-foreground">
            You&apos;re invited to join {preview.org_name ?? "this organization"}
          </h1>
          <p className="mt-1 text-[14px] text-[var(--text-secondary)]">
            Role:{" "}
            <span className="font-semibold capitalize text-foreground">
              {preview.role}
            </span>
          </p>
          <p className="text-[13px] text-[var(--text-muted)]">
            Invitation for <span className="font-medium">{preview.email}</span>
          </p>
        </div>

        {signedIn && !emailMatches && (
          <div className="w-full rounded-xl border border-[var(--warning-color,#faad14)]/30 bg-[color:var(--warning-color,#faad14)]/10 px-4 py-3 text-left text-[13px] text-foreground">
            You&apos;re currently signed in as{" "}
            <span className="font-semibold">{me!.email}</span>. This invitation
            was sent to{" "}
            <span className="font-semibold">{preview.email}</span>. Sign out and
            sign in with the invited email, or accept the invitation by creating
            a new account.
          </div>
        )}

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          {signedIn && emailMatches ? (
            <Button
              onClick={() => acceptMutation.mutate()}
              disabled={acceptMutation.isPending}
              className="h-11 rounded-xl bg-[var(--primary-color)] px-5 font-semibold hover:bg-[var(--primary-color-hover)]"
            >
              {acceptMutation.isPending ? (
                "Joining…"
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Join {preview.org_name ?? "organization"}
                </>
              )}
            </Button>
          ) : (
            <>
              <Button asChild className="h-11 rounded-xl px-5 font-semibold">
                <Link
                  href={`/signup?invite_token=${encodeURIComponent(token)}&email=${encodeURIComponent(preview.email)}`}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create an account
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-xl px-5">
                <Link
                  href={`/login?invite_token=${encodeURIComponent(token)}`}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  I already have an account
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--background-color)]">
      <header className="flex items-center px-6 py-6">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <Image
            src={SITE_LOGO}
            alt="ReechOut"
            width={36}
            height={36}
            className="h-9 w-auto object-contain"
          />
          <span className="text-lg font-extrabold tracking-tight">
            <span className="text-[var(--product-name-color)]">Reech</span>
            <span className="text-[var(--primary-color)]">Out</span>
          </span>
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-[480px] rounded-[16px] border border-[var(--border-color-light)] bg-[var(--background-color)] p-8 shadow-[0_16px_48px_-20px_rgba(var(--shadow-rgb),0.25)] dark:border-white/[0.09]">
          {children}
        </div>
      </main>
    </div>
  );
}

function Card({
  icon,
  title,
  body,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-2)]">
        {icon}
      </div>
      <h1 className="text-[20px] font-bold text-foreground">{title}</h1>
      <p className="text-[14px] text-[var(--text-secondary)]">{body}</p>
      {action}
    </div>
  );
}
