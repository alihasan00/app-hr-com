import type { OrgRole } from "@/lib/auth/types";

export function canManageSquads(role: OrgRole | null | undefined): boolean {
  return role === "owner" || role === "admin";
}
