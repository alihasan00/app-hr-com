"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Check, ShieldCheck, UserRound } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { orgsApi, parseApiError } from "@/lib/api";
import { inviteMemberSchema, type InviteMemberFormValues } from "@/lib/orgs/schemas";
import type { InviteRole } from "@/lib/orgs/types";
import { cn } from "@/lib/ui/cn";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RoleOption = {
  value: InviteRole;
  title: string;
  tagline: string;
  icon: typeof UserRound;
  details: string[];
};

const ROLE_OPTIONS: RoleOption[] = [
  {
    value: "member",
    title: "Member",
    tagline: "View-only collaborator",
    icon: UserRound,
    details: [
      "Browse interviews and candidate reports",
      "See questionnaires the team has built",
      "Cannot create, edit, or delete content",
    ],
  },
  {
    value: "admin",
    title: "Admin",
    tagline: "Full team manager",
    icon: ShieldCheck,
    details: [
      "Create, edit, and delete interviews & questionnaires",
      "Invite teammates and change their roles",
      "Update organization details and branding",
    ],
  },
];

export function InviteMemberDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const form = useForm<InviteMemberFormValues>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: { email: "", role: "member" },
  });

  const createMutation = useMutation({
    mutationFn: (values: InviteMemberFormValues) =>
      orgsApi.createInvitation({
        email: values.email,
        role: values.role as InviteRole,
      }),
    onSuccess: () => {
      toast.success("Invitation sent", {
        description: "Your teammate will get an email with an accept link.",
      });
      form.reset({ email: "", role: "member" });
      onCreated();
      onClose();
    },
    onError: (error) =>
      toast.error("Couldn't send invitation", {
        description: parseApiError(error),
      }),
  });

  const onSubmit = form.handleSubmit((values) => createMutation.mutate(values));

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          form.reset({ email: "", role: "member" });
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Invite a teammate</DialogTitle>
          <DialogDescription>
            We&apos;ll send an email with a secure accept link. Invites expire after 14 days.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="invite_email"
              className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]"
            >
              Email
            </Label>
            <Input
              id="invite_email"
              type="email"
              {...form.register("email")}
              placeholder="teammate@company.com"
              className="h-11 rounded-xl"
              autoComplete="off"
            />
            {form.formState.errors.email && (
              <p className="text-[12px] text-[var(--error-color)]">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]">
              Role
            </Label>
            <Controller
              control={form.control}
              name="role"
              render={({ field }) => (
                <div
                  role="radiogroup"
                  aria-label="Role"
                  className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                >
                  {ROLE_OPTIONS.map((option) => (
                    <RoleCard
                      key={option.value}
                      option={option}
                      selected={field.value === option.value}
                      onSelect={() => field.onChange(option.value)}
                    />
                  ))}
                </div>
              )}
            />
            {form.formState.errors.role && (
              <p className="text-[12px] text-[var(--error-color)]">
                {form.formState.errors.role.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Sending…" : "Send invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RoleCard({
  option,
  selected,
  onSelect,
}: {
  option: RoleOption;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = option.icon;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "group relative flex h-full flex-col gap-3 overflow-hidden rounded-[var(--radius-md)] p-4 text-left",
        "border backdrop-blur-[20px] backdrop-saturate-[180%] transition-all duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        selected
          ? "border-[var(--glass-border-dark)] bg-gradient-to-br from-[var(--glass-primary-overlay-medium)] to-[var(--glass-primary-overlay)] shadow-[0_8px_24px_-12px_rgba(var(--primary-color-rgb),0.35)]"
          : "border-[var(--glass-border-light)] bg-[var(--glass-bg-light)] hover:border-[var(--glass-border-medium)] hover:bg-gradient-to-br hover:from-[var(--glass-primary-overlay)] hover:to-[var(--glass-primary-overlay-light)]",
      )}
    >
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--glass-white-overlay-dark)] to-transparent" />

      <div className="flex items-start justify-between gap-2">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] transition-colors",
            selected
              ? "bg-[rgba(var(--primary-color-rgb),0.15)] text-[var(--primary-color)]"
              : "bg-[color-mix(in_srgb,var(--foreground)_6%,transparent)] text-[var(--text-secondary)] group-hover:text-[var(--primary-color)]",
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
        <span
          aria-hidden
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all",
            selected
              ? "border-[var(--primary-color)] bg-[var(--primary-color)] text-white"
              : "border-[color-mix(in_srgb,var(--foreground)_18%,transparent)] bg-transparent text-transparent",
          )}
        >
          <Check className="h-3 w-3" strokeWidth={3.5} />
        </span>
      </div>

      <div className="flex flex-col gap-0.5">
        <div className="text-[14px] font-semibold text-[var(--text-heading)]">
          {option.title}
        </div>
        <div className="text-[12px] text-[var(--text-secondary)]">
          {option.tagline}
        </div>
      </div>

      <ul className="flex flex-col gap-1.5 text-[12px] leading-[1.45] text-[var(--text-secondary)]">
        {option.details.map((detail) => (
          <li key={detail} className="flex items-start gap-2">
            <span
              aria-hidden
              className={cn(
                "mt-[6px] h-1 w-1 shrink-0 rounded-full transition-colors",
                selected
                  ? "bg-[var(--primary-color)]"
                  : "bg-[color-mix(in_srgb,var(--foreground)_25%,transparent)]",
              )}
            />
            <span>{detail}</span>
          </li>
        ))}
      </ul>
    </button>
  );
}
