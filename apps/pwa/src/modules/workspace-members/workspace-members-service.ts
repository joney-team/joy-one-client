import { ResponseList } from "@/types";
import { t } from "@lingui/core/macro";
import { api } from "../apis";
import {
  getWorkspaceRoleName,
  workspaceSpecialRoleIds,
} from "../workspace-roles/workspace-roles-constants";
import { WorkspaceDefaultRoleId } from "../workspace-roles/workspace-roles-types";
import {
  UpdateWorkspaceMemberDto,
  VerifyInvitaionTokenResponse,
  WorkspaceMemberLegacy,
  WorkspaceMemberOnlineStatus,
} from "./workspace-members-types";

export async function removeWorkspaceMember(memberId: string) {
  return api.delete(`/workspace-members/${memberId}`);
}

export async function updateWorkspaceMember(memberId: string, dto: UpdateWorkspaceMemberDto) {
  return api.put(`/workspace-members/${memberId}`, dto);
}

export async function createWorkspaceMemberInvitation(): Promise<string> {
  return api.post(`/workspace-members/invite`).then((res) => res.joinLink);
}

export async function joinWorkspaceMember(inviteCode: string) {
  return api.post<WorkspaceMemberLegacy>(`/workspace-members/join`, { inviteCode });
}

export async function verifyWorkspaceMemberInvitation(token: string) {
  return api.post<VerifyInvitaionTokenResponse>(`/workspace-members/verify-invitation`, { token });
}

export async function getWorkspaceMemberByIds(userIds: string[]) {
  if (!userIds || userIds.length === 0) return [];
  return api.get<WorkspaceMemberLegacy[]>(`/workspace-members/ids`, {
    params: { ids: [...new Set(userIds.toString().split(","))] },
  });
}

export async function getWorkspaceMemberList(query?: any) {
  return api.get<ResponseList<WorkspaceMemberLegacy>>(`/workspace-members`, { params: query });
}

export async function getWorkspaceMemberOnlineStatus() {
  return api.get<WorkspaceMemberOnlineStatus>(`/workspace-members/online-status`);
}

export function getMemberRoleLabel(member: Pick<WorkspaceMemberLegacy, "memberId" | "roles">) {
  if (!member.memberId) return t`Guest`;

  if (member.roles.length === 0) {
    return workspaceSpecialRoleIds[WorkspaceDefaultRoleId.MEMBER].name();
  }

  if (member.roles.some((v) => v._id === WorkspaceDefaultRoleId.OWNER)) {
    return workspaceSpecialRoleIds[WorkspaceDefaultRoleId.OWNER].name();
  }

  if (member.roles.some((v) => v._id === WorkspaceDefaultRoleId.ADMIN)) {
    return workspaceSpecialRoleIds[WorkspaceDefaultRoleId.ADMIN].name();
  }

  return member.roles.map((v) => getWorkspaceRoleName(v)).join(", ");
}
