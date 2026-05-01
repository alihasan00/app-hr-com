"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Clock,
  Loader2,
  Mail,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Trash2,
  UserCircle2,
  UserMinus,
} from "lucide-react";
import { toast } from "sonner";

import { orgsApi, parseApiError } from "@/lib/api";
import type { OrgRole } from "@/lib/auth/types";
import { canManageInvitations, canManageMembers } from "@/lib/orgs/permissions";
import type {
  Invitation,
  InvitationStatus,
  OrgMember,
} from "@/lib/orgs/types";
import { useAuthStore } from "@/lib/store/auth.store";
import { cn } from "@/lib/ui/cn";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

import { InviteMemberDialog } from "./invite-member-dialog";
import { RoleBadge } from "./role-badge";

const ROLE_LABEL: Record<OrgRole, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
};

const STATUS_LABEL: Record<InvitationStatus, string> = {
  pending: "Pending",
  expired: "Expired",
  accepted: "Accepted",
  revoked: "Revoked",
};
const STATUS_STYLE: Record<InvitationStatus, string> = {
  pending:
    "bg-[color:var(--warning-color,#faad14)]/12 text-[color:var(--warning-color,#b45309)] border-[color:var(--warning-color,#faad14)]/30",
  expired:
    "bg-[var(--surface-2)] text-[var(--text-secondary)] border-[var(--border-color-light)]",
  accepted:
    "bg-[color:var(--success-color)]/12 text-[var(--success-color)] border-[color:var(--success-color)]/30",
  revoked:
    "bg-[var(--surface-2)] text-[var(--text-muted)] border-[var(--border-color-light)]",
};

type Filter = "all" | "members" | "invitations";

const FILTERS: ReadonlyArray<{ key: Filter; label: string }> = [
  { key: "all", label: "All" },
  { key: "members", label: "Members" },
  { key: "invitations", label: "Invitations" },
];

type Row =
  | { kind: "member"; id: string; createdAt: string; data: OrgMember }
  | { kind: "invitation"; id: string; createdAt: string; data: Invitation };

