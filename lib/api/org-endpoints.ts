/**
 * Organization endpoints. Paths are relative to the configured API base.
 */
export const ORG_API_PATHS = {
  /** `GET` — current user's org details. */
  me: "orgs/me",
  /** `PATCH` — update org details (admin+). */
  update: "orgs/me",
  /** `POST` multipart — upload org logo (admin+). */
  uploadLogo: "orgs/me/logo",
  /** `GET` — list members. */
  members: "orgs/me/members",
  /** `PATCH :user_id` body `{ role }` — change member role (admin+). */
  member: (userId: string) => `orgs/me/members/${userId}`,
  /** `GET` — list invitations (admin+). */
  invitations: "orgs/me/invitations",
  /** `DELETE :id` — revoke invite (admin+). */
  invitation: (id: string) => `orgs/me/invitations/${id}`,
  /** `POST :id/resend` — resend invite (admin+). */
  resendInvitation: (id: string) => `orgs/me/invitations/${id}/resend`,
  /** `GET :token` — public invitation preview. */
  previewInvitation: (token: string) => `invitations/${token}`,
  /** `POST` body `{ token }` — accept invitation (auth optional). */
  acceptInvitation: "invitations/accept",
} as const;
