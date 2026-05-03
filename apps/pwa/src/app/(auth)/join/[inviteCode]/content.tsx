"use client";

import { nonLoading } from "@/utils/non-loading";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";

const WorkspaceInvitation = dynamic(() => import("@/modules/workspaces/workspace-invitation"), {
  ssr: false,
  loading: nonLoading,
});

export default function JoinContent() {
  const params = useParams<{ inviteCode: string }>();
  return <WorkspaceInvitation inviteCode={params.inviteCode} />;
}
