/**
 * Auth cookie names. Must stay in sync with `fastapi-hr-io/app/core/config.py`
 * (`COOKIE_NAME` / `REFRESH_COOKIE_NAME`). Single source of truth for the
 * frontend — middleware + axios client should both import from here.
 */
export const ACCESS_COOKIE = "rch_access";
export const REFRESH_COOKIE = "rch_refresh";
