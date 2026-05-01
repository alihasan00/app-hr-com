"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Building2, LogOut, Moon, Plus, Sun, User as UserIcon } from "lucide-react";

import { cn } from "@/lib/ui/cn";
import { SITE_LOGO } from "@/lib/site/marketing-site";
import { THEME_KEY } from "@/lib/ui/theme";
import { useAuthStore } from "@/lib/store/auth.store";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProfileModal } from "@/components/profile-modal";

interface DashboardNavProps {
  /** 
   * Optional callback for the "New Resource" button. 
   * If omitted, it will default to routing to `/interview/create` for interviews.
   */
  onCreateNew?: () => void;
}

export function DashboardNav({ onCreateNew }: DashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const user = useAuthStore((s) => s.user);

  const [darkMode, setDarkMode] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Determine active tab based on route
  const activeTab = pathname?.includes("/questionnaire") ? "questionnaires" : "interviews";

  // Theme initialization
  useEffect(() => {
    const root = document.documentElement;
    const stored = localStorage.getItem(THEME_KEY) as "dark" | "light" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = stored === "dark" || (!stored && prefersDark) ? "dark" : "light";
    
    if (initial === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    
    // Using setTimeout to avoid synchronous setState during render cycle / effect
    setTimeout(() => setDarkMode(root.classList.contains("dark")), 0);
  }, []);

  const toggleTheme = useCallback(() => {
    const root = document.documentElement;
    root.classList.toggle("dark");
    const next = root.classList.contains("dark") ? "dark" : "light";
    localStorage.setItem(THEME_KEY, next);
    setDarkMode(next === "dark");
  }, []);

  const handleLogout = async () => {
    try {
      const { authApi } = await import("@/lib/api");
      await authApi.logout();
    } catch {
      /* best effort — fall through to clearing client state regardless */
    }
    clearAuth();
    router.push("/login");
  };

  const handleCreateClick = () => {
    if (onCreateNew) {
      onCreateNew();
    } else {
      if (activeTab === "questionnaires") {
        router.push("/questionnaires?create=true");
      } else {
        router.push("/interview/create");
      }
    }
  };

  return (
    <header className="sticky top-2 z-40 flex w-full flex-col items-stretch px-4 sm:top-4 sm:px-6 lg:px-8 mb-2 sm:mb-4">
      <div className="mx-auto flex w-full max-w-[1400px] min-h-[52px] shrink-0 items-center justify-between gap-3 rounded-[6px] border border-[var(--header-floating-border)] bg-[var(--header-floating-bg)] py-3 px-[clamp(0.875rem,2.5vw,1.125rem)] shadow-[0_4px_32px_rgba(var(--shadow-rgb),0.09),0_1px_4px_rgba(var(--shadow-rgb),0.05)] sm:px-[clamp(1.125rem,3.5vw,1.5rem)] lg:px-[clamp(1.25rem,4vw,2rem)]">
        {/* Left: Logo & Product Name */}
        <Link href="/interviews" className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-2.5 no-underline outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
          <Image
            src={SITE_LOGO}
            alt="ReechOut Logo"
            width={40}
            height={40}
            className="h-8 w-auto max-w-full object-contain md:h-10"
          />
          <span className="ml-0.5 hidden items-baseline gap-0 text-lg font-extrabold tracking-tight md:flex md:text-xl">
            <span className="text-[var(--product-name-color)]">Reech</span>
            <span className="text-[var(--primary-color)] brightness-[1.05]">
              Out
            </span>
          </span>
        </Link>

        {/* Center: Navigation Tabs */}
        <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-sm:hidden">
          <ul className="flex items-center gap-1 rounded-[6px] border border-[var(--header-floating-border)] bg-[var(--surface-1)] p-1 shadow-sm">
            <li>
              <Link
                href="/interviews"
                className={cn(
                  "block rounded-[3px] px-4 py-1.5 text-[14px] transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-color)]",
                  activeTab === "interviews"
                    ? "bg-[var(--background-color)] font-bold text-[var(--text-primary)] shadow-sm border border-[var(--header-floating-border)]"
                    : "font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] border border-transparent"
                )}
              >
                Interviews
              </Link>
            </li>
            <li>
              <Link
                href="/questionnaires"
                className={cn(
                  "block rounded-[3px] px-4 py-1.5 text-[14px] transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-color)]",
                  activeTab === "questionnaires"
                    ? "bg-[var(--background-color)] font-bold text-[var(--text-primary)] shadow-sm border border-[var(--header-floating-border)]"
                    : "font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] border border-transparent"
                )}
              >
                Questionnaires
              </Link>
            </li>
          </ul>
        </nav>

        {/* Right: Actions */}
        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2.5 lg:ml-7">
          {/* Desktop Create Button */}
          <Button
            onClick={handleCreateClick}
            className="hidden sm:flex h-8 px-3 text-[13px] md:h-10 md:px-4 md:text-sm font-semibold shadow-md"
          >
            <Plus className="mr-1.5 h-4 w-4 shrink-0" strokeWidth={2.5} />
            {activeTab === "questionnaires" ? "New Questionnaire" : "New Interview"}
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            className="h-8 w-8 shrink-0 bg-transparent md:h-10 md:w-10"
          >
            {darkMode ? <Sun className="h-4 w-4 md:h-5 md:w-5" strokeWidth={2} /> : <Moon className="h-4 w-4 md:h-5 md:w-5" strokeWidth={2} />}
          </Button>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0 overflow-hidden bg-[var(--header-floating-bg)] p-0 md:h-10 md:w-10"
                aria-label="Open profile menu"
              >
                {user?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatar_url}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-4 w-4 md:h-5 md:w-5" strokeWidth={2} />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={() => setProfileOpen(true)}>
                <UserIcon className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/organization" className="cursor-pointer">
                  <Building2 className="mr-2 h-4 w-4" />
                  Organization
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 focus:bg-red-50 focus:text-red-600 dark:text-red-500 dark:focus:bg-red-950/50 dark:focus:text-red-500"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <ProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </header>
  );
}
