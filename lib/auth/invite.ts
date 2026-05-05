/**
 * Invite-token sanity check for values coming from `?invite_token=…`.
 *
 * The backend ultimately validates the token, but we refuse to forward
 * obviously-malformed input to it so a stray query param can't trigger
 * a backend error state or log-injection artifact from the frontend.
 *
 * Accepts URL-safe base64 / JWT-shaped strings up to 512 chars. That covers
 * both UUID and JWT-style invitation tokens without hard-coding a format.
 */
const INVITE_TOKEN_PATTERN = /^[A-Za-z0-9._\-~]{8,512}$/;

export function sanitizeInviteToken(raw: string | null | undefined): string {
  if (!raw) return "";
  return INVITE_TOKEN_PATTERN.test(raw) ? raw : "";
}
