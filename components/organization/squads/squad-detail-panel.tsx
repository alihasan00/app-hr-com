"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  ArrowLeft,
  Camera,
  Plus,
  Trash2,
  UserMinus,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";

import { parseApiError, squadsApi } from "@/lib/api";
import { canManageSquads } from "@/lib/squads/permissions";
import {
  SQUAD_AVATAR_ACCEPTED_TYPES,
  SQUAD_AVATAR_MAX_BYTES,
  squadUpdateSchema,
} from "@/lib/squads/schemas";
import type { SquadMember } from "@/lib/squads/types";
import { useAuthStore } from "@/lib/store/auth.store";
import { cn } from "@/lib/ui/cn";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { AddSquadMembersDialog } from "./add-squad-members-dialog";

function memberInitials(first: string, last: string, email: string): string {
  const f = (first || "").trim().charAt(0);
  const l = (last || "").trim().charAt(0);
  const joined = `${f}${l}`.toUpperCase();
  if (joined) return joined;
  return (email || "?").charAt(0).toUpperCase();
}

function squadInitials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  if (parts.length === 0 || !parts[0]) return "S";
  return parts.map((p) => p.charAt(0).toUpperCase()).join("");
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function SquadDetailPanel({ squadId }: { squadId: string }) {
  const me = useAuthStore((s) => s.user);
  const canManage = canManageSquads(me?.current_org_role);
  const queryClient = useQueryClient();
  const router = useRouter();

  const squadQuery = useQuery({
    queryKey: ["org", "squads", squadId],
    queryFn: () => squadsApi.get(squadId),
  });

  const squad = squadQuery.data?.data ?? null;
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  if (squad && !initialized) {
    setName(squad.name);
    setDescription(squad.description ?? "");
    setInitialized(true);
  }

  const [showAddMembers, setShowAddMembers] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<SquadMember | null>(null);
  const [confirmDeleteSquad, setConfirmDeleteSquad] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateMutation = useMutation({
    mutationFn: (payload: { name?: string; description?: string }) =>
      squadsApi.update(squadId, payload),
    onSuccess: (res) => {
      queryClient.setQueryData(["org", "squads", squadId], res);
      queryClient.invalidateQueries({ queryKey: ["org", "squads"] });
      toast.success("Squad updated");
    },
    onError: (error) =>
      toast.error("Couldn't update squad", {
        description: parseApiError(error),
      }),
  });

  const avatarMutation = useMutation({
    mutationFn: (file: File) => squadsApi.uploadAvatar(squadId, file),
    onSuccess: (res) => {
      queryClient.setQueryData(["org", "squads", squadId], res);
      queryClient.invalidateQueries({ queryKey: ["org", "squads"] });
      toast.success("Avatar updated");
    },
    onError: (error) =>
      toast.error("Couldn't upload avatar", {
        description: parseApiError(error),
      }),
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => squadsApi.removeMember(squadId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org", "squads", squadId] });
      queryClient.invalidateQueries({ queryKey: ["org", "squads"] });
      toast.success("Member removed from squad");
      setConfirmRemove(null);
    },
    onError: (error) => {
      toast.error("Couldn't remove member", {
        description: parseApiError(error),
      });
      setConfirmRemove(null);
    },
  });

  const deleteSquadMutation = useMutation({
    mutationFn: () => squadsApi.remove(squadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org", "squads"] });
      toast.success("Squad deleted");
      router.push("/organization/squads");
    },
    onError: (error) => {
      toast.error("Couldn't delete squad", {
        description: parseApiError(error),
      });
      setConfirmDeleteSquad(false);
    },
  });

  const onSave = () => {
    const parsed = squadUpdateSchema.safeParse({
      name: name || undefined,
      description: description || undefined,
    });
    if (!parsed.success) {
      const issue = parsed.error.issues.find((i) => i.path[0] === "name");
      setNameError(issue?.message ?? "Invalid input");
      return;
    }
    setNameError(null);
    const payload: { name?: string; description?: string } = {};
    if (squad) {
      if (parsed.data.name && parsed.data.name !== squad.name) {
        payload.name = parsed.data.name;
      }
      if ((parsed.data.description ?? "") !== (squad.description ?? "")) {
        payload.description = parsed.data.description ?? "";
      }
    }
    if (Object.keys(payload).length === 0) {
      toast.info("No changes to save");
      return;
    }
    updateMutation.mutate(payload);
  };

  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (
      !SQUAD_AVATAR_ACCEPTED_TYPES.includes(
        file.type as (typeof SQUAD_AVATAR_ACCEPTED_TYPES)[number],
      )
    ) {
      toast.error("Unsupported image type", {
        description: "Upload a PNG, JPEG, WebP, or GIF.",
      });
      e.target.value = "";
      return;
    }
    if (file.size > SQUAD_AVATAR_MAX_BYTES) {
      toast.error("Image too large", {
        description: "Max size is 5 MB.",
      });
      e.target.value = "";
      return;
    }
    avatarMutation.mutate(file);
    e.target.value = "";
  };

  if (squadQuery.isLoading) return null;
  if (!squad) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[12px] border border-[var(--border-color-light)] bg-[var(--background-color)] px-6 py-16 text-center dark:border-white/[0.09]">
        <UsersRound className="h-8 w-8 text-[var(--text-muted)]" />
        <p className="text-[14px] text-[var(--text-secondary)]">
          Squad not found.
        </p>
        <Button asChild variant="outline" className="h-9 rounded-xl">
          <Link href="/organization/squads">Back to squads</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        <div>
          <Link
            href="/organization/squads"
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All squads
          </Link>
        </div>

        <section className="rounded-[12px] border border-[var(--border-color-light)] bg-[var(--background-color)] dark:border-white/[0.09]">
          <div className="flex flex-col gap-6 border-b border-[var(--border-color-light)] p-6 sm:flex-row sm:items-start dark:border-white/[0.08]">
            <div className="relative">
              <div
                className={cn(
                  "flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full",
                  "bg-[var(--surface-2)] text-[22px] font-extrabold text-foreground",
                )}
              >
                {squad.avatar_signed_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={squad.avatar_signed_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  squadInitials(squad.name)
                )}
              </div>
              {canManage && (
                <>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarMutation.isPending}
                    aria-label="Upload squad avatar"
                    className={cn(
                      "absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full",
                      "border border-[var(--border-color-light)] bg-[var(--background-color)] shadow-sm",
                      "text-[var(--text-secondary)] transition-colors hover:text-[var(--primary-color)]",
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
                </>
              )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="squad_name_edit"
                  className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]"
                >
                  Name
                </Label>
                <Input
                  id="squad_name_edit"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!canManage}
                  className="h-11 rounded-xl"
                  maxLength={120}
                />
                {nameError && (
                  <p className="text-[12px] text-[var(--error-color)]">
                    {nameError}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="squad_description_edit"
                  className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]"
                >
                  Description
                </Label>
                <Textarea
                  id="squad_description_edit"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={!canManage}
                  placeholder="What is this squad for?"
                  className="min-h-[88px] rounded-xl"
                  maxLength={5000}
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 text-[12px] text-[var(--text-secondary)]">
                <span>Created {formatDate(squad.created_at)}</span>
                <span aria-hidden>·</span>
                <span>
                  {squad.member_count}{" "}
                  {squad.member_count === 1 ? "member" : "members"}
                </span>
              </div>

              {canManage && (
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    onClick={onSave}
                    disabled={updateMutation.isPending}
                    className="h-9 rounded-xl bg-[var(--primary-color)] px-3 font-semibold hover:bg-[var(--primary-color-hover)]"
                  >
                    {updateMutation.isPending ? "Saving…" : "Save changes"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setConfirmDeleteSquad(true)}
                    className="h-9 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-500 dark:hover:bg-red-950/30"
                  >
                    <Trash2 className="mr-1.5 h-4 w-4" />
                    Delete squad
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between px-6 py-4">
            <h3 className="text-[14px] font-semibold text-foreground">
              Members
            </h3>
            {canManage && (
              <Button
                onClick={() => setShowAddMembers(true)}
                variant="outline"
                className="h-9 rounded-xl"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Add members
              </Button>
            )}
          </div>

          {squad.members.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 pb-10 pt-2 text-center">
              <UsersRound className="h-7 w-7 text-[var(--text-muted)]" />
              <p className="text-[13px] text-[var(--text-secondary)]">
                No members in this squad yet.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--border-color-light)] border-t border-[var(--border-color-light)] dark:divide-white/[0.08] dark:border-white/[0.08]">
              {squad.members.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center gap-4 px-6 py-3.5"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--surface-2)] text-[12px] font-semibold text-foreground">
                    {member.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={member.avatar_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      memberInitials(
                        member.first_name,
                        member.last_name,
                        member.email,
                      )
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-semibold text-foreground">
                      {[member.first_name, member.last_name]
                        .filter(Boolean)
                        .join(" ") || member.email}
                    </div>
                    <div className="truncate text-[12px] text-[var(--text-secondary)]">
                      {member.email}
                    </div>
                  </div>
                  {canManage && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-500 dark:hover:bg-red-950/30"
                      onClick={() => setConfirmRemove(member)}
                      aria-label={`Remove ${member.email} from squad`}
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <AddSquadMembersDialog
        open={showAddMembers}
        onClose={() => setShowAddMembers(false)}
        squadId={squadId}
        existingMemberIds={squad.members.map((m) => m.user_id)}
        onAdded={() => {
          queryClient.invalidateQueries({
            queryKey: ["org", "squads", squadId],
          });
          queryClient.invalidateQueries({ queryKey: ["org", "squads"] });
        }}
      />

      <AlertDialog
        open={confirmRemove !== null}
        onOpenChange={(open) => !open && setConfirmRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from squad?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmRemove
                ? `${confirmRemove.first_name || confirmRemove.email} will be removed from this squad. They remain in the organization.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeMemberMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (confirmRemove)
                  removeMemberMutation.mutate(confirmRemove.user_id);
              }}
              disabled={removeMemberMutation.isPending}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {removeMemberMutation.isPending ? "Removing…" : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={confirmDeleteSquad}
        onOpenChange={(open) => !open && setConfirmDeleteSquad(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete squad?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{squad.name}&quot; will be removed. Members stay in the organization.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteSquadMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                deleteSquadMutation.mutate();
              }}
              disabled={deleteSquadMutation.isPending}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleteSquadMutation.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
