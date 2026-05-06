import type { SolutionHeroScreenshot } from "@/components/solution/solution-page-model";
import { REECHOUT_CONNECT_URL, SITE_BASE_URL } from "@/lib/site/marketing-site";

/** Canonical home URL and SEO text — must match [components/hero-section.tsx] h1 + first hero paragraph. */
export const homeCanonical = `${SITE_BASE_URL}/`;

/** RegulateIQ-style hero badge (pill + pulse) and muted line under primary CTA. */
export const HOME_HERO_BADGE = "AI voice interviews & hiring signal";

export const HOME_HERO_TIP =
  "No credit card required · Every candidate gets the same structured evaluation — compare on signal, not polish.";

export const HOME_SEO = {
  title:
    "ReechOut — Hiring based on how candidates think, not resumes | AI Interviews & Shortlists",
  description:
    "Resumes are AI-written and everyone looks qualified. ReechOut runs structured voice interviews and gives you a ranked shortlist with real signal—so you know who to move forward with.",
  keywords:
    "AI phone interviews, automated HR interviews, candidate screening, interview automation, recruitment software, AI interviewer, phone interview automation, candidate assessment, HR automation",
  author: "ReechOut",
  robots: "index, follow",
  language: "English",
} as const;

export type WhyChooseUiType =
  | "interview"
  | "team"
  | "alerts"
  | "reports"
  | "scores"
  | "risk"
  | "partner";

/** Bento-style benefits — mirrors RegulateIQ “Why Choose CGM?” structure. */
export const HOME_WHY_CHOOSE_CARDS = [
  {
    title: "AI Phone Interview Automation",
    description:
      "Conduct structured, conversational AI phone screens that evaluate real reasoning and communication skills. Eliminate early-stage bias and identify top talent faster.",
    icon: "thunderbolt" as const,
    span: "default" as const,
    uiType: "interview" as const satisfies WhyChooseUiType,
  },
  {
    title: "Scale Hiring Without Increasing Headcount",
    description:
      "Whether you're a fast-growing startup or a lean talent acquisition team, our recruitment automation platform handles top-of-funnel screening so you can focus on closing candidates.",
    icon: "team" as const,
    span: "default" as const,
    uiType: "team" as const satisfies WhyChooseUiType,
  },
  {
    title: "High-Signal Candidate Evaluation",
    description:
      "Stop relying on keyword-stuffed resumes. We convert live conversations into standardized, objective hiring signals with actionable insights and recruiter alerts.",
    icon: "bell" as const,
    span: "default" as const,
    uiType: "alerts" as const satisfies WhyChooseUiType,
  },
  {
    title: "Secure Interview Transcripts & Scorecards",
    description:
      "Automatically generate and store detailed interview transcripts and ATS-ready scorecards in one secure, compliant dashboard. Perfect for hiring manager debriefs.",
    icon: "folder" as const,
    span: "default" as const,
    uiType: "reports" as const satisfies WhyChooseUiType,
  },
  {
    title: "Stakeholder Alignment & Reporting",
    description:
      "Share data-driven candidate reports with leadership to build immediate consensus. Make defensible hiring decisions backed by empirical interview data.",
    icon: "chart" as const,
    span: "default" as const,
    uiType: "scores" as const satisfies WhyChooseUiType,
  },
  {
    title: "Predictive Fit & Retention Risk Analytics",
    description:
      "Identify red flags and behavioral patterns early. Move beyond intuition to data-backed hiring, reducing bad hires and improving long-term employee retention.",
    icon: "shield" as const,
    span: "default" as const,
    uiType: "risk" as const satisfies WhyChooseUiType,
  },
  {
    title: "Your Enterprise-Grade HR Tech Partner",
    description:
      "More than just an AI interview tool. ReechOut integrates directly into your existing talent acquisition workflow, continuously optimizing your screening process as your hiring volume scales.",
    icon: "handshake" as const,
    span: "full" as const,
    uiType: "partner" as const satisfies WhyChooseUiType,
  },
] as const;

export const HOME_APPLICATION_STEPS = [
  {
    number: "01",
    title: "Invite candidates",
    description: "Share a link or upload applicants",
    icon: "user-add" as const,
  },
  {
    number: "02",
    title: "AI interviews them automatically",
    description: "Structured voice interviews tailored to your role",
    icon: "phone" as const,
  },
  {
    number: "03",
    title: "Get a ranked shortlist",
    description: "See who to move forward with based on real signal",
    icon: "trophy" as const,
  },
] as const;

export const HOME_TESTIMONIALS = [
  {
    content:
      "We were getting hundreds of applicants and did not know who to trust. ReechOut helped us quickly identify the few worth interviewing.",
    author: "Founder, B2B SaaS Startup",
    position: "",
    company: "",
    avatar:
      "https://apphrcomsa.blob.core.windows.net/images/android-chrome-192x192.webp",
  },
  {
    content:
      "I used to spend hours screening candidates. Now I just look at the shortlist.",
    author: "COO, Marketplace Startup",
    position: "",
    company: "",
    avatar:
      "https://apphrcomsa.blob.core.windows.net/images/android-chrome-192x192.webp",
  },
  {
    content:
      "The biggest difference is confidence. I actually trust who we're moving forward with now.",
    author: "Head of Operations, Series A Startup",
    position: "",
    company: "",
    avatar:
      "https://apphrcomsa.blob.core.windows.net/images/android-chrome-192x192.webp",
  },
  {
    content:
      "We hired faster and spent way less time on interviews. That alone made it worth it.",
    author: "Founder, AI Startup",
    position: "",
    company: "",
    avatar:
      "https://apphrcomsa.blob.core.windows.net/images/android-chrome-192x192.webp",
  },
] as const;

