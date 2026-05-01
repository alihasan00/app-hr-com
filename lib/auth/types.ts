/**
 * Auth-related types. Tokens now live in httpOnly cookies managed by FastAPI;
 * the client only tracks the user profile in-memory.
 */

export type OrgRole = "owner" | "admin" | "member";

export type AuthUser = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  email_verified: boolean;
  account_approved: boolean;
  company_profile_completed: boolean;
  company_name: string | null;
  company_email: string | null;
  company_website: string | null;
  intended_use: string | null;
  avatar_url: string | null;
  org_id: string | null;
  current_org_role: OrgRole | null;
};

export type AuthMeUser = AuthUser;

/** `POST ${apiUrl}/auth/login` body. */
export type LoginPayload = {
  email: string;
  password: string;
};

/** Envelope for login/signup: no tokens in the body, only the user. */
export type AuthEnvelopeData = {
  user: AuthUser;
};

/** `POST ${apiUrl}/auth/signup` body. */
export type SignupPayload = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
};

/** `POST ${apiUrl}/auth/forgot-password` body. */
export type ForgotPasswordPayload = {
  email: string;
};

/** `POST ${apiUrl}/auth/reset-password` body. */
export type ResetPasswordPayload = {
  token: string;
  password: string;
};

export type ApiEnvelope<T> = {
  data: T;
  message: string | null;
  error: unknown;
};
