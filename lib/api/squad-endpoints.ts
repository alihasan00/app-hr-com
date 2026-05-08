/**
 * Squad endpoints. Paths are relative to the configured API base.
 */
export const SQUAD_API_PATHS = {
  /** `GET` — list squads in current org. */
  list: "squads",
  /** `POST` — create a new squad (admin+). */
  create: "squads",
  /** `GET :id` — squad detail with members. */
  detail: (id: string) => `squads/${id}`,
  /** `PATCH :id` — update squad name/description (admin+). */
  update: (id: string) => `squads/${id}`,
  /** `DELETE :id` — delete a squad (admin+). */
  remove: (id: string) => `squads/${id}`,
  /** `POST :id/avatar` multipart — upload squad avatar (admin+). */
  uploadAvatar: (id: string) => `squads/${id}/avatar`,
  /** `POST :id/members` body `{ user_ids }` — add members (admin+). */
  addMembers: (id: string) => `squads/${id}/members`,
  /** `DELETE :id/members/:user_id` — remove a member (admin+). */
  removeMember: (id: string, userId: string) =>
    `squads/${id}/members/${userId}`,
} as const;
