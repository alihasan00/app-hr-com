"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Building2, Users } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

import { orgsApi } from "@/lib/api";
import { cn } from "@/lib/ui/cn";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

type NavItem = {
  href: string;
  label: string;
  icon: IconComponent;
};

const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { href: "/organization", label: "Details", icon: Building2 },
  { href: "/organization/members", label: "Members", icon: Users },
];

function orgInitials(name: string | null | undefined): string {
  const parts = (name || "").trim().split(/\s+/).slice(0, 2);
  if (parts.length === 0 || !parts[0]) return "";
  return parts.map((p) => p.charAt(0).toUpperCase()).join("");
}

export function OrganizationSidebar() {
  const pathname = usePathname();
  const { data: envelope } = useQuery({
    queryKey: ["org", "me"],
    queryFn: () => orgsApi.getMe(),
  });
  const org = envelope?.data ?? null;
  const initials = orgInitials(org?.name);

  return (
    <div className="lg:sticky lg:top-0">
      <div
        className={cn(
          "overflow-hidden rounded-[var(--radius-lg)] border bg-[var(--glass-bg-light)] backdrop-blur-[20px] backdrop-saturate-[180%]",
          "border-[var(--glass-border-light)]",
          "shadow-[var(--shadow-light)]",
        )}
      >
        {/* Profile card — centered, primary-tinted glass */}
        <div className="relative overflow-hidden border-b border-[var(--glass-border-medium)] bg-gradient-to-br from-[var(--glass-primary-overlay-medium)] to-[var(--glass-primary-overlay)] p-7 text-center">
          <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--glass-white-overlay-dark)] to-transparent" />
          <div className="relative z-[1] flex flex-col items-center gap-3">
            <div
              className={cn(
                "flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-full border text-[22px] font-extrabold",
                "border-[rgba(var(--primary-color-rgb),0.3)]",
                "bg-gradient-to-br from-[var(--glass-primary-overlay-dark)] to-[var(--glass-primary-overlay-medium)]",
                "text-[var(--text-accent-color)]",
                "shadow-[0_8px_20px_rgba(var(--primary-color-rgb),0.15)]",
              )}
            >
              {org?.logo_signed_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={org.logo_signed_url}
                  alt={org.name ?? "Organization logo"}
                  className="h-full w-full object-cover"
                />
              ) : initials ? (
                <span>{initials}</span>
              ) : (
                <Building2 className="h-7 w-7" />
              )}
            </div>
            <div className="flex w-full min-w-0 flex-col gap-1">
              <div className="truncate text-base font-bold leading-tight text-[var(--text-primary)]">
                {org?.name || "Your organization"}
              </div>
              <div className="truncate text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                Organization
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav aria-label="Organization sections" className="relative z-[1] p-4">
          <div className="flex flex-col">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active =
                href === "/organization"
                  ? pathname === "/organization"
                  : pathname?.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative mx-1 mb-1.5 flex items-center gap-3 rounded-[var(--radius-md)] px-4 py-3 text-sm text-left outline-none backdrop-blur-[10px] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] last:mb-0",
                    "focus-visible:ring-2 focus-visible:ring-[var(--primary-color)]/40",
                    active
                      ? "border border-[rgba(var(--primary-color-rgb),0.5)] bg-gradient-to-br from-[rgba(var(--primary-color-rgb),0.2)] to-[rgba(var(--primary-color-rgb),0.1)] shadow-[0_4px_12px_rgba(var(--primary-color-rgb),0.15)]"
                      : "border border-[var(--glass-border-medium)] bg-[var(--glass-white-overlay-light)] shadow-[0_2px_4px_var(--glass-shadow-medium)] hover:-translate-y-[1px] hover:border-[var(--glass-border-dark)] hover:bg-[var(--glass-white-overlay)] hover:translate-x-1 hover:shadow-[0_4px_8px_var(--glass-shadow-medium)]",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-[18px] w-[18px] shrink-0 transition-colors duration-300",
                      active
                        ? "text-[var(--icon-accent-color)]"
                        : "text-[var(--text-secondary)] group-hover:text-[var(--icon-accent-color)]",
                    )}
                  />
                  <span
                    className={cn(
                      "transition-colors duration-300",
                      active
                        ? "font-semibold text-[var(--text-accent-color)]"
                        : "font-medium text-[var(--text-primary)] group-hover:text-[var(--text-accent-color)]",
                    )}
                  >
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