/** RegulateIQ `ProductScreenshots` block — assets in `/public` (light + dark per tab). */
export const HOME_IN_ACTION_HEADLINE = {
  sectionTag: "Product Features",
  title: "The Ultimate AI Recruitment Platform",
  description:
    "Explore how ReechOut replaces manual phone screens with an intelligent, automated interview workflow designed for modern talent acquisition teams.",
} as const;

export const HOME_IN_ACTION_ITEMS = [
  {
    id: "interviews",
    label: "AI Interviews",
    description:
      "Deploy intelligent, structured phone interviews. Review comprehensive transcripts and automated scoring instantly.",
    imageLight: "https://apphrcomsa.blob.core.windows.net/images/interview.webp",
    imageDark: "https://apphrcomsa.blob.core.windows.net/images/interview-dark.webp",
  },
  {
    id: "questionnaire",
    label: "Smart Screening",
    description:
      "Build dynamic, role-relevant screening questionnaires to qualify candidates before scheduling live technical rounds.",
    imageLight: "https://apphrcomsa.blob.core.windows.net/images/questionnaire.webp",
    imageDark: "https://apphrcomsa.blob.core.windows.net/images/questionnaire-dark.webp",
  },
  {
    id: "reports",
    label: "Hiring Reports",
    description:
      "Generate stakeholder-ready candidate scorecards packed with clear, objective hiring signals and competency analytics.",
    imageLight: "https://apphrcomsa.blob.core.windows.net/images/report.webp",
    imageDark: "https://apphrcomsa.blob.core.windows.net/images/report-dark.webp",
  },
  {
    id: "personas",
    label: "Candidate Personas",
    description:
      "Define candidate personas and evaluation rubrics to ensure your entire hiring committee is aligned on what 'good' looks like.",
    imageLight: "https://apphrcomsa.blob.core.windows.net/images/persona.webp",
    imageDark: "https://apphrcomsa.blob.core.windows.net/images/persona-dark.webp",
  },
] as const;

export type HomeProductScreenshotId =
  | "interviews"
  | "questionnaire"
  | "reports"
  | "personas";

/** Solution-page hero image — same light/dark assets as the home product section. */
export function getHomeProductScreenshot(
  id: HomeProductScreenshotId,
): SolutionHeroScreenshot {
  const item = HOME_IN_ACTION_ITEMS.find((i) => i.id === id);
  if (!item) {
    throw new Error(`Unknown product screenshot id: ${id}`);
  }
  const chromeLabelById: Record<HomeProductScreenshotId, string> = {
    interviews: "app.reechout.com/interviews",
    questionnaire: "app.reechout.com/questionnaires",
    reports: "app.reechout.com/reports",
    personas: "app.reechout.com/personas",
  };
  return {
    imageLight: item.imageLight,
    imageDark: item.imageDark,
    alt: `ReechOut AI Recruitment Software — ${item.label}`,
    chromeLabel: chromeLabelById[id],
  };
}

/** Shared shape for `HomeCtaSection` (home + solution pages). */
export type MarketingCta = {
  heading: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
};

/** RegulateIQ `HomeCTA` / `CallToActionClient` — copy + links for the dark CTA band. */
export const HOME_CTA = {
  heading: "Stop guessing who to hire",
  description:
    "You do not need more candidates. You need better signal. ReechOut shows you who to move forward with, fast.",
  primaryLabel: "Start Free Trial",
  primaryHref: "/signup",
  secondaryLabel: "Book a call",
  secondaryHref: REECHOUT_CONNECT_URL,
} as const satisfies MarketingCta;

export const HOME_PRICING_HEADER = {
  kicker: "Pricing",
  title: "Simple, transparent pricing",
  description:
    "Pick the plan that matches your hiring volume. Every plan includes automated interviews, structured scoring, and shareable reports. Credits roll over for up to 12 months.",
} as const;

export type HomePricingPlan = {
  id: "starter" | "growth" | "enterprise";
  name: string;
  description: string;
  price: string;
  cadence?: string;
  badge?: string;
  featured?: boolean;
  features: readonly string[];
  cta: { label: string; href: string; external?: boolean };
};

export const HOME_PRICING_PLANS: readonly HomePricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "For small teams running their first structured screens.",
    price: "$149",
    cadence: "/mo",
    features: [
      "40 evaluations per month (~2 hires)",
      "Structured AI voice interviews",
      "Candidate scorecards and reports",
      "Email support",
    ],
    cta: { label: "Start Free Trial", href: "/signup" },
  },
  {
    id: "growth",
    name: "Growth",
    description: "For hiring teams scaling structured interviews across roles.",
    price: "$299",
    cadence: "/mo",
    badge: "Most Popular",
    featured: true,
    features: [
      "100 evaluations per month (~5 hires)",
      "Everything in Starter",
      "Reusable personas and rubrics",
      "Team workspace and shared reports",
      "Priority support",
    ],
    cta: { label: "Start Free Trial", href: "/signup" },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For high-volume hiring with custom workflows and integrations.",
    price: "Custom",
    features: [
      "Unlimited evaluations",
      "Everything in Growth",
      "Advanced reporting and analytics",
      "ATS and SSO integrations",
      "Dedicated success manager",
    ],
    cta: { label: "Book a call", href: REECHOUT_CONNECT_URL, external: true },
  },
] as const;

export const HOME_PRICING_FOOTNOTE =
  "Need more credits? Add-ons available at $5 per credit. Annual billing on request.";
