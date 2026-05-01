import type { Metadata } from "next";

import { OrganizationSidebar } from "@/components/organization/organization-sidebar";

export const metadata: Metadata = {
  title: "Organization",
  robots: { index: false, follow: false },
};

export default function OrganizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[1280px] py-6 sm:py-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <aside className="w-full shrink-0 lg:w-[280px]">
          <OrganizationSidebar />
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
