import type { Metadata } from "next";

import { ApplicationStepsSection } from "@/components/home/application-steps-section";
import { HomeCtaSection } from "@/components/home/home-cta-section";
import {
  HomePageMotionSection,
  HomePageNavMotion,
} from "@/components/home-page-motion";
import { PageAmbientBackground } from "@/components/page-ambient-background";
import {
  SolutionBenefitsSection,
  SolutionFeaturesSection,
  SolutionHeroSection,
} from "@/components/solution";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { getHomeProductScreenshot } from "@/app/home-content";
import { MARKETING_OG_IMAGE } from "@/lib/site/marketing-site";
import {
  PERSONAS_APPLICATION_HEADER,
  PERSONAS_APPLICATION_STEPS,
  PERSONAS_BENEFIT_ITEMS,
  PERSONAS_BENEFIT_VISUAL_STATS,
  PERSONAS_BENEFITS_HEADER,
  PERSONAS_CTA,
  PERSONAS_FEATURES,
  PERSONAS_FEATURES_HEADER,
  PERSONAS_HERO,
  PERSONAS_METADATA,
  personasCanonical,
} from "@/app/personas/content";

export const metadata: Metadata = {
  title: PERSONAS_METADATA.title,
  description: PERSONAS_METADATA.description,
  keywords: PERSONAS_METADATA.keywords,
  authors: [{ name: PERSONAS_METADATA.author }],
  robots: PERSONAS_METADATA.robots,
  alternates: {
    canonical: personasCanonical,
  },
  openGraph: {
    title: PERSONAS_METADATA.title,
    description: PERSONAS_METADATA.description,
    type: "website",
    url: personasCanonical,
    siteName: "ReechOut",
    locale: "en_US",
    images: [{ url: MARKETING_OG_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: PERSONAS_METADATA.title,
    description: PERSONAS_METADATA.description,
    images: [MARKETING_OG_IMAGE],
  },
  other: {
    language: PERSONAS_METADATA.language,
  },
};

export default function PersonasMarketingPage() {
  return (
    <div className="relative bg-gradient-to-b from-[var(--hero-bg-tint)] via-[var(--primary-lighter)] to-[var(--background-color)] dark:from-[#0a0612] dark:via-[#120a18] dark:to-[var(--background-color)]">
      <PageAmbientBackground />
      <div className="relative z-[1] flex min-h-screen flex-col text-[var(--text-primary)]">
        <HomePageNavMotion>
          <SiteNav mode="scroll" />
        </HomePageNavMotion>
        <main className="flex flex-1 flex-col">
          <HomePageMotionSection index={0}>
            <SolutionHeroSection
              hero={PERSONAS_HERO}
              screenshot={getHomeProductScreenshot("personas")}
            />
          </HomePageMotionSection>
          <HomePageMotionSection index={1}>
            <SolutionFeaturesSection
              header={PERSONAS_FEATURES_HEADER}
              features={PERSONAS_FEATURES}
              ariaLabel="Features"
            />
          </HomePageMotionSection>
          <HomePageMotionSection index={2}>
            <ApplicationStepsSection
              header={PERSONAS_APPLICATION_HEADER}
              steps={PERSONAS_APPLICATION_STEPS}
              sectionId="personas-how-it-works"
              ariaLabel="How it works"
            />
          </HomePageMotionSection>
          <HomePageMotionSection index={3}>
            <SolutionBenefitsSection
              header={PERSONAS_BENEFITS_HEADER}
              items={PERSONAS_BENEFIT_ITEMS}
              visualStats={PERSONAS_BENEFIT_VISUAL_STATS}
            />
          </HomePageMotionSection>
          <HomePageMotionSection index={4}>
            <HomeCtaSection cta={PERSONAS_CTA} />
          </HomePageMotionSection>
        </main>
        <HomePageMotionSection index={5}>
          <SiteFooter />
        </HomePageMotionSection>
      </div>
    </div>
  );
}
