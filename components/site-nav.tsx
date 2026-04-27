"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type FocusEvent,
} from "react";

import { useLenis } from "@/components/lenis-provider";
import { REECHOUT_CONNECT_URL, SITE_LOGO } from "@/lib/site/marketing-site";
import { THEME_KEY } from "@/lib/ui/theme";
import { motion, useReducedMotion } from "framer-motion";
import {
  ChevronDown,
  ClipboardList,
  FileChartColumn,
  Menu,
  Mic,
  Moon,
  Sun,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

const SCROLL_ENABLE = 50;
const SCROLL_DISABLE_BUFFER = 20;

type SolutionNavItem = {
  href: string;
  label: string;
  Icon: LucideIcon;
};

const SOLUTION_NAV_ITEMS: SolutionNavItem[] = [
  { href: "/interview", label: "Interview", Icon: Mic },
  { href: "/questionnaire", label: "Questionnaire", Icon: ClipboardList },
  { href: "/reports", label: "Reports", Icon: FileChartColumn },
  { href: "/personas", label: "Personas", Icon: Users },
];

const NAV_LINKS_REST = [
  { href: "/blog", label: "Blog" },
  { href: "/about-us", label: "About Us" },
  { href: "/contact", label: "Contact" },
] as const;

/** Delay before closing so the pointer can move from the trigger into the panel. */
const SOLUTIONS_HOVER_CLOSE_MS = 200;

const springNav = { type: "spring" as const, stiffness: 440, damping: 26 };
const springIcon = { type: "spring" as const, stiffness: 320, damping: 18 };

export type SiteNavMode = "scroll" | "static" | "floating";

export type SiteNavProps = {
  /** `scroll`: floating pill after scroll (default). `static` / `floating`: fixed appearance. */
  mode?: SiteNavMode;
  productName?: string;
} & ComponentPropsWithoutRef<"header">;

function cn(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function SiteNav({
  mode = "scroll",
  productName = "ReechOut",
  className,
  ...headerProps
}: SiteNavProps) {
  const pathname = usePathname();
  const lenis = useLenis();
  const [scrollFloating, setScrollFloating] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [mobileSolutionsOpen, setMobileSolutionsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const rafRef = useRef<number | null>(null);
  const solutionsWrapRef = useRef<HTMLLIElement | null>(null);
  const solutionsHoverCloseTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const solutionSectionActive = SOLUTION_NAV_ITEMS.some(
    ({ href }) => pathname === href || pathname.startsWith(`${href}/`),
  );

  const isFloating =
    mode === "floating" || (mode === "scroll" && scrollFloating);

  useEffect(() => {
    const root = document.documentElement;
    const stored = localStorage.getItem(THEME_KEY) as "dark" | "light" | null;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const initial =
      stored === "dark" || (!stored && prefersDark) ? "dark" : "light";
    if (initial === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    requestAnimationFrame(() => {
      setDarkMode(root.classList.contains("dark"));
    });
  }, []);

  const toggleTheme = useCallback(() => {
    const root = document.documentElement;
    root.classList.toggle("dark");
    const next = root.classList.contains("dark") ? "dark" : "light";
    localStorage.setItem(THEME_KEY, next);
    setDarkMode(next === "dark");
  }, []);

  const cancelSolutionsHoverClose = useCallback(() => {
    if (solutionsHoverCloseTimerRef.current != null) {
      clearTimeout(solutionsHoverCloseTimerRef.current);
      solutionsHoverCloseTimerRef.current = null;
    }
  }, []);

  const openSolutionsMenu = useCallback(() => {
    cancelSolutionsHoverClose();
    setSolutionsOpen(true);
  }, [cancelSolutionsHoverClose]);

  const scheduleCloseSolutionsMenu = useCallback(() => {
    cancelSolutionsHoverClose();
    solutionsHoverCloseTimerRef.current = setTimeout(() => {
      solutionsHoverCloseTimerRef.current = null;
      setSolutionsOpen(false);
    }, SOLUTIONS_HOVER_CLOSE_MS);
  }, [cancelSolutionsHoverClose]);

  const onSolutionsLiBlurCapture = useCallback(
    (e: FocusEvent<HTMLLIElement>) => {
      const next = e.relatedTarget;
      if (next instanceof Node && e.currentTarget.contains(next)) return;
      scheduleCloseSolutionsMenu();
    },
    [scheduleCloseSolutionsMenu],
  );

  useEffect(() => () => cancelSolutionsHoverClose(), [cancelSolutionsHoverClose]);

  useEffect(() => {
    if (mode !== "scroll") return;

    const applyY = (y: number) => {
      const disableThreshold = SCROLL_ENABLE - SCROLL_DISABLE_BUFFER;
      setScrollFloating((prev) => {
        if (prev) {
          if (y < disableThreshold) return false;
          return true;
        }
        if (y > SCROLL_ENABLE) return true;
        return false;
      });
    };

    const runWindow = () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const y =
          window.scrollY ||
          document.documentElement.scrollTop ||
          document.body.scrollTop ||
          0;
        applyY(y);
      });
    };

    if (lenis) {
      const unsub = lenis.on("scroll", (l) => applyY(l.scroll));
      applyY(lenis.scroll);
      return () => {
        unsub();
        if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      };
    }

    runWindow();
    window.addEventListener("scroll", runWindow, { passive: true });
    return () => {
      window.removeEventListener("scroll", runWindow);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [mode, lenis]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!solutionsOpen) return;
    let listen = true;
    const onDoc = (e: MouseEvent) => {
      const el = solutionsWrapRef.current;
      if (el && !el.contains(e.target as Node)) setSolutionsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSolutionsOpen(false);
    };
    // Defer so the same click that opens the menu does not hit the listener first.
    const id = window.requestAnimationFrame(() => {
      if (!listen) return;
      document.addEventListener("mousedown", onDoc);
      document.addEventListener("keydown", onKey);
    });
    return () => {
      listen = false;
      window.cancelAnimationFrame(id);
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [solutionsOpen]);

  useEffect(() => {
    if (!mobileOpen || !solutionSectionActive) return;
    const id = requestAnimationFrame(() => {
      setMobileSolutionsOpen(true);
    });
    return () => cancelAnimationFrame(id);
  }, [mobileOpen, solutionSectionActive]);

  return (
    <header
      className={cn(
        "fixed left-0 right-0 z-[1000] flex w-full flex-col items-stretch transition-[background-color,box-shadow,top] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-[background-color,box-shadow] [backface-visibility:hidden] [transform:translateZ(0)]",
        isFloating
          ? "top-2 border-b-0 bg-transparent px-4 shadow-none sm:top-4 sm:px-6 lg:px-8"
          : "top-0 min-h-[var(--site-nav-height)] border-b-0 bg-transparent shadow-none",
        className,
      )}
      {...headerProps}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-[1400px] min-h-[52px] shrink-0 items-center justify-between gap-3 overflow-visible py-2 transition-[background,border-radius,box-shadow,padding] duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)] will-change-[border-radius,padding,box-shadow] px-[clamp(1rem,4vw,2.5rem)]",
          isFloating
            ? "rounded-[20px] border border-[var(--header-floating-border)] bg-[var(--header-floating-bg)] py-2 px-[clamp(0.875rem,2.5vw,1.125rem)] shadow-[0_4px_32px_rgba(var(--shadow-rgb),0.09),0_1px_4px_rgba(var(--shadow-rgb),0.05)] sm:px-[clamp(1.125rem,3.5vw,1.5rem)] lg:px-[clamp(1.25rem,4vw,2rem)]"
            : "min-h-[var(--site-nav-height)] rounded-none border border-transparent bg-transparent shadow-none",
        )}
      >
        <Link
          href="/"
          className="flex min-w-0 shrink-0 items-center gap-2 no-underline"
          aria-label="ReechOut Home"
        >
          <Image
            src={SITE_LOGO}
            alt=""
            width={60}
            height={60}
            className={cn(
              "h-11 w-auto max-w-full object-contain transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] md:h-[60px]",
              isFloating && "h-10 md:h-[60px]",
            )}
            priority
          />
          {productName === "ReechOut" ? (
            <span className="ml-0.5 flex items-baseline gap-0 max-[480px]:hidden">
              <span className="text-xl font-extrabold tracking-tight text-[var(--product-name-color)] md:text-2xl">
                Reech
              </span>
              <span className="text-xl font-extrabold tracking-tight text-[var(--primary-color)] brightness-[1.05] md:text-2xl">
                Out
              </span>
            </span>
          ) : (
            <span className="ml-0.5 max-[480px]:hidden text-xl font-extrabold tracking-tight text-[var(--product-name-color)] md:text-2xl">
              {productName}
            </span>
          )}
        </Link>

        <nav
          className="ml-4 hidden min-w-0 flex-1 justify-center overflow-visible lg:ml-8 lg:flex"
          aria-label="Main"
        >
          <ul className="m-0 flex min-w-0 list-none items-center gap-0.5 overflow-visible p-0">
            <li
              className="relative overflow-visible"
              ref={solutionsWrapRef}
              onMouseEnter={openSolutionsMenu}
              onMouseLeave={scheduleCloseSolutionsMenu}
              onBlurCapture={onSolutionsLiBlurCapture}
            >
              <button
                type="button"
                className={cn(
                  "flex items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm font-medium text-[var(--text-on-purple)] transition-colors hover:text-[var(--accent-purple)]",
                  (solutionSectionActive || solutionsOpen) &&
                    "text-[var(--accent-purple)] underline decoration-2 underline-offset-8 decoration-[var(--accent-purple)]",
                )}
                aria-expanded={solutionsOpen}
                aria-haspopup="true"
                aria-controls="nav-solutions-panel"
                id="nav-solutions-trigger"
                onFocus={openSolutionsMenu}
                onClick={() => setSolutionsOpen((o) => !o)}
              >
                Solutions
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 opacity-80 transition-transform duration-200",
                    solutionsOpen && "rotate-180",
                  )}
                  aria-hidden
                  strokeWidth={2}
                />
              </button>
              {solutionsOpen && (
                <div
                  id="nav-solutions-panel"
                  role="menu"
                  aria-labelledby="nav-solutions-trigger"
                  className="absolute left-0 top-full z-[1200] min-w-[240px] pt-1"
                >
                  <div className="rounded-[var(--radius-md)] border border-[var(--header-floating-border)] bg-[var(--site-nav-panel-bg)] py-1 shadow-[0_8px_32px_rgba(var(--shadow-rgb),0.14)]">
                    {SOLUTION_NAV_ITEMS.map(({ href, label, Icon }) => {
                      const active =
                        pathname === href || pathname.startsWith(`${href}/`);
                      return (
                        <Link
                          key={href}
                          href={href}
                          role="menuitem"
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-[var(--text-on-purple)] transition-colors hover:bg-black/[0.06] hover:text-[var(--accent-purple)] dark:hover:bg-white/[0.08]",
                            active &&
                              "bg-[rgba(var(--primary-color-rgb),0.1)] text-[var(--accent-purple)]",
                          )}
                          onClick={() => setSolutionsOpen(false)}
                        >
                          <Icon
                            className="h-4 w-4 shrink-0 text-[var(--accent-purple)] opacity-90 dark:text-white dark:opacity-100"
                            aria-hidden
                            strokeWidth={2}
                          />
                          {label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </li>
            {NAV_LINKS_REST.map(({ href, label }) => {
              const active =
                pathname === href || pathname.startsWith(`${href}/`);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      "block whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm font-medium text-[var(--text-on-purple)] transition-colors hover:text-[var(--accent-purple)]",
                      active &&
                        "text-[var(--accent-purple)] underline decoration-2 underline-offset-8 decoration-[var(--accent-purple)]",
                    )}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2.5 lg:ml-7">
          <motion.button
            type="button"
            onClick={toggleTheme}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            whileHover={
              prefersReducedMotion
                ? undefined
                : { scale: 1.06, transition: springNav }
            }
            whileTap={
              prefersReducedMotion ? undefined : { scale: 0.92, transition: springNav }
            }
            transition={springNav}
            className={cn(
              "flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-md)] border border-[var(--header-floating-border)] bg-transparent text-[var(--text-on-purple)] transition-[border-color,background-color,color] duration-200 hover:border-[var(--accent-purple)] hover:bg-white/[0.05] hover:text-[var(--accent-purple)]",
              isFloating &&
                "h-8 w-8 max-[480px]:h-[30px] max-[480px]:w-[30px] md:h-10 md:w-10",
            )}
          >
            <motion.span
              className="inline-flex"
              whileHover={
                prefersReducedMotion
                  ? undefined
                  : {
                      rotate: 22,
                      scale: 1.1,
                      transition: springIcon,
                    }
              }
              transition={springIcon}
            >
              {darkMode ? (
                <Sun className="h-5 w-5" aria-hidden strokeWidth={2} />
              ) : (
                <Moon className="h-5 w-5" aria-hidden strokeWidth={2} />
              )}
            </motion.span>
          </motion.button>
          <Link
            href="/login"
            className={cn(
              "inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-md border px-4 text-sm font-medium text-[var(--text-on-purple)] transition-colors hover:border-[var(--accent-purple)] hover:bg-white/[0.05] hover:text-[var(--accent-purple)] max-[480px]:h-[34px] max-[480px]:px-3 max-[480px]:text-xs",
              isFloating
                ? "h-8 border-[var(--border-color-light)] bg-[var(--surface-1)] px-3 text-[13px] max-[480px]:h-[30px] max-[480px]:px-2.5 max-[480px]:text-[11px] md:h-10 md:px-4 md:text-sm"
                : "border-[var(--site-nav-ghost-border)] bg-[var(--site-nav-ghost-bg)]",
            )}
          >
            Log In
          </Link>
          <a
            href={REECHOUT_CONNECT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-md border-0 bg-[var(--primary-color)] px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 max-[480px]:h-[34px] max-[480px]:px-3 max-[480px]:text-xs",
              isFloating
                ? "h-8 px-3 text-[13px] shadow-[0_0_0_1px_rgba(var(--primary-color-rgb),0.35),0_4px_14px_rgba(var(--primary-color-rgb),0.28)] max-[480px]:h-[30px] max-[480px]:px-2.5 max-[480px]:text-[11px] md:h-10 md:px-4 md:text-sm"
                : "shadow-sm",
            )}
          >
            Start for Free
          </a>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg border-0 bg-transparent p-1.5 text-[var(--text-on-purple)] lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="site-mobile-nav"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? (
              <X className="h-6 w-6" aria-hidden strokeWidth={2} />
            ) : (
              <Menu className="h-6 w-6" aria-hidden strokeWidth={2} />
            )}
            <span className="sr-only">
              {mobileOpen ? "Close menu" : "Open menu"}
            </span>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-[1100] lg:hidden"
          id="site-mobile-nav"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
        >
          <button
            type="button"
            className="absolute inset-0 m-0 cursor-pointer border-0 bg-black/40 p-0"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <div
            className={cn(
              "absolute left-3 right-3 max-h-[min(70vh,calc(100vh-6rem))] overflow-auto rounded-[var(--radius-md)] border border-[var(--site-nav-border)] bg-[var(--site-nav-panel-bg)] p-2 shadow-[var(--shadow-medium)]",
              isFloating
                ? "top-[max(5rem,calc(env(safe-area-inset-top,0px)+4rem))] border-[var(--header-floating-border)] shadow-[0_8px_32px_rgba(var(--shadow-rgb),0.12)]"
                : "top-[calc(var(--site-nav-height)+0.5rem)]",
            )}
          >
            <ul className="m-0 flex list-none flex-col p-0">
              <li>
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-[15px] font-medium text-[var(--text-on-purple)] transition-colors hover:bg-black/[0.06] hover:text-[var(--accent-purple)] dark:hover:bg-white/[0.08]",
                    solutionSectionActive &&
                      "bg-[rgba(var(--primary-color-rgb),0.08)] text-[var(--accent-purple)]",
                  )}
                  aria-expanded={mobileSolutionsOpen}
                  onClick={() => setMobileSolutionsOpen((o) => !o)}
                >
                  Solutions
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 opacity-80 transition-transform duration-200",
                      mobileSolutionsOpen && "rotate-180",
                    )}
                    aria-hidden
                    strokeWidth={2}
                  />
                </button>
                {mobileSolutionsOpen && (
                  <ul className="m-0 mb-1 list-none border-l border-[var(--border-color-light)] p-0 pl-2 ml-4">
                    {SOLUTION_NAV_ITEMS.map(({ href, label, Icon }) => {
                      const active =
                        pathname === href || pathname.startsWith(`${href}/`);
                      return (
                        <li key={href}>
                          <Link
                            href={href}
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-4 py-2.5 text-[15px] font-medium text-[var(--text-on-purple)] transition-colors hover:bg-black/[0.06] hover:text-[var(--accent-purple)] dark:hover:bg-white/[0.08]",
                              active &&
                                "bg-[rgba(var(--primary-color-rgb),0.1)] text-[var(--accent-purple)]",
                            )}
                            onClick={() => setMobileOpen(false)}
                          >
                            <Icon
                              className="h-4 w-4 shrink-0 text-[var(--accent-purple)] dark:text-white"
                              aria-hidden
                              strokeWidth={2}
                            />
                            {label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
              {NAV_LINKS_REST.map(({ href, label }) => {
                const active =
                  pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={cn(
                        "block rounded-lg px-4 py-3 text-[15px] font-medium text-[var(--text-on-purple)] transition-colors hover:bg-black/[0.06] hover:text-[var(--accent-purple)] dark:hover:bg-white/[0.08]",
                        active &&
                          "bg-[rgba(var(--primary-color-rgb),0.1)] text-[var(--accent-purple)]",
                      )}
                      onClick={() => setMobileOpen(false)}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
