import type { MetadataRoute } from "next";

import { getAllSlugs } from "@/app/blog/content";
import { SITE_BASE_URL } from "@/lib/site/marketing-site";

const MARKETING_PATHS = [
  "/",
  "/about-us",
  "/contact",
  "/blog",
  "/interview",
  "/questionnaire",
  "/reports",
  "/personas",
  "/privacy-policy",
  "/security",
  "/terms-of-service",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = [...MARKETING_PATHS].map(
    (path) => ({
      url: path === "/" ? `${SITE_BASE_URL}/` : `${SITE_BASE_URL}${path}`,
      lastModified,
    }),
  );

  const blogEntries: MetadataRoute.Sitemap = getAllSlugs().map((slug) => ({
    url: `${SITE_BASE_URL}/blog/${slug}`,
    lastModified,
  }));

  return [...staticEntries, ...blogEntries];
}
