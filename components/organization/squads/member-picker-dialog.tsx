"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Search,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { orgsApi } from "@/lib/api";
import type { OrgMember } from "@/lib/orgs/types";
import { cn } from "@/lib/ui/cn";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type Tab = "all" | "selected";

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

export function MemberPickerDialog({
  open,
  onClose,
  onConfirm,
  initialSelectedIds,
  excludeIds,
  title = "Select members",
  confirmLabel = "Confirm",
  isSubmitting = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (userIds: string[]) => void;
  initialSelectedIds: string[];
  excludeIds?: string[];
  title?: string;
  confirmLabel?: string;
  isSubmitting?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const searchRef = useRef<HTMLInputElement>(null);

  const membersQuery = useQuery({
    queryKey: ["org", "members"],
    queryFn: () => orgsApi.listMembers(),
    enabled: open,
  });

  useEffect(() => {
    if (open) {
      setSelected(new Set(initialSelectedIds));
      setSearch("");
      setTab("all");
      // Autofocus search shortly after the enter animation
      const t = setTimeout(() => searchRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
    // only re-seed when the dialog opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const allMembers = membersQuery.data?.data?.members ?? [];
  const candidates = useMemo(() => {
    const exclude = new Set(excludeIds ?? []);
    return allMembers.filter((m) => !exclude.has(m.user_id));
  }, [allMembers, excludeIds]);

  const selectedMembers = useMemo(
    () => candidates.filter((m) => selected.has(m.user_id)),
    [candidates, selected],
  );

  const listed = useMemo(() => {
    const base = tab === "selected" ? selectedMembers : candidates;
    const q = search.trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      (m) =>
        displayName(m).toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q),
    );
  }, [candidates, selectedMembers, tab, search]);

  const toggle = (userId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const selectAllVisible = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const m of listed) next.add(m.user_id);
      return next;
    });
  };

  const clearAll = () => setSelected(new Set());

  const allVisibleSelected =
    listed.length > 0 && listed.every((m) => selected.has(m.user_id));

  const hasChanges = useMemo(() => {
    const initial = new Set(initialSelectedIds);
    if (initial.size !== selected.size) return true;
    for (const id of initial) if (!selected.has(id)) return true;
    return false;
  }, [initialSelectedIds, selected]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="flex h-[min(86vh,720px)] max-w-[640px] flex-col overflow-hidden rounded-[20px] border border-[var(--border-color-light)] bg-[var(--background-color)] p-0 shadow-[0_32px_64px_-16px_rgba(var(--shadow-rgb),0.22)] dark:border-white/[0.08]"
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--border-color-light)] px-6 py-5 dark:border-white/[0.08]">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-color)]/10 text-[var(--primary-color)]">
              <UsersRound className="h-5 w-5" />
            </div>
            <div>
              <DialogHeader className="p-0 text-left">
                <DialogTitle className="text-[17px] font-semibold tracking-tight text-foreground">
                  {title}
                </DialogTitle>
              </DialogHeader>
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                {candidates.length} teammate
                {candidates.length === 1 ? "" : "s"} available
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close"
            className="h-8 w-8 shrink-0 rounded-lg text-muted-foreground hover:bg-[var(--surface-2)] hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search + tabs */}
        <div className="flex shrink-0 flex-col gap-3 border-b border-[var(--border-color-light)] px-6 py-4 dark:border-white/[0.08]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="h-11 w-full rounded-xl border-[var(--border-color-light)] bg-[var(--surface-1)] pl-10 pr-10 text-[14px] shadow-none focus-visible:border-[var(--primary-color)]/50 dark:border-white/[0.08] dark:bg-[var(--surface-1)]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-[var(--surface-2)] hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            <div
              role="tablist"
              aria-label="Filter"
              className="inline-flex rounded-lg border border-[var(--border-color-light)] bg-[var(--surface-1)] p-0.5 dark:border-white/[0.08]"
            >
              <TabButton
                active={tab === "all"}
                onClick={() => setTab("all")}
                label="All"
                count={candidates.length}
              />
              <TabButton
                active={tab === "selected"}
                onClick={() => setTab("selected")}
                label="Selected"
                count={selected.size}
                accent
              />
            </div>
            <div className="flex items-center gap-1">
              {listed.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={allVisibleSelected ? clearAll : selectAllVisible}
                  className="h-8 rounded-lg px-2 text-[12px] font-medium text-muted-foreground hover:text-foreground"
                >
                  {allVisibleSelected
                    ? "Deselect visible"
                    : search.trim() || tab === "selected"
                      ? "Select all"
                      : "Select all"}
                </Button>
              )}
              {selected.size > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="h-8 rounded-lg px-2 text-[12px] font-medium text-muted-foreground hover:text-[var(--error-color)]"
                >
                  Clear all
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* List */}
        <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto">
          {membersQuery.isLoading ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--primary-color)]/30 border-t-[var(--primary-color)]" />
              <p className="text-[13px] text-muted-foreground">
                Loading members…
              </p>
            </div>
          ) : listed.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-2)]">
                <UserRound className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-[14px] font-medium text-foreground">
                  {tab === "selected"
                    ? "Nothing selected yet"
                    : candidates.length === 0
                      ? "No eligible members"
                      : "No matches"}
                </p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  {tab === "selected"
                    ? "Pick teammates from the All tab."
                    : candidates.length === 0
                      ? "Every member is already included."
                      : "Try a different search term."}
                </p>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--border-color-light)] dark:divide-white/[0.06]">
              {listed.map((m) => {
                const isSelected = selected.has(m.user_id);
                const inputId = `pick-${m.user_id}`;
                return (
                  <li key={m.user_id}>
                    <label
                      htmlFor={inputId}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 px-6 py-3 transition-colors",
                        isSelected
                          ? "bg-[var(--primary-color)]/[0.04] hover:bg-[var(--primary-color)]/[0.07]"
                          : "hover:bg-[var(--surface-1)]",
                      )}
                    >
                      <Checkbox
                        id={inputId}
                        checked={isSelected}
                        onCheckedChange={() => toggle(m.user_id)}
                        className="size-[18px]"
                      />
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--surface-2)] text-[12px] font-semibold text-foreground">
                        {m.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={m.avatar_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          memberInitials(m.first_name, m.last_name, m.email)
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-[14px] font-semibold text-foreground">
                            {displayName(m)}
                          </span>
                          <span className="hidden h-[18px] items-center rounded-full border border-[var(--border-color-light)] bg-[var(--surface-1)] px-1.5 text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-foreground sm:inline-flex dark:border-white/[0.08]">
                            {m.role}
                          </span>
                        </div>
                        <span className="block truncate text-[12px] text-muted-foreground">
                          {m.email}
                        </span>
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[var(--border-color-light)] bg-[var(--surface-1)]/50 px-6 py-4 dark:border-white/[0.08] dark:bg-[var(--surface-1)]/30">
          <div className="text-[13px] text-muted-foreground">
            {selected.size > 0 ? (
              <>
                <span className="font-semibold text-foreground">
                  {selected.size}
                </span>{" "}
                selected
              </>
            ) : (
              "Nothing selected"
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-9 rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => onConfirm(Array.from(selected))}
              disabled={isSubmitting || !hasChanges}
              className="h-9 rounded-lg bg-[var(--primary-color)] px-4 text-white shadow-sm hover:bg-[var(--primary-color-hover)] disabled:opacity-60"
            >
              {isSubmitting
                ? "Saving…"
                : `${confirmLabel}${selected.size > 0 ? ` · ${selected.size}` : ""}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TabButton({
  active,
  label,
  count,
  onClick,
  accent = false,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-semibold transition-all outline-none",
        "focus-visible:ring-2 focus-visible:ring-[var(--primary-color)]/40",
        active
          ? "bg-[var(--background-color)] text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
      <span
        className={cn(
          "inline-flex min-w-[18px] items-center justify-center rounded-full px-1.5 text-[10.5px] font-semibold",
          active
            ? accent
              ? "bg-[var(--primary-color)] text-white"
              : "bg-[var(--surface-2)] text-foreground"
            : "bg-transparent text-muted-foreground",
        )}
      >
        {count}
      </span>
    </button>
  );
}
