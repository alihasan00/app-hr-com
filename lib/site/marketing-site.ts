/** Shared marketing URLs (matches Angular prerender fallback). */
export const SITE_BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://reechout.com";

/** Cal.com (or other) scheduling link — same as Angular `reechoutConnectUrl`. */
export const REECHOUT_CONNECT_URL =
  process.env.NEXT_PUBLIC_REECHOUT_CONNECT_URL ??
  "https://cal.com/reechout-founders/connect";

export const MARKETING_OG_IMAGE =
  "https://apphrcomsa.blob.core.windows.net/images/android-chrome-192x192.webp";

/** In-app logo (local WebP). Tab icon remains `app/favicon.ico`. */
export const SITE_LOGO = "/android-chrome-192x192.webp";

/** Trust row under solution-page heroes (matches homepage hero). */
export const DEFAULT_SOLUTION_TRUST_ITEMS = [
  "SOC 2 Compliant",
  "GDPR Ready",
  "256-bit Encryption",
  "No Phone Number Required",
] as const;
