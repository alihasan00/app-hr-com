import type { OrgRole } from "@/lib/auth/types";

export function canEditOrg(role: OrgRole | null | undefined): boolean {
  return role === "owner" || role === "admin";
}

export function canManageMembers(role: OrgRole | null | undefined): boolean {
  return role === "owner" || role === "admin";
}

export function canManageInvitations(role: OrgRole | null | undefined): boolean {
  return role === "owner" || role === "admin";
}

/**
 * Who can create/edit/delete shared org content (interviews, questionnaires).
 * Mirrors the backend `require_admin` gate on mutating endpoints.
 */
export function canManageContent(role: OrgRole | null | undefined): boolean {
  return role === "owner" || role === "admin";
}

export function isOrgOwner(role: OrgRole | null | undefined): boolean {
  return role === "owner";
}
