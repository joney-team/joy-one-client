import { UpdateWorkspaceMemberInput } from "@/graphql/types.graphql";
import { WorkspaceMemberFragment } from "./graphql/fragmentWorkspaceMember.graphql";

export function normalizeUpdateWorkspaceMemberInput(
  member: WorkspaceMemberFragment,
): UpdateWorkspaceMemberInput {
  return {
    displayName: member.memberDisplayName ?? member.name,
    color: member.color ?? undefined,
    workingTimeType: member.workingTimeType,
    workspaceBranchIds: member.workspaceBranches.map((v) => v._id),
  };
}