function initials(first: string, last: string, email: string): string {
  const f = (first || "").trim().charAt(0);
  const l = (last || "").trim().charAt(0);
  const joined = `${f}${l}`.toUpperCase();
  if (joined) return joined;
  return (email || "?").charAt(0).toUpperCase();
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

export function MembersPanel() {
  const me = useAuthStore((s) => s.user);
  const myRole = me?.current_org_role;
  const canManage = canManageMembers(myRole);
  const canInvite = canManageInvitations(myRole);
  const queryClient = useQueryClient();

  const [filter, setFilter] = useState<Filter>("all");
  const [showInvite, setShowInvite] = useState(false);
  const [includeHistory, setIncludeHistory] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<OrgMember | null>(null);

  const membersQuery = useQuery({
    queryKey: ["org", "members"],
    queryFn: () => orgsApi.listMembers(),
  });
  const invitationsQuery = useQuery({
    queryKey: ["org", "invitations", { includeHistory }],
    queryFn: () => orgsApi.listInvitations(includeHistory),
    enabled: canInvite,
  });

  const members = useMemo(
    () => membersQuery.data?.data?.members ?? [],
    [membersQuery.data?.data?.members],
  );
  const invitations: Invitation[] = useMemo(
    () => invitationsQuery.data?.data ?? [],
    [invitationsQuery.data?.data],
  );

  const ownerCount = useMemo(
    () => members.filter((m) => m.role === "owner").length,
    [members],
  );

  const rows = useMemo<Row[]>(() => {
    const memberRows: Row[] = members.map((m) => ({
      kind: "member",
      id: `m:${m.id}`,
      createdAt: m.joined_at,
      data: m,
    }));
    const invitationRows: Row[] = canInvite
      ? invitations.map((inv) => ({
          kind: "invitation",
          id: `i:${inv.id}`,
          createdAt: inv.created_at,
          data: inv,
        }))
      : [];

    const selected = [...memberRows, ...invitationRows].filter((r) => {
      if (filter === "members") return r.kind === "member";
      if (filter === "invitations") return r.kind === "invitation";
      return true;
    });

    // Newest first by created date
    selected.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return selected;
  }, [members, invitations, filter, canInvite]);

  const changeRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: OrgRole }) =>
      orgsApi.changeMemberRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org", "members"] });
      toast.success("Role updated");
    },
    onError: (error) =>
      toast.error("Couldn't change role", { description: parseApiError(error) }),
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => orgsApi.removeMember(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org", "members"] });
      toast.success("Member removed");
      setConfirmRemove(null);
    },
    onError: (error) => {
      toast.error("Couldn't remove member", { description: parseApiError(error) });
      setConfirmRemove(null);
    },
  });

  const resendMutation = useMutation({
    mutationFn: (id: string) => orgsApi.resendInvitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org", "invitations"] });
      toast.success("Invitation resent");
    },
    onError: (error) =>
      toast.error("Couldn't resend invitation", {
        description: parseApiError(error),
      }),
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => orgsApi.revokeInvitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org", "invitations"] });
      toast.success("Invitation revoked");
    },
    onError: (error) =>
      toast.error("Couldn't revoke invitation", {
        description: parseApiError(error),
      }),
  });

  const isLoading =
    membersQuery.isLoading || (canInvite && invitationsQuery.isLoading);

  const memberCount = members.length;
  const invitationCount = invitations.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--text-secondary)]" />
      </div>
    );
  }

  return (
    <>
      <section className="rounded-[12px] border border-[var(--border-color-light)] bg-[var(--background-color)] dark:border-white/[0.09]">
        <header className="flex flex-col gap-4 border-b border-[var(--border-color-light)] px-6 py-5 dark:border-white/[0.08]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <FilterTabs
              filter={filter}
              onChange={setFilter}
              counts={{ members: memberCount, invitations: invitationCount }}
              showInvitations={canInvite}
            />
            {canInvite && (
              <Button
                onClick={() => setShowInvite(true)}
                className="h-9 shrink-0 rounded-xl bg-[var(--primary-color)] px-3 font-semibold hover:bg-[var(--primary-color-hover)]"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Invite teammate
              </Button>
            )}
          </div>
          {canInvite && filter !== "members" && (
            <label className="flex cursor-pointer items-center gap-2 text-[12px] text-[var(--text-secondary)]">
              <input
                type="checkbox"
                checked={includeHistory}
                onChange={(e) => setIncludeHistory(e.target.checked)}
                className="h-4 w-4"
              />
              Show invitation history
            </label>
          )}
          {!canManage && (
            <p className="text-[12px] text-[var(--text-muted)]">
              Viewing as a member — role and removal actions are owner/admin only.
            </p>
          )}
        </header>
        {rows.length === 0 ? (
          <EmptyState
            filter={filter}
            canInvite={canInvite}
            includeHistory={includeHistory}
            onInvite={() => setShowInvite(true)}
          />
        ) : (
          <ul className="divide-y divide-[var(--border-color-light)] dark:divide-white/[0.08]">
            {rows.map((row) =>
              row.kind === "member" ? (
                <MemberRow
                  key={row.id}
                  member={row.data}
                  isSelf={me?.id === row.data.user_id}
                  myRole={myRole ?? null}
                  canManage={canManage}
                  ownerCount={ownerCount}
                  onChangeRole={(role) =>
                    changeRoleMutation.mutate({
                      userId: row.data.user_id,
                      role,
                    })
                  }
                  onRemove={() => setConfirmRemove(row.data)}
                />
              ) : (
                <InvitationRow
                  key={row.id}
                  invitation={row.data}
                  onResend={() => resendMutation.mutate(row.data.id)}
                  onRevoke={() => revokeMutation.mutate(row.data.id)}
                  resendPending={resendMutation.isPending}
                  revokePending={revokeMutation.isPending}
                />
              ),
            )}
          </ul>
        )}
      </section>

      <InviteMemberDialog
        open={showInvite}
        onClose={() => setShowInvite(false)}
        onCreated={() =>
          queryClient.invalidateQueries({ queryKey: ["org", "invitations"] })
        }
      />

      <AlertDialog
        open={confirmRemove !== null}
        onOpenChange={(open) => !open && setConfirmRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove member?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmRemove
                ? `${confirmRemove.first_name || confirmRemove.email} will lose access to your organization. They can be invited again later.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (confirmRemove) removeMutation.mutate(confirmRemove.user_id);
              }}
              disabled={removeMutation.isPending}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {removeMutation.isPending ? "Removing…" : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function MemberRow({
  member,
  isSelf,
  myRole,
  canManage,
  ownerCount,
  onChangeRole,
  onRemove,
}: {
  member: OrgMember;
  isSelf: boolean;
  myRole: OrgRole | null;
  canManage: boolean;
  ownerCount: number;
  onChangeRole: (role: OrgRole) => void;
  onRemove: () => void;
}) {
  const actorCanTouchOwner = myRole === "owner";
  const isOnlyOwner = member.role === "owner" && ownerCount <= 1;
  const disableAll =
    !canManage || (member.role === "owner" && !actorCanTouchOwner);

  return (
    <li className="flex items-center gap-4 px-6 py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--surface-2)] text-[13px] font-semibold text-foreground">
        {member.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.avatar_url}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          initials(member.first_name, member.last_name, member.email)
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-[14px] font-semibold text-foreground">
            {[member.first_name, member.last_name].filter(Boolean).join(" ") ||
              member.email}
            {isSelf && (
              <span className="ml-2 text-[11px] font-normal text-[var(--text-muted)]">
                (you)
              </span>
            )}
          </span>
          <RoleBadge role={member.role} />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[12px] text-[var(--text-secondary)]">
          <span className="truncate">{member.email}</span>
          <span aria-hidden>·</span>
          <span>Joined {formatDate(member.joined_at)}</span>
        </div>
      </div>

      {canManage && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0"
              disabled={disableAll}
              aria-label="Member actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <RoleMenuItems
              current={member.role}
              actorRole={myRole}
              disableOwner={isOnlyOwner && member.role === "owner"}
              onSelect={onChangeRole}
            />
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={isOnlyOwner && member.role === "owner"}
              onClick={onRemove}
              className={cn(
                "text-red-600 focus:bg-red-50 focus:text-red-600",
                "dark:text-red-500 dark:focus:bg-red-950/50 dark:focus:text-red-500",
              )}
            >
              <UserMinus className="mr-2 h-4 w-4" />
              Remove from organization
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </li>
  );
}

function InvitationRow({
  invitation,
  onResend,
  onRevoke,
  resendPending,
  revokePending,
}: {
  invitation: Invitation;
  onResend: () => void;
  onRevoke: () => void;
  resendPending: boolean;
  revokePending: boolean;
}) {
  return (
    <li className="flex items-center gap-4 px-6 py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--text-secondary)]">
        <Mail className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-[14px] font-semibold text-foreground">
            {invitation.email}
          </span>
          <span
            className={cn(
              "inline-flex h-5 items-center rounded-full border px-2 text-[10px] font-semibold uppercase tracking-[0.04em]",
              STATUS_STYLE[invitation.status],
            )}
          >
            {STATUS_LABEL[invitation.status]}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[12px] text-[var(--text-secondary)]">
          <span>Invited as {ROLE_LABEL[invitation.role]}</span>
          {invitation.invited_by_name && (
            <>
              <span aria-hidden>·</span>
              <span>by {invitation.invited_by_name}</span>
            </>
          )}
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Expires {formatDate(invitation.expires_at)}
          </span>
        </div>
      </div>
      {invitation.status !== "accepted" && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0"
              aria-label="Invitation actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onResend} disabled={resendPending}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Resend
            </DropdownMenuItem>
            {invitation.status === "pending" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onRevoke}
                  disabled={revokePending}
                  className="text-red-600 focus:bg-red-50 focus:text-red-600 dark:text-red-500 dark:focus:bg-red-950/50 dark:focus:text-red-500"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Revoke invite
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </li>
  );
}

function EmptyState({
  filter,
  canInvite,
  includeHistory,
  onInvite,
}: {
  filter: Filter;
  canInvite: boolean;
  includeHistory: boolean;
  onInvite: () => void;
}) {
  if (filter === "invitations") {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <Mail className="h-8 w-8 text-[var(--text-muted)]" />
        <p className="text-[14px] text-[var(--text-secondary)]">
          {includeHistory ? "No invitations yet." : "No pending invitations."}
        </p>
        {canInvite && !includeHistory && (
          <Button
            onClick={onInvite}
            variant="outline"
            className="h-9 rounded-xl"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Invite someone
          </Button>
        )}
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <UserCircle2 className="h-8 w-8 text-[var(--text-muted)]" />
      <p className="text-[14px] text-[var(--text-secondary)]">
        {filter === "members"
          ? "No members yet."
          : "No members or invitations yet."}
      </p>
      {canInvite && (
        <Button onClick={onInvite} variant="outline" className="h-9 rounded-xl">
          <Plus className="mr-1.5 h-4 w-4" />
          Invite someone
        </Button>
      )}
    </div>
  );
}

function FilterTabs({
  filter,
  onChange,
  counts,
  showInvitations,
}: {
  filter: Filter;
  onChange: (f: Filter) => void;
  counts: { members: number; invitations: number };
  showInvitations: boolean;
}) {
  const tabs = FILTERS.filter(
    (t) => showInvitations || t.key !== "invitations",
  );

  const getCount = (key: Filter): number | null => {
    if (key === "members") return counts.members;
    if (key === "invitations") return counts.invitations;
    if (key === "all" && showInvitations) return counts.members + counts.invitations;
    if (key === "all") return counts.members;
    return null;
  };

  return (
    <div
      role="tablist"
      aria-label="Filter by type"
      className="inline-flex rounded-[8px] border border-[var(--border-color-light)] bg-[var(--surface-1)] p-1 shadow-sm"
    >
      {tabs.map((t) => {
        const active = filter === t.key;
        const count = getCount(t.key);
        return (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.key)}
            className={cn(
              "flex items-center gap-1.5 rounded-[6px] px-3 py-1.5 text-[13px] font-medium transition-colors outline-none",
              "focus-visible:ring-2 focus-visible:ring-[var(--primary-color)]/40",
              active
                ? "bg-[var(--background-color)] text-[var(--text-primary)] shadow-sm border border-[var(--header-floating-border)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] border border-transparent",
            )}
          >
            {t.label}
            {count !== null && (
              <span
                className={cn(
                  "inline-flex min-w-[18px] items-center justify-center rounded-full px-1.5 text-[10.5px] font-semibold",
                  active
                    ? "bg-[color:var(--primary-color)]/12 text-[var(--primary-color)]"
                    : "bg-[var(--surface-2)] text-[var(--text-muted)]",
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function RoleMenuItems({
  current,
  actorRole,
  disableOwner,
  onSelect,
}: {
  current: OrgRole;
  actorRole: OrgRole | null;
  disableOwner: boolean;
  onSelect: (role: OrgRole) => void;
}) {
  const roles: OrgRole[] = ["owner", "admin", "member"];
  return (
    <>
      {roles.map((r) => {
        // Admins cannot assign `owner` role.
        const adminBlocksOwner = actorRole !== "owner" && r === "owner";
        const disabled =
          r === current ||
          adminBlocksOwner ||
          (r !== "owner" && disableOwner && current === "owner");
        return (
          <DropdownMenuItem
            key={r}
            disabled={disabled}
            onClick={() => onSelect(r)}
          >
            <span className="flex-1">Change to {ROLE_LABEL[r]}</span>
            {r === current && (
              <span className="text-[11px] text-[var(--text-muted)]">Current</span>
            )}
          </DropdownMenuItem>
        );
      })}
    </>
  );
}
