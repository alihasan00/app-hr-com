import type { MarketingCta } from "@/app/home-content";
import { SITE_BASE_URL } from "@/lib/site/marketing-site";

export const ABOUT_US_PAGE_PATH = "/about-us";

export const aboutUsCanonical = `${SITE_BASE_URL}${ABOUT_US_PAGE_PATH}`;

export const ABOUT_US_METADATA = {
  title: "About Us | ReechOut — our story, team, and principles",
  description:
    "How ReechOut started at Harvard Innovation Labs, why hiring is a signal problem, and how we help teams decide who to move forward with.",
  keywords:
    "ReechOut, about us, founders, Harvard Innovation Labs, hiring signal, team, company story, recruitment",
  author: "ReechOut",
  robots: "index, follow",
  language: "English",
} as const;

/** Same CDN assets as Angular `about-us.component`. */
export const ABOUT_US_IMAGES = {
  hero: "https://apphrcomsa.blob.core.windows.net/images/about-us.webp",
} as const;

/** Fake browser chrome for hero figure (home hero pattern). */
export const ABOUT_US_HERO_CHROME_LABEL = "app.reechout.com/about";

export const ABOUT_US_HERO = {
  badge: "Our Story",
  titleBeforeHighlight: "Building the Future of",
  titleHighlight: "Recruitment",
  description:
    "Two Harvard students, countless late nights at Harvard Innovation Labs, and a shared vision to revolutionize how companies find talent. This is how ReechOut was born.",
  quote:
    "Harvard Innovation Labs, 2AM. The whiteboard behind us has been erased and rewritten about 47 times. Coffee? Our fourth round. The idea? Finally starting to click.",
} as const;

export const ABOUT_US_JOURNEY_HEADER = {
  kicker: "Our Journey",
  title: "The Problem We Couldn't Ignore",
  description:
    "It started with a simple question: Why does hiring still feel like it's stuck in 2005?",
} as const;

export const ABOUT_US_JOURNEY_CARDS = [
  {
    title: "The Problem",
    body: `Hiring has changed, but the way we evaluate people hasn't.

Companies are getting more applicants than ever.

Resumes are polished, often AI-generated, and increasingly unreliable.

Interviews are inconsistent and depend heavily on who is asking the questions.

The result: more candidates, less signal, and harder hiring decisions.`,
    icon: "rocket" as const,
  },
  {
    title: "The Solution",
    body: `We built ReechOut to fix the signal problem in hiring.

Instead of relying on resumes and unstructured interviews, ReechOut evaluates how candidates actually think, communicate, and solve problems.

We automate the early stages of hiring, not to replace human judgment, but to give it better inputs.

So teams can focus on the right candidates, faster, with more confidence.`,
    icon: "wrench" as const,
  },
] as const;

export const ABOUT_US_FOUNDERS_HEADER = {
  kicker: "Our Founders",
  title: "Meet the Minds Behind ReechOut",
} as const;

export const ABOUT_US_FOUNDERS = [
  {
    name: "Mehmood Khosa",
    role: "Founder & Product",
    image: "https://apphrcomsa.blob.core.windows.net/images/mehmood.webp",
    bio: "Focused on building simple, effective systems for hiring workflows. Leads product design and user experience across ReechOut.",
    description: "",
    education: "Harvard University",
    achievements: [
      "Designs product workflows and user experience",
      "Focused on simplifying hiring systems",
      "Leads product vision and usability",
    ],
    linkedin: "https://www.linkedin.com/in/mehmoodkhosa/",
  },
  {
    name: "Hassan Ahmed",
    role: "Founder & Strategy",
    image: "https://apphrcomsa.blob.core.windows.net/images/hassan.webp",
    bio: "Focused on learning, behavior, and decision systems. Works on product direction, hiring models, and overall strategy.",
    description: "",
    education: "Harvard University",
    achievements: [
      "Defines product direction and positioning",
      "Works on behavioral evaluation systems",
      "Leads strategy and growth",
    ],
    linkedin: "https://www.linkedin.com/in/hssnahmd/",
  },
  {
    name: "Ali Hasan",
    role: "Founder & Engineering",
    image: "https://apphrcomsa.blob.core.windows.net/images/ali_hasan.webp",
    bio: "Leads engineering and system architecture. Builds the infrastructure that powers ReechOut.",
    description: "",
    education: "Lahore University of Management Sciences",
    achievements: [
      "Builds and maintains core platform",
      "Develops AI and backend systems",
      "Ensures scalability and reliability",
    ],
    linkedin: "https://www.linkedin.com/in/ali-hasan-49abaa19b/",
  },
] as const;

export const ABOUT_US_BELIEVE = {
  kicker: "What We Believe",
  title: "Our Principles",
  description: `Quality over Quantity — Hiring should be based on real signal, not surface-level indicators. Better hiring decisions come from better inputs.

Human-Centric Automation — Candidates should be evaluated consistently and fairly. Teams should spend time on meaningful conversations, not repetitive screening.`,
} as const;

export const ABOUT_US_FUTURE = {
  kicker: "Where We're Going",
  title: "The Signal Problem",
  description: `Hiring is becoming a signal problem.

As AI makes it easier to generate resumes and applications, the challenge is no longer access to candidates. It is understanding who will actually perform.

ReechOut is building the system that helps companies make that decision.`,
  tagline: "" as const,
} as const;

export const ABOUT_US_MISSION_HEADER = {
  kicker: "Mission & Values",
  title: "Mission-Driven Innovation",
  description: "How we think about the next chapter of hiring.",
} as const;

export const ABOUT_US_MISSION_CARDS = [
  {
    number: "01",
    title: "Our Mission",
    body: "Help companies make better hiring decisions by replacing weak signals with real evaluation.",
    icon: "flag" as const,
  },
  {
    number: "02",
    title: "Our Vision",
    body: "A world where hiring is based on how people think and perform, not how they present themselves.",
    icon: "eye" as const,
  },
  {
    number: "03",
    title: "Our Values",
    body: "Clarity over complexity. Signal over noise. Speed with quality. Continuous improvement through data.",
    icon: "heart" as const,
  },
] as const;

export const ABOUT_US_CTA: MarketingCta = {
  heading: "Reach Out to ReechOut",
  description:
    "Have questions about hiring or want to see how it works?",
  primaryLabel: "Start Free Trial",
  primaryHref: "/signup",
};
