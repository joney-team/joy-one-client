import { MainRequest } from "../requests/main.request";
import { TransferOwnerDto, WorkspaceRoleDto, WorkspaceRoleEntity } from "./workspace-roles-types";

export async function createWorkspaceRole(dto: WorkspaceRoleDto) {
  return MainRequest.post<WorkspaceRoleEntity>('/WorkspaceRoles', dto);
}

export async function updateWorkspaceRole(id: string, dto: WorkspaceRoleDto) {
  return MainRequest.put<WorkspaceRoleEntity>(`/WorkspaceRoles/${id}`, dto);
}

export async function getWorkspaceRoles() {
  return MainRequest.get<WorkspaceRoleEntity[]>('/WorkspaceRoles');
}

export async function removeWorkspaceRole(roleId: string) {
  return MainRequest.delete(`/WorkspaceRoles/${roleId}`);
}

export async function transferOwner(dto: TransferOwnerDto) {
  return MainRequest.post(`/workspace-members/transfer-owner`, dto);
}