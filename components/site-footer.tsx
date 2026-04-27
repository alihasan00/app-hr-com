import Image from "next/image";
import Link from "next/link";

import { PAGE_SHELL_CLASS } from "@/lib/site/page-layout";
import { SITE_LOGO } from "@/lib/site/marketing-site";
import { IconCheckCircle } from "./home/home-icons";

const FOOTER_LINKS = {
  solutions: [
    { href: "/interview", label: "Interviews" },
    { href: "/questionnaire", label: "Questionnaire" },
    { href: "/reports", label: "Reports" },
    { href: "/personas", label: "Personas" },
  ],
  company: [
    { href: "/about-us", label: "About Us" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ],
} as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      id="footer"
      className="relative w-full overflow-hidden border-t border-[var(--border-color-light)] bg-transparent pb-8 pt-20 md:pb-10 md:pt-24 dark:border-white/[0.08]"
      role="contentinfo"
    >
      <div className={`relative z-[2] ${PAGE_SHELL_CLASS}`}>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <div className="mb-5 flex items-center gap-2">
              <Image
                src={SITE_LOGO}
                alt=""
                width={52}
                height={52}
                className="h-11 w-auto max-w-full object-contain md:h-16"
              />
              <span className="ml-0.5 flex items-baseline gap-0">
                <span className="text-xl font-extrabold tracking-tight text-[var(--product-name-color)] md:text-2xl">
                  Reech
                </span>
                <span className="text-xl font-extrabold tracking-tight text-[var(--primary-color)] brightness-[1.05] md:text-2xl">
                  Out
                </span>
              </span>
            </div>
            <p className="mb-4 max-w-[420px] text-[var(--text-secondary)]">
              Automate phone interviews with AI-powered questionnaires and
              detailed candidate reports.
            </p>
            <div className="mb-6 flex flex-wrap gap-2">
              {["GDPR Compliant", "SOC 2 Ready", "SSO Support"].map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full border border-[rgba(var(--primary-color-rgb),0.12)] bg-[rgba(var(--primary-color-rgb),0.06)] px-2.5 py-1.5 text-xs font-bold text-[var(--primary-color)]"
                >
                  <IconCheckCircle className="h-3.5 w-3.5 text-[var(--success-emerald)]" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className="mb-6 text-lg font-bold text-[var(--text-primary)]">
              Solutions
            </h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.solutions.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-[var(--text-secondary)] transition-colors hover:text-[var(--primary-color)]"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="mb-6 text-lg font-bold text-[var(--text-primary)]">
              Company
            </h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.company.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-[var(--text-secondary)] transition-colors hover:text-[var(--primary-color)]"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h4 className="mb-6 text-lg font-bold text-[var(--text-primary)]">
              Stay in the loop
            </h4>
            <p className="mb-4 text-[var(--text-secondary)]">
              Get product updates and hiring best practices.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--text-muted)]">
              <Link
                href="/privacy-policy"
                className="hover:text-[var(--primary-color)]"
              >
                Privacy Policy
              </Link>
              <span aria-hidden>•</span>
              <Link
                href="/terms-of-service"
                className="hover:text-[var(--primary-color)]"
              >
                Terms of Service
              </Link>
              <span aria-hidden>•</span>
              <Link href="/security" className="hover:text-[var(--primary-color)]">
                Security
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[var(--border-color-light)] pt-8 text-sm text-[var(--text-secondary)] md:flex-row">
          <p>© {year} HR Interviewer. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/status" className="hover:text-[var(--primary-color)]">
              Status
            </Link>
            <Link href="/docs" className="hover:text-[var(--primary-color)]">
              Docs
            </Link>
            <Link href="/api" className="hover:text-[var(--primary-color)]">
              API
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
