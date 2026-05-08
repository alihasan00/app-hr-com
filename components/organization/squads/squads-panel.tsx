"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Calendar,
  MoreVertical,
  Plus,
  Search,
  Trash,
  Users,
  UsersRound,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { parseApiError, squadsApi } from "@/lib/api";
import { canManageSquads } from "@/lib/squads/permissions";
import type { Squad } from "@/lib/squads/types";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { CreateSquadDialog } from "./create-squad-dialog";

function squadInitials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  if (parts.length === 0 || !parts[0]) return "S";
  return parts.map((p) => p.charAt(0).toUpperCase()).join("");
}

type SizeFilter = "" | "empty" | "small" | "medium" | "large";
type SortOption = "newest" | "oldest" | "name_asc" | "name_desc" | "largest" | "smallest";

const SIZE_OPTIONS: { value: Exclude<SizeFilter, "">; label: string }[] = [
  { value: "empty", label: "Empty (0)" },
  { value: "small", label: "Small (1–5)" },
  { value: "medium", label: "Medium (6–20)" },
  { value: "large", label: "Large (21+)" },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "name_asc", label: "Name A→Z" },
  { value: "name_desc", label: "Name Z→A" },
  { value: "largest", label: "Most members" },
  { value: "smallest", label: "Fewest members" },
];

function matchesSize(count: number, filter: SizeFilter): boolean {
  if (!filter) return true;
  if (filter === "empty") return count === 0;
  if (filter === "small") return count >= 1 && count <= 5;
  if (filter === "medium") return count >= 6 && count <= 20;
  if (filter === "large") return count >= 21;
  return true;
}

// Same glass-card look the interviews + questionnaires pages use.
const CARD_CLASSES =
  "rounded-[var(--radius-md)] border border-[var(--header-floating-border)] bg-[var(--header-floating-bg)] shadow-[0_4px_32px_rgba(var(--shadow-rgb),0.09),0_1px_4px_rgba(var(--shadow-rgb),0.05)] transition-[border-color,box-shadow,transform] duration-300 hover:border-[rgba(var(--primary-color-rgb),0.28)] hover:shadow-[0_20px_40px_rgba(var(--shadow-rgb),0.08)] dark:hover:border-[rgba(var(--accent-violet-rgb),0.35)]";

const PILL_CLASSES =
  "inline-flex items-center gap-2 rounded-xl border border-[rgba(var(--primary-color-rgb),0.15)] bg-gradient-to-br from-[rgba(var(--primary-color-rgb),0.08)] to-[rgba(var(--primary-color-rgb),0.04)] px-3 py-1.5 backdrop-blur-md transition-all duration-200";

