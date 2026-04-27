import type { MarketingCta } from "@/app/home-content";
import { SITE_BASE_URL } from "@/lib/site/marketing-site";
import type { SolutionHeroModel } from "@/components/solution/solution-page-model";

export const PERSONAS_PAGE_PATH = "/personas";

export const PERSONAS_METADATA = {
  title:
    "Candidate personas - Define what good looks like for every role | ReechOut",
  description:
    "Define candidate personas and evaluation rubrics so your entire hiring committee is aligned on what 'good' looks like. Consistent evaluation, clearer signal, faster decisions.",
  keywords:
    "candidate personas, hiring rubrics, evaluation criteria, hiring alignment, role profiles, structured hiring, recruitment, candidate evaluation",
  author: "ReechOut",
  robots: "index, follow",
  language: "English",
} as const;

export const PERSONAS_HERO = {
  badge: "Candidate Personas",
  titleLine1: "Align your hiring committee on",
  titleLine2Prefix: "what ",
  titleHighlight: "good looks like",
  titleLine2Suffix: ".",
  description:
    "Define candidate personas and evaluation rubrics once, then reuse them across every role so every interview is scored against the same bar.",
  stats: [
    { value: "1x", label: "definition, every role" },
    { value: "100%", label: "consistent evaluation" },
    { value: "", label: "Aligned hiring committee" },
  ] as const,
  ctaLabel: "Start Free Trial",
  ctaHref: "/signup",
} as const satisfies SolutionHeroModel;

export const PERSONAS_FEATURES_HEADER = {
  kicker: "Why Candidate Personas?",
  title: "Stop debating what 'good' looks like in every interview",
  description:
    "Most hiring debates happen because nobody wrote down what a strong candidate actually looks like. Personas turn fuzzy expectations into a shared rubric so every reviewer is grading on the same scale.",
} as const;

export const PERSONAS_FEATURES = [
  {
    title: "Define the bar once",
    description:
      "Capture the skills, signals, and trade-offs that matter for a role in a single persona — no more whiteboard debates before every interview loop.",
    icon: "edit" as const,
  },
  {
    title: "Align the committee",
    description:
      "Everyone evaluating a candidate sees the same rubric, weighting, and definition of strong. Disagreements happen on the candidate, not on the criteria.",
    icon: "team" as const,
  },
  {
    title: "Reuse and adapt across roles",
    description:
      "Build a library of personas you can clone and tweak for adjacent roles. Hire faster as you grow, without starting evaluation criteria from scratch.",
    icon: "file-text" as const,
  },
] as const;

export const PERSONAS_APPLICATION_HEADER = {
  kicker: "How It Works",
  title: "Three simple steps",
  description: "From a vague job description to a shared bar in minutes",
} as const;

export const PERSONAS_APPLICATION_STEPS = [
  {
    number: "01",
    title: "Describe the role",
    description:
      "Add the job description or key responsibilities. We draft an initial persona for you to refine.",
    icon: "file-add" as const,
  },
  {
    number: "02",
    title: "Tune the rubric",
    description:
      "Edit skills, weightings, and must-haves until the persona reflects the bar your team actually wants to hire to.",
    icon: "edit" as const,
  },
  {
    number: "03",
    title: "Score every candidate against it",
    description:
      "Interviews and reports map back to the persona so the committee compares apples to apples.",
    icon: "check-circle" as const,
  },
] as const;

export const PERSONAS_BENEFITS_HEADER = {
  kicker: "Benefits",
  title: "Why teams build personas first",
  description: "Consistent evaluation, faster alignment, fewer bad hires",
} as const;

export const PERSONAS_BENEFIT_ITEMS = [
  {
    title: "Consistent evaluation",
    description: "Every candidate is scored against the same rubric",
  },
  {
    title: "Faster committee alignment",
    description: "Debates happen once, not in every debrief",
  },
  {
    title: "Clearer signal",
    description: "Reports tie back to the criteria you actually care about",
  },
  {
    title: "Reuse and scale",
    description: "Clone personas for adjacent roles as you grow",
  },
] as const;

export const PERSONAS_BENEFIT_VISUAL_STATS = [
  { value: "Shared", label: "rubric" },
  { value: "Reusable", label: "across roles" },
] as const;

export const PERSONAS_CTA: MarketingCta = {
  heading: "Define your hiring bar in minutes",
  description:
    "Stop relying on gut feel and conflicting interviewer notes. Build a persona, align the committee, and hire to the same bar every time.",
  primaryLabel: "Start Free Trial",
  primaryHref: "/signup",
};

export const personasCanonical = `${SITE_BASE_URL}${PERSONAS_PAGE_PATH}`;
