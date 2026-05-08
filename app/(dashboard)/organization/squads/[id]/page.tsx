"use client";

import { use } from "react";

import { SquadDetailPanel } from "@/components/organization/squads/squad-detail-panel";

interface SquadDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function SquadDetailPage({ params }: SquadDetailPageProps) {
  const { id } = use(params);
  return <SquadDetailPanel squadId={id} />;
}
