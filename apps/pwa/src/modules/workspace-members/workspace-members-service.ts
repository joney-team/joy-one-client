import { ResponseList } from "@/types";
import { api } from "../apis";
import { t } from "../lang/lang-service";
import { WorkspaceSpecialRoleId } from "../workspace-roles/workspace-roles-types";
import { UpdateWorkspaceMemberDto, VerifyInvitaionTokenResponse, WorkspaceMember, WorkspaceMemberOnlineStatus } from "./workspace-members-types";

export async function getMyWorkspaceMembers() {
  return api.get<WorkspaceMember[]>(`/workspace-members/me`)
}

export async function removeWorkspaceMember(memberId: string) {
  return api.delete(`/workspace-members/${memberId}`);
}

export async function updateWorkspaceMember(memberId: string, dto: UpdateWorkspaceMemberDto) {
  return api.put(`/workspace-members/${memberId}`, dto);
}

export async function createWorkspaceMemberInvitation(): Promise<string> {
  return api.post(`/workspace-members/invite`)
    .then((res) => res.joinLink)
}

export async function joinWorkspaceMember(inviteCode: string) {
  return api.post<WorkspaceMember>(`/workspace-members/join`, { inviteCode });
}

export async function verifyWorkspaceMemberInvitation(token: string) {
  return api.post<VerifyInvitaionTokenResponse>(`/workspace-members/verify-invitation`, { token });
}

export async function getWorkspaceMemberByIds(userIds: string[]) {
  if (!userIds || userIds.length === 0) return [];
  return api.get<WorkspaceMember[]>(`/workspace-members/ids`, { params: { ids: [...new Set(userIds.toString().split(','))] } })
}

export async function getWorkspaceMemberList(query?: any) {
  return api.get<ResponseList<WorkspaceMember>>(`/workspace-members`, { params: query });
}

export async function getWorkspaceMemberOnlineStatus() {
  return api.get<WorkspaceMemberOnlineStatus>(`/workspace-members/online-status`);
}

export function getUserMemberRoleLabel(userMember: Pick<WorkspaceMember, 'memberId' | 'roles'>) {
  if (!userMember.memberId) return t('guest');
  if (userMember.roles.length === 0) return t(`role_${WorkspaceSpecialRoleId.MEMBER}`);
  return userMember.roles.map(v => t(v.name)).join(', ');
}