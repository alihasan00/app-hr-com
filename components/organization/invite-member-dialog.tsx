"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { orgsApi, parseApiError } from "@/lib/api";
import { inviteMemberSchema, type InviteMemberFormValues } from "@/lib/orgs/schemas";
import type { InviteRole } from "@/lib/orgs/types";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
      <DialogContent className="sm:max-w-[480px]">
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
                <Select
                  value={field.value}
                  onValueChange={(v) => field.onChange(v as InviteRole)}
                >
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member — view access only</SelectItem>
                    <SelectItem value="admin">Admin — manage org + members</SelectItem>
                  </SelectContent>
                </Select>
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
