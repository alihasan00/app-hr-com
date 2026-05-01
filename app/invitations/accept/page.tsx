import { Suspense } from "react";

import { AcceptInvitePage } from "@/components/organization/accept-invite-page";

export const metadata = {
  title: "Accept invitation",
  robots: { index: false, follow: false },
};

export default function AcceptInvitationRoute() {
  return (
    <Suspense fallback={null}>
      <AcceptInvitePage />
    </Suspense>
  );
}
