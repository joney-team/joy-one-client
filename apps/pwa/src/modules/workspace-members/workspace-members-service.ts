import { ResponseList } from "@/types";
import { restClient } from "../apis/rest-client";
import { WorkspaceMemberDataFragment } from "./graphql/fragmentWorkspaceMember.graphql";
import {
  UpdateWorkspaceMemberDto,
  VerifyInvitaionTokenResponse,
  WorkspaceMemberOnlineStatus,
} from "./workspace-members-types";

export async function removeWorkspaceMember(memberId: string) {
  return restClient.delete(`/workspace-members/${memberId}`);
}

export async function updateWorkspaceMember(memberId: string, dto: UpdateWorkspaceMemberDto) {
  return restClient.put(`/workspace-members/${memberId}`, dto);
}

export async function joinWorkspaceMember(inviteCode: string) {
  return restClient.post<WorkspaceMemberDataFragment>(`/workspace-members/join`, { inviteCode });
}

export async function verifyWorkspaceMemberInvitation(token: string) {
  return restClient.post<VerifyInvitaionTokenResponse>(`/workspace-members/verify-invitation`, {
    token,
  });
}

export async function getWorkspaceMemberByIds(userIds: string[]) {
  if (!userIds || userIds.length === 0) return [];
  return restClient.get<WorkspaceMemberDataFragment[]>(`/workspace-members/ids`, {
    params: { ids: [...new Set(userIds.toString().split(","))] },
  });
}

export async function getWorkspaceMemberList(query?: any) {
  return restClient.get<ResponseList<WorkspaceMemberDataFragment>>(`/workspace-members`, {
    params: query,
  });
}

export async function getWorkspaceMemberOnlineStatus() {
  return restClient.get<WorkspaceMemberOnlineStatus>(`/workspace-members/online-status`);
}
