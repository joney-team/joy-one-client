import { ResponseList } from "@/types";
import { apiClient } from "../apis";
import { WorkspaceMemberDataFragment } from "./graphql/fragmentWorkspaceMember.graphql";
import {
  UpdateWorkspaceMemberDto,
  VerifyInvitaionTokenResponse,
  WorkspaceMemberOnlineStatus,
} from "./workspace-members-types";

export async function removeWorkspaceMember(memberId: string) {
  return apiClient.delete(`/workspace-members/${memberId}`);
}

export async function updateWorkspaceMember(memberId: string, dto: UpdateWorkspaceMemberDto) {
  return apiClient.put(`/workspace-members/${memberId}`, dto);
}

export async function joinWorkspaceMember(inviteCode: string) {
  return apiClient.post<WorkspaceMemberDataFragment>(`/workspace-members/join`, { inviteCode });
}

export async function verifyWorkspaceMemberInvitation(token: string) {
  return apiClient.post<VerifyInvitaionTokenResponse>(`/workspace-members/verify-invitation`, {
    token,
  });
}

export async function getWorkspaceMemberByIds(userIds: string[]) {
  if (!userIds || userIds.length === 0) return [];
  return apiClient.get<WorkspaceMemberDataFragment[]>(`/workspace-members/ids`, {
    params: { ids: [...new Set(userIds.toString().split(","))] },
  });
}

export async function getWorkspaceMemberList(query?: any) {
  return apiClient.get<ResponseList<WorkspaceMemberDataFragment>>(`/workspace-members`, {
    params: query,
  });
}

export async function getWorkspaceMemberOnlineStatus() {
  return apiClient.get<WorkspaceMemberOnlineStatus>(`/workspace-members/online-status`);
}
