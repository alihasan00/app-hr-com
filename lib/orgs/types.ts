import type { OrgRole } from "@/lib/auth/types";

export type Org = {
  id: string;
  name: string | null;
  contact_email: string | null;
  website: string | null;
  intended_use: string | null;
  logo_url: string | null;
  logo_signed_url: string | null;
  description: string | null;
  industry: string | null;
  size: string | null;
  location: string | null;
  timezone: string | null;
  billing_email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  created_at: string;
  updated_at: string;
};

export type OrgMember = {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  role: OrgRole;
  joined_at: string;
};

export type MemberList = {
  members: OrgMember[];
  total: number;
};

export type InvitationStatus = "pending" | "expired" | "accepted" | "revoked";
export type InviteRole = Exclude<OrgRole, "owner">;

export type Invitation = {
  id: string;
  email: string;
  role: OrgRole;
  invited_by_name: string | null;
  status: InvitationStatus;
  created_at: string;
  expires_at: string;
};

export type InvitationPreview = {
  org_id: string;
  org_name: string | null;
  logo_signed_url: string | null;
  email: string;
  role: OrgRole;
  expires_at: string;
};

export type AcceptInviteResponse = {
  status: "joined" | "signup_required";
  org_id: string;
  org_name: string | null;
  email: string;
  role: OrgRole;
};
