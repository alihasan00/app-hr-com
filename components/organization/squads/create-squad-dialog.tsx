"use client";

import { useForm, useStore } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Camera, Pencil, Trash2, UserPlus, UsersRound } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { orgsApi, parseApiError, squadsApi } from "@/lib/api";
import type { OrgMember } from "@/lib/orgs/types";
import {
  SQUAD_AVATAR_ACCEPTED_TYPES,
  SQUAD_AVATAR_MAX_BYTES,
  squadCreateSchema,
  type SquadCreateFormValues,
} from "@/lib/squads/schemas";
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
import { Textarea } from "@/components/ui/textarea";

import { MemberPickerDialog } from "./member-picker-dialog";

function memberInitials(first: string, last: string, email: string): string {
  const f = (first || "").trim().charAt(0);
  const l = (last || "").trim().charAt(0);
  const joined = `${f}${l}`.toUpperCase();
  if (joined) return joined;
  return (email || "?").charAt(0).toUpperCase();
}

function displayName(m: OrgMember): string {
  return [m.first_name, m.last_name].filter(Boolean).join(" ") || m.email;
}

const STACK_MAX = 5;

export function CreateSquadDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(null);
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  useEffect(() => {
    if (!open) {
      setAvatarFile(null);
    }
  }, [open]);

  const membersQuery = useQuery({
    queryKey: ["org", "members"],
    queryFn: () => orgsApi.listMembers(),
    enabled: open,
  });
  const memberLookup = useMemo(() => {
    const map = new Map<string, OrgMember>();
    for (const m of membersQuery.data?.data?.members ?? []) {
      map.set(m.user_id, m);
    }
    return map;
  }, [membersQuery.data?.data?.members]);

  const createMutation = useMutation({
    mutationFn: async (values: SquadCreateFormValues) => {
      const res = await squadsApi.create({
        name: values.name,
        description: values.description,
        member_ids: values.member_ids,
      });
      const squadId = res.data?.id;
      if (squadId && avatarFile) {
        try {
          await squadsApi.uploadAvatar(squadId, avatarFile);
        } catch (err) {
          // Avatar upload is best-effort — surface a soft warning but don't
          // reverse the create.
          toast.warning("Squad created, but the avatar couldn't be uploaded", {
            description: parseApiError(err),
          });
        }
      }
      return res;
    },
    onSuccess: () => {
      toast.success("Squad created");
      form.reset();
      setAvatarFile(null);
      onCreated();
      onClose();
    },
    onError: (error) =>
      toast.error("Couldn't create squad", {
        description: parseApiError(error),
      }),
  });

  const form = useForm({
    defaultValues: {
      name: "",
      description: undefined,
      member_ids: [],
    } as SquadCreateFormValues,
    validators: { onSubmit: squadCreateSchema },
    onSubmit: ({ value }) => createMutation.mutate(value),
  });

  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (
      !SQUAD_AVATAR_ACCEPTED_TYPES.includes(
        file.type as (typeof SQUAD_AVATAR_ACCEPTED_TYPES)[number],
      )
    ) {
      toast.error("Unsupported image type", {
        description: "Upload a PNG, JPEG, WebP, or GIF.",
      });
      return;
    }
    if (file.size > SQUAD_AVATAR_MAX_BYTES) {
      toast.error("Image too large", { description: "Max size is 5 MB." });
      return;
    }
    setAvatarFile(file);
  };

  const nameValue = useStore(form.store, (s) => s.values.name);
  const avatarInitials = useMemo(() => {
    const parts = (nameValue || "").trim().split(/\s+/).slice(0, 2);
    if (!parts[0]) return "S";
    return parts.map((p) => p.charAt(0).toUpperCase()).join("");
  }, [nameValue]);

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) {
            form.reset();
            onClose();
          }
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="max-w-[540px] overflow-hidden rounded-[20px] border border-[var(--border-color-light)] bg-[var(--background-color)] p-0 shadow-[0_32px_64px_-16px_rgba(var(--shadow-rgb),0.22)] dark:border-white/[0.08]"
        >
          {/* Header */}
          <div className="flex items-start gap-3 border-b border-[var(--border-color-light)] px-6 py-5 dark:border-white/[0.08]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-color)]/10 text-[var(--primary-color)]">
              <UsersRound className="h-5 w-5" />
            </div>
            <DialogHeader className="p-0 text-left">
              <DialogTitle className="text-[17px] font-semibold tracking-tight text-foreground">
                Create a squad
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-[13px]">
                Name it, describe it, and pick some teammates.
              </DialogDescription>
            </DialogHeader>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void form.handleSubmit();
            }}
            className="flex flex-col"
          >
            <div className="flex flex-col gap-5 px-6 py-5">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div
                    className={cn(
                      "flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-[var(--border-color-light)] text-[18px] font-extrabold dark:border-white/[0.08]",
                      avatarPreview
                        ? "bg-[var(--surface-2)]"
                        : "bg-gradient-to-br from-[var(--primary-color)]/15 to-[var(--primary-color)]/5 text-[var(--primary-color)]",
                    )}
                  >
                    {avatarPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarPreview}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>{avatarInitials}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Upload squad avatar"
                    className={cn(
                      "absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border shadow-sm transition-colors",
                      "border-[var(--border-color-light)] bg-[var(--background-color)] text-muted-foreground",
                      "hover:border-[var(--primary-color)]/50 hover:text-[var(--primary-color)]",
                      "dark:border-white/[0.12]",
                    )}
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={SQUAD_AVATAR_ACCEPTED_TYPES.join(",")}
                    className="hidden"
                    onChange={onAvatarChange}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-foreground">
                    Squad avatar
                  </p>
                  <p className="text-[12px] text-muted-foreground">
                    PNG, JPG, WebP, or GIF · up to 5 MB
                  </p>
                  {avatarFile && (
                    <button
                      type="button"
                      onClick={() => setAvatarFile(null)}
                      className="mt-1 inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground hover:text-[var(--error-color)]"
                    >
                      <Trash2 className="h-3 w-3" />
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <form.Field name="name">
                {(field) => (
                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="squad_name"
                      className="text-[12px] font-semibold text-foreground"
                    >
                      Name
                    </Label>
                    <Input
                      id="squad_name"
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="Frontend team"
                      className="h-11 rounded-xl border-[var(--border-color-light)] bg-[var(--surface-1)] shadow-none focus-visible:border-[var(--primary-color)]/50 dark:border-white/[0.08] dark:bg-[var(--surface-1)]"
                      autoComplete="off"
                    />
                    {field.state.meta.errors[0]?.message && (
                      <p className="text-[12px] text-[var(--error-color)]">
                        {field.state.meta.errors[0].message}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field name="description">
                {(field) => (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="squad_description"
                        className="text-[12px] font-semibold text-foreground"
                      >
                        Description
                      </Label>
                      <span className="text-[11px] text-muted-foreground">
                        Optional
                      </span>
                    </div>
                    <Textarea
                      id="squad_description"
                      name={field.name}
                      value={field.state.value ?? ""}
                      onChange={(e) =>
                        field.handleChange(e.target.value || undefined)
                      }
                      onBlur={field.handleBlur}
                      placeholder="What is this squad for?"
                      className="min-h-[80px] rounded-xl border-[var(--border-color-light)] bg-[var(--surface-1)] shadow-none focus-visible:border-[var(--primary-color)]/50 dark:border-white/[0.08] dark:bg-[var(--surface-1)]"
                    />
                    {field.state.meta.errors[0]?.message && (
                      <p className="text-[12px] text-[var(--error-color)]">
                        {field.state.meta.errors[0].message}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field name="member_ids">
                {(field) => {
                  const ids = field.state.value;
                  const resolved = ids
                    .map((id) => memberLookup.get(id))
                    .filter((m): m is OrgMember => Boolean(m));
                  const stack = resolved.slice(0, STACK_MAX);
                  const overflow = resolved.length - stack.length;
                  return (
                    <div className="flex flex-col gap-2">
                      <Label className="text-[12px] font-semibold text-foreground">
                        Members
                      </Label>
                      {ids.length === 0 ? (
                        <button
                          type="button"
                          onClick={() => setPickerOpen(true)}
                          className={cn(
                            "group flex w-full items-center gap-3 rounded-xl border border-dashed px-4 py-3.5 text-left transition-all",
                            "border-[var(--border-color-light)] bg-[var(--surface-1)] hover:border-[var(--primary-color)]/50 hover:bg-[var(--primary-color)]/[0.03] dark:border-white/[0.1]",
                          )}
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--surface-2)] text-muted-foreground transition-colors group-hover:bg-[var(--primary-color)]/10 group-hover:text-[var(--primary-color)]">
                            <UserPlus className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[13.5px] font-semibold text-foreground">
                              Add members
                            </p>
                            <p className="text-[12px] text-muted-foreground">
                              Pick teammates to include in this squad
                            </p>
                          </div>
                        </button>
                      ) : (
                        <div className="flex items-center gap-3 rounded-xl border border-[var(--border-color-light)] bg-[var(--surface-1)] px-3.5 py-2.5 dark:border-white/[0.08]">
                          <div className="flex items-center -space-x-2">
                            {stack.map((m) => (
                              <div
                                key={m.user_id}
                                title={displayName(m)}
                                className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--background-color)] bg-[var(--surface-2)] text-[11px] font-semibold text-foreground shadow-sm"
                              >
                                {m.avatar_url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={m.avatar_url}
                                    alt=""
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  memberInitials(
                                    m.first_name,
                                    m.last_name,
                                    m.email,
                                  )
                                )}
                              </div>
                            ))}
                            {overflow > 0 && (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--background-color)] bg-[var(--primary-color)]/10 text-[11px] font-semibold text-[var(--primary-color)] shadow-sm">
                                +{overflow}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-semibold text-foreground">
                              {ids.length}{" "}
                              {ids.length === 1 ? "member" : "members"}
                            </p>
                            <p className="truncate text-[12px] text-muted-foreground">
                              {resolved
                                .slice(0, 3)
                                .map((m) => m.first_name || m.email)
                                .join(", ")}
                              {resolved.length > 3
                                ? ` +${resolved.length - 3} more`
                                : ""}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setPickerOpen(true)}
                            className="h-8 shrink-0 rounded-lg text-[12.5px] text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10 hover:text-[var(--primary-color)]"
                          >
                            <Pencil className="mr-1 h-3.5 w-3.5" />
                            Edit
                          </Button>
                        </div>
                      )}

                      <MemberPickerDialog
                        open={pickerOpen}
                        onClose={() => setPickerOpen(false)}
                        initialSelectedIds={ids}
                        title="Select members"
                        confirmLabel="Save"
                        onConfirm={(userIds) => {
                          field.handleChange(userIds);
                          setPickerOpen(false);
                        }}
                      />
                    </div>
                  );
                }}
              </form.Field>
            </div>

            <DialogFooter className="border-t border-[var(--border-color-light)] bg-[var(--surface-1)]/50 px-6 py-4 dark:border-white/[0.08] dark:bg-[var(--surface-1)]/30">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={createMutation.isPending}
                className="h-9 rounded-lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="h-9 rounded-lg bg-[var(--primary-color)] px-4 text-white shadow-sm hover:bg-[var(--primary-color-hover)]"
              >
                {createMutation.isPending ? "Creating…" : "Create squad"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
