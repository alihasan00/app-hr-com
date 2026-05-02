import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Server-side auth gate. The FastAPI backend stores the session in a pair of
 * httpOnly cookies (`rch_access` for short-lived JWT, `rch_refresh` for the
 * rotating refresh token). We only check *presence* here — verification lives
 * on the API — but that's enough to prevent a flash of protected content for
 * unauthenticated users.
 *
 * Cookie names must stay in sync with `fastapi-hr-io/app/core/config.py`
 * (`COOKIE_NAME` / `REFRESH_COOKIE_NAME`).
 */

const ACCESS_COOKIE = "rch_access";
const REFRESH_COOKIE = "rch_refresh";

/**
 * Only the `(dashboard)` route group is gated. The singular `/interview` and
 * `/questionnaire` routes at the app root are public marketing pages, and the
 * `(candidate)` group is the public candidate flow.
 */
const PROTECTED_PREFIXES = ["/interviews", "/questionnaires", "/reports"];

/**
 * Route-group folders like `(candidate)` are invisible in URLs, so the public
 * candidate agent pages collide with the dashboard's `/interviews/*` namespace.
 * Allow-list those URLs explicitly.
 */
const PUBLIC_CANDIDATE_PREFIXES = [
  "/interviews/agent",
  "/interviews/vapi-agent",
];

function isProtected(pathname: string): boolean {
  if (
    PUBLIC_CANDIDATE_PREFIXES.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`),
    )
  ) {
    return false;
  }
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!isProtected(pathname)) {
    return NextResponse.next();
  }

  const hasAccess = request.cookies.has(ACCESS_COOKIE);
  const hasRefresh = request.cookies.has(REFRESH_COOKIE);
  if (hasAccess || hasRefresh) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  const redirectTo = `${pathname}${search}`;
  if (redirectTo && redirectTo !== "/") {
    loginUrl.searchParams.set("next", redirectTo);
  }
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    /**
     * Scope the middleware to the routes that need gating — avoids running on
     * static assets, the marketing pages, the candidate flow, and public auth
     * pages. Keep this in sync with `PROTECTED_PREFIXES` above.
     */
    "/interviews/:path*",
    "/questionnaires/:path*",
    "/reports/:path*",
  ],
};
