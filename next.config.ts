import type { NextConfig } from "next";

/**
 * Defense-in-depth response headers.
 *
 * We intentionally do NOT ship a Content-Security-Policy here yet — the app
 * loads Firebase, Vapi (WebSocket + media), reCAPTCHA, Google Fonts via
 * `next/font`, and GCS images, so a naive policy will break the candidate
 * flow. Add CSP in a follow-up after auditing every third-party origin.
 */
const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), geolocation=(), microphone=(self)",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    return [
      {
        // Apply to every route. Next applies the first matching rule's headers
        // and then merges them with per-route headers we may add later.
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/images.reechout.com/**",
      },
      /** Lorem Picsum — open dummy images (https://picsum.photos/) */
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "fastly.picsum.photos",
        pathname: "/**",
      },
      /** Unsplash CDN (hotlinked photo URLs in blog content) */
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
