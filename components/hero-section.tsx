"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, Phone, Zap, Target } from "lucide-react";

import { HOME_CTA, HOME_HERO_BADGE, HOME_HERO_TIP } from "@/app/home-content";
import { cn } from "@/lib/ui/cn";
import { PAGE_SHELL_CLASS } from "@/components/page-shell";
import { PrimaryCtaLink } from "./home/primary-cta-link";
import { HeroParticleBackground } from "./hero-particle-background";

const STATS = [
  { v: "1.5K+", l: "Interviews Conducted", i: Phone },
  { v: "1.25K+", l: "HR Hours Saved", i: Zap },
  { v: "96%", l: "Screening Accuracy", i: Target },
] as const;

/** Cubic-bezier tuple — `as const` so Framer Motion types `ease` as `Easing`, not `number[]`. */
const HERO_EASE = [0.22, 1, 0.36, 1] as const;

const heroBookingCtaClass = cn(
  "inline-flex min-h-[50px] w-full max-w-none items-center justify-center gap-2 rounded-xl border border-[var(--header-floating-border)] bg-[var(--header-floating-bg)] px-5 py-3 text-[15px] font-semibold text-[var(--text-heading)] shadow-[0_4px_16px_rgba(var(--shadow-rgb),0.06)] backdrop-blur-md transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-[rgba(var(--primary-color-rgb),0.28)] hover:shadow-[0_8px_24px_rgba(var(--shadow-rgb),0.08)] sm:px-7 md:min-h-14 md:w-auto md:text-base dark:hover:border-[rgba(var(--accent-violet-rgb),0.35)]",
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: HERO_EASE,
    },
  },
};

const imageVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: HERO_EASE,
      delay: 0.6,
    },
  },
};

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden pt-[calc(var(--site-nav-height)+clamp(2rem,5vw,3.5rem))] pb-[clamp(3rem,8vw,5rem)]"
      aria-label="Hero Section"
    >
      <HeroParticleBackground />
      
      <motion.div 
        className={`relative z-[2] ${PAGE_SHELL_CLASS}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="mx-auto flex w-full min-w-0 max-w-[52rem] flex-col items-center text-center">
          <motion.div
            className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-[rgba(var(--primary-color-rgb),0.22)] bg-[rgba(var(--primary-color-rgb),0.08)] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--primary-color)] dark:border-[rgba(var(--accent-violet-rgb),0.3)] dark:bg-[rgba(var(--primary-color-rgb),0.12)] dark:text-[var(--accent-violet)]"
            variants={itemVariants}
          >
            <span
              className="h-1.5 w-1.5 shrink-0 animate-[roBadgePulse_2s_ease-in-out_infinite] rounded-full bg-[var(--primary-color)] dark:bg-[#c4b5fd]"
              aria-hidden
            />
            {HOME_HERO_BADGE}
          </motion.div>

          <motion.h1 
            className="mb-4 text-[clamp(2.5rem,5.5vw,4rem)] font-extrabold leading-[1.1] tracking-[-0.03em] text-[var(--text-heading)] md:mb-6"
            variants={itemVariants}
          >
            <span className="block text-[var(--text-primary)]">Too many applicants.</span>
            <span className="mt-1 block text-[var(--text-primary)] opacity-90">
              Still not sure
            </span>
            <span className="mt-1 block">
              <span className="relative inline-block bg-[length:200%_auto] bg-gradient-to-br from-[var(--primary-color)] via-[var(--accent-violet)] to-[var(--accent-pink)] bg-clip-text text-transparent animate-[hero-gradient-shift_3s_ease_infinite] after:absolute after:bottom-1 after:left-0 after:right-0 after:h-1 after:rounded-sm after:bg-gradient-to-r after:from-[var(--primary-color)] after:via-[var(--accent-violet)] after:to-[var(--accent-pink)] after:opacity-30 after:content-['']">
                who to hire
              </span>
              <span className="text-[var(--primary-color)]">?</span>
            </span>
          </motion.h1>

          <motion.p 
            className="mb-5 max-w-[42rem] text-[clamp(0.95rem,1.5vw,1.125rem)] leading-[1.65] text-[var(--text-secondary)] md:mb-6"
            variants={itemVariants}
          >
            Resumes are AI-written. Everyone looks qualified. ReechOut shows you
            how candidates actually think so you know who to move forward with.
          </motion.p>

          <motion.div
            className="mb-8 w-full max-w-full min-w-0 px-1 sm:px-0"
            variants={itemVariants}
          >
            <div
              className="grid min-w-0 grid-cols-1 divide-y divide-[var(--header-floating-border)] rounded-[1.75rem] border border-[var(--header-floating-border)] bg-[var(--header-floating-bg)] shadow-[0_8px_32px_rgba(var(--shadow-rgb),0.06),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-xl dark:divide-white/[0.08] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.05)] md:grid-cols-3 md:divide-x md:divide-y-0"
              role="group"
              aria-label="Product metrics"
            >
              {STATS.map((s) => (
                <div
                  key={s.l}
                  className="group flex min-w-0 items-center justify-center gap-3 px-4 py-4 sm:px-5 md:px-4 md:py-5 lg:px-6"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary-color)]/10 text-[var(--primary-color)] ring-1 ring-[var(--primary-color)]/20 transition-transform group-hover:scale-110 group-hover:bg-[var(--primary-color)]/15 md:h-11 md:w-11">
                    <s.i className="h-4 w-4 md:h-5 md:w-5" strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1 text-left md:flex-initial">
                    <div className="text-lg font-extrabold tracking-tight text-[var(--text-heading)] md:text-xl lg:text-2xl">
                      {s.v}
                    </div>
                    <div className="text-[10px] font-semibold uppercase leading-snug tracking-wider text-[var(--text-secondary)] text-balance opacity-80 sm:text-[11px]">
                      {s.l}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="mb-3 flex w-full min-w-0 max-w-full flex-col items-stretch justify-center gap-3 md:mb-4 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center"
            variants={itemVariants}
          >
            <PrimaryCtaLink
              href={HOME_CTA.primaryHref}
              fullWidth
              className="min-w-0 sm:w-auto sm:max-w-none"
            >
              <span>{HOME_CTA.primaryLabel}</span>
            </PrimaryCtaLink>
            <a
              href={HOME_CTA.secondaryHref}
              target="_blank"
              rel="noopener noreferrer"
              className={heroBookingCtaClass}
            >
              <Calendar className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
              <span>{HOME_CTA.secondaryLabel}</span>
            </a>
          </motion.div>

          <motion.p
            className="mb-10 max-w-[36rem] text-[13px] leading-relaxed text-[var(--text-muted)] opacity-[0.85] dark:text-white/40 dark:opacity-100 md:mb-12"
            variants={itemVariants}
          >
            {HOME_HERO_TIP}
          </motion.p>
        </div>

        <motion.div 
          className="relative mx-auto max-w-[1060px]"
          variants={imageVariants}
        >
          <figure className="relative overflow-hidden rounded-t-2xl border border-b-0 border-[var(--border-color-light)] shadow-[0_-8px_48px_rgba(var(--primary-color-rgb),0.08),0_0_0_1px_rgba(var(--shadow-rgb),0.06)] dark:border-white/[0.09] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.04),inset_0_1px_0_rgba(255,255,255,0.06)]">
            <div className="flex items-center gap-2.5 border-b border-[var(--border-color-light)] bg-[var(--surface-2)] px-4 py-2.5 dark:border-white/[0.07] dark:bg-[rgba(12,10,20,0.98)]">
              <div className="flex shrink-0 gap-1.5" aria-hidden>
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex min-w-0 flex-1 justify-center">
                <div className="max-w-full truncate whitespace-nowrap rounded-md border border-[var(--border-color-light)] bg-[var(--background-color)] px-5 py-1 text-[11px] tracking-wide text-[var(--text-muted)] dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white/35">
                  app.reechout.com/dashboard
                </div>
              </div>
            </div>
            <div className="bg-[var(--background-color)] p-1 sm:p-2">
              <Image
                src="https://storage.googleapis.com/images.reechout.com/dashboard.webp"
                alt="ReechOut dashboard — interviews and questionnaires"
                width={3456}
                height={1994}
                priority
                sizes="(max-width: 1024px) 100vw, 896px"
                className="block h-auto w-full rounded-lg object-cover object-top dark:hidden sm:rounded-[10px]"
              />
              <Image
                src="https://storage.googleapis.com/images.reechout.com/dashboard-dark.webp"
                alt="ReechOut dashboard — interviews and questionnaires"
                width={3456}
                height={1994}
                priority
                sizes="(max-width: 1024px) 100vw, 896px"
                className="hidden h-auto w-full rounded-lg object-cover object-top dark:block sm:rounded-[10px]"
              />
            </div>
          </figure>
        </motion.div>
      </motion.div>
    </section>
  );
}
