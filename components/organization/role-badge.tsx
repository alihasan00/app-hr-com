import type { OrgRole } from "@/lib/auth/types";
import { cn } from "@/lib/ui/cn";

const STYLE: Record<OrgRole, string> = {
  owner:
    "bg-[color:var(--primary-color)]/12 text-[var(--primary-color)] border-[color:var(--primary-color)]/30",
  admin:
    "bg-[var(--surface-2)] text-foreground border-[var(--border-color-light)]",
  member:
    "bg-[var(--surface-2)] text-[var(--text-secondary)] border-[var(--border-color-light)]",
};

const LABEL: Record<OrgRole, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
};

export function RoleBadge({ role }: { role: OrgRole }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full border px-2.5 text-[11px] font-semibold uppercase tracking-[0.04em]",
        STYLE[role],
      )}
    >
      {LABEL[role]}
    </span>
  );
}
