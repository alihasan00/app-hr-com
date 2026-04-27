"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const LenisContext = createContext<Lenis | null>(null);

/** Smooth scroll (Lenis) only on marketing / static site routes — not dashboard, auth, or candidate flows. */
export function isLenisEnabledPath(path: string | null): boolean {
  if (!path) return false;
  if (path === "/") return true;
  if (path.startsWith("/blog/")) return true;
  const exact = new Set([
    "/about-us",
    "/contact",
    "/reports",
    "/questionnaire",
    "/personas",
    "/terms-of-service",
    "/privacy-policy",
    "/security",
    "/blog",
  ]);
  return exact.has(path);
}

export function useLenis(): Lenis | null {
  return useContext(LenisContext);
}

export function LenisProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const enabled = isLenisEnabledPath(pathname);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches || !enabled) {
      return;
    }

    const instance = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      autoRaf: true,
    });
    queueMicrotask(() => {
      setLenis(instance);
    });

    return () => {
      instance.destroy();
      queueMicrotask(() => {
        setLenis(null);
      });
    };
  }, [enabled]);

  const value = useMemo(() => lenis, [lenis]);

  return (
    <LenisContext.Provider value={value}>{children}</LenisContext.Provider>
  );
}
