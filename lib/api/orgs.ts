import { apiClient } from "./client";
import { ORG_API_PATHS } from "./org-endpoints";
import type { ApiEnvelope, OrgRole } from "@/lib/auth/types";
import type {
  AcceptInviteResponse,
  Invitation,
  InvitationPreview,
  InviteRole,
  MemberList,
  Org,
  OrgMember,
} from "@/lib/orgs/types";

export type OrgUpdatePayload = Partial<{
  name: string;
  contact_email: string;
  website: string;
  description: string;
  industry: string;
  size: string;
  location: string;
  timezone: string;
  billing_email: string;
  phone: string;
  linkedin_url: string;
}>;

export const orgsApi = {
  getMe: async (): Promise<ApiEnvelope<Org>> => {
    const { data } = await apiClient.get<ApiEnvelope<Org>>(ORG_API_PATHS.me);
    return data;
  },

  update: async (payload: OrgUpdatePayload): Promise<ApiEnvelope<Org>> => {
    const { data } = await apiClient.patch<ApiEnvelope<Org>>(
      ORG_API_PATHS.update,
      payload,
    );
    return data;
  },

  uploadLogo: async (file: File): Promise<ApiEnvelope<Org>> => {
    const form = new FormData();
    form.append("file", file);
    const { data } = await apiClient.post<ApiEnvelope<Org>>(
      ORG_API_PATHS.uploadLogo,
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  },

  listMembers: async (): Promise<ApiEnvelope<MemberList>> => {
    const { data } = await apiClient.get<ApiEnvelope<MemberList>>(
      ORG_API_PATHS.members,
    );
    return data;
  },

  changeMemberRole: async (
    userId: string,
    role: OrgRole,
  ): Promise<ApiEnvelope<OrgMember>> => {
    const { data } = await apiClient.patch<ApiEnvelope<OrgMember>>(
      ORG_API_PATHS.member(userId),
      { role },
    );
    return data;
  },

  removeMember: async (userId: string): Promise<void> => {
    await apiClient.delete(ORG_API_PATHS.member(userId));
  },

  listInvitations: async (
    includeHistory = false,
  ): Promise<ApiEnvelope<Invitation[]>> => {
    const { data } = await apiClient.get<ApiEnvelope<Invitation[]>>(
      ORG_API_PATHS.invitations,
      { params: { include_history: includeHistory } },
    );
    return data;
  },

  createInvitation: async (payload: {
    email: string;
    role: InviteRole;
  }): Promise<ApiEnvelope<Invitation>> => {
    const { data } = await apiClient.post<ApiEnvelope<Invitation>>(
      ORG_API_PATHS.invitations,
      payload,
    );
    return data;
  },

  revokeInvitation: async (id: string): Promise<void> => {
    await apiClient.delete(ORG_API_PATHS.invitation(id));
  },

  resendInvitation: async (id: string): Promise<ApiEnvelope<Invitation>> => {
    const { data } = await apiClient.post<ApiEnvelope<Invitation>>(
      ORG_API_PATHS.resendInvitation(id),
      null,
    );
    return data;
  },

  previewInvitation: async (
    token: string,
  ): Promise<ApiEnvelope<InvitationPreview>> => {
    const { data } = await apiClient.get<ApiEnvelope<InvitationPreview>>(
      ORG_API_PATHS.previewInvitation(token),
    );
    return data;
  },

  acceptInvitation: async (
    token: string,
  ): Promise<ApiEnvelope<AcceptInviteResponse>> => {
    const { data } = await apiClient.post<ApiEnvelope<AcceptInviteResponse>>(
      ORG_API_PATHS.acceptInvitation,
      { token },
    );
    return data;
  },
};
