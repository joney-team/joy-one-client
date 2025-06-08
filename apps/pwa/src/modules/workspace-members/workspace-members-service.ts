import { ResponseList } from "@/types";
import { t } from "../lang/lang-service";
import { MainRequest } from "../requests/main.request";
import { WorkspaceSpecialRoleId } from "../workspace-roles/workspace-roles-types";
import { UpdateWorkspaceMemberDto, VerifyInvitaionTokenResponse, WorkspaceMember, WorkspaceMemberOnlineStatus } from "./workspace-members-types";

export async function getMyWorkspaceMembers() {
  return MainRequest.get<WorkspaceMember[]>(`/workspace-members/me`)
}

export async function removeWorkspaceMember(memberId: string) {
  return MainRequest.delete(`/workspace-members/${memberId}`);
}

export async function updateWorkspaceMember(memberId: string, dto: UpdateWorkspaceMemberDto) {
  return MainRequest.put(`/workspace-members/${memberId}`, dto);
}

export async function createWorkspaceMemberInvitation(): Promise<string> {
  return MainRequest.post(`/workspace-members/invite`)
    .then((res) => res.joinLink)
}

export async function joinWorkspaceMember(inviteCode: string) {
  return MainRequest.post<WorkspaceMember>(`/workspace-members/join`, { inviteCode });
}

export async function verifyWorkspaceMemberInvitation(token: string) {
  return MainRequest.post<VerifyInvitaionTokenResponse>(`/workspace-members/verify-invitation`, { token });
}

export async function getWorkspaceMemberByIds(userIds: string[]) {
  if (!userIds || userIds.length === 0) return [];
  return MainRequest.get<WorkspaceMember[]>(`/workspace-members/ids`, { ids: [...new Set(userIds.toString().split(','))] })
}

export async function getWorkspaceMemberList(query?: any) {
  return MainRequest.get<ResponseList<WorkspaceMember>>(`/workspace-members`, query);
}

export async function getWorkspaceMemberOnlineStatus() {
  return MainRequest.get<WorkspaceMemberOnlineStatus>(`/workspace-members/online-status`);
}

export function getUserMemberRoleLabel(userMember: Pick<WorkspaceMember, 'memberId' | 'roles'>) {
  if (!userMember.memberId) return t('guest');
  if (userMember.roles.length === 0) return t(`role_${WorkspaceSpecialRoleId.MEMBER}`);
  return userMember.roles.map(v => t(v.name)).join(', ');
}