export function SquadsPanel() {
  const me = useAuthStore((s) => s.user);
  const canManage = canManageSquads(me?.current_org_role);
  const queryClient = useQueryClient();

  const [showCreate, setShowCreate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Squad | null>(null);
  const [search, setSearch] = useState("");
  const [sizeFilter, setSizeFilter] = useState<SizeFilter>("");
  const [sort, setSort] = useState<SortOption>("newest");

  const squadsQuery = useQuery({
    queryKey: ["org", "squads"],
    queryFn: () => squadsApi.list(),
  });

  const squads = squadsQuery.data?.data?.squads ?? [];

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = squads.filter((s) => {
      if (!matchesSize(s.member_count, sizeFilter)) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        (s.description ?? "").toLowerCase().includes(q)
      );
    });
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      switch (sort) {
        case "newest":
          return b.created_at.localeCompare(a.created_at);
        case "oldest":
          return a.created_at.localeCompare(b.created_at);
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        case "largest":
          return b.member_count - a.member_count;
        case "smallest":
          return a.member_count - b.member_count;
      }
    });
    return sorted;
  }, [squads, search, sizeFilter, sort]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => squadsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org", "squads"] });
      toast.success("Squad deleted");
      setConfirmDelete(null);
    },
    onError: (error) => {
      toast.error("Couldn't delete squad", { description: parseApiError(error) });
      setConfirmDelete(null);
    },
  });

  const isFiltering =
    search.trim().length > 0 || sizeFilter !== "" || sort !== "newest";
  const hasAnySquads = squads.length > 0;

  if (squadsQuery.isLoading) {
    return null;
  }

  const resetFilters = () => {
    setSearch("");
    setSizeFilter("");
    setSort("newest");
  };

  return (
    <>
      {/* Controls card */}
      <div
        className={cn(
          "mb-4 flex w-full min-h-[52px] flex-col gap-3 py-3 px-[clamp(0.875rem,2.5vw,1.125rem)] sm:px-[clamp(1.125rem,3.5vw,1.5rem)] lg:px-[clamp(1.25rem,4vw,1.75rem)] md:flex-row md:items-center md:justify-between",
          CARD_CLASSES,
        )}
      >
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={sizeFilter || "all"}
            onValueChange={(v) => setSizeFilter(v === "all" ? "" : (v as SizeFilter))}
          >
            <SelectTrigger
              aria-label="Filter by size"
              className="h-10 min-w-[150px] rounded-[6px] border border-[var(--header-floating-border)] bg-background text-[13px] shadow-sm focus:ring-primary"
            >
              <SelectValue placeholder="Any size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any size</SelectItem>
              {SIZE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
            <SelectTrigger
              aria-label="Sort"
              className="h-10 min-w-[150px] rounded-[6px] border border-[var(--header-floating-border)] bg-background text-[13px] shadow-sm focus:ring-primary"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isFiltering && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-[12px] font-medium text-[var(--text-secondary)] hover:text-[var(--primary-color)]"
            >
              Reset
            </button>
          )}
        </div>

        {/* Right: search + create */}
        <div className="flex items-center gap-3">
          <div className="relative w-full max-w-[280px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search squads…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-[6px] border border-[var(--header-floating-border)] bg-background pl-9 pr-9 shadow-sm placeholder:text-muted-foreground focus-visible:ring-primary"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-[var(--surface-2)] hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {canManage && (
            <Button
              onClick={() => setShowCreate(true)}
              className="h-10 shrink-0 rounded-xl bg-[var(--primary-color)] px-3 font-semibold hover:bg-[var(--primary-color-hover)]"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              New squad
            </Button>
          )}
        </div>
      </div>

      {isFiltering && hasAnySquads && (
        <div className="mb-3 px-1 text-[12px] text-muted-foreground">
          <span className="font-semibold text-foreground">{visible.length}</span>
          {" "}of {squads.length}{" "}
          {squads.length === 1 ? "squad" : "squads"}
        </div>
      )}

      {/* List / empty states */}
      {!hasAnySquads ? (
        <div
          className={cn(
            "flex flex-col items-center justify-center gap-3 px-6 py-16 text-center",
            CARD_CLASSES,
          )}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-2)] text-[var(--text-muted)]">
            <UsersRound className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-foreground">
              No squads yet
            </h3>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Group members into squads for organization-wide collaboration.
            </p>
          </div>
          {canManage && (
            <Button
              onClick={() => setShowCreate(true)}
              className="h-9 rounded-xl bg-[var(--primary-color)] px-3 font-semibold hover:bg-[var(--primary-color-hover)]"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Create your first squad
            </Button>
          )}
        </div>
      ) : visible.length === 0 ? (
        <div
          className={cn(
            "flex flex-col items-center justify-center gap-3 px-6 py-16 text-center",
            CARD_CLASSES,
          )}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-2)] text-[var(--text-muted)]">
            <Search className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-foreground">
              No squads match your filters
            </h3>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Try a different search term or reset the filters.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-xl"
            onClick={resetFilters}
          >
            Reset filters
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((squad) => (
            <SquadCard
              key={squad.id}
              squad={squad}
              canManage={canManage}
              onDelete={() => setConfirmDelete(squad)}
            />
          ))}
        </div>
      )}

      <CreateSquadDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() =>
          queryClient.invalidateQueries({ queryKey: ["org", "squads"] })
        }
      />

      <AlertDialog
        open={confirmDelete !== null}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete squad?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDelete
                ? `"${confirmDelete.name}" will be removed. Members stay in the organization.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (confirmDelete) deleteMutation.mutate(confirmDelete.id);
              }}
              disabled={deleteMutation.isPending}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function SquadCard({
  squad,
  canManage,
  onDelete,
}: {
  squad: Squad;
  canManage: boolean;
  onDelete: () => void;
}) {
  return (
    <Link
      href={`/organization/squads/${squad.id}`}
      className={cn(
        "group relative flex items-center gap-4 rounded-[var(--radius-md)] px-5 py-4 outline-none transition-all hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[var(--primary-color)]/40",
        CARD_CLASSES,
      )}
    >
      {/* Accent stripe on hover */}
      <div className="absolute bottom-0 left-0 top-0 w-1 rounded-l-[var(--radius-md)] bg-gradient-to-b from-[var(--primary-color)] to-[var(--primary-color-rgb)]/60 opacity-0 transition-opacity group-hover:opacity-100" />

      {/* Avatar */}
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[var(--border-color-light)] bg-gradient-to-br from-[rgba(var(--primary-color-rgb),0.15)] to-[rgba(var(--primary-color-rgb),0.04)] text-[16px] font-extrabold text-[var(--primary-color)] dark:border-white/[0.08]">
        {squad.avatar_signed_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={squad.avatar_signed_url}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{squadInitials(squad.name)}</span>
        )}
      </div>

      {/* Main info */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[15px] font-bold text-[var(--text-primary)] transition-colors group-hover:text-[var(--text-accent-color)]">
          {squad.name}
        </h3>
        {squad.description ? (
          <p className="line-clamp-1 text-[13px] text-[var(--text-secondary)]">
            {squad.description}
          </p>
        ) : (
          <p className="text-[12.5px] italic text-[var(--text-muted)]">
            No description
          </p>
        )}
      </div>

      {/* Meta pills */}
      <div className="hidden items-center gap-2 md:flex">
        <div className={PILL_CLASSES}>
          <Users className="h-4 w-4 text-[var(--primary-color)]" />
          <span className="text-[13px] font-bold text-[var(--primary-color)]">
            {squad.member_count}
          </span>
          <span className="text-[12px] font-medium text-[var(--text-secondary)]">
            {squad.member_count === 1 ? "member" : "members"}
          </span>
        </div>
        <div className={PILL_CLASSES}>
          <Calendar className="h-4 w-4 text-[var(--primary-color)]" />
          <span className="text-[12.5px] font-semibold text-[var(--text-primary)]">
            {format(new Date(squad.created_at), "MMM d, yyyy")}
          </span>
        </div>
      </div>

      {/* Mobile meta row */}
      <div className="flex shrink-0 items-center gap-2 md:hidden">
        <span className="inline-flex items-center gap-1 rounded-lg bg-[var(--surface-2)] px-2 py-1 text-[11px] font-semibold text-[var(--text-secondary)]">
          <Users className="h-3 w-3" />
          {squad.member_count}
        </span>
      </div>

      {/* Actions */}
      {canManage && (
        <div
          onClick={(e) => e.preventDefault()}
          className="relative shrink-0"
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                aria-label="Squad actions"
                className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground outline-none transition-colors hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-40 rounded-[6px]"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete();
                }}
                className="text-destructive focus:bg-destructive/10 focus:text-destructive dark:focus:bg-destructive/20"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </Link>
  );
}
