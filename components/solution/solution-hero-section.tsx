import Image from "next/image";
import { Fragment } from "react";

import { DEFAULT_SOLUTION_TRUST_ITEMS } from "@/lib/site/marketing-site";
import { PAGE_SHELL_CLASS } from "@/components/page-shell";
import type {
  SolutionHeroModel,
  SolutionHeroScreenshot,
} from "@/components/solution/solution-page-model";
import { IconCalendar, IconCheckCircle } from "@/components/home/home-icons";
import { PrimaryCtaLink } from "@/components/home/primary-cta-link";

export type { SolutionHeroModel, SolutionHeroScreenshot };

const DEFAULT_SCREENSHOT: SolutionHeroScreenshot = {
  imageLight: "https://storage.googleapis.com/images.reechout.com/dashboard.webp",
  imageDark: "https://storage.googleapis.com/images.reechout.com/dashboard-dark.webp",
  alt: "ReechOut dashboard — interviews and questionnaires",
  chromeLabel: "app.reechout.com/dashboard",
};

export type SolutionHeroSectionProps = {
  hero: SolutionHeroModel;
  trustItems?: readonly string[];
  /** Defaults to home-page dashboard screenshot. */
  screenshot?: SolutionHeroScreenshot;
};

export function SolutionHeroSection({
  hero: h,
  trustItems = DEFAULT_SOLUTION_TRUST_ITEMS,
  screenshot = DEFAULT_SCREENSHOT,
}: SolutionHeroSectionProps) {
  const shot = screenshot;
  const chrome =
    shot.chromeLabel ?? DEFAULT_SCREENSHOT.chromeLabel ?? "app.reechout.com";
  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden pt-[calc(var(--site-nav-height)+clamp(2rem,5vw,3.5rem))] pb-[clamp(3rem,8vw,5rem)]"
      aria-label="Hero Section"
    >
      <div className={`relative z-[2] ${PAGE_SHELL_CLASS}`}>
        <div className="mx-auto flex max-w-[52rem] flex-col items-center text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[rgba(var(--primary-color-rgb),0.22)] bg-[rgba(var(--primary-color-rgb),0.08)] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--primary-color)] dark:border-[rgba(var(--accent-violet-rgb),0.35)] dark:bg-[rgba(var(--primary-color-rgb),0.12)] dark:text-[var(--accent-violet)]">
            <span
              className="h-1.5 w-1.5 shrink-0 animate-[roBadgePulse_2s_ease-in-out_infinite] rounded-full bg-[var(--primary-color)]"
              aria-hidden
            />
            <span>{h.badge}</span>
          </div>

          <h1 className="mb-4 text-[clamp(2.25rem,5vw,3.75rem)] font-extrabold leading-[1.1] tracking-[-0.03em] text-[var(--text-heading)] md:mb-6">
            <span className="block">{h.titleLine1}</span>
            <span className="mt-1 block">
              {h.titleLine2Prefix ?? ""}
              <span className="relative inline-block bg-[length:200%_auto] bg-gradient-to-br from-[var(--primary-color)] via-[var(--accent-violet)] to-[var(--accent-pink)] bg-clip-text text-transparent animate-[hero-gradient-shift_3s_ease_infinite] after:absolute after:bottom-1 after:left-0 after:right-0 after:h-1 after:rounded-sm after:bg-gradient-to-r after:from-[var(--primary-color)] after:via-[var(--accent-violet)] after:to-[var(--accent-pink)] after:opacity-30 after:content-['']">
                {h.titleHighlight}
              </span>
              {h.titleLine2Suffix ?? ""}
            </span>
          </h1>

          <p className="mb-5 max-w-[42rem] text-[clamp(0.95rem,1.5vw,1.125rem)] leading-[1.65] text-[var(--text-secondary)] md:mb-6">
            {h.description}
          </p>

          <div className="mb-6 flex flex-wrap items-center justify-center gap-4 md:mb-8 md:gap-6">
            {h.stats.map((s, i) => (
              <Fragment key={s.label}>
                {i > 0 && (
                  <div
                    className="h-8 w-px bg-gradient-to-b from-transparent via-[rgba(var(--primary-color-rgb),0.22)] to-transparent md:h-10"
                    aria-hidden
                  />
                )}
                <div>
                  {s.value ? (
                    <div className="text-[clamp(1.375rem,2vw,1.75rem)] font-extrabold leading-none text-[var(--primary-color)]">
                      {s.value}
                    </div>
                  ) : null}
                  <div
                    className={
                      s.value
                        ? "mt-1 text-[11px] font-medium text-[var(--text-secondary)] md:text-[13px]"
                        : "text-[clamp(0.8125rem,1.2vw,0.9375rem)] font-semibold leading-snug text-[var(--text-secondary)] md:text-[15px]"
                    }
                  >
                    {s.label}
                  </div>
                </div>
              </Fragment>
            ))}
          </div>

          <div className="mb-8 w-full md:mb-10">
            <PrimaryCtaLink href={h.ctaHref}>
              <IconCalendar className="h-5 w-5 shrink-0" />
              <span>{h.ctaLabel}</span>
            </PrimaryCtaLink>
          </div>

          <div className="mb-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 md:mb-12 md:gap-x-5 md:gap-y-4">
            {trustItems.map((label) => (
              <div
                key={label}
                className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--text-primary)]"
              >
                <IconCheckCircle className="h-4 w-4 shrink-0 text-[var(--success-emerald)]" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto max-w-[1060px]">
          <figure className="relative overflow-hidden rounded-t-2xl border border-b-0 border-[var(--border-color-light)] shadow-[0_-8px_48px_rgba(var(--primary-color-rgb),0.08),0_0_0_1px_rgba(var(--shadow-rgb),0.06)] dark:border-white/[0.09] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.04),inset_0_1px_0_rgba(255,255,255,0.06)]">
            <div className="flex items-center gap-2.5 border-b border-[var(--border-color-light)] bg-[var(--surface-2)] px-4 py-2.5 dark:border-white/[0.07] dark:bg-[rgba(12,10,20,0.98)]">
              <div className="flex shrink-0 gap-1.5" aria-hidden>
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex min-w-0 flex-1 justify-center">
                <div className="max-w-full truncate whitespace-nowrap rounded-md border border-[var(--border-color-light)] bg-[var(--background-color)] px-5 py-1 text-[11px] tracking-wide text-[var(--text-muted)] dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white/35">
                  {chrome}
                </div>
              </div>
            </div>
            <div className="bg-[var(--background-color)] p-1 sm:p-2">
              <Image
                src={shot.imageLight}
                alt={shot.alt}
                width={3456}
                height={1994}
                priority
                sizes="(max-width: 1024px) 100vw, 896px"
                className="block h-auto w-full rounded-lg object-cover object-top dark:hidden sm:rounded-[10px]"
              />
              <Image
                src={shot.imageDark}
                alt={shot.alt}
                width={3456}
                height={1994}
                priority
                sizes="(max-width: 1024px) 100vw, 896px"
                className="hidden h-auto w-full rounded-lg object-cover object-top dark:block sm:rounded-[10px]"
              />
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}
